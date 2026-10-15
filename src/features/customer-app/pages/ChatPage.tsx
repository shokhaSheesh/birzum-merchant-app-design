import { Headset, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { PageHeader } from '@/shared/ui/PageHeader'

type Message = { id: number; from: 'agent' | 'me'; text: string; at: Date }

const TOPICS: TranslationKey[] = ['chat.topic.payment', 'chat.topic.limit', 'chat.topic.order']
const time = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

let lastId = 0
const nextId = () => ++lastId

/**
 * Chat with support. Sample conversation: the agent greets, quick topics start a question,
 * and every message gets a short automatic answer. The real chat comes from the support system.
 */
export function ChatPage() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: nextId(), from: 'agent', text: t('chat.greeting'), at: new Date() },
  ])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = (text: string) => {
    const clean = text.trim()
    if (!clean) return
    setMessages((list) => [...list, { id: nextId(), from: 'me', text: clean, at: new Date() }])
    setDraft('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((list) => [
        ...list,
        { id: nextId(), from: 'agent', text: t('chat.reply'), at: new Date() },
      ])
    }, 1400)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    send(draft)
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('support.chat.title')} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-4">
        <p className="self-center rounded-full bg-surface px-3 py-1 text-xs text-ink-muted">
          {t('chat.online')}
        </p>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex max-w-[82%] gap-2', message.from === 'me' && 'self-end')}
          >
            {message.from === 'agent' && (
              <span className="mt-auto grid size-8 shrink-0 place-items-center rounded-full bg-green-200 text-brand">
                <Headset size={16} />
              </span>
            )}
            <div
              className={cn(
                'flex flex-col gap-1 rounded-[18px] px-3.5 py-2.5',
                message.from === 'me'
                  ? 'rounded-br-md bg-primary text-on-primary'
                  : 'rounded-bl-md bg-surface',
              )}
            >
              <p className="break-words whitespace-pre-line">{message.text}</p>
              <p className="self-end text-[11px] opacity-60">{time(message.at)}</p>
            </div>
          </div>
        ))}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pl-10">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => send(t(topic))}
                className="h-9 rounded-full border-[1.5px] border-primary px-3.5 text-sm font-semibold text-brand active:bg-surface"
              >
                {t(topic)}
              </button>
            ))}
          </div>
        )}
        {typing && (
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-green-200 text-brand">
              <Headset size={16} />
            </span>
            <span className="flex gap-1 rounded-[18px] rounded-bl-md bg-surface px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-ink-muted"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        onSubmit={submit}
        className="flex shrink-0 items-center gap-2 border-t border-line px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <label htmlFor="chat-input" className="sr-only">
          {t('chat.placeholder')}
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('chat.placeholder')}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-full bg-surface px-4 outline-none placeholder:text-ink-subtle focus-visible:ring-3 focus-visible:ring-green-200"
        />
        <button
          type="submit"
          aria-label={t('chat.send')}
          disabled={!draft.trim()}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-on-primary disabled:opacity-40"
        >
          <SendHorizontal size={20} />
        </button>
      </form>
    </div>
  )
}
