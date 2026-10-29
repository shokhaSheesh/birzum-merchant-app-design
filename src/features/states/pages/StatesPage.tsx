import {
  CircleAlert,
  CircleCheck,
  ClockAlert,
  FileSignature,
  Undo2,
  Gauge,
  Inbox,
  KeyRound,
  LayoutGrid,
  LayoutList,
  PanelTop,
  Rows3,
  Smartphone,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import { ROUTES, stateDemoPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { ERROR_KINDS } from '@/shared/ui/errorKinds'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { ClientConfirmSheet, type ConfirmKind } from '../components/ClientConfirmSheet'
import {
  NOTICE_IDS,
  NOTICE_LOOKS,
  ShowcaseNotice,
  type NoticeId,
} from '../components/ShowcaseNotice'

type Open =
  | { sheet: 'confirm'; kind: ConfirmKind; expired?: boolean }
  | { sheet: 'notice'; id: NoticeId }
  | null

const CONFIRM_ROWS: { kind: ConfirmKind; expired?: boolean; icon: typeof FileSignature }[] = [
  { kind: 'contract', icon: FileSignature },
  { kind: 'contract', expired: true, icon: ClockAlert },
  { kind: 'cancel', icon: Undo2 },
  { kind: 'refund', icon: Undo2 },
  { kind: 'refund', expired: true, icon: ClockAlert },
]

/**
 * A gallery of the states a real build needs but sample data never shows: loading, errors,
 * empty, the confirmation toasts, and the sheets drawn ahead of their logic (the client's OTP
 * confirmations, the shop's waits, the Nizom security errors). Rows open a screen or a sheet.
 */
export function StatesPage() {
  const { t } = useI18n()
  const [open, setOpen] = useState<Open>(null)
  const noticeRow = (id: NoticeId) => (
    <MenuRow
      key={id}
      icon={NOTICE_LOOKS[id].icon}
      label={t(`show.${id}.row`)}
      onClick={() => setOpen({ sheet: 'notice', id })}
    />
  )

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('states.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 pt-2 pb-8">
        <p className="text-ink-muted">{t('states.hint')}</p>

        <Section title={t('states.loading')}>
          <MenuList>
            <MenuRow
              icon={LayoutList}
              label={t('states.loading.rows')}
              to={stateDemoPath('rows')}
            />
            <MenuRow
              icon={LayoutGrid}
              label={t('states.loading.grid')}
              to={stateDemoPath('grid')}
            />
            <MenuRow icon={Rows3} label={t('states.loading.cards')} to={stateDemoPath('cards')} />
            <MenuRow
              icon={PanelTop}
              label={t('states.loading.detail')}
              to={stateDemoPath('detail')}
            />
          </MenuList>
        </Section>

        <Section title={t('states.errors')}>
          <MenuList>
            {ERROR_KINDS.map((kind) => (
              <MenuRow
                key={kind}
                icon={TriangleAlert}
                label={t(`errorState.${kind}.title`)}
                to={stateDemoPath(kind)}
              />
            ))}
            <MenuRow icon={Inbox} label={t('states.empty')} to={stateDemoPath('empty')} />
          </MenuList>
        </Section>

        <Section title={t('states.customer')}>
          <MenuList>
            <MenuRow icon={Smartphone} label={t('states.onboarding')} to={ROUTES.customerWelcome} />
            <MenuRow icon={KeyRound} label={t('states.pinSetup')} to={ROUTES.customerPinSetup} />
            <MenuRow
              icon={Gauge}
              label={t('states.scoringDeclined')}
              to={`${ROUTES.customerScoring}?result=declined`}
            />
            {CONFIRM_ROWS.map((row) => (
              <MenuRow
                key={`${row.kind}-${row.expired ? 'expired' : 'open'}`}
                icon={row.icon}
                label={t(`show.confirm.${row.kind}.${row.expired ? 'rowExpired' : 'row'}`)}
                onClick={() => setOpen({ sheet: 'confirm', kind: row.kind, expired: row.expired })}
              />
            ))}
          </MenuList>
        </Section>

        <Section title={t('show.merchant')}>
          <MenuList>{NOTICE_IDS.merchant.map(noticeRow)}</MenuList>
        </Section>

        <Section title={t('show.nizom')} hint={t('show.nizom.hint')}>
          <MenuList>{NOTICE_IDS.nizom.map(noticeRow)}</MenuList>
        </Section>

        <Section title={t('states.toasts')}>
          <Button variant="secondary" block onClick={() => toast(t('toast.saved'))}>
            <CircleCheck size={20} />
            {t('states.toast.success')}
          </Button>
          <Button variant="secondary" block onClick={() => toast(t('toast.failed'), 'error')}>
            <CircleAlert size={20} />
            {t('states.toast.error')}
          </Button>
        </Section>
      </div>

      {open?.sheet === 'confirm' && (
        <ClientConfirmSheet
          key={`${open.kind}-${open.expired}`}
          kind={open.kind}
          expired={open.expired}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.sheet === 'notice' && (
        <ShowcaseNotice key={open.id} id={open.id} onClose={() => setOpen(null)} />
      )}
    </div>
  )
}
