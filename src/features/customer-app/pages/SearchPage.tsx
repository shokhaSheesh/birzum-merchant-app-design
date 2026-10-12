import { ArrowUpRight, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRANDS, CATEGORIES, products } from '@/entities/catalog/products'
import { customerProductsPath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { EmptyState } from '@/shared/ui/EmptyState'
import { SearchField } from '@/shared/ui/SearchField'
import { CategoryList } from '../components/CategoryList'
import { PageHeader } from '../components/PageHeader'

type Suggestion = { text: string; kind?: string; to: string }

/**
 * Search on its own screen. Empty, it lists the categories. While typing it suggests brands,
 * categories and product names; picking one, or pressing Enter, opens the product listing.
 */
export function SearchPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const needle = query.trim().toLowerCase()
  const matches = (text: string) => text.toLowerCase().includes(needle)
  const suggestions: Suggestion[] = needle
    ? [
        ...BRANDS.filter(matches).map((brand) => ({
          text: brand,
          kind: t('filter.brand'),
          to: customerProductsPath({ brand }),
        })),
        ...CATEGORIES.filter((category) => matches(t(`catalog.category.${category}`))).map(
          (category) => ({
            text: t(`catalog.category.${category}`),
            kind: t('filter.category'),
            to: customerProductsPath({ category }),
          }),
        ),
        ...products
          .filter((product) => matches(product.name))
          .map((product) => ({
            text: product.name,
            to: customerProductsPath({ q: product.name }),
          })),
      ]
    : []

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('search.title')} />
      <div className="shrink-0 px-5 pb-3">
        <SearchField
          label={t('catalog.search')}
          placeholder={t('catalog.search')}
          value={query}
          onChange={setQuery}
          onSubmit={() => needle && navigate(customerProductsPath({ q: query.trim() }))}
          autoFocus
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-6">
        {!needle ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">{t('chome.categories')}</h2>
            <CategoryList />
          </div>
        ) : suggestions.length === 0 ? (
          <EmptyState title={t('catalog.empty.title')} hint={t('applications.empty.hint')} />
        ) : (
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion.to} className="border-b border-line last:border-b-0">
                <Link to={suggestion.to} className="flex min-h-13 items-center gap-3 py-2">
                  <Search size={20} className="shrink-0 text-ink-subtle" />
                  <span className="min-w-0 flex-1 truncate font-medium">{suggestion.text}</span>
                  {suggestion.kind && (
                    <span className="shrink-0 text-sm text-ink-muted">{suggestion.kind}</span>
                  )}
                  <ArrowUpRight size={18} className="shrink-0 text-ink-subtle" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
