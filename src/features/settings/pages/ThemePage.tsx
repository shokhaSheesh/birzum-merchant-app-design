import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { toast } from '@/shared/lib/toast'
import { THEMES, type Theme } from '@/shared/theme/context'
import { useTheme } from '@/shared/theme/useTheme'
import { Button } from '@/shared/ui/Button'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import { ThemePreview, type PreviewApp } from '../components/ThemePreview'

const SCREENS = [0, 1] as const

/**
 * Choosing the theme: tabs for Tizim, Yorugʻ and Qorongʻi, a preview of the app in the one
 * picked (swipe for a second screen), and "Qoʻllash" to switch. Nothing changes before that.
 */
export function ThemePage({ app }: { app: PreviewApp }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [draft, setDraft] = useState<Theme>(theme)
  const [screen, setScreen] = useState(0)
  // "Tizim" previews whatever the phone is set to right now
  const [systemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const dark = draft === 'dark' || (draft === 'system' && systemDark)

  const apply = () => {
    setTheme(draft)
    toast(t('toast.saved'))
    navigate(-1)
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('profile.theme')} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-2 pb-4">
        <SegmentedTabs
          label={t('profile.theme')}
          options={THEMES.map((value) => ({ value, label: t(`theme.${value}`) }))}
          value={draft}
          onChange={setDraft}
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className="-mx-5 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) =>
              setScreen(
                Math.round(
                  e.currentTarget.scrollLeft / (e.currentTarget.scrollWidth / SCREENS.length),
                ),
              )
            }
          >
            {SCREENS.map((i) => (
              <div key={i} className="w-full shrink-0 snap-center">
                <ThemePreview app={app} dark={dark} screen={i} />
              </div>
            ))}
          </div>
          <div aria-hidden className="flex gap-1.5">
            {SCREENS.map((i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === screen ? 'w-5 bg-primary' : 'w-1.5 bg-navy-200',
                )}
              />
            ))}
          </div>
          {draft === 'system' && (
            <p className="text-center text-sm text-ink-muted">{t('theme.system.hint')}</p>
          )}
        </div>
      </div>
      <footer className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Button block onClick={apply}>
          {t('common.apply')}
        </Button>
      </footer>
    </div>
  )
}
