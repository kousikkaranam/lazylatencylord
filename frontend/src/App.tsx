import { useEffect, useRef, useState } from 'react'

type StartResp = { sessionId: number, prompt: string }
type FinishResp = { wpm: number, netWpm: number, errors: number, totalChars: number }

export default function App() {
    const [prompt, setPrompt] = useState('')
    const [sessionId, setSessionId] = useState<number | null>(null)
    const [input, setInput] = useState('')
    const [result, setResult] = useState<FinishResp | null>(null)
    const startTimeRef = useRef<number | null>(null)

    // @ts-ignore
    const start = async () => {
        const r = await fetch('/api/session/start', { method: 'POST' })
        const data: StartResp = await r.json()
        setPrompt(data.prompt)
        setSessionId(data.sessionId)
        setInput('')
        setResult(null)
        startTimeRef.current = performance.now()
    }

    // @ts-ignore
    const finish = async () => {
        if (!sessionId || startTimeRef.current === null) return
        // naive counts for MVP
        const totalChars = input.length
        // @ts-ignore
        const errors = [...input].reduce((e, ch, i) => e + (prompt[i] !== ch ? 1 : 0), 0)

        const r = await fetch(`/api/session/${sessionId}/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ totalChars, errors })
        })
        const data = await r.json()
        setResult(data)
    }

    useEffect(() => { start() }, [])

    return (
        <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui' }}>
            <h1>LazyLatencyLord – Typing MVP</h1>
            <p><strong>Prompt:</strong> {prompt || 'Loading...'}</p>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                style={{ width: '100%', fontSize: 16 }}
                disabled={!sessionId || !!result}
                placeholder="Start typing here…"
            />

            <div style={{ marginTop: 12 }}>
                {!result && <button onClick={finish} disabled={!sessionId}>Finish</button>}
                {result && (
                    <div style={{ marginTop: 12 }}>
                        <div>Gross WPM: {result.wpm.toFixed(2)}</div>
                        <div>Net WPM: {result.netWpm.toFixed(2)}</div>
                        <div>Errors: {result.errors}</div>
                        <div>Total Chars: {result.totalChars}</div>
                        <button onClick={start}>Try another</button>
                    </div>
                )}
            </div>
        </div>
    )
}
