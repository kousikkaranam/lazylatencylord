import { useCallback, useRef, useState } from 'react'
import type { SessionState, Stats, SessionConfig, GamificationState, Screen } from '../utils/types'
import { API, ADAPT_CHECK_INTERVAL, ADAPT_ACCURACY_THRESHOLD, ADAPT_WPM_RATIO_THRESHOLD } from '../utils/constants'
import { getComboMultiplier, calculateXP, getXPLevel } from '../utils/scoring'
import { checkAchievements } from '../utils/achievements'

const INITIAL_GAMIFICATION: GamificationState = {
  xp: 0,
  xpLevel: 0,
  charStreak: 0,
  bestCharStreak: 0,
  perfectSentences: 0,
  comboMultiplier: 1,
  comboChars: 0,
  achievements: [],
}

export function useTypingSession(config: SessionConfig) {
  const [screen, setScreen] = useState<Screen>('topics')
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [session, setSession] = useState<SessionState | null>(null)
  const [typed, setTyped] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sentenceHistory, setSentenceHistory] = useState<Stats[]>([])
  const [loading, setLoading] = useState(false)
  const [adapting, setAdapting] = useState(false)
  const [wasAdapted, setWasAdapted] = useState(false)
  const [gamification, setGamification] = useState<GamificationState>(INITIAL_GAMIFICATION)
  const [pendingAchievements, setPendingAchievements] = useState<string[]>([])
  const [keyStats, setKeyStats] = useState<Record<string, { correct: number; incorrect: number }>>({})

  const lastKeyTime = useRef(0)
  const hesitationTotal = useRef(0)
  const keyCount = useRef(0)
  const lastAdaptCheck = useRef(0)
  const expectedWpm = useRef(50)
  const inputRef = useRef<HTMLInputElement>(null)

  // Timer refs (managed externally by useTimer, but we need getElapsedMs for stats)
  const startTimeRef = useRef(0)
  const totalPausedMsRef = useRef(0)

  const calculateStats = useCallback((currentTyped: string, sentence: string): Stats => {
    const elapsed = startTimeRef.current > 0
      ? (Date.now() - startTimeRef.current - totalPausedMsRef.current) / 1000
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

  function onCharTyped(char: string, expected: string) {
    const isCorrect = char === expected
    const key = char.toLowerCase()
    setKeyStats(prev => {
      const existing = prev[key] ?? { correct: 0, incorrect: 0 }
      return {
        ...prev,
        [key]: {
          correct: existing.correct + (isCorrect ? 1 : 0),
          incorrect: existing.incorrect + (isCorrect ? 0 : 1),
        },
      }
    })
    setGamification(prev => {
      const newComboChars = isCorrect ? prev.comboChars + 1 : 0
      const newCharStreak = isCorrect ? prev.charStreak + 1 : 0
      const newBestStreak = Math.max(prev.bestCharStreak, newCharStreak)
      const newMultiplier = getComboMultiplier(newComboChars)
      return {
        ...prev,
        charStreak: newCharStreak,
        bestCharStreak: newBestStreak,
        comboChars: newComboChars,
        comboMultiplier: newMultiplier,
      }
    })
  }

  function onSentenceComplete(finalStats: Stats) {
    const xpEarned = calculateXP(finalStats.wpm, finalStats.accuracy, gamification.comboMultiplier)
    const newTotalXP = gamification.xp + xpEarned
    const newPerfect = finalStats.accuracy === 100
      ? gamification.perfectSentences + 1
      : 0

    const newGamification: GamificationState = {
      ...gamification,
      xp: newTotalXP,
      xpLevel: getXPLevel(newTotalXP),
      perfectSentences: newPerfect,
    }

    const newAchievements = checkAchievements(
      finalStats,
      newGamification,
      sentenceHistory.length + 1,
      session?.difficulty ?? 1,
      wasAdapted,
    )

    if (newAchievements.length > 0) {
      newGamification.achievements = [...newGamification.achievements, ...newAchievements]
      setPendingAchievements(prev => [...prev, ...newAchievements])
    }

    setGamification(newGamification)
    setWasAdapted(false)
  }

  function dismissAchievement(id: string) {
    setPendingAchievements(prev => prev.filter(a => a !== id))
  }

  async function fetchTopics() {
    try {
      const res = await fetch(`${API}/topics`)
      const data = await res.json()
      setTopics(data)
    } catch {
      setTopics(['Technology', 'Space', 'History', 'Programming', 'News', 'Random'])
    }
  }

  function selectTopic(topic: string) {
    setSelectedTopic(topic)
    setScreen('config')
  }

  async function startSession() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: selectedTopic }),
      })
      const data = await res.json()
      setSession(data)
      resetTypingState()
      setSentenceHistory([])
      setStats(null)
      setGamification(INITIAL_GAMIFICATION)
      setPendingAchievements([])
      setKeyStats({})
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
    setWasAdapted(false)
    startTimeRef.current = 0
    totalPausedMsRef.current = 0
    hesitationTotal.current = 0
    keyCount.current = 0
    lastKeyTime.current = 0
    lastAdaptCheck.current = 0
  }

  function startTyping() {
    setIsTyping(true)
    startTimeRef.current = Date.now()
  }

  const pausedTimeRef = useRef(0)
  function doPause() {
    pausedTimeRef.current = Date.now()
    setIsPaused(true)
  }
  function doResume() {
    totalPausedMsRef.current += Date.now() - pausedTimeRef.current
    setIsPaused(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function endSession() {
    if (isTyping && session && typed.length > 0) {
      const finalStats = calculateStats(typed, session.sentence)
      setSentenceHistory(prev => [...prev, finalStats])
    }
    setScreen('results')
  }

  async function checkAdaptation(currentTyped: string) {
    if (!session || !config.adaptiveRealtime || adapting) return
    if (currentTyped.length - lastAdaptCheck.current < ADAPT_CHECK_INTERVAL) return
    if (currentTyped.length < 10) return

    lastAdaptCheck.current = currentTyped.length
    const liveStats = calculateStats(currentTyped, session.sentence)
    const remaining = session.sentence.slice(currentTyped.length)

    if (remaining.length < 10) return

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
          expectedAccuracy: 90,
        }),
      })
      const data = await res.json()
      if (data.newRemaining) {
        setSession(prev => prev ? {
          ...prev,
          sentence: currentTyped + ' ' + data.newRemaining.trim(),
        } : null)
        setWasAdapted(true)
      }
    } catch {
      // Keep original sentence
    } finally {
      setAdapting(false)
    }
  }

  async function submitAndGetNext(finalStats: Stats) {
    if (!session) return

    expectedWpm.current = finalStats.wpm > 0 ? finalStats.wpm : expectedWpm.current
    onSentenceComplete(finalStats)

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
          hesitationMs: keyCount.current > 0 ? hesitationTotal.current / keyCount.current : 0,
        }),
      })
      const data = await res.json()

      setSentenceHistory(prev => [...prev, finalStats])
      setStats(finalStats)

      setSession(prev => prev ? {
        ...prev,
        difficulty: data.difficulty,
        difficultyLabel: data.difficultyLabel,
        sentence: data.nextSentence,
        smoothedScore: data.smoothedScore,
      } : null)
      setTyped('')
      setWasAdapted(false)
      hesitationTotal.current = 0
      keyCount.current = 0
      lastKeyTime.current = 0
      lastAdaptCheck.current = 0
      setTimeout(() => inputRef.current?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
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
      startTyping()
    }

    if (e.key === 'Backspace') {
      setTyped(prev => prev.slice(0, -1))
      // Reset combo on backspace
      setGamification(prev => ({ ...prev, comboChars: 0, comboMultiplier: 1 }))
      return
    }

    if (e.key.length !== 1) return

    const newTyped = typed + e.key
    const expectedChar = session.sentence[typed.length] ?? ''
    onCharTyped(e.key, expectedChar)

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

  function goToTopics() {
    setSentenceHistory([])
    setSession(null)
    setStats(null)
    setScreen('topics')
  }

  function restart() {
    resetTypingState()
    startSession()
  }

  return {
    // State
    screen, topics, selectedTopic, session, typed, stats,
    isTyping, isPaused, sentenceHistory, loading, adapting,
    currentStats, gamification, pendingAchievements, keyStats,

    // Refs
    inputRef, startTimeRef, totalPausedMsRef, pausedTimeRef,

    // Actions
    fetchTopics, selectTopic, startSession, handleKeyDown,
    endSession, doPause, doResume, goToTopics, restart,
    dismissAchievement, setScreen,
  }
}
