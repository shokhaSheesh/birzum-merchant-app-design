import { ShieldCheck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { fullName, initials } from '@/entities/clients/clientName'
import { formatShopperCode, shopperCode, shopperQrValue } from '@/entities/clients/shopperCode'
import { useCustomer } from '@/entities/session/customer'
import logoMark from '@/shared/assets/logo-mark.svg'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone } from '@/shared/lib/phone'
import { Avatar } from '@/shared/ui/Avatar'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * The shopper's own QR code, shown to a merchant in the shop. The merchant scans it and the
 * shopper joins their clients, so an ariza can be drawn up without typing the passport in.
 * The six digits below it are for when the camera cannot read the screen.
 */
export function MyQrPage() {
  const { t } = useI18n()
  const customer = useCustomer()
  if (!customer) return null
  const code = shopperCode(customer)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('myqr.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-2 pb-6">
        <section className="flex flex-col items-center gap-5 rounded-card border border-line bg-canvas p-6">
          <div className="flex items-center gap-3 self-stretch">
            <Avatar initials={initials(customer)} photoUrl={customer.photoUrl} />
            <div className="flex min-w-0 flex-col">
              <p className="truncate font-bold">{fullName(customer)}</p>
              <p className="text-sm text-ink-muted">{formatPhone(customer.phone)}</p>
            </div>
          </div>
          {/* Navy on white in both themes, so any camera can read it */}
          <div className="rounded-control bg-white p-4 text-navy-900">
            <QRCodeSVG
              value={shopperQrValue(code)}
              size={232}
              level="H"
              fgColor="currentColor"
              bgColor="transparent"
              imageSettings={{ src: logoMark, height: 44, width: 44, excavate: true }}
              title={t('myqr.title')}
            />
          </div>
          <div className="flex flex-col items-center gap-1 self-stretch border-t border-line pt-4">
            <p className="text-sm text-ink-muted">{t('myqr.code')}</p>
            <p className="text-3xl font-bold tracking-[0.18em] tabular-nums">
              {formatShopperCode(code)}
            </p>
          </div>
        </section>

        <p className="text-center text-ink-muted">{t('myqr.hint')}</p>
        <p className="flex items-start gap-2.5 rounded-control border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">
          <ShieldCheck size={20} className="shrink-0 text-success" />
          {t('myqr.safe')}
        </p>
      </div>
    </div>
  )
}
