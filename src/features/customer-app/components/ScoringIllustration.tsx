import { cn } from '@/shared/lib/cn'

export type ScoringState = 'checking' | 'approved' | 'declined'

const line = { strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/**
 * The limit check, drawn in the style of the empty-state picture: a tilted card with a gauge.
 * While checking, a magnifier sweeps over it; the result swaps in a green tick or a red cross.
 */
export function ScoringIllustration({
  state,
  className,
}: {
  state: ScoringState
  className?: string
}) {
  const sparkle = 'M0-9C1-2.5 2.5-1 9 0 2.5 1 1 2.5 0 9-1 2.5-2.5 1-9 0-2.5-1-1-2.5 0-9Z'
  // The needle points left while checking, right when approved, down-left when declined
  const needle = state === 'approved' ? 40 : state === 'declined' ? -60 : -15

  return (
    <svg viewBox="0 0 272 220" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="136" cy="112" rx="124" ry="92" className="fill-green-200" />
      <ellipse cx="136" cy="200" rx="72" ry="8" className="fill-navy-100" />
      <rect
        x="86"
        y="34"
        width="112"
        height="150"
        rx="18"
        transform="rotate(7 142 109)"
        className="fill-surface stroke-navy-400"
        strokeWidth="2"
      />
      <g transform="rotate(-3 136 115)">
        <rect
          x="78"
          y="40"
          width="116"
          height="148"
          rx="18"
          className="fill-canvas stroke-brand"
          strokeWidth="2.5"
        />
        {/* gauge */}
        <path
          d="M98 112a38 38 0 0 1 76 0"
          className="stroke-navy-100"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M98 112a38 38 0 0 1 76 0"
          className={cn(
            'transition-all duration-700',
            state === 'declined' ? 'stroke-danger' : 'stroke-green-500',
          )}
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={state === 'approved' ? 0 : state === 'declined' ? 82 : 55}
        />
        <g
          style={{ transform: `rotate(${needle}deg)`, transformOrigin: '136px 112px' }}
          className={cn(
            'transition-transform duration-700',
            state === 'checking' && 'scoring-needle',
          )}
        >
          <path d="M136 112V84" className="stroke-brand" {...line} />
        </g>
        <circle cx="136" cy="112" r="5" className="fill-brand" />
        <rect x="98" y="132" width="76" height="7" rx="3.5" className="fill-navy-200" />
        <rect x="98" y="146" width="48" height="7" rx="3.5" className="fill-navy-100" />
        <rect x="98" y="162" width="60" height="12" rx="6" className="fill-green-200" />
      </g>

      {state === 'checking' && (
        <g className="scoring-lens">
          <circle
            cx="196"
            cy="140"
            r="22"
            className="fill-canvas/60 stroke-brand"
            strokeWidth="5"
          />
          <path d="M212 156l16 16" className="stroke-brand" strokeWidth="7" strokeLinecap="round" />
        </g>
      )}
      {state === 'approved' && (
        <g>
          <circle
            cx="204"
            cy="150"
            r="22"
            className="fill-green-500 stroke-canvas"
            strokeWidth="4"
          />
          <path d="M194 150l7 7 13-14" className="stroke-navy-950" {...line} strokeWidth="4" />
        </g>
      )}
      {state === 'declined' && (
        <g>
          <circle cx="204" cy="150" r="22" className="fill-danger stroke-canvas" strokeWidth="4" />
          <path
            d="M196 142l16 16M212 142l-16 16"
            className="stroke-canvas"
            {...line}
            strokeWidth="4"
          />
        </g>
      )}
      <path d={sparkle} transform="translate(226 52)" className="fill-green-500" />
      <path d={sparkle} transform="translate(42 92) scale(0.6)" className="fill-green-500" />
      <circle cx="52" cy="150" r="4" className="fill-navy-400" />
    </svg>
  )
}
