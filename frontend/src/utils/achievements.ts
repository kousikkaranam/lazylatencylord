import type { Achievement, Stats, GamificationState } from './types'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'speed_50', title: 'Getting Warmed Up', description: 'Reach 50 WPM', icon: '⚡' },
  { id: 'speed_75', title: 'Speed Demon', description: 'Reach 75 WPM', icon: '🏎' },
  { id: 'speed_100', title: 'Keyboard Warrior', description: 'Reach 100 WPM', icon: '⚔' },
  { id: 'perfect', title: 'Perfectionist', description: '100% accuracy on a sentence', icon: '💎' },
  { id: 'marathon_10', title: 'Getting Started', description: 'Complete 10 sentences', icon: '📝' },
  { id: 'marathon_25', title: 'Marathon Runner', description: 'Complete 25 sentences', icon: '🏃' },
  { id: 'marathon_50', title: 'Endurance Master', description: 'Complete 50 sentences', icon: '🏆' },
  { id: 'streak_50', title: 'On a Roll', description: '50 char streak', icon: '🔥' },
  { id: 'streak_100', title: 'Streak Master', description: '100 char streak', icon: '💥' },
  { id: 'streak_200', title: 'Unstoppable', description: '200 char streak', icon: '🌟' },
  { id: 'expert', title: 'Expert Mode', description: 'Reach difficulty level 5', icon: '👑' },
  { id: 'adapted', title: 'Adaptation Survivor', description: 'Complete a sentence after adaptation', icon: '🧬' },
]

export function checkAchievements(
  stats: Stats,
  gamification: GamificationState,
  sentenceCount: number,
  difficulty: number,
  wasAdapted: boolean,
): string[] {
  const earned = gamification.achievements
  const newAchievements: string[] = []

  const check = (id: string, condition: boolean) => {
    if (condition && !earned.includes(id)) newAchievements.push(id)
  }

  check('speed_50', stats.wpm >= 50)
  check('speed_75', stats.wpm >= 75)
  check('speed_100', stats.wpm >= 100)
  check('perfect', stats.accuracy === 100)
  check('marathon_10', sentenceCount >= 10)
  check('marathon_25', sentenceCount >= 25)
  check('marathon_50', sentenceCount >= 50)
  check('streak_50', gamification.bestCharStreak >= 50)
  check('streak_100', gamification.bestCharStreak >= 100)
  check('streak_200', gamification.bestCharStreak >= 200)
  check('expert', difficulty >= 5)
  check('adapted', wasAdapted)

  return newAchievements
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}
