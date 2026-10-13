import { ChevronDown, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { OptionSheet } from '@/shared/ui/OptionSheet'
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
  const [open, setOpen] = useState(false)
  const locations = useMyLocations()
  const current = locations.find((location) => location.id === value)

  if (locations.length < 2) return null

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold whitespace-nowrap transition-colors',
          current ? 'bg-primary text-on-primary' : 'bg-surface text-brand active:bg-navy-100',
        )}
      >
        <MapPin size={18} />
        {current ? tl(current.name) : t('location.all')}
        <ChevronDown size={16} />
      </button>
      <OptionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t('profile.branch')}
        options={[
          { value: 'all', label: t('location.all') },
          ...locations.map((location) => ({ value: location.id, label: tl(location.name) })),
        ]}
        value={value ?? 'all'}
        onChange={(next) => onChange(next === 'all' ? null : next)}
      />
    </>
  )
}
