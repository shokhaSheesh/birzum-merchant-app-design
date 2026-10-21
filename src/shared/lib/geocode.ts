import type { Lang } from '@/shared/i18n/dictionaries'

/** A point on the map with its address in words. */
export type Place = { lat: number; lng: number; text: string }

// OpenStreetMap's free geocoder, good enough for the prototype. The real app will use the
// backend's map provider; only these two functions need to change.
const NOMINATIM = 'https://nominatim.openstreetmap.org'

type Hit = { lat: string; lon: string; display_name: string }

const toPlace = (hit: Hit): Place => ({
  lat: Number(hit.lat),
  lng: Number(hit.lon),
  // Drop the country and postcode at the end; everyone here is in Uzbekistan
  text: hit.display_name
    .split(', ')
    .filter((part) => !/^\d+$/.test(part) && part !== 'Oʻzbekiston' && part !== 'Узбекистан')
    .join(', '),
})

/** Addresses matching the text, within Uzbekistan. */
export async function searchPlaces(query: string, lang: Lang, signal?: AbortSignal) {
  const url = `${NOMINATIM}/search?format=json&countrycodes=uz&limit=6&accept-language=${lang}&q=${encodeURIComponent(query)}`
  const response = await fetch(url, { signal })
  const places = ((await response.json()) as Hit[]).map(toPlace)
  // The same address can come back twice from different map objects
  return places.filter((place, i) => places.findIndex((p) => p.text === place.text) === i)
}

/** The address at a point, or null when there is none. */
export async function placeAt(lat: number, lng: number, lang: Lang, signal?: AbortSignal) {
  const url = `${NOMINATIM}/reverse?format=json&zoom=18&accept-language=${lang}&lat=${lat}&lon=${lng}`
  const response = await fetch(url, { signal })
  const hit = (await response.json()) as Partial<Hit>
  return hit.display_name ? toPlace(hit as Hit) : null
}
