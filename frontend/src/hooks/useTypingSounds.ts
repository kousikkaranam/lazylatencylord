import { useRef, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useTypingSounds() {
  const [enabled, setEnabled] = useLocalStorage('lll-sounds', false)
  const ctxRef = useRef<AudioContext | null>(null)

  function getCtx(): AudioContext {
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    return ctxRef.current
  }

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) => {
    if (!enabled) return
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.value = volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Audio context not available
    }
  }, [enabled])

  const playKeyClick = useCallback(() => playTone(800, 0.04, 'square', 0.03), [playTone])
  const playError = useCallback(() => playTone(200, 0.1, 'sawtooth', 0.05), [playTone])
  const playComplete = useCallback(() => {
    playTone(523, 0.1, 'sine', 0.06)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.06), 80)
    setTimeout(() => playTone(784, 0.15, 'sine', 0.06), 160)
  }, [playTone])

  return { enabled, setEnabled, playKeyClick, playError, playComplete }
}
