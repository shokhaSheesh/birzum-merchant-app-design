import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white active:bg-navy-950',
  secondary: 'bg-surface text-navy-900 active:bg-navy-100',
  ghost: 'bg-transparent text-navy-900 active:bg-surface',
  danger: 'bg-danger text-white active:opacity-90',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  block?: boolean
  loading?: boolean
}

export function Button({
  variant = 'primary',
  block,
  loading,
  disabled,
  className,
  type = 'button',
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'flex h-13 items-center justify-center gap-2 rounded-control px-5 text-base font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600',
        'disabled:opacity-45',
        variants[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <LoaderCircle size={20} className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
