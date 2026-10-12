import { ProductPicture } from '@/entities/catalog/ProductPicture'
import type { Category, Variation } from '@/entities/catalog/products'
import { cn } from '@/shared/lib/cn'

type Props = {
  variation: Variation
  /** Index of the chosen option. */
  value: number
  onChange: (index: number) => void
  category: Category
}

/**
 * One product option group. Colors are small pictures of the product in that color; anything
 * else is a compact text pill. Nothing is filled in: the choice is marked by its border alone.
 */
export function VariationPicker({ variation, value, onChange, category }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink-muted">
        {variation.name}:{' '}
        <span className="font-semibold text-ink">{variation.options[value].label}</span>
      </p>
      <div role="radiogroup" aria-label={variation.name} className="flex flex-wrap gap-2">
        {variation.options.map((option, index) => {
          const selected = index === value
          const ring = selected ? 'border-primary' : 'border-line'
          return option.swatch ? (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              onClick={() => onChange(index)}
              className={cn('size-16 overflow-hidden rounded-control border-2', ring)}
            >
              <ProductPicture category={category} color={option.swatch} />
            </button>
          ) : (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(index)}
              className={cn(
                'h-10 rounded-control border-2 px-3.5 text-sm font-semibold',
                ring,
                !selected && 'text-ink-muted',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
