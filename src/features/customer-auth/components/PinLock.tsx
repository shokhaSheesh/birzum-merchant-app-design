import { useCallback, useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { PIN_ATTEMPTS, PIN_LENGTH, security } from '@/entities/session/security'
import { useI18n } from '@/shared/i18n/useI18n'
import logoOnDark from '@/shared/assets/logo-on-dark.svg'
import logo from '@/shared/assets/logo.svg'
import { PinPad } from '@/shared/ui/PinPad'
import { BiometricPrompt } from './BiometricPrompt'

type Props = {
  onUnlock: () => void
  /** Forgot the PIN or ran out of tries: sign in by phone again. */
  onSignIn: () => void
}

/** What a returning shopper sees when the app opens: Face ID if it is on, otherwise the PIN. */
export function PinLock({ onUnlock, onSignIn }: Props) {
  const { t } = useI18n()
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(PIN_ATTEMPTS)
  const [scanning, setScanning] = useState(security.biometric)
  const stopScanning = useCallback(() => setScanning(false), [])

  useEffect(() => {
    if (pin.length < PIN_LENGTH) return
    if (security.checkPin(pin)) {
      onUnlock()
      return
    }
    const left = attemptsLeft - 1
    setWrong(true)
    setAttemptsLeft(left)
    const timer = setTimeout(() => {
      setPin('')
      setWrong(false)
      if (left === 0) {
        security.signOut()
        onSignIn()
      }
    }, 500)
    return () => clearTimeout(timer)
    // Runs once per complete PIN
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  const signIn = () => {
    security.signOut()
    onSignIn()
  }

  return (
    <div className="flex h-full flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <header className="flex h-11 shrink-0 items-center justify-between">
        <button
          type="button"
          aria-label={t('pin.otherAccount')}
          onClick={signIn}
          className="-ml-2 grid size-11 place-items-center rounded-full text-ink-muted active:bg-navy-100"
        >
          <LogOut size={24} />
        </button>
        <button
          type="button"
          onClick={signIn}
          className="-mr-2 h-11 rounded-full px-2 font-semibold text-brand active:bg-navy-100"
        >
          {t('pin.forgot')}
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <img src={logo} alt="Birzum nasiya" className="h-12 dark:hidden" />
        <img src={logoOnDark} alt="Birzum nasiya" className="hidden h-12 dark:block" />
        <p className={wrong || attemptsLeft < PIN_ATTEMPTS ? 'text-danger' : 'text-ink'}>
          {attemptsLeft < PIN_ATTEMPTS
            ? t('pin.wrong', { count: String(attemptsLeft) })
            : t('pin.enter')}
        </p>
        <PinPad
          value={pin}
          onChange={setPin}
          length={PIN_LENGTH}
          error={wrong}
          onBiometric={security.biometric() ? () => setScanning(true) : undefined}
        />
      </div>

      {scanning && <BiometricPrompt onSuccess={onUnlock} onCancel={stopScanning} />}
    </div>
  )
}
