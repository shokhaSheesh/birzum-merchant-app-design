import { Pause, Play, SendHorizontal, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

const BARS = 28
const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

/** Bar heights from 0.25 to 1, always the same for the same message. */
function waveform(seed: number) {
  let state = seed * 9301 + 49297
  return Array.from({ length: BARS }, () => {
    state = (state * 9301 + 49297) % 233280
    return 0.25 + (state / 233280) * 0.75
  })
}

type Props = {
  /** Length in seconds. */
  duration: number
  /** Gives each message its own waveform. */
  seed: number
  /** The client's own message (on the brand colour). */
  mine: boolean
}

/**
 * A voice message in the chat: play/pause, a waveform that fills as it plays, and the time
 * (full length, or how far it has played). The prototype has no sound; playing only moves the bar.
 */
export function VoiceMessage({ duration, seed, mine }: Props) {
  const { t } = useI18n()
  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(0)

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      setPlayed((current) => {
        if (current + 0.1 >= duration) {
          setPlaying(false)
          return 0
        }
        return current + 0.1
      })
    }, 100)
    return () => clearInterval(timer)
  }, [playing, duration])

  const share = played / duration
  return (
    <div className="flex w-56 max-w-full items-center gap-2.5">
      <button
        type="button"
        aria-label={playing ? t('chat.voice.pause') : t('chat.voice.play')}
        onClick={() => setPlaying((value) => !value)}
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-full',
          mine ? 'bg-on-primary/20 text-on-primary' : 'bg-primary text-on-primary',
        )}
      >
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex h-7 items-center gap-[2px]" aria-hidden>
          {waveform(seed).map((height, i) => (
            <span
              key={i}
              className={cn(
                'w-[3px] flex-1 rounded-full',
                i / BARS < share || (playing && i === 0)
                  ? mine
                    ? 'bg-on-primary'
                    : 'bg-primary'
                  : mine
                    ? 'bg-on-primary/40'
                    : 'bg-navy-200',
              )}
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
        <span className="text-[11px] tabular-nums opacity-70">
          {clock(playing || played > 0 ? played : duration)}
        </span>
      </div>
    </div>
  )
}

/**
 * Shown in place of the message box while a voice message is being recorded: delete on the left,
 * a red dot with the time in the middle, send on the right. The prototype doesn't use the
 * microphone; the timer only shows how it will look.
 */
export function RecordingBar({
  onCancel,
  onSend,
}: {
  onCancel: () => void
  onSend: (seconds: number) => void
}) {
  const { t } = useI18n()
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <button
        type="button"
        aria-label={t('chat.voice.cancel')}
        onClick={onCancel}
        className="grid size-12 shrink-0 place-items-center rounded-full text-danger active:bg-danger-soft"
      >
        <Trash2 size={22} />
      </button>
      <div
        role="status"
        className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line bg-canvas px-4"
      >
        <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-danger" />
        <span className="font-semibold tabular-nums">{clock(seconds)}</span>
        <span className="truncate text-sm text-ink-muted">{t('chat.voice.recording')}</span>
      </div>
      <button
        type="button"
        aria-label={t('chat.send')}
        onClick={() => onSend(Math.max(1, seconds))}
        className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-on-primary"
      >
        <SendHorizontal size={20} />
      </button>
    </>
  )
}
