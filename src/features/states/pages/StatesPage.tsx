import {
  CircleAlert,
  CircleCheck,
  Inbox,
  LayoutGrid,
  LayoutList,
  PanelTop,
  Rows3,
  TriangleAlert,
} from 'lucide-react'
import { stateDemoPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { ERROR_KINDS } from '@/shared/ui/errorKinds'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'

/**
 * A gallery of the states a real build needs but sample data never shows: loading, errors,
 * empty, and the confirmation toasts. Each row opens that state as a full screen.
 */
export function StatesPage() {
  const { t } = useI18n()

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
    </div>
  )
}
