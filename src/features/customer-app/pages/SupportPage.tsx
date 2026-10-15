import { ChevronDown, Clock, MessageCircle, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SearchField } from '@/shared/ui/SearchField'
import { Section } from '@/shared/ui/Section'
import { faq } from '../data/faq'

const PHONE = '+998 71 200 00 00'
const TELEGRAM = '@birzum_support'

/** Help: searchable questions and answers, the ways to reach support, and the chat. */
export function SupportPage() {
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<number | null>(null)
  const needle = query.trim().toLowerCase()
  const found = faq.filter(
    (item) =>
      needle === '' ||
      tl(item.question).toLowerCase().includes(needle) ||
      tl(item.answer).toLowerCase().includes(needle),
  )

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('support.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
        <SearchField
          label={t('support.search')}
          placeholder={t('support.search')}
          value={query}
          onChange={setQuery}
        />

        <Section title={t('support.faq')}>
          {found.length === 0 ? (
            <EmptyState title={t('support.notFound')} />
          ) : (
            <ul className="rounded-card bg-surface px-4">
              {found.map((item) => {
                const index = faq.indexOf(item)
                const expanded = open === index
                return (
                  <li key={index} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpen(expanded ? null : index)}
                      className="flex min-h-13 w-full items-center gap-3 py-3 text-left"
                    >
                      <span className="min-w-0 flex-1 font-medium">{tl(item.question)}</span>
                      <ChevronDown
                        size={20}
                        className={cn(
                          'shrink-0 text-ink-subtle transition-transform',
                          expanded && 'rotate-180',
                        )}
                      />
                    </button>
                    {expanded && <p className="pb-3 text-ink-muted">{tl(item.answer)}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        <Section title={t('support.contacts')}>
          <ul className="rounded-card bg-surface px-4">
            <li className="flex items-center gap-3 border-b border-line py-3">
              <Phone size={22} className="shrink-0 text-brand" />
              <div className="flex min-w-0 flex-1 flex-col">
                <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="font-semibold">
                  {PHONE}
                </a>
                <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                  <Clock size={14} />
                  {t('support.hours')}
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3 py-3">
              <Send size={22} className="shrink-0 text-brand" />
              <a
                href={`https://t.me/${TELEGRAM.slice(1)}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold"
              >
                {TELEGRAM}
              </a>
            </li>
          </ul>
        </Section>
      </div>
      <footer className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Button block onClick={() => navigate(ROUTES.customerChat)}>
          <MessageCircle size={20} />
          {t('support.chat')}
        </Button>
      </footer>
    </div>
  )
}
