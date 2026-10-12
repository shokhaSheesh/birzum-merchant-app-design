import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'accent' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white active:bg-navy-950',
  accent: 'bg-lime-500 text-navy-950 active:bg-lime-600',
  ghost: 'bg-transparent text-navy-900 active:bg-navy-100',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  block?: boolean
}

export function Button({ variant = 'primary', block, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'h-13 rounded-control px-5 text-base font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600',
        'disabled:opacity-40',
        variants[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    />
  )
}
