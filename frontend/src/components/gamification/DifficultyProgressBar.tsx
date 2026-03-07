import { DIFFICULTY_COLORS } from '../../utils/constants'
import './DifficultyProgressBar.css'

interface Props {
  difficulty: number
  difficultyLabel: string
  smoothedScore?: number
}

export function DifficultyProgressBar({ difficulty, difficultyLabel, smoothedScore }: Props) {
  const color = DIFFICULTY_COLORS[difficultyLabel] ?? 'var(--text-dim)'
  const score = smoothedScore ?? (difficulty * 20)

  return (
    <div className="diff-bar">
      <div className="diff-bar__label">
        <span className="diff-bar__badge" style={{ background: color, color: 'var(--bg)' }}>
          {difficultyLabel}
        </span>
        <span className="diff-bar__score">{Math.round(score)} / 100</span>
      </div>
      <div className="diff-bar__track">
        <div className="diff-bar__marker" style={{ left: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  )
}
