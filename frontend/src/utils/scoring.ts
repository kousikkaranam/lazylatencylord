import { COMBO_TIERS, XP_LEVELS } from './constants'

export function getComboMultiplier(consecutiveCorrect: number): number {
  for (const [minChars, multiplier] of COMBO_TIERS) {
    if (consecutiveCorrect >= minChars) return multiplier
  }
  return 1
}

export function calculateXP(wpm: number, accuracy: number, comboMultiplier: number): number {
  const base = (wpm * 0.5) + (accuracy * 0.3)
  return Math.round(base * comboMultiplier)
}

export function getXPLevel(totalXP: number): number {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_LEVELS[i]) return i
  }
  return 0
}

export function getXPProgress(totalXP: number): { level: number; current: number; next: number; percent: number } {
  const level = getXPLevel(totalXP)
  const current = XP_LEVELS[level] ?? 0
  const next = XP_LEVELS[level + 1] ?? XP_LEVELS[XP_LEVELS.length - 1] * 2
  const progress = totalXP - current
  const needed = next - current
  return {
    level,
    current: progress,
    next: needed,
    percent: Math.min((progress / needed) * 100, 100),
  }
}
