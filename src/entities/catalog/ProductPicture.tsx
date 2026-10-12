import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import type { Category } from './products'

// Drawn stand-ins for product photos, one per category. Real photos will replace them.
const tints: Record<Category, string> = {
  phones: 'bg-[#e3edf2]',
  tvs: 'bg-[#eef3e4]',
  appliances: 'bg-[#f1ede6]',
  laptops: 'bg-[#e9eaf2]',
}

const defaultBody: Record<Category, string> = {
  phones: '#17364a',
  tvs: '#17364a',
  appliances: '#f7f8f8',
  laptops: '#17364a',
}

/** Each drawing takes the color of the product's body, so a color option can show itself. */
const drawings: Record<Category, (body: string) => ReactNode> = {
  phones: (body) => (
    <>
      <rect
        x="30"
        y="8"
        width="40"
        height="84"
        rx="9"
        fill={body}
        stroke="#0b1d28"
        strokeOpacity=".25"
      />
      <rect x="33.5" y="11.5" width="33" height="77" rx="6" fill="#7fb6d6" />
      <path d="M33.5 60c12-10 22-6 33-16v38.5a6 6 0 0 1-6 6h-21a6 6 0 0 1-6-6Z" fill="#4f8fb5" />
      <circle cx="50" cy="17" r="2.2" fill="#0b1d28" />
    </>
  ),
  tvs: (body) => (
    <>
      <rect x="8" y="20" width="84" height="52" rx="5" fill={body} />
      <rect x="11.5" y="23.5" width="77" height="45" rx="2.5" fill="#a9c97a" />
      <path
        d="M11.5 56c14-12 24-2 38-14s22-6 39-18v42a2.5 2.5 0 0 1-2.5 2.5h-72a2.5 2.5 0 0 1-2.5-2.5Z"
        fill="#6ea33a"
      />
      <rect x="46" y="72" width="8" height="8" fill={body} />
      <rect x="32" y="80" width="36" height="4" rx="2" fill={body} />
    </>
  ),
  appliances: (body) => (
    <>
      <rect
        x="18"
        y="8"
        width="64"
        height="84"
        rx="7"
        fill={body}
        stroke="#c9d2d6"
        strokeWidth="2"
      />
      <rect x="18" y="8" width="64" height="16" rx="7" fill="#0b1d28" fillOpacity=".1" />
      <circle cx="28" cy="16" r="3" fill="#8499a4" />
      <rect x="56" y="13" width="18" height="6" rx="3" fill="#17364a" />
      <circle cx="50" cy="56" r="23" fill="#c9d2d6" />
      <circle cx="50" cy="56" r="17" fill="#7fb6d6" />
      <path d="M34 60c8-6 14 4 22-2s8-2 10-2a17 17 0 0 1-32 6Z" fill="#4f8fb5" />
    </>
  ),
  laptops: (body) => (
    <>
      <rect
        x="16"
        y="20"
        width="68"
        height="46"
        rx="5"
        fill={body}
        stroke="#0b1d28"
        strokeOpacity=".25"
      />
      <rect x="19.5" y="23.5" width="61" height="39" rx="2.5" fill="#c8cdea" />
      <path
        d="M19.5 50c16-8 22 2 34-8s16-4 27-12v30a2.5 2.5 0 0 1-2.5 2.5h-56a2.5 2.5 0 0 1-2.5-2.5Z"
        fill="#8f97cf"
      />
      <path d="M6 70h88l-5 8a4 4 0 0 1-3.4 2H14.4a4 4 0 0 1-3.4-2Z" fill="#aab4ba" />
    </>
  ),
}

type Props = {
  category: Category
  /** Body color of the product, e.g. the chosen color option. */
  color?: string
  className?: string
}

/** A square product picture on a soft tinted tile. */
export function ProductPicture({ category, color, className }: Props) {
  return (
    <div className={cn('grid aspect-square place-items-center', tints[category], className)}>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="size-[62%]">
        {drawings[category](color ?? defaultBody[category])}
      </svg>
    </div>
  )
}
