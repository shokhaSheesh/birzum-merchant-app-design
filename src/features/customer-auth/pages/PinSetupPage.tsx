import { ScanFace } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { afterSignIn, PIN_LENGTH, security } from '@/entities/session/security'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PinPad } from '@/shared/ui/PinPad'
import { BiometricPrompt } from '../components/BiometricPrompt'

type Step = 'create' | 'confirm' | 'biometric'

/**
 * Right after the first sign-in: choose a PIN, type it again, then decide on Face ID.
 * From Profil (`?change=1`) it only replaces the PIN and goes back.
 */
export function PinSetupPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const changing = useSearchParams()[0].has('change')
  const [step, setStep] = useState<Step>('create')
  const [first, setFirst] = useState('')
  const [pin, setPin] = useState('')
  const [mismatch, setMismatch] = useState(false)
  const [scanning, setScanning] = useState(false)

  const finish = useCallback(() => navigate(afterSignIn(), { replace: true }), [navigate])

  useEffect(() => {
    if (pin.length < PIN_LENGTH) return
    const timer = setTimeout(() => {
      if (step === 'create') {
        setFirst(pin)
        setPin('')
        setMismatch(false)
        setStep('confirm')
      } else if (pin === first) {
        security.setPin(pin)
        if (changing) {
          toast(t('toast.saved'))
          navigate(ROUTES.customerProfile, { replace: true })
        } else setStep('biometric')
      } else {
        // Start over: the two did not match
        setMismatch(true)
        setPin('')
        setFirst('')
        setStep('create')
      }
    }, 150)
    return () => clearTimeout(timer)
    // Runs once per complete PIN
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  if (step === 'biometric') {
    return (
      <div className="flex h-full flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="grid size-28 place-items-center rounded-full bg-green-200 text-brand">
            <ScanFace size={60} strokeWidth={1.5} />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{t('pin.biometric.title')}</h1>
            <p className="text-ink-muted">{t('pin.biometric.hint')}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button variant="ghost" block onClick={finish}>
            {t('pin.biometric.later')}
          </Button>
          <Button block onClick={() => setScanning(true)}>
            {t('pin.biometric.enable')}
          </Button>
        </div>
        {scanning && (
          <BiometricPrompt
            onSuccess={() => {
              security.setBiometric(true)
              finish()
            }}
            onCancel={() => setScanning(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {changing ? <PageHeader /> : <div className="h-[max(3rem,env(safe-area-inset-top))]" />}
      <div className="flex flex-1 flex-col items-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">
            {t(step === 'create' ? 'pin.create.title' : 'pin.confirm.title')}
          </h1>
          <p className={mismatch && step === 'create' ? 'text-danger' : 'text-ink-muted'}>
            {mismatch && step === 'create'
              ? t('pin.mismatch')
              : t(step === 'create' ? 'pin.create.hint' : 'pin.confirm.hint')}
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-center py-8">
          <PinPad value={pin} onChange={setPin} length={PIN_LENGTH} />
        </div>
      </div>
    </div>
  )
}
