import { ChevronRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { categoryImages } from '@/entities/catalog/categoryImages'
import { ProductPicture } from '@/entities/catalog/ProductPicture'
import { CATEGORIES, photosOf, useCatalog, type Category } from '@/entities/catalog/products'
import { subcategoriesOf } from '@/entities/catalog/subcategories'
import { customerProductsPath, ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { PageHeader } from '@/shared/ui/PageHeader'

/**
 * A category's subcategories, opened from a category that has any. "Hammasi" on top shows the
 * whole category; each row below opens one subcategory's products.
 */
export function SubcategoriesPage() {
  const { t, tl, lang } = useI18n()
  const products = useCatalog()
  const category = useParams().category as Category

  if (!CATEGORIES.includes(category)) return <Navigate to={ROUTES.customerCategories} replace />
  const inCategory = products.filter((product) => product.category === category)
  const rows = [
    {
      key: 'all',
      title: t('catalog.all'),
      count: inCategory.length,
      image: categoryImages[category],
      to: customerProductsPath({ category }),
    },
    ...subcategoriesOf(category).map((sub) => {
      const items = inCategory.filter((product) => product.subcategory === sub.id)
      return {
        key: sub.id,
        title: tl(sub.name),
        count: items.length,
        // A subcategory has no picture of its own yet: its first product's photo stands in
        image: items.map((product) => photosOf(product, lang)[0]).find(Boolean),
        to: customerProductsPath({ category, sub: sub.id }),
      }
    }),
  ]

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t(`catalog.category.${category}`)} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-6">
        <ul className="rounded-card bg-surface px-3">
          {rows.map((row) => (
            <li key={row.key} className="border-b border-line last:border-b-0">
              <Link to={row.to} className="flex items-center gap-3 py-2.5">
                <ProductPicture
                  category={category}
                  src={row.image}
                  className="w-14 shrink-0 rounded-control bg-canvas!"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate font-semibold">{row.title}</p>
                  <p className="text-sm text-ink-muted">
                    {t('stores.count', { count: String(row.count) })}
                  </p>
                </div>
                <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
