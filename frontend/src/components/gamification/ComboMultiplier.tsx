import './ComboMultiplier.css'

interface Props {
  multiplier: number
}

export function ComboMultiplier({ multiplier }: Props) {
  if (multiplier <= 1) return null

  let className = 'combo combo--active'
  if (multiplier >= 5) className = 'combo combo--x5'
  else if (multiplier >= 3) className = 'combo combo--x3'
  else if (multiplier >= 2) className = 'combo combo--x2'

  return <span className={className}>{multiplier}x</span>
}
