import { Star } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'
import { TextAreaField } from '@/shared/ui/TextAreaField'

type Props = {
  shopName: string
  onClose: () => void
  onSend: (rating: number, text: string) => void
}

/** The shopper rates a shop after getting the goods: one to five stars and a few words. */
export function ReviewSheet({ shopName, onClose, onSend }: Props) {
  const { t } = useI18n()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const send = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (rating === 0) return
    onSend(rating, text.trim())
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={shopName}>
      <form onSubmit={send} noValidate className="flex flex-col gap-4 pt-1 pb-1">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-ink-muted">{t('feedback.rating')}</p>
          <div role="radiogroup" aria-label={t('feedback.rating')} className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} / 5`}
                onClick={() => setRating(n)}
                className="grid size-12 place-items-center rounded-full active:bg-navy-100"
              >
                <Star
                  size={32}
                  className={cn(n <= rating ? 'fill-warning text-warning' : 'text-navy-200')}
                />
              </button>
            ))}
          </div>
          {submitted && rating === 0 && (
            <p role="alert" className="text-sm text-danger">
              {t('error.rating')}
            </p>
          )}
        </div>
        <TextAreaField
          label={t('feedback.text')}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" block className="mt-2">
          {t('feedback.send')}
        </Button>
      </form>
    </Sheet>
  )
}
