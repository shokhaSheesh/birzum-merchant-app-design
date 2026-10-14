import { Bell, CalendarDays, Home, Search, ShoppingCart, User, Users } from 'lucide-react'
import photo1 from '@/shared/assets/products/product-1.jpg'
import photo9 from '@/shared/assets/products/product-9.jpg'
import { cn } from '@/shared/lib/cn'

export type PreviewApp = 'customer' | 'merchant'
type Props = { app: PreviewApp; dark: boolean; screen: 0 | 1 }

const bar = (width: string, className = 'bg-navy-200') => (
  <span className={cn('block h-2 rounded-full', className)} style={{ width }} />
)

/**
 * A small drawing of one of the app's screens, in the theme being chosen. It sets its own
 * `data-theme`, so the real theme tokens draw it light or dark whatever the page is in.
 */
export function ThemePreview({ app, dark, screen }: Props) {
  return (
    <div
      data-theme={dark ? 'dark' : 'light'}
      aria-hidden
      className="flex aspect-[3/4] w-full flex-col gap-3 overflow-hidden rounded-card border border-line bg-canvas p-4 text-ink"
    >
      <div className="flex items-center gap-2">
        <span className="size-8 shrink-0 rounded-full bg-navy-200" />
        {bar('38%', 'bg-ink')}
        <span className="ml-auto grid size-8 place-items-center rounded-full bg-surface text-brand">
          <Search size={15} />
        </span>
        <span className="grid size-8 place-items-center rounded-full bg-surface text-brand">
          <Bell size={15} />
        </span>
      </div>

      {screen === 0 ? (
        app === 'customer' ? (
          <>
            <div className="flex flex-col gap-2 rounded-card bg-tile p-3">
              <div className="flex gap-1 rounded-lg bg-white/10 p-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn('h-4 flex-1 rounded', i === 2 ? 'bg-green-500' : 'bg-white/15')}
                  />
                ))}
              </div>
              {bar('40%', 'bg-white/50')}
              {bar('70%', 'h-3 bg-white')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[photo1, photo9].map((src) => (
                <div key={src} className="flex flex-col gap-1.5">
                  <div className="aspect-square overflow-hidden rounded-xl bg-surface">
                    <img
                      src={src}
                      alt=""
                      className="size-full object-cover mix-blend-multiply dark:mix-blend-normal"
                    />
                  </div>
                  {bar('80%', 'bg-ink')}
                  {bar('50%', 'bg-green-200')}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-1 rounded-lg bg-surface p-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className={cn('h-5 flex-1 rounded', i === 1 && 'bg-canvas')} />
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              {bar('35%')}
              {bar('65%', 'h-3.5 bg-ink')}
            </div>
            <div className="flex flex-1 items-end gap-2 rounded-card bg-surface p-3">
              {[30, 55, 40, 80, 50, 65, 35].map((h, i) => (
                <span
                  key={i}
                  className={cn('flex-1 rounded-t', i === 3 ? 'bg-primary' : 'bg-navy-200')}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </>
        )
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            <span className="h-6 w-14 rounded-full bg-primary" />
            <span className="h-6 w-20 rounded-full bg-surface" />
            <span className="h-6 w-12 rounded-full bg-surface" />
          </div>
          {['success', 'warning', 'danger'].map((tone) => (
            <div key={tone} className="flex flex-col gap-2 rounded-xl bg-surface p-3">
              <div className="flex items-center justify-between">
                {bar('35%', 'bg-ink')}
                <span
                  className={cn(
                    'h-3.5 w-14 rounded-full',
                    tone === 'success' && 'bg-success-soft',
                    tone === 'warning' && 'bg-warning-soft',
                    tone === 'danger' && 'bg-danger-soft',
                  )}
                />
              </div>
              {bar('60%')}
            </div>
          ))}
        </div>
      )}

      <div className="glass mt-auto flex h-11 items-center justify-around rounded-full px-2 text-ink-muted">
        <Home size={16} className="text-brand" />
        {app === 'customer' ? <ShoppingCart size={16} /> : <Users size={16} />}
        <span className="grid size-8 -translate-y-1.5 place-items-center rounded-full bg-primary text-on-primary">
          {app === 'customer' ? <ShoppingCart size={14} /> : <CalendarDays size={14} />}
        </span>
        <CalendarDays size={16} />
        <User size={16} />
      </div>
    </div>
  )
}
