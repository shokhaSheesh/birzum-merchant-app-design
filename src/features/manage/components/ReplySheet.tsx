import { useState, type FormEvent } from 'react'
import type { Review } from '@/entities/catalog/reviews'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'
import { TextAreaField } from '@/shared/ui/TextAreaField'

type Props = {
  review: Review
  onClose: () => void
  onSend: (text: string) => void
}

/** The merchant answers a review, or edits the answer. The client sees it under the review. */
export function ReplySheet({ review, onClose, onSend }: Props) {
  const { t } = useI18n()
  const [text, setText] = useState(review.reply?.text ?? '')
  const [submitted, setSubmitted] = useState(false)

  const send = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!text.trim()) return
    onSend(text.trim())
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={t('reply.title')}>
      <form onSubmit={send} noValidate className="flex flex-col gap-4 pt-1 pb-1">
        <div className="flex flex-col gap-1 rounded-control bg-surface px-3 py-2.5">
          <p className="text-sm font-semibold">{review.author}</p>
          {review.text && <p className="line-clamp-3 text-sm text-ink-muted">{review.text}</p>}
        </div>
        <TextAreaField
          label={t('reply.text')}
          hint={t('reply.hint')}
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={submitted && !text.trim() ? t('error.required') : undefined}
        />
        <Button type="submit" block className="mt-2">
          {t('feedback.send')}
        </Button>
      </form>
    </Sheet>
  )
}
