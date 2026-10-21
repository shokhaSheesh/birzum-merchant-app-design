import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { formatPhone, PHONE_DIGITS } from '@/shared/lib/phone'
import { Button } from '@/shared/ui/Button'
import { ConfirmSheet } from '@/shared/ui/ConfirmSheet'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PhoneField } from '@/shared/ui/PhoneField'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { TextField } from '@/shared/ui/TextField'
import { addContact, removeContact, updateContact } from '../api/mockClients'
import { RELATIONS, type Client, type Contact, type Relation } from '@/entities/clients/clients'

/**
 * A client's extra contacts. Tapping one opens it for editing, where it can also be deleted.
 * The merchant sees it on the client screen; the shopper edits the same list on Profil →
 * Kontaktlar, where the screen's own title replaces the section's (`untitled`).
 */
export function ContactsSection({ client, untitled }: { client: Client; untitled?: boolean }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  /** The contact being edited; null while a new one is being added. */
  const [editing, setEditing] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState<Contact | null>(null)
  const [phone, setPhone] = useState('')
  const [relation, setRelation] = useState<Relation | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const openSheet = (contact: Contact | null) => {
    setEditing(contact)
    setPhone(contact?.phone ?? '')
    setRelation(contact?.relation ?? null)
    setComment(contact?.comment ?? '')
    setSubmitted(false)
    setOpen(true)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (phone.length < PHONE_DIGITS || !relation) return
    setLoading(true)
    const values = { phone, relation, comment: comment.trim() }
    await (editing
      ? updateContact(client.id, { ...values, id: editing.id })
      : addContact(client.id, values))
    setLoading(false)
    setOpen(false)
    toast(t('toast.saved'))
  }

  const body = (
    <>
      {client.contacts.length === 0 ? (
        untitled ? (
          <EmptyState title={t('contacts.empty.title')} hint={t('contacts.empty.hint')} />
        ) : (
          <p className="text-sm text-ink-muted">{t('client.contacts.empty')}</p>
        )
      ) : (
        <ul className="rounded-card border border-line bg-canvas px-4">
          {client.contacts.map((contact) => (
            <li key={contact.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                aria-label={t('client.contacts.edit')}
                onClick={() => openSheet(contact)}
                className="flex w-full items-center gap-2 py-3 text-left"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold">{formatPhone(contact.phone)}</p>
                    <p className="text-sm text-ink-muted">{t(`relation.${contact.relation}`)}</p>
                  </div>
                  {contact.comment && <p className="text-sm text-ink-muted">{contact.comment}</p>}
                </div>
                <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button variant="secondary" block onClick={() => openSheet(null)}>
        <Plus size={20} />
        {t('client.contacts.add')}
      </Button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t(editing ? 'client.contacts.edit' : 'client.contacts.add')}
      >
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
          <div className="mt-2 flex flex-col gap-1">
            {editing && (
              <Button
                variant="ghost"
                block
                className="text-danger!"
                disabled={loading}
                onClick={() => {
                  // One sheet at a time: the confirmation replaces the form
                  setOpen(false)
                  setDeleting(editing)
                }}
              >
                <Trash2 size={20} />
                {t('common.delete')}
              </Button>
            )}
            <Button type="submit" block loading={loading}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Sheet>

      <ConfirmSheet
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={t('confirm.delete.title')}
        message={t('confirm.delete.message')}
        confirmLabel={t('common.delete')}
        onConfirm={() => {
          if (!deleting) return
          removeContact(client.id, deleting.id)
          toast(t('toast.deleted'))
        }}
      />
    </>
  )
  return untitled ? (
    <div className="flex flex-col gap-3">{body}</div>
  ) : (
    <Section title={t('client.contacts')}>{body}</Section>
  )
}
