import type { Stats, TimerMode } from '../utils/types'
import './LiveStats.css'

interface Props {
  timerMode: TimerMode
  timerDisplay: number
  countdown: number
  currentStats: Stats | null
  lastStats: Stats | null
  typed: string
  sentenceLength: number
}

export function LiveStats({ timerMode, timerDisplay, countdown, currentStats, lastStats, typed, sentenceLength }: Props) {
  return (
    <div className="live-stats">
      <div>
        <span className={`live-stats__value${timerMode === 'countdown' && countdown <= 10 ? ' live-stats__value--danger' : ''}`}>
          {timerDisplay}
        </span>
        <span className="live-stats__unit">s</span>
      </div>
      {currentStats && (
        <>
          <div>
            <span className="live-stats__value">{currentStats.wpm}</span>
            <span className="live-stats__unit">wpm</span>
          </div>
          <div>
            <span className={`live-stats__value${currentStats.accuracy < 80 ? ' live-stats__value--danger' : ''}`}>
              {currentStats.accuracy}
            </span>
            <span className="live-stats__unit">%</span>
          </div>
          <div>
            <span className="live-stats__unit">{typed.length}/{sentenceLength}</span>
          </div>
        </>
      )}
      {lastStats && !currentStats && (
        <span className="live-stats__last">last: {lastStats.wpm} wpm / {lastStats.accuracy}%</span>
      )}
    </div>
  )
}
