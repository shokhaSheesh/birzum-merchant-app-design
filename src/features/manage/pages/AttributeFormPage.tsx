import { Plus, Tags, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { attributesStore, SWATCH_PRESETS } from '@/entities/catalog/attributes'
import { LANGS, type Lang, type LocalizedText } from '@/shared/i18n/dictionaries'
import { emptyText, fillMissing, isComplete } from '@/shared/i18n/localized'
import { useI18n } from '@/shared/i18n/useI18n'
import { toast } from '@/shared/lib/toast'
import { newId } from '@/shared/lib/createStore'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { IconBadge } from '@/shared/ui/IconBadge'
import { LangToggle } from '@/shared/ui/LangToggle'
import { LocalizedTextField } from '@/shared/ui/LocalizedTextField'
import { ScreenIntro } from '@/shared/ui/ScreenIntro'
import { Section } from '@/shared/ui/Section'
import { SwatchPicker } from '../components/SwatchPicker'

type ValueDraft = { id: string; name: LocalizedText; swatch?: string }

/** Create or edit a variant type: its name and its values, each written once per language. */
export function AttributeFormPage() {
  const { t, lang: appLang } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = attributesStore.get(id)

  /** One toggle switches every value row at once. */
  const [valuesLang, setValuesLang] = useState<Lang>(appLang)
  const [name, setName] = useState<LocalizedText>(existing?.name ?? emptyText())
  const [color, setColor] = useState(existing?.color ?? false)
  const [values, setValues] = useState<ValueDraft[]>(
    () => existing?.values ?? [{ id: newId(), name: emptyText() }],
  )
  const [submitted, setSubmitted] = useState(false)

  const patchValue = (valueId: string, patch: Partial<ValueDraft>) =>
    setValues((list) => list.map((v) => (v.id === valueId ? { ...v, ...patch } : v)))
  const save = () => {
    setSubmitted(true)
    const texts = [name, ...values.map((v) => v.name)]
    if (!texts.every(isComplete) || values.length === 0) return
    attributesStore.save({
      id: existing?.id ?? newId(),
      name: fillMissing(name),
      color,
      values: values.map((v) => ({
        id: v.id,
        name: fillMissing(v.name),
        swatch: color ? (v.swatch ?? SWATCH_PRESETS[0]) : undefined,
      })),
    })
    toast(t('toast.saved'))
    navigate(-1)
  }

  return (
    <FormScreen
      onSubmit={save}
      onBack={() => navigate(-1)}
      footer={
        <Button type="submit" block>
          {t('common.save')}
        </Button>
      }
    >
      <IconBadge icon={Tags} />
      <ScreenIntro title={t(existing ? 'attribute.edit' : 'attribute.new')} />
      <div className="flex flex-col gap-4">
        <LocalizedTextField
          label={t('field.name')}
          value={name}
          onChange={setName}
          requireBoth={submitted}
        />
        <Checkbox label={t('variation.color')} checked={color} onChange={setColor} />
      </div>

      <Section
        title={t('attribute.values')}
        action={
          <LangToggle
            value={valuesLang}
            onChange={setValuesLang}
            missing={
              submitted
                ? LANGS.filter((l) => values.some((v) => v.name[l].trim() === ''))
                : undefined
            }
          />
        }
      >
        {values.map((value) => (
          <div key={value.id} className="flex flex-col gap-3 rounded-card bg-surface p-4">
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <LocalizedTextField
                  label={t('attribute.value')}
                  value={value.name}
                  onChange={(next) => patchValue(value.id, { name: next })}
                  requireBoth={submitted}
                  lang={valuesLang}
                  hideToggle
                />
              </div>
              {values.length > 1 && (
                <button
                  type="button"
                  aria-label={t('common.remove')}
                  onClick={() => setValues((list) => list.filter((v) => v.id !== value.id))}
                  className="-mr-2 mb-1.5 grid size-10 shrink-0 place-items-center rounded-full text-danger active:bg-danger-soft"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            {color && (
              <SwatchPicker
                value={value.swatch}
                onChange={(swatch) => patchValue(value.id, { swatch })}
              />
            )}
          </div>
        ))}
        <Button
          variant="secondary"
          block
          onClick={() => setValues((list) => [...list, { id: newId(), name: emptyText() }])}
        >
          <Plus size={20} />
          {t('attribute.addValue')}
        </Button>
      </Section>
    </FormScreen>
  )
}
