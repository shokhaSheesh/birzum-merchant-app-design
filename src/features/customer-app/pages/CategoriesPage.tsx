import { useI18n } from '@/shared/i18n/useI18n'
import { CategoryList } from '../components/CategoryList'
import { PageHeader } from '../components/PageHeader'

export function CategoriesPage() {
  const { t } = useI18n()

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('chome.categories')} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-6">
        <CategoryList />
      </div>
    </div>
  )
}
