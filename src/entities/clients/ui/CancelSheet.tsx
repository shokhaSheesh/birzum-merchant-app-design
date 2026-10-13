import { useState, type FormEvent } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'
import { TextAreaField } from '@/shared/ui/TextAreaField'

type Props = {
  onClose: () => void
  onCancel: (comment: string) => Promise<void>
}

/** Asks why before an application is cancelled, in either app. Mount it only while it is open. */
export function CancelSheet({ onClose, onCancel }: Props) {
  const { t } = useI18n()
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (comment.trim() === '') return
    setLoading(true)
    await onCancel(comment.trim())
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={t('cancel.title')}>
      <form onSubmit={(e) => void submit(e)} noValidate className="flex flex-col gap-4 pt-1 pb-1">
        <TextAreaField
          label={t('cancel.reason')}
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={submitted && comment.trim() === '' ? t('error.required') : undefined}
          hint={t('cancel.hint')}
        />
        <Button type="submit" variant="danger" block loading={loading} className="mt-2">
          {t('cancel.title')}
        </Button>
      </form>
    </Sheet>
  )
}
