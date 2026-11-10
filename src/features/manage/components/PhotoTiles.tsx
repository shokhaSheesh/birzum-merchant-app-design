import { ImagePlus, X } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

type Props = {
  images: string[]
  onChange: (images: string[]) => void
  /** `sm` for a row of photos inside a card, e.g. one color's photos. */
  size?: 'md' | 'sm'
}

/** Photos as square tiles with a remove button each, ending in a dashed tile that adds more. */
export function PhotoTiles({ images, onChange, size = 'md' }: Props) {
  const { t } = useI18n()
  // The backend has no photo upload for merchants yet (API doc §4): a product takes ready
  // http(s) links, so the tile asks for one.
  const addByUrl = () => {
    const url = window.prompt(t('product.photos.url'))?.trim()
    if (url && /^https?:\/\/\S+$/.test(url) && !images.includes(url)) onChange([...images, url])
  }
  const tile = size === 'sm' ? 'size-16' : 'size-24'

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((src) => (
        <div key={src} className={cn('relative overflow-hidden rounded-control bg-surface', tile)}>
          <img src={src} alt="" className="size-full object-cover" />
          <button
            type="button"
            aria-label={t('product.photos.remove')}
            onClick={() => onChange(images.filter((x) => x !== src))}
            className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-canvas/90 text-danger"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        aria-label={t('product.photos.add')}
        onClick={addByUrl}
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-control border-[1.5px] border-dashed border-navy-400 px-1 text-center text-xs font-semibold text-brand active:bg-navy-100',
          tile,
        )}
      >
        <ImagePlus size={size === 'sm' ? 20 : 24} />
        {size === 'md' && t('product.photos.add')}
      </button>
    </div>
  )
}
