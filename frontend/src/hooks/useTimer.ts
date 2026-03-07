import { useEffect, useRef, useState } from 'react'
import type { TimerMode } from '../utils/types'

interface UseTimerOptions {
  screen: string
  isTyping: boolean
  isPaused: boolean
  timerMode: TimerMode
  timeLimit: number
  onTimeUp: () => void
}

export function useTimer({ screen, isTyping, isPaused, timerMode, timeLimit, onTimeUp }: UseTimerOptions) {
  const [countdown, setCountdown] = useState(0)
  const startTime = useRef(0)
  const pausedTime = useRef(0)
  const totalPausedMs = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function getElapsedSec(): number {
    if (startTime.current === 0) return 0
    const now = isPaused ? pausedTime.current : Date.now()
    return Math.round((now - startTime.current - totalPausedMs.current) / 1000)
  }

  function getElapsedMs(): number {
    if (startTime.current === 0) return 0
    const now = isPaused ? pausedTime.current : Date.now()
    return now - startTime.current - totalPausedMs.current
  }

  // Countdown timer
  useEffect(() => {
    if (screen === 'typing' && isTyping && !isPaused && timerMode === 'countdown') {
      timerRef.current = setInterval(() => {
        const elapsed = getElapsedSec()
        const remaining = Math.max(0, timeLimit - elapsed)
        setCountdown(Math.ceil(remaining))
        if (remaining <= 0) onTimeUp()
      }, 200)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [screen, isTyping, isPaused, timerMode])

  // Stopwatch timer
  useEffect(() => {
    if (screen === 'typing' && isTyping && !isPaused && timerMode !== 'countdown') {
      timerRef.current = setInterval(() => {
        setCountdown(getElapsedSec())
      }, 200)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [screen, isTyping, isPaused, timerMode])

  function start() {
    startTime.current = Date.now()
    setCountdown(timerMode === 'countdown' ? timeLimit : 0)
  }

  function pause() {
    pausedTime.current = Date.now()
  }

  function resume() {
    totalPausedMs.current += Date.now() - pausedTime.current
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current)
    startTime.current = 0
    pausedTime.current = 0
    totalPausedMs.current = 0
    setCountdown(timerMode === 'countdown' ? timeLimit : 0)
  }

  const timerDisplay = timerMode === 'countdown' ? countdown : getElapsedSec()

  return {
    countdown,
    timerDisplay,
    getElapsedSec,
    getElapsedMs,
    start,
    pause,
    resume,
    reset,
    clearTimer: () => { if (timerRef.current) clearInterval(timerRef.current) },
  }
}
