import { getAllBests } from '../utils/personalBest'
import './TopicSelection.css'

const TOPIC_META: Record<string, { icon: string; color: string; desc: string }> = {
  Technology: { icon: '\u2699\uFE0F', color: '#58a6ff', desc: 'AI, gadgets & innovation' },
  Space: { icon: '\u{1F680}', color: '#bc8cff', desc: 'Cosmos & exploration' },
  History: { icon: '\u{1F3DB}\uFE0F', color: '#d29922', desc: 'Past events & civilizations' },
  Startups: { icon: '\u{1F4C8}', color: '#7ee787', desc: 'Business & entrepreneurship' },
  Philosophy: { icon: '\u{1F9E0}', color: '#f0883e', desc: 'Ideas & deep thinking' },
  Programming: { icon: '\u{1F4BB}', color: '#58a6ff', desc: 'Code & software' },
  Science: { icon: '\u{1F52C}', color: '#7ee787', desc: 'Research & discovery' },
  News: { icon: '\u{1F4F0}', color: '#d29922', desc: 'Current world events' },
  Random: { icon: '\u{1F3B2}', color: '#bc8cff', desc: 'Surprise me' },
}

const FEATURES = [
  { icon: '\u{1F9E0}', title: 'AI Adaptation', desc: 'Difficulty adjusts in real-time based on your WPM and accuracy' },
  { icon: '\u26A1', title: 'Live Stats', desc: 'Track WPM, accuracy, streaks and combos as you type' },
  { icon: '\u{1F3AF}', title: 'Topic Sentences', desc: 'Practice with AI-generated sentences on topics you love' },
]

const FEATURES_RIGHT = [
  { icon: '\u{1F525}', title: 'XP & Levels', desc: 'Earn experience points and level up your typing skills' },
  { icon: '\u{1F3C6}', title: 'Achievements', desc: 'Unlock badges for speed, accuracy and perfect streaks' },
  { icon: '\u2328\uFE0F', title: 'Key Heatmap', desc: 'See which keys you struggle with in a visual heatmap' },
]

interface Props {
  topics: string[]
  onSelect: (topic: string) => void
}

export function TopicSelection({ topics, onSelect }: Props) {
  const bests = getAllBests()
  const allBestValues = Object.values(bests)
  const avgWpm = allBestValues.length > 0
    ? Math.round(allBestValues.reduce((s, b) => s + b.wpm, 0) / allBestValues.length)
    : null
  const avgAccuracy = allBestValues.length > 0
    ? Math.round(allBestValues.reduce((s, b) => s + b.accuracy, 0) / allBestValues.length)
    : null

  return (
    <div className="topics screen-enter">
      <div className="topics__orb topics__orb--1" />
      <div className="topics__orb topics__orb--2" />

      {/* Hero */}
      <header className="topics__hero">
        <div className="topics__hero-left">
          <div className="topics__badge">AI-POWERED</div>
          <h1 className="topics__title">
            <span className="topics__title-lazy">Lazy</span>
            <span className="topics__title-latency">Latency</span>
            <span className="topics__title-lord">Lord</span>
          </h1>
          <p className="topics__subtitle">
            AI-generated topic sentences with real-time adaptive difficulty.
          </p>
        </div>
        <div className="topics__hero-right">
          <button className="topics__cta" onClick={() => topics[0] && onSelect(topics[0])}>
            Start Training
          </button>
          {avgWpm !== null ? (
            <div className="topics__stats-bar">
              <div className="topics__stat">
                <span className="topics__stat-value">{avgWpm}</span>
                <span className="topics__stat-unit">WPM</span>
              </div>
              <div className="topics__stat-sep" />
              <div className="topics__stat">
                <span className="topics__stat-value">{avgAccuracy}%</span>
                <span className="topics__stat-unit">ACC</span>
              </div>
              <div className="topics__stat-sep" />
              <div className="topics__stat">
                <span className="topics__stat-value">{allBestValues.length}</span>
                <span className="topics__stat-unit">PLAYED</span>
              </div>
            </div>
          ) : (
            <div className="topics__stats-bar topics__stats-bar--empty">
              <span className="topics__stat-unit">Pick a topic to begin</span>
            </div>
          )}
        </div>
      </header>

      {/* 3-column body */}
      <div className="topics__body">
        {/* Left features */}
        <aside className="topics__features topics__features--left">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="feature-card__icon">{f.icon}</span>
              <div className="feature-card__text">
                <div className="feature-card__title">{f.title}</div>
                <div className="feature-card__desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </aside>

        {/* Center: topic grid */}
        <main className="topics__center">
          <div className="topics__section-header">
            <div className="topics__section-line" />
            <span className="topics__section-label">Choose Topic</span>
            <div className="topics__section-line" />
          </div>
          <div className="topics__grid">
            {topics.map((topic, i) => {
              const meta = TOPIC_META[topic] || { icon: '\u26A1', color: '#58a6ff', desc: '' }
              const best = bests[topic]
              return (
                <button
                  key={topic}
                  className="topic-card"
                  onClick={() => onSelect(topic)}
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    '--tc': meta.color,
                  } as React.CSSProperties}
                >
                  <div className="topic-card__accent" />
                  <div className="topic-card__icon-ring">
                    <span className="topic-card__icon">{meta.icon}</span>
                  </div>
                  <span className="topic-card__name">{topic}</span>
                  <span className="topic-card__desc">{meta.desc}</span>
                  {best && (
                    <span className="topic-card__stats">
                      {best.wpm} wpm &middot; {best.accuracy}%
                    </span>
                  )}
                </button>
              )
            })}
            {/* Coming soon placeholder */}
            <div className="topic-card topic-card--soon">
              <div className="topic-card__icon-ring topic-card__icon-ring--soon">
                <span className="topic-card__icon">+</span>
              </div>
              <span className="topic-card__name">More</span>
              <span className="topic-card__desc">coming soon</span>
            </div>
          </div>
        </main>

        {/* Right features */}
        <aside className="topics__features topics__features--right">
          {FEATURES_RIGHT.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${(i + 3) * 0.1}s` }}>
              <span className="feature-card__icon">{f.icon}</span>
              <div className="feature-card__text">
                <div className="feature-card__title">{f.title}</div>
                <div className="feature-card__desc">{f.desc}</div>
              </div>
            </div>
          ))}
          <div className="feature-card feature-card--soon" style={{ animationDelay: '0.6s' }}>
            <span className="feature-card__icon">+</span>
            <div className="feature-card__text">
              <div className="feature-card__title">More Features</div>
              <div className="feature-card__desc">Coming soon</div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="topics__footer">
        <kbd className="topics__kbd">click</kbd> to select topic &middot; AI adapts to your skill level &middot; track progress with XP
      </footer>
    </div>
  )
}
