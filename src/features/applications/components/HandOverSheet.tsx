import { Camera, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'

type Props = {
  onClose: () => void
  onConfirm: (photos: string[]) => Promise<void>
}

const MAX_PHOTOS = 3

/**
 * Confirms hand-over: the seller photographs the client holding the goods (one to three
 * photos) before the ariza moves to Topshirilgan. On a phone the camera opens straight away.
 */
export function HandOverSheet({ onClose, onConfirm }: Props) {
  const { t } = useI18n()
  const input = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    setSubmitted(true)
    if (photos.length === 0) return
    setLoading(true)
    await onConfirm(photos)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={t('handover.title')}>
      <div className="flex flex-col gap-4 pt-1 pb-1">
        <p className="text-ink-muted">{t('handover.hint')}</p>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-control">
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label={t('product.photos.remove')}
                onClick={() => setPhotos((list) => list.filter((item) => item !== src))}
                className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-canvas/90 text-danger"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-control border-[1.5px] border-dashed border-navy-400 text-sm font-semibold text-brand active:bg-surface"
            >
              <Camera size={26} />
              {t('handover.take')}
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setPhotos((list) => [...list, URL.createObjectURL(file)])
            e.target.value = ''
          }}
        />
        {submitted && photos.length === 0 && <Alert message={t('handover.required')} />}
        <Button block loading={loading} onClick={() => void confirm()}>
          {t('application.handOver')}
        </Button>
      </div>
    </Sheet>
  )
}
