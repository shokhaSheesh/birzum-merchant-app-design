import type { ReactNode } from 'react'

/** A titled block on a detail screen. */
type Props = { title: string; hint?: string; children: ReactNode }

export function Section({ title, hint, children }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <p className="text-sm text-ink-muted">{hint}</p>}
      </div>
      {children}
    </section>
  )
}
