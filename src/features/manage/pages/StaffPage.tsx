import { locationsStore } from '@/entities/merchant/locations'
import { loadLocations, loadStaff } from '@/entities/merchant/merchantApi'
import { useRemote } from '@/shared/api/useRemote'
import { staffStore } from '@/entities/merchant/staff'
import { managePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Avatar } from '@/shared/ui/Avatar'
import { ListRow, ListScreen } from '../components/ListScreen'

/** Everyone who can sign in to the merchant app, with their role and shops. */
export function StaffPage() {
  const { t, tl } = useI18n()
  const staff = staffStore.useAll()
  const locations = locationsStore.useAll()
  const { loading, failed, reload } = useRemote(() => Promise.all([loadStaff(), loadLocations()]))

  return (
    <ListScreen
      title={t('manage.staff')}
      createTo={managePath('staff', 'new')}
      empty={staff.length === 0}
      loading={loading}
      failed={failed}
      onRetry={reload}
    >
      <ul className="rounded-card border border-line bg-canvas px-4">
        {staff.map((member) => (
          <ListRow
            key={member.id}
            to={managePath('staff', member.id)}
            leading={
              <Avatar
                initials={`${member.firstName[0]}${member.lastName[0]}`}
                photoUrl={member.photoUrl}
              />
            }
            title={`${member.firstName} ${member.lastName}`}
            lines={[
              t(`staff.role.${member.roleId}`),
              locations
                .filter((location) => member.locationIds.includes(location.id))
                .map((location) => tl(location.name))
                .join(', '),
            ]}
            inactiveLabel={member.active ? undefined : t('common.inactive')}
          />
        ))}
      </ul>
    </ListScreen>
  )
}
