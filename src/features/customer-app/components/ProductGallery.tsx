import { useState } from 'react'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import type { Category } from '@/entities/catalog/products'
import { cn } from '@/shared/lib/cn'

type Props = {
  images: string[]
  category: Category
  /** Used for the drawn stand-in when there are no photos. */
  color?: string
}

/** The product's photos, swiped sideways, with dots under them. One picture needs no dots. */
export function ProductGallery({ images, category, color }: Props) {
  const [index, setIndex] = useState(0)

  if (images.length <= 1) {
    return (
      <ProductPicture
        category={category}
        color={color}
        src={images[0]}
        className="aspect-[1/0.8]! shrink-0 rounded-card"
      />
    )
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-card"
        onScroll={(e) =>
          setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
        }
      >
        {images.map((src) => (
          <ProductPicture
            key={src}
            category={category}
            src={src}
            className="aspect-[1/0.8]! w-full shrink-0 snap-center rounded-card"
          />
        ))}
      </div>
      <div className="flex justify-center gap-1.5" aria-hidden>
        {images.map((src, i) => (
          <span
            key={src}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-4 bg-primary' : 'w-1.5 bg-navy-200',
            )}
          />
        ))}
      </div>
    </div>
  )
}
