import { CircleCheck, ScanFace } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { CameraView } from '@/shared/ui/CameraView'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { verifyFace } from '../api/mockClients'

type Props = {
  progress: { step: number; total: number }
  onBack: () => void
  onDone: () => void
}

type View = 'intro' | 'camera' | 'done'

/** MyID identity check: the client shows their face to the camera of this phone. No QR code. */
export function MyIdStep({ progress, onBack, onDone }: Props) {
  const { t } = useI18n()
  const [view, setView] = useState<View>('intro')
  const backToIntro = () => setView('intro')

  if (view === 'camera') {
    return <FaceCapture progress={progress} onBack={backToIntro} onDone={() => setView('done')} />
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
    <FormScreen
      onSubmit={() => setView('camera')}
      onBack={onBack}
      progress={progress}
      footer={
        <Button type="submit" block>
          {t('myid.camera.open')}
        </Button>
      }
    >
      <IconBadge icon={ScanFace} />
      <ScreenIntro title={t('myid.title')} subtitle={t('myid.subtitle')} />
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
