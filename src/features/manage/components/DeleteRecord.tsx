import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'

type Props = {
  onDelete: () => void
  /** Why this record cannot be deleted right now. Shown instead of the button. */
  blocked?: string
}

/** The delete action at the end of an edit form: a quiet red button, then a confirmation. */
export function DeleteRecord({ onDelete, blocked }: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  if (blocked) return <Alert message={blocked} />

  return (
    <>
      <Button variant="ghost" block className="text-danger!" onClick={() => setOpen(true)}>
        <Trash2 size={20} />
        {t('common.delete')}
      </Button>
      <ConfirmSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t('confirm.delete.title')}
        message={t('confirm.delete.message')}
        confirmLabel={t('common.delete')}
        onConfirm={() => {
          onDelete()
          toast(t('toast.deleted'))
        }}
      />
    </>
  )
}
