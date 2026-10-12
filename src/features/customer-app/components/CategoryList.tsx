import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { CATEGORIES, products } from '@/entities/catalog/products'
import { customerProductsPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'

/** Every category, one per row with its picture. A row opens that category's products. */
export function CategoryList() {
  const { t } = useI18n()

  return (
    <ul className="rounded-card bg-surface px-3">
      {CATEGORIES.map((category) => (
        <li key={category} className="border-b border-line last:border-b-0">
          <Link to={customerProductsPath({ category })} className="flex items-center gap-3 py-2.5">
            <ProductPicture category={category} className="w-14 shrink-0 rounded-control" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate font-semibold">{t(`catalog.category.${category}`)}</p>
              <p className="text-sm text-ink-muted">
                {t('stores.count', {
                  count: String(products.filter((p) => p.category === category).length),
                })}
              </p>
            </div>
            <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
