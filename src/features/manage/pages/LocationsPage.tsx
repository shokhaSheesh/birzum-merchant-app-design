import { locationsStore } from '@/entities/merchant/locations'
import { managePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { ListRow, ListScreen } from '../components/ListScreen'

/** The merchant's shops. */
export function LocationsPage() {
  const { t, tl } = useI18n()
  const locations = locationsStore.useAll()

  return (
    <ListScreen
      title={t('manage.locations')}
      createTo={managePath('locations', 'new')}
      empty={locations.length === 0}
    >
      <ul className="rounded-card bg-surface px-4">
        {locations.map((location) => (
          <ListRow
            key={location.id}
            to={managePath('locations', location.id)}
            title={tl(location.name)}
            lines={[tl(location.address), tl(location.hours)]}
            inactiveLabel={location.active ? undefined : t('common.inactive')}
          />
        ))}
      </ul>
    </ListScreen>
  )
}
