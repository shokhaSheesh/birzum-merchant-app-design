import { CircleCheck, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fullName, initials } from '@/entities/clients/clientName'
import type { Client } from '@/entities/clients/clients'
import { useClient } from '@/entities/clients/useClients'
import { clientPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatDate } from '@/shared/lib/format'
import { formatPhone } from '@/shared/lib/phone'
import { toast } from '@/shared/lib/toast'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { CameraView } from '@/shared/ui/CameraView'
import { FormScreen } from '@/shared/ui/FormScreen'
import { InfoList, InfoRow } from '@/shared/ui/InfoList'
import { OtpField } from '@/shared/ui/OtpField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { addToMyClients, findShopper, scanShopper } from '../api/mockClients'

type View = { kind: 'scan' } | { kind: 'code' } | { kind: 'found'; id: string }

/**
 * Add a shopper who already uses the Birzum app: scan the QR code on their phone, or type the
 * six digits under it, check it is the right person, and add them to Klientlar. Someone who is
 * already a client is shown with a way to open them instead.
 */
export function ScanClientPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>({ kind: 'scan' })
  const found = (client: Client) => setView({ kind: 'found', id: client.id })

  if (view.kind === 'code')
    return <CodeEntry onBack={() => setView({ kind: 'scan' })} onFound={found} />
  if (view.kind === 'found') return <Found id={view.id} onAgain={() => setView({ kind: 'scan' })} />
  return (
    <Scanner onBack={() => navigate(-1)} onFound={found} onCode={() => setView({ kind: 'code' })} />
  )
}

function Scanner({
  onBack,
  onFound,
  onCode,
}: {
  onBack: () => void
  onFound: (client: Client) => void
  onCode: () => void
}) {
  const { t } = useI18n()

  useEffect(() => {
    let cancelled = false
    void scanShopper().then((client) => {
      if (!cancelled) onFound(client)
    })
    return () => {
      cancelled = true
    }
  }, [onFound])

  return (
    <FormScreen
      onSubmit={() => {}}
      onBack={onBack}
      footer={
        <Button variant="secondary" block onClick={onCode}>
          {t('scan.typeCode')}
        </Button>
      }
    >
      <ScreenIntro title={t('scan.title')} subtitle={t('scan.hint')} />
      <CameraView guide="qr" facing="environment" unavailableText={t('myid.scan.noCamera')} />
      <p
        role="status"
        className="flex items-center justify-center gap-2 text-sm font-medium text-ink-muted"
      >
        <LoaderCircle size={18} className="animate-spin" aria-hidden />
        {t('customer.qr.searching')}
      </p>
    </FormScreen>
  )
}

function CodeEntry({ onBack, onFound }: { onBack: () => void; onFound: (client: Client) => void }) {
  const { t } = useI18n()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (code.length < 6) return setError(t('scan.code.short'))
    setLoading(true)
    try {
      onFound(await findShopper(code))
    } catch {
      setError(t('scan.code.notFound'))
      setLoading(false)
    }
  }

  return (
    <FormScreen
      onSubmit={() => void submit()}
      onBack={onBack}
      footer={
        <Button type="submit" block loading={loading}>
          {t('scan.code.find')}
        </Button>
      }
    >
      <ScreenIntro title={t('scan.code.title')} subtitle={t('scan.code.hint')} />
      <OtpField
        label={t('myqr.code')}
        numeric
        value={code}
        onChange={(next) => {
          setCode(next)
          setError(undefined)
        }}
        error={error}
        autoFocus
      />
    </FormScreen>
  )
}

function Found({ id, onAgain }: { id: string; onAgain: () => void }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const client = useClient(id)
  const [adding, setAdding] = useState(false)
  // Read once, so the screen does not flip to "already a client" the moment they are added
  const [already] = useState(() => client?.listed !== false)
  if (!client) return null

  const open = () => navigate(clientPath(client.id), { replace: true })
  const add = async () => {
    setAdding(true)
    await addToMyClients(client.id)
    toast(t('scan.added'))
    open()
  }

  return (
    <FormScreen
      onSubmit={() => (already ? open() : void add())}
      onBack={onAgain}
      footer={
        <div className="flex flex-col gap-2">
          <Button type="submit" block loading={adding}>
            {t(already ? 'scan.open' : 'scan.add')}
          </Button>
          <Button variant="ghost" block onClick={onAgain}>
            {t('scan.again')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <Avatar initials={initials(client)} photoUrl={client.photoUrl} size="lg" />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{fullName(client)}</h1>
          <p className="text-ink-muted">{t('scan.found.hint')}</p>
        </div>
      </div>
      {already && (
        <p className="flex items-center gap-2.5 rounded-control bg-success-soft px-4 py-3 text-sm font-medium text-success">
          <CircleCheck size={20} className="shrink-0" />
          {t('scan.already')}
        </p>
      )}
      <InfoList>
        <InfoRow label={t('field.phone')} value={formatPhone(client.phone)} />
        <InfoRow label={t('field.birthDate')} value={formatDate(client.birthDate)} />
        <InfoRow
          label={t('scan.limit')}
          value={t(client.limits ? 'scan.limit.yes' : 'scan.limit.no')}
        />
      </InfoList>
    </FormScreen>
  )
}
