import { useCallback, useEffect, useRef, useState } from 'react'

const API = 'http://localhost:8080/api/typing'

type Screen = 'topics' | 'config' | 'typing' | 'results'
type TimerMode = 'none' | 'countdown' | 'sentences'

interface SessionState {
    sessionId: string
    topic: string
    difficulty: number
    difficultyLabel: string
    sentence: string
}

interface Stats {
    wpm: number
    accuracy: number
    errorRate: number
    correct: number
    incorrect: number
    total: number
    timeSec: number
}

interface SessionConfig {
    timerMode: TimerMode
    timeLimit: number       // seconds for countdown
    sentenceLimit: number   // max sentences
    adaptiveRealtime: boolean
}

const TIMER_OPTIONS = [15, 30, 60, 120]
const SENTENCE_OPTIONS = [5, 10, 20, 50]

// Thresholds for mid-sentence adaptation
const ADAPT_CHECK_INTERVAL = 5       // check every N chars typed
const ADAPT_ACCURACY_THRESHOLD = 70  // below this triggers easier
const ADAPT_WPM_RATIO_THRESHOLD = 0.6 // below 60% of expected WPM triggers easier

export default function App() {
    const [screen, setScreen] = useState<Screen>('topics')
    const [topics, setTopics] = useState<string[]>([])
    const [selectedTopic, setSelectedTopic] = useState('')
    const [config, setConfig] = useState<SessionConfig>({
        timerMode: 'none',
        timeLimit: 60,
        sentenceLimit: 10,
        adaptiveRealtime: true
    })
    const [session, setSession] = useState<SessionState | null>(null)
    const [typed, setTyped] = useState('')
    const [stats, setStats] = useState<Stats | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [sentenceHistory, setSentenceHistory] = useState<Stats[]>([])
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [adapting, setAdapting] = useState(false)

    const startTime = useRef<number>(0)
    const pausedTime = useRef<number>(0)
    const totalPausedMs = useRef<number>(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const lastKeyTime = useRef<number>(0)
    const hesitationTotal = useRef<number>(0)
    const keyCount = useRef<number>(0)
    const lastAdaptCheck = useRef<number>(0)
    const expectedWpm = useRef<number>(50)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        fetch(`${API}/topics`)
            .then(r => r.json())
            .then(setTopics)
            .catch(() => setTopics(['Technology', 'Space', 'History', 'Programming', 'News', 'Random']))
    }, [])

    // Countdown timer
    useEffect(() => {
        if (screen === 'typing' && isTyping && !isPaused && config.timerMode === 'countdown') {
            timerRef.current = setInterval(() => {
                const elapsed = getElapsedSec()
                const remaining = Math.max(0, config.timeLimit - elapsed)
                setCountdown(Math.ceil(remaining))
                if (remaining <= 0) {
                    endSession()
                }
            }, 200)
            return () => { if (timerRef.current) clearInterval(timerRef.current) }
        }
    }, [screen, isTyping, isPaused, config.timerMode])

    // Stopwatch timer for 'none' and 'sentences' mode
    useEffect(() => {
        if (screen === 'typing' && isTyping && !isPaused && config.timerMode !== 'countdown') {
            timerRef.current = setInterval(() => {
                setCountdown(getElapsedSec())
            }, 200)
            return () => { if (timerRef.current) clearInterval(timerRef.current) }
        }
    }, [screen, isTyping, isPaused, config.timerMode])

    function getElapsedSec(): number {
        if (startTime.current === 0) return 0
        const now = isPaused ? pausedTime.current : Date.now()
        return Math.round((now - startTime.current - totalPausedMs.current) / 1000)
    }

    const selectTopic = (topic: string) => {
        setSelectedTopic(topic)
        setScreen('config')
    }

    const startSession = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: selectedTopic })
            })
            const data = await res.json()
            setSession(data)
            resetTypingState()
            setSentenceHistory([])
            setStats(null)
            setScreen('typing')
            setTimeout(() => inputRef.current?.focus(), 50)
        } finally {
            setLoading(false)
        }
    }

    function resetTypingState() {
        setTyped('')
        setIsTyping(false)
        setIsPaused(false)
        startTime.current = 0
        pausedTime.current = 0
        totalPausedMs.current = 0
        hesitationTotal.current = 0
        keyCount.current = 0
        lastKeyTime.current = 0
        lastAdaptCheck.current = 0
        setCountdown(config.timerMode === 'countdown' ? config.timeLimit : 0)
    }

    function togglePause() {
        if (isPaused) {
            totalPausedMs.current += Date.now() - pausedTime.current
            setIsPaused(false)
            setTimeout(() => inputRef.current?.focus(), 50)
        } else {
            pausedTime.current = Date.now()
            setIsPaused(true)
        }
    }

    function endSession() {
        if (timerRef.current) clearInterval(timerRef.current)
        // Submit current sentence stats if typing
        if (isTyping && session && typed.length > 0) {
            const finalStats = calculateStats(typed, session.sentence)
            setSentenceHistory(prev => [...prev, finalStats])
        }
        setScreen('results')
    }

    const calculateStats = useCallback((currentTyped: string, sentence: string): Stats => {
        const elapsed = startTime.current > 0
            ? (Date.now() - startTime.current - totalPausedMs.current) / 1000
            : 0
        const minutes = Math.max(elapsed / 60, 0.01)

        let correct = 0, incorrect = 0
        for (let i = 0; i < currentTyped.length; i++) {
            if (i < sentence.length && currentTyped[i] === sentence[i]) correct++
            else incorrect++
        }

        const total = currentTyped.length
        const wpm = Math.round((correct / 5) / minutes)
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100
        const errorRate = total > 0 ? incorrect / total : 0

        return { wpm, accuracy, errorRate, correct, incorrect, total, timeSec: Math.round(elapsed) }
    }, [])

    // Mid-sentence adaptation
    async function checkAdaptation(currentTyped: string) {
        if (!session || !config.adaptiveRealtime || adapting) return
        if (currentTyped.length - lastAdaptCheck.current < ADAPT_CHECK_INTERVAL) return
        if (currentTyped.length < 10) return  // need enough data

        lastAdaptCheck.current = currentTyped.length
        const liveStats = calculateStats(currentTyped, session.sentence)
        const remaining = session.sentence.slice(currentTyped.length)

        if (remaining.length < 10) return  // not worth adapting near end

        const isStruggling = liveStats.accuracy < ADAPT_ACCURACY_THRESHOLD
            || liveStats.wpm < expectedWpm.current * ADAPT_WPM_RATIO_THRESHOLD
        const isExcelling = liveStats.accuracy > 97 && liveStats.wpm > expectedWpm.current * 1.3

        if (!isStruggling && !isExcelling) return

        setAdapting(true)
        try {
            const res = await fetch(`${API}/adapt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: session.topic,
                    typedSoFar: currentTyped,
                    remainingText: remaining,
                    currentWpm: liveStats.wpm,
                    currentAccuracy: liveStats.accuracy,
                    expectedWpm: expectedWpm.current,
                    expectedAccuracy: 90
                })
            })
            const data = await res.json()
            if (data.newRemaining) {
                setSession(prev => prev ? {
                    ...prev,
                    sentence: currentTyped + ' ' + data.newRemaining.trim()
                } : null)
            }
        } catch {
            // Silently fail - keep original sentence
        } finally {
            setAdapting(false)
        }
    }

    const submitAndGetNext = async (finalStats: Stats) => {
        if (!session) return

        // Update expected WPM based on history
        expectedWpm.current = finalStats.wpm > 0 ? finalStats.wpm : expectedWpm.current

        // Check sentence limit
        const newCount = sentenceHistory.length + 1
        if (config.timerMode === 'sentences' && newCount >= config.sentenceLimit) {
            setSentenceHistory(prev => [...prev, finalStats])
            setStats(finalStats)
            setScreen('results')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.sessionId,
                    topic: session.topic,
                    wpm: finalStats.wpm,
                    accuracy: finalStats.accuracy,
                    errorRate: finalStats.errorRate,
                    hesitationMs: keyCount.current > 0 ? hesitationTotal.current / keyCount.current : 0
                })
            })
            const data = await res.json()

            setSentenceHistory(prev => [...prev, finalStats])
            setStats(finalStats)

            setSession(prev => prev ? {
                ...prev,
                difficulty: data.difficulty,
                difficultyLabel: data.difficultyLabel,
                sentence: data.nextSentence
            } : null)
            setTyped('')
            hesitationTotal.current = 0
            keyCount.current = 0
            lastKeyTime.current = 0
            lastAdaptCheck.current = 0
            setTimeout(() => inputRef.current?.focus(), 50)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!session || loading || isPaused) return

        if (e.key === 'Tab') { e.preventDefault(); return }
        if (e.key === 'Escape') { endSession(); return }

        const now = Date.now()
        if (lastKeyTime.current > 0) {
            hesitationTotal.current += (now - lastKeyTime.current)
            keyCount.current++
        }
        lastKeyTime.current = now

        if (!isTyping && e.key.length === 1) {
            setIsTyping(true)
            startTime.current = Date.now()
            setCountdown(config.timerMode === 'countdown' ? config.timeLimit : 0)
        }

        if (e.key === 'Backspace') {
            setTyped(prev => prev.slice(0, -1))
            return
        }

        if (e.key.length !== 1) return

        const newTyped = typed + e.key

        if (newTyped.length >= session.sentence.length) {
            setTyped(newTyped)
            const finalStats = calculateStats(newTyped, session.sentence)
            submitAndGetNext(finalStats)
            return
        }

        setTyped(newTyped)
        checkAdaptation(newTyped)
    }

    const currentStats = session && isTyping ? calculateStats(typed, session.sentence) : null
    const timerDisplay = config.timerMode === 'countdown'
        ? countdown
        : getElapsedSec()

    // ─── Topic Selection ───
    if (screen === 'topics') {
        return (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                <h1 style={{
                    fontSize: '2.4rem', color: 'var(--accent)',
                    marginBottom: '8px', fontWeight: 400, letterSpacing: '2px'
                }}>LazyLatencyLord</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '48px' }}>
                    AI-powered adaptive typing trainer
                </p>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px', maxWidth: '600px', margin: '0 auto'
                }}>
                    {topics.map(topic => (
                        <button key={topic} onClick={() => selectTopic(topic)}
                            style={{
                                background: 'var(--bg-secondary)', color: 'var(--text)',
                                border: '2px solid transparent', borderRadius: '8px',
                                padding: '16px 24px', fontSize: '1rem', fontFamily: 'inherit',
                                cursor: 'pointer', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text)' }}
                        >{topic}</button>
                    ))}
                </div>
            </div>
        )
    }

    // ─── Session Config ───
    if (screen === 'config') {
        const pill = (active: boolean) => ({
            background: active ? 'var(--accent)' : 'var(--bg-secondary)',
            color: active ? 'var(--bg)' : 'var(--text)',
            border: 'none', borderRadius: '6px', padding: '8px 16px',
            fontSize: '0.9rem', fontFamily: 'inherit', cursor: 'pointer',
            fontWeight: active ? 600 : 400 as const, transition: 'all 0.15s'
        })

        return (
            <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                <h2 style={{ color: 'var(--accent)', fontSize: '1.4rem', marginBottom: '8px', fontWeight: 400 }}>
                    {selectedTopic}
                </h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '40px' }}>
                    Configure your session
                </p>

                {/* Timer Mode */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '10px' }}>mode</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button style={pill(config.timerMode === 'none')}
                            onClick={() => setConfig(c => ({ ...c, timerMode: 'none' }))}>infinite</button>
                        <button style={pill(config.timerMode === 'countdown')}
                            onClick={() => setConfig(c => ({ ...c, timerMode: 'countdown' }))}>timer</button>
                        <button style={pill(config.timerMode === 'sentences')}
                            onClick={() => setConfig(c => ({ ...c, timerMode: 'sentences' }))}>sentences</button>
                    </div>
                </div>

                {/* Time limit options */}
                {config.timerMode === 'countdown' && (
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '10px' }}>time (seconds)</div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {TIMER_OPTIONS.map(t => (
                                <button key={t} style={pill(config.timeLimit === t)}
                                    onClick={() => setConfig(c => ({ ...c, timeLimit: t }))}>{t}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sentence limit options */}
                {config.timerMode === 'sentences' && (
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '10px' }}>sentences</div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {SENTENCE_OPTIONS.map(n => (
                                <button key={n} style={pill(config.sentenceLimit === n)}
                                    onClick={() => setConfig(c => ({ ...c, sentenceLimit: n }))}>{n}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Real-time adaptation toggle */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '10px' }}>live adaptation</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button style={pill(config.adaptiveRealtime)}
                            onClick={() => setConfig(c => ({ ...c, adaptiveRealtime: true }))}>on</button>
                        <button style={pill(!config.adaptiveRealtime)}
                            onClick={() => setConfig(c => ({ ...c, adaptiveRealtime: false }))}>off</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={() => setScreen('topics')}
                        style={{ ...pill(false), padding: '12px 28px' }}>back</button>
                    <button onClick={startSession} disabled={loading}
                        style={{
                            background: 'var(--accent)', color: 'var(--bg)', border: 'none',
                            borderRadius: '8px', padding: '12px 40px', fontSize: '1rem',
                            fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer',
                            fontWeight: 600, opacity: loading ? 0.6 : 1
                        }}>
                        {loading ? 'loading...' : 'start'}
                    </button>
                </div>
            </div>
        )
    }

    // ─── Results ───
    if (screen === 'results') {
        const avgWpm = sentenceHistory.length > 0
            ? Math.round(sentenceHistory.reduce((s, h) => s + h.wpm, 0) / sentenceHistory.length) : 0
        const avgAccuracy = sentenceHistory.length > 0
            ? Math.round(sentenceHistory.reduce((s, h) => s + h.accuracy, 0) / sentenceHistory.length) : 0
        const totalTime = sentenceHistory.reduce((s, h) => s + h.timeSec, 0)

        return (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
                <h2 style={{ color: 'var(--accent)', fontSize: '1.6rem', marginBottom: '32px', fontWeight: 400 }}>
                    Session Results
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '3rem', color: 'var(--accent)' }}>{avgWpm}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>avg wpm</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', color: 'var(--accent)' }}>{avgAccuracy}%</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>avg accuracy</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', color: 'var(--accent)' }}>{sentenceHistory.length}</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>sentences</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', color: 'var(--accent)' }}>{totalTime}s</div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>total time</div>
                    </div>
                </div>

                {sentenceHistory.length > 0 && (
                    <div style={{ maxWidth: '500px', margin: '0 auto 32px', textAlign: 'left' }}>
                        {sentenceHistory.map((h, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between',
                                padding: '8px 12px', borderBottom: '1px solid var(--bg-secondary)',
                                fontSize: '0.85rem'
                            }}>
                                <span style={{ color: 'var(--text-dim)' }}>#{i + 1}</span>
                                <span>{h.wpm} wpm</span>
                                <span>{h.accuracy}%</span>
                                <span style={{ color: 'var(--text-dim)' }}>{h.timeSec}s</span>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={() => { resetTypingState(); startSession() }}
                        style={{
                            background: 'var(--bg-secondary)', color: 'var(--text)', border: 'none',
                            borderRadius: '8px', padding: '12px 28px', fontSize: '1rem',
                            fontFamily: 'inherit', cursor: 'pointer'
                        }}>restart</button>
                    <button onClick={() => { setSentenceHistory([]); setSession(null); setStats(null); setScreen('topics') }}
                        style={{
                            background: 'var(--accent)', color: 'var(--bg)', border: 'none',
                            borderRadius: '8px', padding: '12px 28px', fontSize: '1rem',
                            fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600
                        }}>new session</button>
                </div>
            </div>
        )
    }

    // ─── Typing Screen ───
    return (
        <div style={{ paddingTop: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{session?.topic}</span>
                    <span style={{
                        color: 'var(--text-dim)', fontSize: '0.85rem',
                        background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '4px'
                    }}>{session?.difficultyLabel}</span>
                    {config.timerMode === 'sentences' && (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                            {sentenceHistory.length}/{config.sentenceLimit}
                        </span>
                    )}
                    {adapting && (
                        <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontStyle: 'italic' }}>adapting...</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {isTyping && (
                        <button onClick={togglePause}
                            style={{
                                background: 'none', border: '1px solid var(--text-dim)',
                                color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem',
                                fontFamily: 'inherit', padding: '4px 12px', borderRadius: '4px'
                            }}>
                            {isPaused ? 'resume' : 'pause'}
                        </button>
                    )}
                    <button onClick={endSession}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-dim)',
                            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit'
                        }}>esc - end</button>
                </div>
            </div>

            {/* Timer + Live stats */}
            <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', fontSize: '1.4rem', alignItems: 'baseline' }}>
                {/* Timer */}
                <div>
                    <span style={{ color: config.timerMode === 'countdown' && countdown <= 10 ? 'var(--incorrect)' : 'var(--accent)' }}>
                        {timerDisplay}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginLeft: '4px' }}>s</span>
                </div>
                {currentStats && (
                    <>
                        <div>
                            <span style={{ color: 'var(--accent)' }}>{currentStats.wpm}</span>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginLeft: '4px' }}>wpm</span>
                        </div>
                        <div>
                            <span style={{ color: currentStats.accuracy < 80 ? 'var(--incorrect)' : 'var(--accent)' }}>
                                {currentStats.accuracy}
                            </span>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', marginLeft: '4px' }}>%</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                                {typed.length}/{session?.sentence.length}
                            </span>
                        </div>
                    </>
                )}
                {stats && !currentStats && (
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        last: {stats.wpm} wpm / {stats.accuracy}%
                    </span>
                )}
            </div>

            {/* Pause overlay */}
            {isPaused && (
                <div style={{
                    textAlign: 'center', padding: '40px', color: 'var(--accent)',
                    fontSize: '1.2rem', marginBottom: '24px'
                }}>
                    paused - click resume to continue
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Loading next sentence...
                </div>
            )}

            {/* Sentence display */}
            {!isPaused && (
                <div
                    style={{
                        fontSize: '1.5rem', lineHeight: '2', letterSpacing: '0.05em',
                        minHeight: '120px', cursor: 'text', userSelect: 'none', position: 'relative'
                    }}
                    onClick={() => inputRef.current?.focus()}
                >
                    {session?.sentence.split('').map((char, i) => {
                        let color = 'var(--text-dim)'
                        if (i < typed.length) {
                            color = typed[i] === char ? 'var(--correct)' : 'var(--incorrect)'
                        }
                        const isCaret = i === typed.length
                        return (
                            <span key={i} style={{ position: 'relative' }}>
                                {isCaret && (
                                    <span style={{
                                        position: 'absolute', left: '-1px', top: '2px',
                                        width: '2px', height: '1.3em', background: 'var(--caret)',
                                        animation: 'blink 1s step-end infinite'
                                    }} />
                                )}
                                <span style={{
                                    color,
                                    textDecoration: i < typed.length && typed[i] !== char ? 'underline' : 'none',
                                    textDecorationColor: 'var(--incorrect)'
                                }}>{char}</span>
                            </span>
                        )
                    })}
                    {typed.length > (session?.sentence.length ?? 0) &&
                        typed.slice(session?.sentence.length).split('').map((char, i) => (
                            <span key={`extra-${i}`} style={{ color: 'var(--extra)' }}>{char}</span>
                        ))
                    }
                </div>
            )}

            <input ref={inputRef}
                style={{ position: 'absolute', opacity: 0, left: '-9999px' }}
                onKeyDown={handleKeyDown} autoFocus />

            <div style={{ textAlign: 'center', marginTop: '48px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                {!isTyping && !isPaused ? 'start typing to begin' : ''}
            </div>

            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
        </div>
    )
}
