import { rolesStore } from '@/entities/merchant/roles'
import { staffStore } from '@/entities/merchant/staff'
import { managePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { ListRow, ListScreen } from '../components/ListScreen'

/** Roles, each a named set of permissions that staff are given. */
export function RolesPage() {
  const { t } = useI18n()
  const roles = rolesStore.useAll()
  const staff = staffStore.useAll()

  return (
    <ListScreen
      title={t('manage.roles')}
      createTo={managePath('roles', 'new')}
      empty={roles.length === 0}
    >
      <ul className="rounded-card bg-surface px-4">
        {roles.map((role) => (
          <ListRow
            key={role.id}
            to={managePath('roles', role.id)}
            title={role.name}
            lines={[
              t('role.summary', {
                permissions: String(role.permissions.length),
                staff: String(staff.filter((member) => member.roleId === role.id).length),
              }),
            ]}
          />
        ))}
      </ul>
    </ListScreen>
  )
}
