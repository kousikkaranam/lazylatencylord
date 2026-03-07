import { useMemo } from 'react'
import './KeyboardHeatmap.css'

interface KeyStats {
  correct: number
  incorrect: number
}

interface Props {
  keyStats: Record<string, KeyStats>
}

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  [' '],
]

function getKeyColor(stats: KeyStats | undefined): string {
  if (!stats || (stats.correct + stats.incorrect === 0)) return 'var(--bg-secondary)'
  const total = stats.correct + stats.incorrect
  const errorRate = stats.incorrect / total
  if (errorRate > 0.3) return 'rgba(202, 71, 84, 0.6)'  // High errors
  if (errorRate > 0.15) return 'rgba(245, 166, 35, 0.4)' // Some errors
  if (errorRate > 0.05) return 'rgba(69, 183, 209, 0.3)' // Few errors
  return 'rgba(78, 205, 196, 0.4)' // Accurate
}

export function KeyboardHeatmap({ keyStats }: Props) {
  const hasData = useMemo(() => Object.keys(keyStats).length > 0, [keyStats])

  if (!hasData) return null

  return (
    <div className="heatmap">
      <div className="heatmap__title">key accuracy</div>
      {ROWS.map((row, ri) => (
        <div key={ri} className="heatmap__row">
          {row.map(key => {
            const stats = keyStats[key]
            const color = getKeyColor(stats)
            const label = key === ' ' ? 'space' : key
            return (
              <div
                key={key}
                className={`heatmap__key${key === ' ' ? ' heatmap__key--space' : ''}`}
                style={{ background: color, color: 'var(--text)' }}
                title={stats ? `${stats.correct} correct, ${stats.incorrect} errors` : 'not typed'}
              >
                {label}
              </div>
            )
          })}
        </div>
      ))}
      <div className="heatmap__legend">
        <span><span className="heatmap__legend-swatch" style={{ background: 'rgba(78, 205, 196, 0.4)' }} />accurate</span>
        <span><span className="heatmap__legend-swatch" style={{ background: 'rgba(245, 166, 35, 0.4)' }} />some errors</span>
        <span><span className="heatmap__legend-swatch" style={{ background: 'rgba(202, 71, 84, 0.6)' }} />high errors</span>
      </div>
    </div>
  )
}
