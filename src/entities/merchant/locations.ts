import { calendarNames, type LocalizedText } from '@/shared/i18n/dictionaries'
import { createStore } from '@/shared/lib/createStore'

/** One of the merchant's shops. Stock is kept per location and staff are assigned to them. */
export type Location = {
  id: string
  name: LocalizedText
  address: LocalizedText
  /** Nine digits after +998. */
  phone: string
  /** A one-line summary of `schedule`, e.g. "09:00–20:00". Empty when no hours are set. */
  hours: string
  /** Working hours per weekday; a weekday that is missing is a day off. */
  schedule: WorkDay[]
  /** The pin on the map, if the merchant has set one. */
  point: { lat: number; lng: number } | null
  active: boolean
}

/** One working day. `weekday` is ISO: 1 Monday … 7 Sunday. Times are "HH:MM", Tashkent time. */
export type WorkDay = { weekday: number; open: string; close: string }

/** "09:00–20:00" when every working day is the same, otherwise "Du–Ju 09:00–20:00, Sh 10:00–18:00". */
export function summarizeSchedule(schedule: WorkDay[], lang: 'uz' | 'ru' = 'uz') {
  if (schedule.length === 0) return ''
  const days = [...schedule].sort((a, b) => a.weekday - b.weekday)
  const hours = (day: WorkDay) => `${day.open}–${day.close}`
  if (days.every((day) => hours(day) === hours(days[0]))) return hours(days[0])
  const groups: { first: number; last: number; hours: string }[] = []
  for (const day of days) {
    const group = groups[groups.length - 1]
    if (group && group.last === day.weekday - 1 && group.hours === hours(day))
      group.last = day.weekday
    else groups.push({ first: day.weekday, last: day.weekday, hours: hours(day) })
  }
  const names = calendarNames[lang].weekdays
  return groups
    .map(
      ({ first, last, hours: h }) =>
        `${names[first - 1]}${last > first ? `–${names[last - 1]}` : ''} ${h}`,
    )
    .join(', ')
}

// Invented sample shops of the signed-in merchant. Replace with the API.
export const locationsStore = createStore<Location>([
  {
    id: 'l1',
    name: { uz: 'Chilonzor filiali', ru: 'Филиал Чиланзар' },
    address: {
      uz: 'Toshkent, Chilonzor 9-kvartal, 12-uy',
      ru: 'Ташкент, Чиланзар, 9-й квартал, 12',
    },
    phone: '712001122',
    hours: '09:00–20:00',
    schedule: [],
    point: null,
    active: true,
  },
  {
    id: 'l2',
    name: { uz: 'Yunusobod filiali', ru: 'Филиал Юнусабад' },
    address: { uz: 'Toshkent, Yunusobod 4-mavze, 7-uy', ru: 'Ташкент, Юнусабад, 4-й массив, 7' },
    phone: '712003344',
    hours: '10:00–21:00',
    schedule: [],
    point: null,
    active: true,
  },
  {
    id: 'l3',
    name: { uz: 'Samarqand filiali', ru: 'Филиал Самарканд' },
    address: { uz: 'Samarqand, Registon koʻchasi, 5-uy', ru: 'Самарканд, улица Регистан, 5' },
    phone: '662005566',
    hours: '09:00–19:00',
    schedule: [],
    point: null,
    active: false,
  },
])
