import { useState, type FormEvent } from 'react'
import { REJECT_REASONS, type RejectReason, type Rejection } from '@/entities/clients/clients'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { TextAreaField } from '@/shared/ui/TextAreaField'

type Props = {
  onClose: () => void
  onReject: (rejection: Rejection) => Promise<void>
}

/** Asks why before an application is rejected. Mount it only while it is open. */
export function RejectSheet({ onClose, onReject }: Props) {
  const { t } = useI18n()
  const [reason, setReason] = useState<RejectReason | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  // "Other" says nothing on its own, so it needs the comment
  const commentMissing = reason === 'other' && comment.trim() === ''

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!reason || commentMissing) return
    setLoading(true)
    await onReject({ reason, comment: comment.trim() })
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={t('reject.title')}>
      <form onSubmit={(e) => void submit(e)} noValidate className="flex flex-col gap-4 pt-1 pb-1">
        <Select
          label={t('reject.reason')}
          options={REJECT_REASONS.map((value) => ({
            value,
            label: t(`reject.reason.${value}`),
          }))}
          value={reason}
          onChange={setReason}
          error={submitted && !reason ? t('error.required') : undefined}
        />
        <TextAreaField
          label={t('field.comment')}
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={submitted && commentMissing ? t('error.required') : undefined}
          hint={t('reject.hint')}
        />
        <Button type="submit" variant="danger" block loading={loading} className="mt-2">
          {t('application.reject')}
        </Button>
      </form>
    </Sheet>
  )
}
