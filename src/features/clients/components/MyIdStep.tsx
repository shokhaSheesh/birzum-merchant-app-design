import { CircleCheck, LoaderCircle, QrCode, ScanFace } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Button } from '@/shared/ui/Button'
import { CameraView } from '@/shared/ui/CameraView'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { MYID_QR_MOCK_WAIT_MS, MYID_QR_URL, verifyFace } from '../api/mockClients'

type Props = {
  progress: { step: number; total: number }
  onBack: () => void
  onDone: () => void
}

type View = 'choose' | 'camera' | 'qr' | 'done'

/** MyID identity check: scan the face on this device, or hand over a QR code. */
export function MyIdStep({ progress, onBack, onDone }: Props) {
  const { t } = useI18n()
  const [view, setView] = useState<View>('choose')
  const backToChoice = () => setView('choose')

  if (view === 'camera') {
    return <FaceCapture progress={progress} onBack={backToChoice} onDone={() => setView('done')} />
  }

  if (view === 'qr') {
    return <QrHandover progress={progress} onBack={backToChoice} onDone={() => setView('done')} />
  }

  if (view === 'done') {
    return (
      <FormScreen
        onSubmit={onDone}
        progress={progress}
        footer={
          <Button type="submit" block>
            {t('common.continue')}
          </Button>
        }
      >
        <IconBadge icon={CircleCheck} />
        <ScreenIntro title={t('myid.done.title')} subtitle={t('myid.done.hint')} />
      </FormScreen>
    )
  }

  return (
    <FormScreen onSubmit={() => {}} onBack={onBack} progress={progress}>
      <IconBadge icon={ScanFace} />
      <ScreenIntro title={t('myid.title')} subtitle={t('myid.subtitle')} />
      <div className="flex flex-col gap-3">
        <ActionCard
          icon={ScanFace}
          title={t('myid.camera.title')}
          description={t('myid.camera.hint')}
          onClick={() => setView('camera')}
        />
        <ActionCard
          icon={QrCode}
          title={t('myid.qr.title')}
          description={t('myid.qr.hint')}
          onClick={() => setView('qr')}
        />
      </div>
    </FormScreen>
  )
}

function FaceCapture({ progress, onBack, onDone }: Props) {
  const { t } = useI18n()
  const [checking, setChecking] = useState(false)

  const capture = async () => {
    setChecking(true)
    await verifyFace()
    onDone()
  }

  return (
    <FormScreen
      onSubmit={() => void capture()}
      onBack={onBack}
      progress={progress}
      footer={
        <Button type="submit" block loading={checking}>
          {t('myid.scan.capture')}
        </Button>
      }
    >
      <ScreenIntro title={t('myid.scan.title')} subtitle={t('myid.scan.hint')} />
      <CameraView guide="face" facing="user" unavailableText={t('myid.scan.noCamera')} />
    </FormScreen>
  )
}

function QrHandover({ progress, onBack, onDone }: Props) {
  const { t } = useI18n()

  useEffect(() => {
    // Mock: the real screen waits for MyID to report that the client finished
    const timer = setTimeout(onDone, MYID_QR_MOCK_WAIT_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <FormScreen onSubmit={() => {}} onBack={onBack} progress={progress}>
      <ScreenIntro title={t('myid.qr.screenTitle')} subtitle={t('myid.qr.screenHint')} />
      <div className="mx-auto rounded-card border-[1.5px] border-line bg-white p-5 text-navy-900">
        <QRCodeSVG value={MYID_QR_URL} size={216} fgColor="currentColor" bgColor="transparent" />
      </div>
      <p
        role="status"
        className="flex items-center justify-center gap-2 text-sm font-medium text-ink-muted"
      >
        <LoaderCircle size={18} className="animate-spin" aria-hidden />
        {t('myid.qr.waiting')}
      </p>
    </FormScreen>
  )
}
