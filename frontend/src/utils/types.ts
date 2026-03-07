export type Screen = 'topics' | 'config' | 'typing' | 'results'
export type TimerMode = 'none' | 'countdown' | 'sentences'

export interface SessionState {
  sessionId: string
  topic: string
  difficulty: number
  difficultyLabel: string
  sentence: string
  smoothedScore?: number
}

export interface Stats {
  wpm: number
  accuracy: number
  errorRate: number
  correct: number
  incorrect: number
  total: number
  timeSec: number
}

export interface SessionConfig {
  timerMode: TimerMode
  timeLimit: number
  sentenceLimit: number
  adaptiveRealtime: boolean
}

export interface GamificationState {
  xp: number
  xpLevel: number
  charStreak: number
  bestCharStreak: number
  perfectSentences: number
  comboMultiplier: number
  comboChars: number
  achievements: string[]
}

export interface PersonalBest {
  wpm: number
  accuracy: number
  streak: number
  xp: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
}
