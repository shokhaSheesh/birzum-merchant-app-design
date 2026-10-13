import { Languages } from 'lucide-react'
import { LANG_NAMES, LANGS, type Lang } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'

type Props = {
  value: Lang
  onChange: (lang: Lang) => void
  /** Copies the other language into this one's empty fields. */
  onFillEmpty: () => void
}

/**
 * Chooses which language a form's text fields are being written in. The fields that follow
 * it (names, descriptions) hold one text per language; everything else is language-free.
 */
export function FormLanguage({ value, onChange, onFillEmpty }: Props) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-ink-muted">{t('form.language')}</p>
      <SegmentedTabs
        label={t('form.language')}
        options={LANGS.map((lang) => ({ value: lang, label: LANG_NAMES[lang] }))}
        value={value}
        onChange={onChange}
      />
      <Button variant="ghost" block className="h-10! text-sm!" onClick={onFillEmpty}>
        <Languages size={18} />
        {t('form.fillEmpty')}
      </Button>
    </div>
  )
}
