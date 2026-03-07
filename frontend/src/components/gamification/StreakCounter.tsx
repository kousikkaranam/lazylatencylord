import { STREAK_MILESTONES } from '../../utils/constants'
import './StreakCounter.css'

interface Props {
  streak: number
}

export function StreakCounter({ streak }: Props) {
  const isActive = streak >= 5
  const isMilestone = STREAK_MILESTONES.includes(streak)

  return (
    <div className={`streak${isActive ? ' streak--active' : ''}`}>
      <span className={`streak__icon${isMilestone ? ' streak__icon--milestone' : ''}`}>
        {isActive ? '\uD83D\uDD25' : '\u2022'}
      </span>
      <span className="streak__count">{streak}</span>
    </div>
  )
}
