import { ScanFace } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ActionCard } from '@/shared/ui/ActionCard'
import { Button } from '@/shared/ui/Button'
import { CardExpiryField, CardNumberField } from '@/shared/ui/CardFields'
import { Checkbox } from '@/shared/ui/Checkbox'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { DatePicker } from '@/shared/ui/DatePicker'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { NumberField } from '@/shared/ui/NumberField'
import { OtpField } from '@/shared/ui/OtpField'
import { PassportField } from '@/shared/ui/PassportField'
import { PasswordField } from '@/shared/ui/PasswordField'
import { PhoneField } from '@/shared/ui/PhoneField'
import { QuantityField } from '@/shared/ui/QuantityField'
import { SearchField } from '@/shared/ui/SearchField'
import { Select } from '@/shared/ui/Select'
import { TextField } from '@/shared/ui/TextField'

const terms = [
  { value: '3', label: '3 oy' },
  { value: '6', label: '6 oy' },
  { value: '9', label: '9 oy' },
  { value: '12', label: '12 oy' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">{title}</h2>
      {children}
    </section>
  )
}

/** Developer reference: every shared control in one place. Not part of the product. */
export function KitPage() {
  const [amount, setAmount] = useState<number | null>(12480000)
  const [term, setTerm] = useState<string | null>('6')
  const [branch, setBranch] = useState<string | null>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [phone, setPhone] = useState('901234567')
  const [code, setCode] = useState('482')
  const [checked, setChecked] = useState(true)
  const [query, setQuery] = useState('')
  const [passport, setPassport] = useState('AB1234567')
  const [card, setCard] = useState('8600123456789012')
  const [expiry, setExpiry] = useState('')
  const [months, setMonths] = useState<number | null>(12)
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto px-5 pt-6 pb-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">UI kit</h1>
        <LanguageSwitcher />
      </header>

      <Section title="Buttons">
        <Button block>Primary</Button>
        <Button block variant="secondary">
          Secondary
        </Button>
        <Button block variant="ghost">
          Ghost
        </Button>
        <Button block variant="danger">
          Danger
        </Button>
        <Button block loading>
          Loading
        </Button>
        <Button block disabled>
          Disabled
        </Button>
        <Button size="sm">Small (list header)</Button>
      </Section>

      <Section title="Text inputs">
        <TextField label="Login" defaultValue="mega.texno" />
        <PasswordField label="Parol" defaultValue="secret123" />
        <TextField label="Login" error="Maydonni toʻldiring" />
      </Section>

      <Section title="Search">
        <SearchField
          label="Qidiruv"
          placeholder="Telefon, JSHSHIR yoki pasport"
          value={query}
          onChange={setQuery}
        />
      </Section>

      <Section title="Number input">
        <NumberField label="Xarid summasi" value={amount} onChange={setAmount} suffix="UZS" />
      </Section>

      <Section title="Quantity and choice grid">
        <QuantityField label="Miqdori" value={quantity} onChange={setQuantity} />
        <ChoiceGrid
          label="Muddat"
          columns={6}
          options={[3, 6, 9, 12, 18, 24].map((value) => ({
            value,
            label: String(value),
            description: 'oy',
          }))}
          value={months}
          onChange={setMonths}
        />
      </Section>

      <Section title="Phone and code">
        <PhoneField label="Telefon raqam" value={phone} onChange={setPhone} />
        <OtpField label="Tasdiqlash kodi" value={code} onChange={setCode} />
        <PassportField label="Pasport seriyasi va raqami" value={passport} onChange={setPassport} />
      </Section>

      <Section title="Bank card">
        <CardNumberField label="Karta raqami" value={card} onChange={setCard} />
        <CardExpiryField label="Amal qilish muddati" value={expiry} onChange={setExpiry} />
      </Section>

      <Section title="Choice card">
        <ActionCard
          icon={ScanFace}
          title="Shu qurilmada"
          description="Kamera shu telefonda ochiladi, klient yuzini koʻrsatadi."
          onClick={() => {}}
        />
      </Section>

      <Section title="Checkbox">
        <Checkbox
          label="Boshqa qurilmalardan chiqish"
          description="Avval kirilgan barcha qurilmalarda seans yakunlanadi."
          checked={checked}
          onChange={setChecked}
        />
      </Section>

      <Section title="Dropdown">
        <Select label="Muddat" options={terms} value={term} onChange={setTerm} />
        <Select
          label="Filial"
          options={[
            { value: 'chilonzor', label: 'Chilonzor filiali' },
            { value: 'yunusobod', label: 'Yunusobod filiali' },
          ]}
          value={branch}
          onChange={setBranch}
        />
      </Section>

      <Section title="Calendar">
        <DatePicker label="Sana" value={date} onChange={setDate} />
      </Section>
    </div>
  )
}
