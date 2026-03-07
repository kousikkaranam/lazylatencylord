import type { SessionConfig as Config } from '../utils/types'
import { TIMER_OPTIONS, SENTENCE_OPTIONS } from '../utils/constants'
import './SessionConfig.css'

interface Props {
  topic: string
  config: Config
  loading: boolean
  onConfigChange: (update: Partial<Config>) => void
  onStart: () => void
  onBack: () => void
}

export function SessionConfig({ topic, config, loading, onConfigChange, onStart, onBack }: Props) {
  return (
    <div className="config screen-enter">
      <h2 className="config__topic">{topic}</h2>
      <p className="config__subtitle">Configure your session</p>

      <div className="config__section">
        <div className="config__label">mode</div>
        <div className="config__options">
          <button className={`pill ${config.timerMode === 'none' ? 'pill--active' : ''}`}
            onClick={() => onConfigChange({ timerMode: 'none' })}>infinite</button>
          <button className={`pill ${config.timerMode === 'countdown' ? 'pill--active' : ''}`}
            onClick={() => onConfigChange({ timerMode: 'countdown' })}>timer</button>
          <button className={`pill ${config.timerMode === 'sentences' ? 'pill--active' : ''}`}
            onClick={() => onConfigChange({ timerMode: 'sentences' })}>sentences</button>
        </div>
      </div>

      {config.timerMode === 'countdown' && (
        <div className="config__section">
          <div className="config__label">time (seconds)</div>
          <div className="config__options">
            {TIMER_OPTIONS.map(t => (
              <button key={t} className={`pill ${config.timeLimit === t ? 'pill--active' : ''}`}
                onClick={() => onConfigChange({ timeLimit: t })}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {config.timerMode === 'sentences' && (
        <div className="config__section">
          <div className="config__label">sentences</div>
          <div className="config__options">
            {SENTENCE_OPTIONS.map(n => (
              <button key={n} className={`pill ${config.sentenceLimit === n ? 'pill--active' : ''}`}
                onClick={() => onConfigChange({ sentenceLimit: n })}>{n}</button>
            ))}
          </div>
        </div>
      )}

      <div className="config__section">
        <div className="config__label">live adaptation</div>
        <div className="config__options">
          <button className={`pill ${config.adaptiveRealtime ? 'pill--active' : ''}`}
            onClick={() => onConfigChange({ adaptiveRealtime: true })}>on</button>
          <button className={`pill ${!config.adaptiveRealtime ? 'pill--active' : ''}`}
            onClick={() => onConfigChange({ adaptiveRealtime: false })}>off</button>
        </div>
      </div>

      <div className="config__actions">
        <button className="btn btn-secondary" onClick={onBack}>back</button>
        <button className="btn btn-primary" onClick={onStart} disabled={loading}>
          {loading ? 'loading...' : 'start'}
        </button>
      </div>
    </div>
  )
}
