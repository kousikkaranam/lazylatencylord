export const API = '/api/typing'

export const TIMER_OPTIONS = [15, 30, 60, 120]
export const SENTENCE_OPTIONS = [5, 10, 20, 50]

// Mid-sentence adaptation thresholds
export const ADAPT_CHECK_INTERVAL = 5
export const ADAPT_ACCURACY_THRESHOLD = 70
export const ADAPT_WPM_RATIO_THRESHOLD = 0.6

// XP level thresholds
export const XP_LEVELS = [0, 100, 250, 500, 1000, 2000, 4000, 8000]

// Combo tiers: [minChars, multiplier]
export const COMBO_TIERS: [number, number][] = [
  [50, 5],
  [30, 3],
  [15, 2],
  [5, 1.5],
]

// Streak milestones for glow animation
export const STREAK_MILESTONES = [10, 25, 50, 100, 200, 500]

// Difficulty colors mapped by label
export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'var(--diff-beginner)',
  easy: 'var(--diff-easy)',
  medium: 'var(--diff-medium)',
  hard: 'var(--diff-hard)',
  expert: 'var(--diff-expert)',
}
