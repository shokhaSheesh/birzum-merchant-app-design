import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { PhoneField } from '@/shared/ui/PhoneField'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { TextField } from '@/shared/ui/TextField'
import { addContact } from '../api/mockClients'
import { RELATIONS, type Client, type Relation } from '../data/clients'

export function ContactsSection({ client }: { client: Client }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [relation, setRelation] = useState<Relation | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const openSheet = () => {
    setPhone('')
    setRelation(null)
    setComment('')
    setSubmitted(false)
    setOpen(true)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (phone.length < PHONE_DIGITS || !relation) return
    setLoading(true)
    await addContact(client.id, { phone, relation, comment: comment.trim() })
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
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">{formatPhone(contact.phone)}</p>
                <p className="text-sm text-ink-muted">{t(`relation.${contact.relation}`)}</p>
              </div>
              {contact.comment && <p className="text-sm text-ink-muted">{contact.comment}</p>}
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
          <PhoneField
            label={t('field.phone')}
            value={phone}
            onChange={setPhone}
            error={submitted && phone.length < PHONE_DIGITS ? t('auth.error.phone') : undefined}
          />
          <Select
            label={t('field.relation')}
            options={RELATIONS.map((value) => ({ value, label: t(`relation.${value}`) }))}
            value={relation}
            onChange={setRelation}
            error={submitted && !relation ? t('error.required') : undefined}
          />
          <TextField
            label={t('field.comment')}
            autoComplete="off"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" block loading={loading} className="mt-2">
            {t('common.save')}
          </Button>
        </form>
      </Sheet>
    </Section>
  )
}
