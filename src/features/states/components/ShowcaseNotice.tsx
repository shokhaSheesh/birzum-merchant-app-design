import {
  Ban,
  Clock,
  CreditCard,
  KeyRound,
  LockKeyhole,
  type LucideIcon,
  MessageSquareText,
  PhoneCall,
  PhoneOff,
  ShieldAlert,
  Smartphone,
  Timer,
  Undo2,
} from 'lucide-react'
import { useState } from 'react'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { useCountdown } from '@/shared/lib/useCountdown'
import { Button } from '@/shared/ui/Button'
import { NoticeSheet, type NoticeTone } from '@/shared/ui/NoticeSheet'

/** Every state shown as a notice: the shop's waits, and Nizom (the client's blocked sign-in is there). */
export const NOTICE_IDS = {
  merchant: ['appWaiting', 'appExpired', 'refundWaiting', 'refundClosed'],
  nizom: [
    'phoneNotYours',
    'cardPhone',
    'wrongCode',
    'codeBlocked',
    'newDevice',
    'cardsRemoved',
    'blocked',
    'callBlocked',
    'sessionEnded',
  ],
} as const
export type NoticeId = (typeof NOTICE_IDS.merchant)[number] | (typeof NOTICE_IDS.nizom)[number]

/** The sheet header says where the state shows up: sign-in, the application, cards, etc. */
type Look = { icon: LucideIcon; tone: NoticeTone; where: TranslationKey }

export const NOTICE_LOOKS: Record<NoticeId, Look> = {
  blocked: { icon: ShieldAlert, tone: 'danger', where: 'show.where.signIn' },
  appWaiting: { icon: Clock, tone: 'warning', where: 'show.where.application' },
  appExpired: { icon: Clock, tone: 'danger', where: 'show.where.application' },
  refundWaiting: { icon: Undo2, tone: 'warning', where: 'show.where.application' },
  refundClosed: { icon: Ban, tone: 'danger', where: 'application.changeStatus' },
  phoneNotYours: { icon: PhoneOff, tone: 'danger', where: 'show.where.signIn' },
  cardPhone: { icon: CreditCard, tone: 'danger', where: 'show.where.card' },
  wrongCode: { icon: KeyRound, tone: 'danger', where: 'show.where.signIn' },
  codeBlocked: { icon: Timer, tone: 'danger', where: 'show.where.signIn' },
  newDevice: { icon: Smartphone, tone: 'danger', where: 'show.where.signIn' },
  cardsRemoved: { icon: CreditCard, tone: 'warning', where: 'show.where.card' },
  callBlocked: { icon: PhoneCall, tone: 'warning', where: 'show.where.app' },
  sessionEnded: { icon: LockKeyhole, tone: 'info', where: 'show.where.app' },
}

const CLIENT_PHONE = '901234567'
const BLOCK_SECONDS = 15 * 60

const formatTimer = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Opens one notice state. Showcase only: the buttons close it or move to the next state. */
export function ShowcaseNotice({ id, onClose }: { id: NoticeId; onClose: () => void }) {
  const { t } = useI18n()
  // «Ilovasi yoʻq» on the shop's waiting screen sends the link and shows that it went
  const [linkSent, setLinkSent] = useState(false)
  const [blockLeft] = useCountdown(BLOCK_SECONDS)

  if (id === 'appWaiting' && linkSent) {
    return (
      <NoticeSheet
        onClose={onClose}
        sheetTitle={t('show.where.application')}
        icon={MessageSquareText}
        tone="success"
        title={t('show.appWaiting.sent.title')}
        text={t('show.appWaiting.sent.text', { phone: formatPhone(CLIENT_PHONE) })}
        actions={
          <Button block onClick={onClose}>
            {t('common.close')}
          </Button>
        }
      />
    )
  }

  const look = NOTICE_LOOKS[id]
  const close = (
    <Button block onClick={onClose}>
      {t(`show.${id}.button` as TranslationKey)}
    </Button>
  )
  const actions =
    id === 'appWaiting' ? (
      <>
        <Button variant="ghost" block onClick={() => setLinkSent(true)}>
          {t('show.appWaiting.noApp')}
        </Button>
        {close}
      </>
    ) : id === 'blocked' ? (
      <>
        <Button variant="ghost" block onClick={onClose}>
          {t('common.close')}
        </Button>
        {close}
      </>
    ) : id === 'codeBlocked' ? (
      <Button block disabled={blockLeft > 0} onClick={onClose}>
        {t('show.codeBlocked.button')}
      </Button>
    ) : (
      close
    )

  return (
    <NoticeSheet
      onClose={onClose}
      sheetTitle={t(look.where)}
      icon={look.icon}
      tone={look.tone}
      title={t(`show.${id}.title` as TranslationKey)}
      text={
        <>
          {t(`show.${id}.text` as TranslationKey, { phone: formatPhone(CLIENT_PHONE) })}
          {id === 'codeBlocked' && (
            <p className="mt-3 text-2xl font-bold text-danger tabular-nums">
              {formatTimer(blockLeft)}
            </p>
          )}
        </>
      }
      actions={actions}
    />
  )
}
