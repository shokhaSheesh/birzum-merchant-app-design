import { useCallback, useEffect, useState } from 'react'
import { initials } from '@/entities/clients/clientName'
import { useCustomer } from '@/entities/session/customer'
import { PIN_ATTEMPTS, PIN_LENGTH, security } from '@/entities/session/security'
import { useI18n } from '@/shared/i18n/useI18n'
import { Avatar } from '@/shared/ui/Avatar'
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
  const customer = useCustomer()
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

  return (
    <div className="flex h-full flex-col items-center px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-3 text-center">
        {customer && (
          <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} size="lg" />
        )}
        <h1 className="text-xl font-bold">
          {t('chome.greeting', { name: customer?.firstName ?? '' })}
        </h1>
        <p className={wrong || attemptsLeft < PIN_ATTEMPTS ? 'text-danger' : 'text-ink-muted'}>
          {attemptsLeft < PIN_ATTEMPTS
            ? t('pin.wrong', { count: String(attemptsLeft) })
            : t('pin.enter')}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        <PinPad
          value={pin}
          onChange={setPin}
          length={PIN_LENGTH}
          error={wrong}
          onBiometric={security.biometric() ? () => setScanning(true) : undefined}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          security.signOut()
          onSignIn()
        }}
        className="h-11 rounded-full px-4 text-sm font-semibold text-brand active:bg-surface"
      >
        {t('pin.forgot')}
      </button>

      {scanning && <BiometricPrompt onSuccess={onUnlock} onCancel={stopScanning} />}
    </div>
  )
}
