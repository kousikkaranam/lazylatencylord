import { useEffect, useState } from 'react'
import type { SessionConfig } from './utils/types'
import { useTypingSession } from './hooks/useTypingSession'
import { useTimer } from './hooks/useTimer'
import { TopicSelection } from './components/TopicSelection'
import { SessionConfig as SessionConfigScreen } from './components/SessionConfig'
import { TypingScreen } from './components/TypingScreen'
import { ResultsScreen } from './components/ResultsScreen'

export default function App() {
  const [config, setConfig] = useState<SessionConfig>({
    timerMode: 'none',
    timeLimit: 60,
    sentenceLimit: 10,
    adaptiveRealtime: true,
  })

  const ts = useTypingSession(config)

  const timer = useTimer({
    screen: ts.screen,
    isTyping: ts.isTyping,
    isPaused: ts.isPaused,
    timerMode: config.timerMode,
    timeLimit: config.timeLimit,
    onTimeUp: ts.endSession,
  })

  // Fetch topics on mount
  useEffect(() => { ts.fetchTopics() }, [])

  if (ts.screen === 'topics') {
    return <TopicSelection topics={ts.topics} onSelect={ts.selectTopic} />
  }

  if (ts.screen === 'config') {
    return (
      <SessionConfigScreen
        topic={ts.selectedTopic}
        config={config}
        loading={ts.loading}
        onConfigChange={update => setConfig(c => ({ ...c, ...update }))}
        onStart={ts.startSession}
        onBack={() => ts.setScreen('topics')}
      />
    )
  }

  if (ts.screen === 'results') {
    return (
      <ResultsScreen
        topic={ts.selectedTopic}
        sentenceHistory={ts.sentenceHistory}
        gamification={ts.gamification}
        keyStats={ts.keyStats}
        onRestart={ts.restart}
        onNewSession={ts.goToTopics}
      />
    )
  }

  // Typing screen
  if (!ts.session) return null

  return (
    <TypingScreen
      session={ts.session}
      config={config}
      typed={ts.typed}
      isTyping={ts.isTyping}
      isPaused={ts.isPaused}
      loading={ts.loading}
      adapting={ts.adapting}
      currentStats={ts.currentStats}
      lastStats={ts.stats}
      sentenceCount={ts.sentenceHistory.length}
      timerDisplay={timer.timerDisplay}
      countdown={timer.countdown}
      gamification={ts.gamification}
      pendingAchievements={ts.pendingAchievements}
      inputRef={ts.inputRef}
      onKeyDown={ts.handleKeyDown}
      onPause={ts.doPause}
      onResume={ts.doResume}
      onEnd={ts.endSession}
      onDismissAchievement={ts.dismissAchievement}
    />
  )
}
