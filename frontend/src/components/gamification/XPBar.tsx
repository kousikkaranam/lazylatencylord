import { getXPProgress } from '../../utils/scoring'
import './XPBar.css'

interface Props {
  totalXP: number
}

export function XPBar({ totalXP }: Props) {
  const { level, current, next, percent } = getXPProgress(totalXP)

  return (
    <div className="xp-bar">
      <div className="xp-bar__header">
        <span className="xp-bar__level">LVL {level}</span>
        <span className="xp-bar__xp">{current} / {next} XP</span>
      </div>
      <div className="xp-bar__track">
        <div className="xp-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
