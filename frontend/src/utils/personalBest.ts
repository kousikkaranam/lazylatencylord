import type { PersonalBest } from './types'

const STORAGE_KEY = 'lll-personal-bests'

function getAll(): Record<string, PersonalBest> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(data: Record<string, PersonalBest>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getBests(topic: string): PersonalBest | null {
  const all = getAll()
  return all[topic] ?? null
}

export function getAllBests(): Record<string, PersonalBest> {
  return getAll()
}

export function updateBests(
  topic: string,
  stats: { wpm: number; accuracy: number; streak: number; xp: number }
): string[] {
  const all = getAll()
  const current = all[topic] ?? { wpm: 0, accuracy: 0, streak: 0, xp: 0 }
  const newBests: string[] = []

  if (stats.wpm > current.wpm) { current.wpm = stats.wpm; newBests.push('wpm') }
  if (stats.accuracy > current.accuracy) { current.accuracy = stats.accuracy; newBests.push('accuracy') }
  if (stats.streak > current.streak) { current.streak = stats.streak; newBests.push('streak') }
  if (stats.xp > current.xp) { current.xp = stats.xp; newBests.push('xp') }

  all[topic] = current
  saveAll(all)
  return newBests
}
