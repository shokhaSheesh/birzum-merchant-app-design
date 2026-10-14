import type { ReactNode } from 'react'

export type Slide = 'limit' | 'shop' | 'pay'

const line = { strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** What is drawn on the card for each slide. */
const motifs: Record<Slide, ReactNode> = {
  // The limit: a big amount over a strip of terms, one chosen
  limit: (
    <>
      <rect x="92" y="62" width="40" height="7" rx="3.5" className="fill-navy-200" />
      <rect x="92" y="78" width="88" height="14" rx="7" className="fill-brand" />
      <rect x="92" y="100" width="56" height="6" rx="3" className="fill-navy-100" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={92 + i * 23}
          y="124"
          width="19"
          height="16"
          rx="6"
          className={i === 2 ? 'fill-green-500' : 'fill-navy-100'}
        />
      ))}
      <rect x="92" y="150" width="88" height="22" rx="11" className="fill-green-200" />
      <path d="M128 161h16" className="stroke-brand" {...line} />
    </>
  ),
  // Shopping: a product with its price, and the cart
  shop: (
    <>
      <rect x="92" y="58" width="88" height="62" rx="12" className="fill-surface" />
      <rect
        x="122"
        y="66"
        width="28"
        height="46"
        rx="7"
        className="fill-canvas stroke-brand"
        {...line}
      />
      <circle cx="136" cy="72" r="1.8" className="fill-brand" />
      <rect x="92" y="130" width="64" height="8" rx="4" className="fill-navy-200" />
      <rect x="92" y="145" width="44" height="10" rx="5" className="fill-brand" />
      <rect x="92" y="161" width="52" height="12" rx="6" className="fill-green-200" />
      <circle cx="194" cy="150" r="22" className="fill-brand" />
      <path
        d="M183 141h4l3 13h11l3-9h-15"
        className="stroke-canvas"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="191" cy="158" r="1.8" className="fill-canvas" />
      <circle cx="200" cy="158" r="1.8" className="fill-canvas" />
      <circle cx="208" cy="132" r="7" className="fill-green-500 stroke-canvas" strokeWidth="2" />
    </>
  ),
  // Paying: a month calendar with today ticked
  pay: (
    <>
      <rect x="92" y="58" width="88" height="20" rx="8" className="fill-brand" />
      <path d="M108 52v10M164 52v10" className="stroke-brand" {...line} />
      {Array.from({ length: 12 }, (_, i) => (
        <circle
          key={i}
          cx={104 + (i % 4) * 21}
          cy={96 + Math.floor(i / 4) * 22}
          r="5"
          className={i < 5 ? 'fill-green-200' : 'fill-navy-100'}
        />
      ))}
      <circle cx="146" cy="118" r="11" className="fill-green-500" />
      <path d="M141 118l3.5 3.5 6.5-7" className="stroke-navy-950" {...line} />
      <rect x="92" y="152" width="88" height="20" rx="10" className="fill-surface" />
      <rect x="100" y="159" width="34" height="6" rx="3" className="fill-navy-200" />
    </>
  ),
}

/** The picture for one intro slide, in the style of the empty and error pictures. */
export function OnboardingIllustration({ slide, className }: { slide: Slide; className?: string }) {
  const sparkle = 'M0-9C1-2.5 2.5-1 9 0 2.5 1 1 2.5 0 9-1 2.5-2.5 1-9 0-2.5-1-1-2.5 0-9Z'

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
        {motifs[slide]}
      </g>
      <path d={sparkle} transform="translate(226 52)" className="fill-green-500" />
      <path d={sparkle} transform="translate(42 92) scale(0.6)" className="fill-green-500" />
      <circle cx="232" cy="134" r="5" className="fill-brand" />
      <circle cx="52" cy="150" r="4" className="fill-navy-400" />
    </svg>
  )
}
