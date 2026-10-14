import { ScanFace } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { afterSignIn, PIN_LENGTH, security } from '@/entities/session/security'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/Button'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PinPad } from '@/shared/ui/PinPad'
import { BiometricPrompt } from '../components/BiometricPrompt'

type Step = 'current' | 'create' | 'confirm' | 'biometric'

/**
 * Right after the first sign-in: choose a PIN, type it again, then decide on Face ID.
 * From Xavfsizlik (`?change=1`) it asks for the current PIN first, then replaces it and goes back.
 */
export function PinSetupPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const changing = useSearchParams()[0].has('change')
  const [step, setStep] = useState<Step>(changing ? 'current' : 'create')
  const [wrongCurrent, setWrongCurrent] = useState(false)
  const [first, setFirst] = useState('')
  const [pin, setPin] = useState('')
  const [mismatch, setMismatch] = useState(false)
  const [scanning, setScanning] = useState(false)

  const finish = useCallback(() => navigate(afterSignIn(), { replace: true }), [navigate])

  useEffect(() => {
    if (pin.length < PIN_LENGTH) return
    const timer = setTimeout(() => {
      if (step === 'current') {
        const ok = security.checkPin(pin)
        setWrongCurrent(!ok)
        setPin('')
        if (ok) setStep('create')
      } else if (step === 'create') {
        setFirst(pin)
        setPin('')
        setMismatch(false)
        setStep('confirm')
      } else if (pin === first) {
        security.setPin(pin)
        if (changing) {
          toast(t('toast.saved'))
          navigate(-1)
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

  const title =
    step === 'current'
      ? 'pin.current.title'
      : step === 'create'
        ? 'pin.create.title'
        : 'pin.confirm.title'
  const hint =
    step === 'current'
      ? wrongCurrent
        ? 'pin.current.wrong'
        : 'pin.current.hint'
      : step === 'create'
        ? mismatch
          ? 'pin.mismatch'
          : 'pin.create.hint'
        : 'pin.confirm.hint'
  const isError = (step === 'current' && wrongCurrent) || (step === 'create' && mismatch)

  return (
    <div className="flex h-full flex-col">
      {changing ? <PageHeader /> : <div className="h-[max(3rem,env(safe-area-inset-top))]" />}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-2xl font-bold">{t(title)}</h1>
          <p className={isError ? 'text-danger' : 'text-ink-muted'}>{t(hint)}</p>
        </div>
        {/* No Face ID key here: a PIN is being chosen, not checked */}
        <PinPad value={pin} onChange={setPin} length={PIN_LENGTH} error={isError && pin === ''} />
      </div>
    </div>
  )
}
