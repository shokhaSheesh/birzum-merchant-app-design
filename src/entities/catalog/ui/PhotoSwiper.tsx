import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, type MouseEvent } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { ProductPicture } from '../ProductPicture'
import type { Category } from '../products'

type Props = {
  images: string[]
  category: Category
  /** Used for the drawn stand-in when there are no photos. */
  color?: string
  /** Shape of each picture, e.g. its corner radius and aspect ratio. */
  tileClassName?: string
  /** `sm` for a card in a grid: smaller arrows and dots drawn over the picture. */
  size?: 'md' | 'sm'
  /** Called with the photo's position when a picture is tapped. */
  onOpen?: (index: number) => void
}

/**
 * A product's photos, swiped sideways one at a time. With several photos it shows dots and,
 * for a mouse, arrows at the sides. One photo (or none) is just the picture.
 */
export function PhotoSwiper({
  images,
  category,
  color,
  tileClassName,
  size = 'md',
  onOpen,
}: Props) {
  const { t } = useI18n()
  const strip = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const many = images.length > 1

  // The arrows may sit inside a link (a product card): they must not follow it
  const go = (e: MouseEvent, to: number) => {
    e.preventDefault()
    e.stopPropagation()
    const el = strip.current
    el?.scrollTo({ left: to * el.clientWidth, behavior: 'smooth' })
  }
  const arrow = cn(
    'absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-canvas/85 text-brand shadow-sm active:bg-canvas',
    size === 'sm' ? 'size-7' : 'size-9',
  )

  return (
    <div className="relative shrink-0">
      <div
        ref={strip}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) =>
          setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
        }
      >
        {(images.length > 0 ? images : [undefined]).map((src, i) => (
          <div
            key={src ?? 'drawing'}
            className="w-full shrink-0 snap-center"
            onClick={onOpen && src ? () => onOpen(i) : undefined}
          >
            <ProductPicture
              category={category}
              color={color}
              src={src}
              className={cn(tileClassName, onOpen && src && 'cursor-zoom-in')}
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          {index > 0 && (
            <button
              type="button"
              aria-label={t('gallery.prev')}
              onClick={(e) => go(e, index - 1)}
              className={cn(arrow, size === 'sm' ? 'left-1.5' : 'left-2')}
            >
              <ChevronLeft size={size === 'sm' ? 16 : 20} />
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              aria-label={t('gallery.next')}
              onClick={(e) => go(e, index + 1)}
              className={cn(arrow, size === 'sm' ? 'right-1.5' : 'right-2')}
            >
              <ChevronRight size={size === 'sm' ? 16 : 20} />
            </button>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5"
          >
            {images.map((src, i) => (
              <span
                key={src}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-4 bg-primary' : 'w-1.5 bg-navy-400/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
