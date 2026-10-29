import { createStore } from '@/shared/lib/createStore'

/** One place the shopper is signed in: the app on a phone, or a browser. */
export type Session = {
  id: string
  kind: 'phone' | 'browser'
  /** "iPhone 15 Pro", "Samsung Galaxy S24". */
  device: string
  /** "iOS 18.1", "Android 15". */
  os: string
  /** The app and its version, or the browser: "Birzum 2.4", "Chrome 130". */
  client: string
  ip: string
  startedAt: Date
  /** The session this screen is open in. It can't be ended from here. */
  current?: boolean
}

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000)

// Invented sample sessions. Replace with the API.
export const sessionsStore = createStore<Session>([
  {
    id: 's1',
    kind: 'phone',
    device: 'iPhone 15 Pro',
    os: 'iOS 18.1',
    client: 'Birzum 2.4',
    ip: '213.230.80.14',
    startedAt: hoursAgo(0.2),
    current: true,
  },
  {
    id: 's2',
    kind: 'phone',
    device: 'Samsung Galaxy A54',
    os: 'Android 15',
    client: 'Birzum 2.3',
    ip: '84.54.71.203',
    startedAt: hoursAgo(26),
  },
  {
    id: 's3',
    kind: 'browser',
    device: 'MacBook Air',
    os: 'macOS 15',
    client: 'Chrome 130',
    ip: '195.158.9.41',
    startedAt: hoursAgo(24 * 6),
  },
])
