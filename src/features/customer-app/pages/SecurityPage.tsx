import { KeyRound, ScanFace } from 'lucide-react'
import { security, useBiometric } from '@/entities/session/security'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SwitchRow } from '@/shared/ui/Switch'

/** How the app is opened: change the PIN, and turn Face ID on or off. */
export function SecurityPage() {
  const { t } = useI18n()
  const biometric = useBiometric()

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('pin.section')} />
      <div className="px-5 pt-2 pb-6">
        <MenuList>
          <MenuRow
            icon={KeyRound}
            label={t('pin.change')}
            to={`${ROUTES.customerPinSetup}?change=1`}
          />
          <SwitchRow
            icon={ScanFace}
            label={t('pin.biometric.toggle')}
            checked={biometric}
            onChange={security.setBiometric}
          />
        </MenuList>
      </div>
    </div>
  )
}
