import { useMemo } from 'react'
import './SentenceDisplay.css'

interface Props {
  sentence: string
  typed: string
  onClick: () => void
}

export function SentenceDisplay({ sentence, typed, onClick }: Props) {
  const chars = useMemo(() => {
    const result: { char: string; className: string; isCaret: boolean }[] = []
    for (let i = 0; i < sentence.length; i++) {
      let className = 'sentence__char--pending'
      if (i < typed.length) {
        className = typed[i] === sentence[i]
          ? 'sentence__char--correct'
          : 'sentence__char--incorrect'
      }
      result.push({ char: sentence[i], className, isCaret: i === typed.length })
    }
    return result
  }, [sentence, typed])

  const extraChars = typed.length > sentence.length
    ? typed.slice(sentence.length).split('')
    : []

  return (
    <div className="sentence" onClick={onClick}>
      {chars.map((c, i) => (
        <span key={i} className="sentence__char">
          {c.isCaret && <span className="sentence__caret" />}
          <span className={c.className}>{c.char}</span>
        </span>
      ))}
      {extraChars.map((char, i) => (
        <span key={`extra-${i}`} className="sentence__char--extra">{char}</span>
      ))}
    </div>
  )
}
