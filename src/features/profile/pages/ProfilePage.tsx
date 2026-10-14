import {
  ArrowLeftRight,
  Boxes,
  LoaderCircle,
  LogOut,
  MapPin,
  Package,
  Shapes,
  ShieldCheck,
  Star,
  Tags,
  UsersRound,
  Globe,
  Palette,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMyLocations } from '@/entities/merchant/useMyLocations'
import { usePermissions } from '@/entities/merchant/usePermissions'
import { currentUser } from '@/entities/session/user'
import { logout } from '@/features/auth/api/mockAuth'
import { ROUTES } from '@/shared/config/routes'
import { LANG_NAMES } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { useTheme } from '@/shared/theme/useTheme'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { MenuList, MenuRow } from '@/shared/ui/MenuList'
import { Section } from '@/shared/ui/Section'

export function ProfilePage() {
  const { t, tl, lang } = useI18n()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const user = currentUser
  const { can, role } = usePermissions()
  const myLocations = useMyLocations()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col gap-7 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-tabbar">
      <h1 className="flex min-h-10 items-center text-2xl font-bold">{t('nav.menu')}</h1>

      <div className="flex items-center gap-4">
        <Avatar
          initials={`${user.firstName[0]}${user.lastName[0]}`}
          photoUrl={user.photoUrl}
          size="lg"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-xl leading-tight font-bold">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-ink-muted">{role?.name ?? t('profile.role')}</p>
        </div>
      </div>

      <InfoList>
        <InfoRow label={t('field.login')} value={user.login} />
        <InfoRow label={t('field.phone')} value={formatPhone(user.phone)} />
        <InfoRow label={t('profile.store')} value={user.store} />
        <InfoRow
          label={t(myLocations.length > 1 ? 'manage.locations' : 'profile.branch')}
          value={myLocations.map((location) => tl(location.name)).join(', ') || '—'}
        />
      </InfoList>

      {(can('products') || can('inventory')) && (
        <Section title={t('menu.catalog')}>
          <MenuList>
            {can('products') && (
              <MenuRow icon={Package} label={t('manage.products')} to={ROUTES.manageProducts} />
            )}
            {can('products') && (
              <MenuRow icon={Tags} label={t('manage.attributes')} to={ROUTES.manageAttributes} />
            )}
            {can('inventory') && (
              <MenuRow icon={Boxes} label={t('manage.inventory')} to={ROUTES.manageInventory} />
            )}
          </MenuList>
        </Section>
      )}

      {(can('locations') || can('staff') || can('roles')) && (
        <Section title={t('menu.shop')}>
          <MenuList>
            {can('locations') && (
              <MenuRow icon={MapPin} label={t('manage.locations')} to={ROUTES.manageLocations} />
            )}
            {can('staff') && (
              <MenuRow icon={UsersRound} label={t('manage.staff')} to={ROUTES.manageStaff} />
            )}
            {can('roles') && (
              <MenuRow icon={ShieldCheck} label={t('manage.roles')} to={ROUTES.manageRoles} />
            )}
            <MenuRow icon={Star} label={t('manage.reviews')} to={ROUTES.manageReviews} />
          </MenuList>
        </Section>
      )}

      <ActionCard
        icon={ArrowLeftRight}
        title={t('profile.switchToCustomer')}
        description={t('profile.switchToCustomer.hint')}
        onClick={() => navigate(ROUTES.customerApp)}
      />

      <Section title={t('profile.settings')}>
        <MenuList>
          <MenuRow
            icon={Palette}
            label={t('profile.theme')}
            to={ROUTES.theme}
            value={t(`theme.${theme}`)}
          />
          <MenuRow
            icon={Globe}
            label={t('profile.language')}
            to={ROUTES.language}
            value={LANG_NAMES[lang]}
          />
        </MenuList>
      </Section>

      <Section title={t('states.design')}>
        <MenuList>
          <MenuRow icon={Shapes} label={t('states.kit')} to={ROUTES.kit} />
          <MenuRow icon={LoaderCircle} label={t('states.title')} to={ROUTES.states} />
        </MenuList>
      </Section>

      <Button variant="secondary" block className="mt-auto" onClick={handleLogout}>
        <LogOut size={20} />
        {t('profile.logout')}
      </Button>
    </div>
  )
}
