import { useState } from 'react'
import { loadMapKeys, rotateMapKey, type MapKey } from '@/entities/merchant/merchantApi'
import { toastError } from '@/shared/api/client'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Section } from '@/shared/ui/Section'
import { StatusBadge } from '@/shared/ui/StatusBadge'

type Row = { label: TranslationKey; endpoints?: string }

/** Screens wired to the backend, with the endpoints they call (birzum-mobile-api.md §1). */
const WIRED: Row[] = [
  { label: 'nav.home', endpoints: 'GET /merchant/me (name, role, shops)' },
  { label: 'nav.menu', endpoints: 'GET /merchant/me (name, role, permissions, shops)' },
  {
    label: 'manage.locations',
    endpoints:
      'GET/POST /merchant/locations, PUT/DELETE /merchant/locations/:id (map pin, weekly schedule)',
  },
  {
    label: 'manage.attributes',
    endpoints: 'GET/POST /merchant/variation-types, PUT/DELETE /merchant/variation-types/:id',
  },
  {
    label: 'manage.products',
    endpoints:
      'GET/POST /merchant/products, PUT/DELETE /merchant/products/:id (moderation states, photos by link)',
  },
  { label: 'manage.inventory', endpoints: 'GET/PUT /merchant/inventory' },
  { label: 'manage.reviews', endpoints: 'GET /merchant/reviews (read only)' },
  {
    label: 'manage.staff',
    endpoints: 'GET/POST /merchant/staff, GET/PUT/DELETE /merchant/staff/:id',
  },
]

/** Screens that keep sample data: the backend has no endpoint for them yet (§4). */
const SAMPLE: Row[] = [
  { label: 'nav.clients' },
  { label: 'nav.applications' },
  { label: 'nav.calculator' },
  { label: 'notifications.title' },
]

function RowList({ rows, tone }: { rows: Row[]; tone: 'success' | 'warning' }) {
  const { t } = useI18n()
  return (
    <ul className="rounded-card border border-line bg-canvas px-4">
      {rows.map((row) => (
        <li
          key={row.label}
          className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">{t(row.label)}</p>
            <StatusBadge tone={tone}>
              {t(tone === 'success' ? 'api.wired' : 'api.sample')}
            </StatusBadge>
          </div>
          <p className="text-sm break-words text-ink-muted">
            {row.endpoints ?? t('api.sample.reason')}
          </p>
        </li>
      ))}
    </ul>
  )
}

const mask = (key: string) => `${key.slice(0, 8)}…`

/** Which screens talk to the real server, and a check of the map key rotation (§1.8). */
export function ApiStatusPage() {
  const { t } = useI18n()
  const [keys, setKeys] = useState<MapKey[] | null>(null)
  const [busy, setBusy] = useState(false)

  const fetchKeys = async () => {
    setBusy(true)
    try {
      setKeys(await loadMapKeys())
    } catch (error) {
      toastError(error)
    } finally {
      setBusy(false)
    }
  }

  // The key was rejected by the map: ask for another of the same kind, once
  const rotate = async (current: MapKey) => {
    setBusy(true)
    try {
      const next = await rotateMapKey(current.kind, current.id)
      setKeys((list) => list?.map((item) => (item.kind === current.kind ? next : item)) ?? null)
    } catch (error) {
      toastError(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('api.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
        <p className="text-sm text-ink-muted">{t('api.hint')}</p>
        <Section title={t('api.wired')}>
          <RowList rows={WIRED} tone="success" />
        </Section>
        <Section title={t('api.sample')}>
          <RowList rows={SAMPLE} tone="warning" />
        </Section>
        <Section title={t('api.signin')}>
          <p className="rounded-card border border-line bg-canvas p-4 text-sm text-ink-muted">
            {t('api.signin.reason')}
          </p>
        </Section>
        <Section title={t('api.map.title')} hint={t('api.map.hint')}>
          <Button variant="secondary" block loading={busy} onClick={fetchKeys}>
            {t('api.map.load')}
          </Button>
          {keys && keys.length === 0 && <p className="text-sm">{t('api.map.none')}</p>}
          {keys?.map((key) => (
            <div
              key={key.kind}
              className="flex items-center justify-between gap-3 rounded-card border border-line bg-canvas p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold">{key.kind}</p>
                <p className="truncate text-sm text-ink-muted">
                  id {key.id || '—'} · {mask(key.key)}
                </p>
              </div>
              {key.id && (
                <Button variant="ghost" disabled={busy} onClick={() => rotate(key)}>
                  {t('api.map.rotate')}
                </Button>
              )}
            </div>
          ))}
        </Section>
      </div>
    </div>
  )
}
