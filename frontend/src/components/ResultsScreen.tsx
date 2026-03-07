import { useMemo } from 'react'
import type { Stats, GamificationState } from '../utils/types'
import { ACHIEVEMENTS } from '../utils/achievements'
import { updateBests } from '../utils/personalBest'
import { ProgressChart } from './ProgressChart'
import { KeyboardHeatmap } from './KeyboardHeatmap'
import './ResultsScreen.css'

interface Props {
  topic: string
  sentenceHistory: Stats[]
  gamification: GamificationState
  keyStats: Record<string, { correct: number; incorrect: number }>
  onRestart: () => void
  onNewSession: () => void
}

export function ResultsScreen({ topic, sentenceHistory, gamification, keyStats, onRestart, onNewSession }: Props) {
  const { avgWpm, avgAccuracy, totalTime, newBests } = useMemo(() => {
    const len = sentenceHistory.length
    const avgWpm = len > 0 ? Math.round(sentenceHistory.reduce((s, h) => s + h.wpm, 0) / len) : 0
    const avgAccuracy = len > 0 ? Math.round(sentenceHistory.reduce((s, h) => s + h.accuracy, 0) / len) : 0
    const totalTime = sentenceHistory.reduce((s, h) => s + h.timeSec, 0)
    const newBests = updateBests(topic, {
      wpm: avgWpm,
      accuracy: avgAccuracy,
      streak: gamification.bestCharStreak,
      xp: gamification.xp,
    })
    return { avgWpm, avgAccuracy, totalTime, newBests }
  }, [sentenceHistory, topic, gamification])

  const earnedAchievements = ACHIEVEMENTS.filter(a => gamification.achievements.includes(a.id))

  return (
    <div className="results screen-enter">
      <h2 className="results__title">Session Results</h2>

      {/* Stat cards */}
      <div className="results__stats">
        <div className="stat-card">
          <div className="stat-card__value">{avgWpm}</div>
          <div className="stat-card__label">avg wpm</div>
          {newBests.includes('wpm') && <div className="stat-card__best">NEW BEST</div>}
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{avgAccuracy}%</div>
          <div className="stat-card__label">avg accuracy</div>
          {newBests.includes('accuracy') && <div className="stat-card__best">NEW BEST</div>}
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{sentenceHistory.length}</div>
          <div className="stat-card__label">sentences</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{totalTime}s</div>
          <div className="stat-card__label">total time</div>
        </div>
      </div>

      {/* Gamification summary */}
      <div className="results__gamification">
        <div className="results__gamification-item">
          <span className="results__gamification-value">{gamification.xp}</span>
          <span>XP earned</span>
        </div>
        <div className="results__gamification-item">
          <span className="results__gamification-value">{gamification.bestCharStreak}</span>
          <span>best streak</span>
        </div>
        <div className="results__gamification-item">
          <span className="results__gamification-value">{gamification.perfectSentences}</span>
          <span>perfect</span>
        </div>
      </div>

      {/* Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="results__achievements">
          {earnedAchievements.map(a => (
            <div key={a.id} className="results__achievement">
              <span className="results__achievement-icon">{a.icon}</span>
              {a.title}
            </div>
          ))}
        </div>
      )}

      {/* Progress chart */}
      <ProgressChart history={sentenceHistory} />

      {/* Keyboard heatmap */}
      <KeyboardHeatmap keyStats={keyStats} />

      {/* Sentence history */}
      {sentenceHistory.length > 0 && (
        <div className="results__history">
          {sentenceHistory.map((h, i) => (
            <div key={i} className="results__history-row" style={{ '--i': i } as React.CSSProperties}>
              <span className="results__history-num">#{i + 1}</span>
              <span>{h.wpm} wpm</span>
              <span>{h.accuracy}%</span>
              <span className="results__history-time">{h.timeSec}s</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="results__actions">
        <button className="btn btn-secondary" onClick={onRestart}>restart</button>
        <button className="btn btn-primary" onClick={onNewSession}>new session</button>
      </div>
    </div>
  )
}
