import { ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Sheet } from '@/shared/ui/Sheet'

type Props = {
  /** What is about to happen: sending an ariza, or taking money from the card. */
  action: 'checkout' | 'pay'
  onConfirm: () => void
  onCancel: () => void
}

/**
 * The Nizom's "Делаю сам" step: before an ariza or a payment the shopper ticks that nobody is
 * telling them what to press. Fraudsters phone posing as Birzum, a bank or the police and walk
 * people through it; this is the moment to stop.
 */
export function SelfCheck({ action, onConfirm, onCancel }: Props) {
  const { t } = useI18n()
  const [checked, setChecked] = useState(false)

  return (
    <div className="flex flex-col gap-4 pt-1 pb-1">
      <p className="flex gap-2.5 rounded-control bg-warning-soft px-4 py-3 text-sm text-warning">
        <ShieldAlert size={20} className="shrink-0" />
        {t('selfcheck.warn')}
      </p>
      <p className="text-ink-muted">{t(`selfcheck.text.${action}`)}</p>
      <Checkbox label={t('selfcheck.agree')} checked={checked} onChange={setChecked} />
      <div className="flex flex-col gap-1">
        <Button block disabled={!checked} onClick={onConfirm}>
          {t('selfcheck.continue')}
        </Button>
        <Button variant="ghost" block onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}

/** The same step in its own bottom sheet, for checkout. */
export function SelfCheckSheet({ open, ...props }: Props & { open: boolean }) {
  const { t } = useI18n()
  return (
    <Sheet open={open} onClose={props.onCancel} title={t('selfcheck.title')}>
      {open && <SelfCheck {...props} />}
    </Sheet>
  )
}
