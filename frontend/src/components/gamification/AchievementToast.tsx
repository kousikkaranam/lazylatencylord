import { useEffect } from 'react'
import { getAchievement } from '../../utils/achievements'
import './AchievementToast.css'

interface Props {
  achievementIds: string[]
  onDismiss: (id: string) => void
}

export function AchievementToast({ achievementIds, onDismiss }: Props) {
  useEffect(() => {
    if (achievementIds.length === 0) return
    const timers = achievementIds.map(id =>
      setTimeout(() => onDismiss(id), 3000)
    )
    return () => timers.forEach(clearTimeout)
  }, [achievementIds, onDismiss])

  if (achievementIds.length === 0) return null

  return (
    <div className="toast-container">
      {achievementIds.map(id => {
        const achievement = getAchievement(id)
        if (!achievement) return null
        return (
          <div key={id} className="toast" onClick={() => onDismiss(id)}>
            <span className="toast__icon">{achievement.icon}</span>
            <div className="toast__content">
              <span className="toast__title">{achievement.title}</span>
              <span className="toast__desc">{achievement.description}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
