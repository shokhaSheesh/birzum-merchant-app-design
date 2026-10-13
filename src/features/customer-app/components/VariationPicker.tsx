import type { Attribute } from '@/entities/catalog/attributes'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import type { Category } from '@/entities/catalog/products'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = {
  attribute: Attribute
  /** The values this product comes in. */
  valueIds: string[]
  /** The chosen value. */
  value: string
  onChange: (valueId: string) => void
  /** False for a value that is not sold together with the other current choices. */
  isAvailable: (valueId: string) => boolean
  category: Category
}

/**
 * One product option group. Colors are small pictures of the product in that color; anything
 * else is a compact text pill. Nothing is filled in: the choice is marked by its border alone,
 * and a value not sold in the current combination is faded and struck through.
 */
export function VariationPicker({
  attribute,
  valueIds,
  value,
  onChange,
  isAvailable,
  category,
}: Props) {
  const { tl } = useI18n()
  const values = attribute.values.filter((item) => valueIds.includes(item.id))
  const chosen = values.find((item) => item.id === value)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink-muted">
        {tl(attribute.name)}:{' '}
        <span className="font-semibold text-ink">{chosen ? tl(chosen.name) : ''}</span>
      </p>
      <div role="radiogroup" aria-label={tl(attribute.name)} className="flex flex-wrap gap-2">
        {values.map((item) => {
          const selected = item.id === value
          const state = cn(
            selected ? 'border-primary' : 'border-line',
            !isAvailable(item.id) && 'opacity-40',
          )
          return attribute.color ? (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={tl(item.name)}
              onClick={() => onChange(item.id)}
              className={cn('size-16 overflow-hidden rounded-control border-2', state)}
            >
              <ProductPicture category={category} color={item.swatch} />
            </button>
          ) : (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(item.id)}
              className={cn(
                'h-10 rounded-control border-2 px-3.5 text-sm font-semibold',
                state,
                !selected && 'text-ink-muted',
                !isAvailable(item.id) && 'line-through',
              )}
            >
              {tl(item.name)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
