import { useSyncExternalStore } from 'react'
import { ROUTES } from '@/shared/config/routes'

// The shopper's device settings. Kept in the browser so the lock screen survives a refresh,
// as it would on a phone. The real app keeps the PIN in the device's secure storage.
const KEYS = { pin: 'birzum.pin', biometric: 'birzum.biometric', onboarded: 'birzum.onboarded' }

const read = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Private mode: the setting lasts until the page is closed
  }
  emit()
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const PIN_LENGTH = 4
/** Wrong PINs in a row before the app asks to sign in by phone again. */
export const PIN_ATTEMPTS = 5

export const security = {
  hasPin: () => read(KEYS.pin) !== null,
  checkPin: (pin: string) => read(KEYS.pin) === pin,
  setPin: (pin: string) => write(KEYS.pin, pin),
  biometric: () => read(KEYS.biometric) === '1',
  setBiometric: (on: boolean) => write(KEYS.biometric, on ? '1' : null),
  onboarded: () => read(KEYS.onboarded) === '1',
  setOnboarded: () => write(KEYS.onboarded, '1'),
  /** Signing out forgets the PIN and Face ID; the next start asks for the phone number. */
  signOut: () => {
    write(KEYS.pin, null)
    write(KEYS.biometric, null)
  },
}

/** Re-renders when Face ID is turned on or off. */
export const useBiometric = () => useSyncExternalStore(subscribe, security.biometric)

/** Where the shopper goes once signed in: PIN setup the first time, then the intro, then home. */
export const afterSignIn = () =>
  !security.hasPin()
    ? ROUTES.customerPinSetup
    : !security.onboarded()
      ? ROUTES.customerWelcome
      : ROUTES.customerHome
