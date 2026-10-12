import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { PhoneField } from '@/shared/ui/PhoneField'
import { Section } from '@/shared/ui/Section'
import { Sheet } from '@/shared/ui/Sheet'
import { TextField } from '@/shared/ui/TextField'
import { addContact } from '../api/mockClients'
import type { Client } from '../data/clients'

export function ContactsSection({ client }: { client: Client }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const openSheet = () => {
    setName('')
    setPhone('')
    setSubmitted(false)
    setOpen(true)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (name.trim() === '' || phone.length < PHONE_DIGITS) return
    setLoading(true)
    await addContact(client.id, { name: name.trim(), phone })
    setLoading(false)
    setOpen(false)
  }

  return (
    <Section title={t('client.contacts')}>
      {client.contacts.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('client.contacts.empty')}</p>
      ) : (
        <ul className="rounded-card bg-surface px-4">
          {client.contacts.map((contact) => (
            <li
              key={contact.id}
              className="flex flex-col gap-0.5 border-b border-line py-3 last:border-b-0"
            >
              <p className="font-semibold">{contact.name}</p>
              <p className="text-sm text-ink-muted">{formatPhone(contact.phone)}</p>
            </li>
          ))}
        </ul>
      )}
      <Button variant="secondary" block onClick={openSheet}>
        <Plus size={20} />
        {t('client.contacts.add')}
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t('client.contacts.add')}>
        <form onSubmit={(e) => void save(e)} noValidate className="flex flex-col gap-4 pt-1 pb-1">
          <TextField
            label={t('field.contactName')}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={submitted && name.trim() === '' ? t('error.required') : undefined}
          />
          <PhoneField
            label={t('field.phone')}
            value={phone}
            onChange={setPhone}
            error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
          />
          <Button type="submit" block loading={loading} className="mt-2">
            {t('common.save')}
          </Button>
        </form>
      </Sheet>
    </Section>
  )
}
