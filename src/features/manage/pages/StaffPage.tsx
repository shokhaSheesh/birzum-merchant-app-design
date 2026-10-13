import { locationsStore } from '@/entities/merchant/locations'
import { rolesStore } from '@/entities/merchant/roles'
import { staffStore } from '@/entities/merchant/staff'
import { managePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Avatar } from '@/shared/ui/Avatar'
import { ListRow, ListScreen } from '../components/ListScreen'

/** Everyone who can sign in to the merchant app, with their role and shops. */
export function StaffPage() {
  const { t, tl } = useI18n()
  const staff = staffStore.useAll()
  const roles = rolesStore.useAll()
  const locations = locationsStore.useAll()

  return (
    <ListScreen
      title={t('manage.staff')}
      createTo={managePath('staff', 'new')}
      empty={staff.length === 0}
    >
      <ul className="rounded-card bg-surface px-4">
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
              roles.find((role) => role.id === member.roleId)?.name ?? t('common.none'),
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
