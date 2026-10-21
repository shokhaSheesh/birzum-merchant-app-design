import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, LocateFixed, MapPin, Minus, Plus, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { OVERLAY_ROOT_ID } from '@/shared/config/overlay'
import { useI18n } from '@/shared/i18n/useI18n'
import { placeAt, searchPlaces, type Place } from '@/shared/lib/geocode'
import { Button } from './Button'

// Tashkent, where the map opens when there is no address and no location yet
const START = { lat: 41.3111, lng: 69.2797 }

const mapButton =
  'grid size-11 place-items-center rounded-full border border-line bg-canvas text-brand shadow-[0_4px_12px_-4px_rgb(7_42_60/0.3)] active:bg-navy-100'

type Props = {
  open: boolean
  title: string
  /** The address picked before, to open on. */
  value?: Place | null
  onClose: () => void
  onPick: (place: Place) => void
}

/**
 * Full-screen map for picking an address. The pin stays in the middle and the map moves under
 * it; the address of the spot under the pin shows at the bottom. On top a search box, on the
 * right zoom in, zoom out and "my location"; the shopper's own position is a blue dot.
 */
export function MapPicker({ open, title, value, onClose, onPick }: Props) {
  const root = open ? document.getElementById(OVERLAY_ROOT_ID) : null
  if (!root) return null
  return createPortal(
    <MapScreen title={title} value={value} onClose={onClose} onPick={onPick} />,
    root,
  )
}

function MapScreen({ title, value, onClose, onPick }: Omit<Props, 'open'>) {
  const { t, lang } = useI18n()
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const me = useRef<L.CircleMarker | null>(null)
  const [place, setPlace] = useState<Place | null>(value ?? null)
  const [finding, setFinding] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[] | null>(null)
  const [locateError, setLocateError] = useState(false)

  // Shows the shopper's position as a blue dot and, when asked, moves the map there. A failure
  // is only reported when the shopper pressed the button.
  const locate = (center: boolean, pressed = false) => {
    if (!navigator.geolocation) return pressed && setLocateError(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here: L.LatLngExpression = [coords.latitude, coords.longitude]
        setLocateError(false)
        if (!map.current) return
        if (me.current) me.current.setLatLng(here)
        else
          me.current = L.circleMarker(here, {
            radius: 8,
            color: '#ffffff',
            weight: 3,
            fillColor: '#2f7bf5',
            fillOpacity: 1,
          }).addTo(map.current)
        if (center) map.current.setView(here, 17)
      },
      () => pressed && setLocateError(true),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  useEffect(() => {
    if (!box.current) return
    const start = value ?? START
    const m = L.map(box.current, { zoomControl: false, attributionControl: false }).setView(
      [start.lat, start.lng],
      value ? 17 : 13,
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m)
    L.control
      .attribution({ prefix: false, position: 'topright' })
      .addAttribution('© OpenStreetMap')
      .addTo(m)
    map.current = m

    // Reads the address under the pin once the map stops moving
    let request: AbortController | null = null
    const read = () => {
      request?.abort()
      request = new AbortController()
      const { lat, lng } = m.getCenter()
      setFinding(true)
      placeAt(lat, lng, lang, request.signal)
        .then((found) => setPlace(found ?? { lat, lng, text: '' }))
        .catch(() => {})
        .finally(() => setFinding(false))
    }
    m.on('moveend', read)
    if (!value) read()
    // Without an address yet, open on where the shopper is
    locate(!value)
    return () => {
      request?.abort()
      m.remove()
      map.current = null
      me.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Search as the shopper types, a moment after they stop
  useEffect(() => {
    const needle = query.trim()
    if (needle.length < 3) return setResults(null)
    const request = new AbortController()
    const timer = setTimeout(() => {
      searchPlaces(needle, lang, request.signal)
        .then(setResults)
        .catch(() => {})
    }, 400)
    return () => {
      clearTimeout(timer)
      request.abort()
    }
  }, [query, lang])

  const goTo = (found: Place) => {
    setQuery('')
    setResults(null)
    map.current?.setView([found.lat, found.lng], 17)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="absolute inset-0 z-50 flex flex-col bg-page"
    >
      <div className="relative min-h-0 flex-1">
        <div ref={box} className="absolute inset-0 z-0" />

        {/* The pin marks the middle of the map; its tip is the picked point */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-[500] -translate-x-1/2 -translate-y-full text-brand drop-shadow-[0_4px_6px_rgb(7_42_60/0.35)]"
        >
          <MapPin size={44} fill="var(--color-green-300)" strokeWidth={1.8} />
        </span>

        <div className="absolute inset-x-0 top-0 z-[600] flex flex-col gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t('common.back')}
              onClick={onClose}
              className={mapButton}
            >
              <ArrowLeft size={22} />
            </button>
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-canvas px-4 shadow-[0_4px_12px_-4px_rgb(7_42_60/0.3)]">
              <Search size={18} className="shrink-0 text-ink-subtle" />
              <input
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                aria-label={t('map.search')}
                placeholder={t('map.search')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-subtle"
              />
              {query && (
                <button
                  type="button"
                  aria-label={t('common.clear')}
                  onClick={() => setQuery('')}
                  className="text-ink-subtle"
                >
                  <X size={18} />
                </button>
              )}
            </label>
          </div>
          {results && (
            <ul className="max-h-72 overflow-y-auto rounded-card border border-line bg-canvas px-2 py-1 shadow-[0_12px_32px_-12px_rgb(7_42_60/0.35)]">
              {results.length === 0 ? (
                <li className="px-2 py-3 text-sm text-ink-muted">{t('map.noResults')}</li>
              ) : (
                results.map((found) => (
                  <li key={`${found.lat},${found.lng}`}>
                    <button
                      type="button"
                      onClick={() => goTo(found)}
                      className="flex w-full items-start gap-2 rounded-control px-2 py-2.5 text-left text-sm active:bg-navy-100"
                    >
                      <MapPin size={18} className="mt-0.5 shrink-0 text-ink-subtle" />
                      {found.text}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <div className="absolute right-4 bottom-4 z-[600] flex flex-col gap-2">
          <button
            type="button"
            aria-label={t('map.zoomIn')}
            onClick={() => map.current?.zoomIn()}
            className={mapButton}
          >
            <Plus size={22} />
          </button>
          <button
            type="button"
            aria-label={t('map.zoomOut')}
            onClick={() => map.current?.zoomOut()}
            className={mapButton}
          >
            <Minus size={22} />
          </button>
          <button
            type="button"
            aria-label={t('map.locate')}
            onClick={() => locate(true, true)}
            className={`${mapButton} mt-2`}
          >
            <LocateFixed size={22} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-t-[28px] bg-canvas px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(7_42_60/0.25)]">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-ink-muted">{title}</p>
          <p className="min-h-12 font-semibold">
            {finding ? t('map.finding') : place?.text || t('map.hint')}
          </p>
          {locateError && <p className="text-sm text-danger">{t('map.locateError')}</p>}
        </div>
        <Button block disabled={finding || !place?.text} onClick={() => place && onPick(place)}>
          {t('map.confirm')}
        </Button>
      </div>
    </div>
  )
}
