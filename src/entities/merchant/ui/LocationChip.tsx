import { MapPin } from 'lucide-react'
import { useI18n } from '@/shared/i18n/useI18n'
import { SelectChip } from '@/shared/ui/SelectChip'
import { useMyLocations } from '../useMyLocations'

type Props = {
  /** A location id, or null for every shop the staff member works in. */
  value: string | null
  onChange: (locationId: string | null) => void
}

/**
 * A filter chip that narrows a screen to one of the staff member's shops. Hidden for
 * someone assigned to a single shop: there is nothing to choose.
 */
export function LocationChip({ value, onChange }: Props) {
  const { t, tl } = useI18n()
  const locations = useMyLocations()

  if (locations.length < 2) return null

  return (
    <SelectChip
      icon={MapPin}
      title={t('profile.branch')}
      allLabel={t('location.all')}
      options={locations.map((location) => ({ value: location.id, label: tl(location.name) }))}
      value={value}
      onChange={onChange}
    />
  )
}
