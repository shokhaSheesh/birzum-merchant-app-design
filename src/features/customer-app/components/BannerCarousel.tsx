import { LayoutGrid, MapPin, ShoppingBag, Store, type LucideIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { liveBanners, type BannerTarget } from '@/entities/banners/banners'
import { customerCatalogPath, customerProductsPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'

const ICONS: Record<BannerTarget['kind'], LucideIcon> = {
  nearest: MapPin,
  products: ShoppingBag,
  categories: LayoutGrid,
  stores: Store,
}

/** Picked products or categories open the product listing; shops open Katalog's shops tab. */
function targetPath(target: BannerTarget) {
  switch (target.kind) {
    case 'products':
      return customerProductsPath({ ids: target.ids.join(',') })
    case 'categories':
      return customerProductsPath({ cats: target.ids.join(',') })
    case 'stores':
      return customerCatalogPath('stores', { ids: target.ids })
    case 'nearest':
      return customerCatalogPath('stores', { near: true })
  }
}

/**
 * The banners on Bosh sahifa: swiped sideways, the next one peeking in, with dots under them.
 * An uploaded picture fills the banner. Without one the app draws it: a navy banner has a green
 * circle with the icon low on the right; a green one is plain.
 */
export function BannerCarousel() {
  const { t, tl, lang } = useI18n()
  const banners = liveBanners()
  const row = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  const onScroll = () => {
    const el = row.current
    const first = el?.firstElementChild as HTMLElement | null
    if (!el || !first) return
    setCurrent(Math.round(el.scrollLeft / (first.offsetWidth + 12)))
  }

  if (banners.length === 0) return null

  return (
    <section aria-label={t('chome.banners')} className="flex flex-col gap-2.5">
      <div
        ref={row}
        onScroll={onScroll}
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 [scrollbar-width:none]"
      >
        {banners.map((banner) => {
          const Icon = ICONS[banner.target.kind]
          const to = targetPath(banner.target)
          const image = banner.image?.[lang] ?? Object.values(banner.image ?? {})[0]
          const navy = banner.tone === 'navy'
          if (image) {
            return (
              <Link
                key={banner.id}
                to={to}
                aria-label={tl(banner.title)}
                className="h-38 w-[85%] shrink-0 snap-start overflow-hidden rounded-card"
              >
                <img src={image} alt="" className="size-full object-cover" />
              </Link>
            )
          }
          return (
            <Link
              key={banner.id}
              to={to}
              className={cn(
                'relative isolate flex h-38 w-[85%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-card p-4.5',
                navy ? 'bg-tile text-on-tile' : 'bg-green-300 text-ink',
              )}
            >
              {navy && (
                <span
                  aria-hidden
                  className="absolute -right-8 -bottom-10 -z-10 grid size-38 place-items-center rounded-full bg-green-300 text-ink"
                >
                  <Icon size={48} strokeWidth={1.8} className="-translate-x-3 -translate-y-3" />
                </span>
              )}
              <p
                className={cn(
                  'text-xl leading-tight font-bold',
                  navy ? 'max-w-[60%]' : 'max-w-[80%]',
                )}
              >
                {tl(banner.title)}
              </p>
              <span
                className={cn(
                  'self-start rounded-full px-3.5 py-1.5 text-sm font-bold',
                  navy ? 'bg-canvas text-ink' : 'bg-primary text-on-primary',
                )}
              >
                {tl(banner.action)}
              </span>
            </Link>
          )
        })}
      </div>
      <div aria-hidden className="flex justify-center gap-1.5">
        {banners.map((banner, index) => (
          <span
            key={banner.id}
            className={cn(
              'h-1.5 rounded-full transition-all',
              index === current ? 'w-5 bg-primary' : 'w-1.5 bg-navy-200',
            )}
          />
        ))}
      </div>
    </section>
  )
}
