import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { OVERLAY_ROOT_ID } from '@/shared/config/overlay'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = {
  images: string[]
  /** The photo to open on. */
  start: number
  onClose: () => void
}

/**
 * A product's photos full screen: the chosen one large, the rest as thumbnails underneath
 * to jump between. Mount it only while it is open.
 */
export function PhotoViewer({ images, start, onClose }: Props) {
  const { t } = useI18n()
  const [index, setIndex] = useState(start)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  const root = document.getElementById(OVERLAY_ROOT_ID)
  if (!root) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('gallery.title')}
      className="absolute inset-0 z-50 flex flex-col bg-navy-950 text-white"
    >
      <header className="flex shrink-0 items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <p className="text-sm font-semibold opacity-75">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="-mr-2 grid size-10 place-items-center rounded-full active:bg-white/15"
        >
          <X size={24} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center px-2" onClick={onClose}>
        <img
          src={images[index]}
          alt=""
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-control object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`${i + 1} / ${images.length}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-control border-2 bg-white transition-opacity',
                i === index ? 'border-green-500' : 'border-transparent opacity-60',
              )}
            >
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    root,
  )
}
