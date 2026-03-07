import { useMemo } from 'react'
import type { Stats } from '../utils/types'
import './ProgressChart.css'

interface Props {
  history: Stats[]
}

export function ProgressChart({ history }: Props) {
  const data = useMemo(() => {
    if (history.length < 2) return null

    const padding = { top: 10, right: 20, bottom: 20, left: 35 }
    const width = 500
    const height = 160
    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom

    const maxWpm = Math.max(...history.map(h => h.wpm), 10)
    const xStep = innerW / (history.length - 1)

    const wpmPoints = history.map((h, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + innerH - (h.wpm / maxWpm) * innerH,
    }))

    const accPoints = history.map((h, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + innerH - (h.accuracy / 100) * innerH,
    }))

    const wpmPath = wpmPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const accPath = accPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    // Grid lines (3 horizontal)
    const gridLines = [0.25, 0.5, 0.75].map(frac => ({
      y: padding.top + innerH * (1 - frac),
      wpmLabel: Math.round(maxWpm * frac),
      accLabel: Math.round(100 * frac),
    }))

    return { wpmPath, accPath, wpmPoints, accPoints, gridLines, width, height, padding, innerW, innerH, maxWpm }
  }, [history])

  if (!data) {
    return history.length === 1 ? (
      <div className="chart">
        <div className="chart__title">complete more sentences to see progress</div>
      </div>
    ) : null
  }

  return (
    <div className="chart">
      <div className="chart__title">session progress</div>
      <svg className="chart__svg" viewBox={`0 0 ${data.width} ${data.height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {data.gridLines.map((g, i) => (
          <g key={i}>
            <line className="chart__grid-line"
              x1={data.padding.left} y1={g.y}
              x2={data.padding.left + data.innerW} y2={g.y} />
            <text className="chart__axis-label" x={data.padding.left - 4} y={g.y + 3} textAnchor="end">
              {g.wpmLabel}
            </text>
          </g>
        ))}

        {/* Lines */}
        <path className="chart__line chart__line--wpm" d={data.wpmPath} />
        <path className="chart__line chart__line--accuracy" d={data.accPath} />

        {/* Dots */}
        {data.wpmPoints.map((p, i) => (
          <circle key={`w${i}`} className="chart__dot chart__dot--wpm" cx={p.x} cy={p.y} />
        ))}
        {data.accPoints.map((p, i) => (
          <circle key={`a${i}`} className="chart__dot chart__dot--accuracy" cx={p.x} cy={p.y} />
        ))}
      </svg>
      <div className="chart__legend">
        <div className="chart__legend-item">
          <span className="chart__legend-dot chart__legend-dot--wpm" /> WPM
        </div>
        <div className="chart__legend-item">
          <span className="chart__legend-dot chart__legend-dot--accuracy" /> Accuracy
        </div>
      </div>
    </div>
  )
}
