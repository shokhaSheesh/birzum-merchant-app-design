import { CircleCheck, Clock } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatSum } from '@/shared/lib/format'
import { formatPhone } from '@/shared/lib/phone'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from '@/shared/ui/Button'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { OtpField } from '@/shared/ui/OtpField'
import { ResendCode } from '@/shared/ui/ResendCode'
import { Sheet } from '@/shared/ui/Sheet'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { NoticeSheet } from '@/shared/ui/NoticeSheet'

/**
 * `contract`: a new contract, the client's own order after the shop confirmed it or one the
 * shop filled in. `cancel`: the goods came back within the 3 days. `refund`: a return after
 * «Shartnoma tasdiqlandi», inside the refund window.
 */
export type ConfirmKind = 'contract' | 'cancel' | 'refund'

const PHONE = '901234567'
const RESEND_SECONDS = 59

/**
 * The client's confirmation, opened from a push or when the app opens: what is being signed,
 * «Tasdiqlash», then the SMS code. Showcase only: any code but 000000 goes through.
 */
export function ClientConfirmSheet({
  kind,
  expired,
  onClose,
}: {
  kind: ConfirmKind
  expired?: boolean
  onClose: () => void
}) {
  const { t } = useI18n()
  const [step, setStep] = useState<'summary' | 'code' | 'done'>('summary')
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [secondsLeft, setSecondsLeft] = useCountdown(0)
  const title = t(`show.confirm.${kind}.title`)

  if (expired) {
    return (
      <NoticeSheet
        onClose={onClose}
        sheetTitle={title}
        icon={Clock}
        tone="danger"
        title={t('show.confirm.expired.title')}
        text={t(`show.confirm.${kind}.expired`)}
        actions={
          <Button block onClick={onClose}>
            {t('common.close')}
          </Button>
        }
      />
    )
  }

  if (step === 'done') {
    return (
      <NoticeSheet
        onClose={onClose}
        sheetTitle={title}
        icon={CircleCheck}
        tone="success"
        title={t(`show.confirm.${kind}.done`)}
        text={t(`show.confirm.${kind}.doneText`)}
        actions={
          <Button block onClick={onClose}>
            {t('common.close')}
          </Button>
        }
      />
    )
  }

  const verify = () => {
    if (code === '000000') {
      setError(true)
      return
    }
    setStep('done')
  }

  return (
    <Sheet open onClose={onClose} title={title}>
      {step === 'summary' ? (
        <div className="flex flex-col gap-4 pt-1 pb-1">
          <div className="self-start">
            <StatusBadge tone="warning">{t('show.confirm.waiting')}</StatusBadge>
          </div>
          <p className="text-ink-muted">{t(`show.confirm.${kind}.text`)}</p>
          <InfoList>
            <InfoRow label={t('profile.store')} value="Mediapark" />
            <InfoRow label={t('show.confirm.product')} value="Samsung Galaxy A35 (Koʻk, 128 GB)" />
            {kind === 'contract' ? (
              <>
                <InfoRow label={t('show.confirm.term')} value={t('show.confirm.months')} />
                <InfoRow label={t('show.confirm.monthly')} value={formatSum(738_000)} />
                <InfoRow label={t('contract.installmentTotal')} value={formatSum(4_428_000)} />
              </>
            ) : (
              <InfoRow label={t('show.confirm.contract')} value="B-52463/26" />
            )}
          </InfoList>
          <p className="flex items-center gap-2 rounded-control bg-warning-soft px-4 py-3 text-sm font-semibold text-warning">
            <Clock size={18} className="shrink-0" />
            {t('show.confirm.deadline')}
          </p>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" block onClick={onClose}>
              {t(kind === 'contract' ? 'common.cancel' : 'show.confirm.later')}
            </Button>
            <Button
              block
              onClick={() => {
                setStep('code')
                setSecondsLeft(RESEND_SECONDS)
              }}
            >
              {t('code.submit')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pt-1 pb-1">
          <p className="text-ink-muted">{t('code.subtitle', { phone: formatPhone(PHONE) })}</p>
          <OtpField
            label={t('code.title')}
            value={code}
            onChange={(value) => {
              setCode(value)
              setError(false)
            }}
            error={error ? t('code.error') : undefined}
            autoFocus
          />
          <ResendCode secondsLeft={secondsLeft} onResend={() => setSecondsLeft(RESEND_SECONDS)} />
          <Button block disabled={code.length < 6} onClick={verify}>
            {t('code.submit')}
          </Button>
        </div>
      )}
    </Sheet>
  )
}
