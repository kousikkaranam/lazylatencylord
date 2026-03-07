import { getAllBests } from '../utils/personalBest'
import './TopicSelection.css'

interface Props {
  topics: string[]
  onSelect: (topic: string) => void
}

export function TopicSelection({ topics, onSelect }: Props) {
  const bests = getAllBests()

  return (
    <div className="topics screen-enter">
      <h1 className="topics__title">LazyLatencyLord</h1>
      <p className="topics__subtitle">AI-powered adaptive typing trainer</p>
      <div className="topics__grid">
        {topics.map(topic => {
          const best = bests[topic]
          return (
            <button key={topic} className="topic-btn" onClick={() => onSelect(topic)}>
              {topic}
              {best && (
                <span className="topic-btn__best">
                  {best.wpm} wpm · {best.accuracy}%
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
