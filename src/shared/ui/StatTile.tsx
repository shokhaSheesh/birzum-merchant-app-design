import { Link } from 'react-router-dom'

type Props = {
  label: string
  value: string
  /** Makes the tile a link to where the number comes from. */
  to?: string
}

/** One number with its label. Used in a row of two or three on a summary screen. */
export function StatTile({ label, value, to }: Props) {
  const body = (
    <>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-sm text-ink-muted">{label}</span>
    </>
  )
  const box = 'flex min-w-0 flex-col gap-0.5 rounded-card bg-surface p-4'

  return to ? (
    <Link to={to} className={`${box} transition-colors active:bg-navy-100`}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  )
}
