import { locationsStore } from '@/entities/merchant/locations'
import { loadLocations } from '@/entities/merchant/merchantApi'
import { useRemote } from '@/shared/api/useRemote'
import { managePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { ListRow, ListScreen } from '../components/ListScreen'

/** The merchant's shops. */
export function LocationsPage() {
  const { t, tl } = useI18n()
  const locations = locationsStore.useAll()
  const { loading, failed, reload } = useRemote(loadLocations)

  return (
    <ListScreen
      title={t('manage.locations')}
      createTo={managePath('locations', 'new')}
      empty={locations.length === 0}
      loading={loading}
      failed={failed}
      onRetry={reload}
    >
      <ul className="rounded-card border border-line bg-canvas px-4">
        {locations.map((location) => (
          <ListRow
            key={location.id}
            to={managePath('locations', location.id)}
            title={tl(location.name)}
            lines={[tl(location.address), location.hours].filter(Boolean)}
            inactiveLabel={location.active ? undefined : t('common.inactive')}
          />
        ))}
      </ul>
    </ListScreen>
  )
}
