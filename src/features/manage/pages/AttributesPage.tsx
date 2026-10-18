import { attributesStore } from '@/entities/catalog/attributes'
import { managePath } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { ListRow, ListScreen } from '../components/ListScreen'

/** The directory of variant types (color, memory, …) and their values, named in every language. */
export function AttributesPage() {
  const { t, tl } = useI18n()
  const attributes = attributesStore.useAll()

  return (
    <ListScreen
      title={t('manage.attributes')}
      createTo={managePath('attributes', 'new')}
      empty={attributes.length === 0}
    >
      <ul className="rounded-card border border-line bg-canvas px-4">
        {attributes.map((attribute) => (
          <ListRow
            key={attribute.id}
            to={managePath('attributes', attribute.id)}
            title={tl(attribute.name)}
            lines={[
              t('attribute.summary', { count: String(attribute.values.length) }),
              attribute.values.map((value) => tl(value.name)).join(', '),
            ]}
          />
        ))}
      </ul>
    </ListScreen>
  )
}
