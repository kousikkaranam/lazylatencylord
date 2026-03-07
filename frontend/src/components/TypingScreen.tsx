import type { SessionState, Stats, SessionConfig, GamificationState, TimerMode } from '../utils/types'
import { SentenceDisplay } from './SentenceDisplay'
import { LiveStats } from './LiveStats'
import { XPBar } from './gamification/XPBar'
import { StreakCounter } from './gamification/StreakCounter'
import { ComboMultiplier } from './gamification/ComboMultiplier'
import { DifficultyProgressBar } from './gamification/DifficultyProgressBar'
import { AchievementToast } from './gamification/AchievementToast'
import './TypingScreen.css'

interface Props {
  session: SessionState
  config: SessionConfig
  typed: string
  isTyping: boolean
  isPaused: boolean
  loading: boolean
  adapting: boolean
  currentStats: Stats | null
  lastStats: Stats | null
  sentenceCount: number
  timerDisplay: number
  countdown: number
  gamification: GamificationState
  pendingAchievements: string[]
  inputRef: React.RefObject<HTMLInputElement | null>
  onKeyDown: (e: React.KeyboardEvent) => void
  onPause: () => void
  onResume: () => void
  onEnd: () => void
  onDismissAchievement: (id: string) => void
}

export function TypingScreen({
  session, config, typed, isTyping, isPaused, loading, adapting,
  currentStats, lastStats, sentenceCount, timerDisplay, countdown,
  gamification, pendingAchievements, inputRef,
  onKeyDown, onPause, onResume, onEnd, onDismissAchievement,
}: Props) {
  return (
    <div className="typing screen-enter">
      <AchievementToast achievementIds={pendingAchievements} onDismiss={onDismissAchievement} />

      {/* Difficulty bar */}
      <DifficultyProgressBar
        difficulty={session.difficulty}
        difficultyLabel={session.difficultyLabel}
        smoothedScore={session.smoothedScore}
      />

      {/* Header */}
      <div className="typing__header">
        <div className="typing__header-left">
          <span className="typing__topic">{session.topic}</span>
          {config.timerMode === 'sentences' && (
            <span className="typing__sentence-count">
              {sentenceCount}/{config.sentenceLimit}
            </span>
          )}
          {adapting && <span className="typing__adapting">adapting...</span>}
        </div>
        <div className="typing__header-right">
          {isTyping && (
            <button className="btn btn-ghost" onClick={isPaused ? onResume : onPause}>
              {isPaused ? 'resume' : 'pause'}
            </button>
          )}
          <button className="typing__end-btn" onClick={onEnd}>esc - end</button>
        </div>
      </div>

      {/* Live stats + Gamification row */}
      <div className="typing__gamification">
        <StreakCounter streak={gamification.charStreak} />
        <ComboMultiplier multiplier={gamification.comboMultiplier} />
      </div>

      <LiveStats
        timerMode={config.timerMode}
        timerDisplay={timerDisplay}
        countdown={countdown}
        currentStats={currentStats}
        lastStats={lastStats}
        typed={typed}
        sentenceLength={session.sentence.length}
      />

      {/* Pause overlay */}
      {isPaused && (
        <div className="typing__pause">paused - click resume to continue</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="typing__loading">Loading next sentence...</div>
      )}

      {/* Sentence display */}
      {!isPaused && (
        <SentenceDisplay
          sentence={session.sentence}
          typed={typed}
          onClick={() => inputRef.current?.focus()}
        />
      )}

      {/* XP Bar */}
      <XPBar totalXP={gamification.xp} />

      <input
        ref={inputRef}
        className="typing__hidden-input"
        onKeyDown={onKeyDown}
        autoFocus
      />

      <div className="typing__hint">
        {!isTyping && !isPaused ? 'start typing to begin' : ''}
      </div>
    </div>
  )
}
