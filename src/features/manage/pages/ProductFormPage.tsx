import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { attributesStore, SWATCH_PRESETS, type Attribute } from '@/entities/catalog/attributes'
import {
  allCombos,
  BRANDS,
  CATEGORIES,
  OWN_STORE_ID,
  productsStore,
  variantKey,
  type Category,
} from '@/entities/catalog/products'
import type { Lang, LocalizedText } from '@/shared/i18n/dictionaries'
import {
  emptyText,
  fillMissing,
  isBlank,
  isComplete,
  missingLang,
  withLang,
} from '@/shared/i18n/localized'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { newId } from '@/shared/lib/createStore'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { FormScreen } from '@/shared/ui/FormScreen'
import { NumberField } from '@/shared/ui/NumberField'
import { Section } from '@/shared/ui/Section'
import { Select } from '@/shared/ui/Select'
import { Sheet } from '@/shared/ui/Sheet'
import { TextAreaField } from '@/shared/ui/TextAreaField'
import { TextField } from '@/shared/ui/TextField'
import { FormLanguage } from '../components/FormLanguage'
import { SwatchPicker } from '../components/SwatchPicker'

type GroupDraft = { id: number; attributeId: string | null; valueIds: string[] }
type SpecDraft = { id: number; label: LocalizedText; value: LocalizedText }
/** A combination's row: whether it is sold, and at what price. */
type ComboDraft = { on: boolean; price: number | null }

// Keys for rows that are added and removed while editing; never saved
let lastDraftId = 0
const draftId = () => ++lastDraftId

const iconButton =
  'grid size-10 shrink-0 place-items-center rounded-full text-danger active:bg-danger-soft'
const chip = 'h-10 rounded-control border-2 px-3.5 text-sm font-semibold'

/**
 * Create or edit a product. Text is written once per language. Variant types come from the
 * directory; the merchant then ticks which combinations of their values are actually sold
 * and prices each one.
 */
export function ProductFormPage() {
  const { t, tl, lang: appLang } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = productsStore.get(id)
  const attributes = attributesStore.useAll()
  const fileInput = useRef<HTMLInputElement>(null)

  const [lang, setLang] = useState<Lang>(appLang)
  const [images, setImages] = useState<string[]>(existing?.images ?? [])
  const [name, setName] = useState<LocalizedText>(existing?.name ?? emptyText())
  const [description, setDescription] = useState<LocalizedText>(
    existing?.description ?? emptyText(),
  )
  const [category, setCategory] = useState<Category | null>(existing?.category ?? null)
  const [brand, setBrand] = useState<string | null>(existing?.brand ?? null)
  const [price, setPrice] = useState<number | null>(existing?.price ?? null)
  const [active, setActive] = useState(existing?.active ?? true)
  const [submitted, setSubmitted] = useState(false)
  const [groups, setGroups] = useState<GroupDraft[]>(() =>
    (existing?.variations ?? []).map((variation) => ({ id: draftId(), ...variation })),
  )
  const [comboDrafts, setComboDrafts] = useState<Record<string, ComboDraft>>(() =>
    Object.fromEntries(
      Object.entries(existing?.variants ?? {}).map(([key, variant]) => [
        key,
        { on: true, price: variant.price },
      ]),
    ),
  )
  const [specs, setSpecs] = useState<SpecDraft[]>(() =>
    (existing?.specs ?? []).map((spec) => ({ id: draftId(), ...spec })),
  )
  /** The attribute a new value is being added to, while that sheet is open. */
  const [addingTo, setAddingTo] = useState<Attribute | null>(null)

  const attributeOf = (group: GroupDraft) => attributes.find((a) => a.id === group.attributeId)
  const patchGroup = (groupId: number, patch: Partial<GroupDraft>) =>
    setGroups((list) => list.map((g) => (g.id === groupId ? { ...g, ...patch } : g)))
  const patchSpec = (specId: number, patch: Partial<SpecDraft>) =>
    setSpecs((list) => list.map((s) => (s.id === specId ? { ...s, ...patch } : s)))

  const groupsValid = groups.every((group) => group.attributeId && group.valueIds.length > 0)
  const variations = groups.flatMap((group) =>
    group.attributeId && group.valueIds.length > 0
      ? [{ attributeId: group.attributeId, valueIds: group.valueIds }]
      : [],
  )
  const combos = variations.length > 0 ? allCombos(variations) : []
  const comboOf = (combo: string[]): ComboDraft =>
    comboDrafts[variantKey(combo)] ?? { on: false, price: null }
  const setCombo = (combo: string[], patch: Partial<ComboDraft>) =>
    setComboDrafts((drafts) => ({
      ...drafts,
      [variantKey(combo)]: { ...comboOf(combo), ...patch },
    }))
  const sold = combos.filter((combo) => comboOf(combo).on)
  const combosValid =
    combos.length === 0 || (sold.length > 0 && sold.every((combo) => comboOf(combo).price))

  const valueName = (index: number, valueId: string) => {
    const value = attributes
      .find((a) => a.id === variations[index].attributeId)
      ?.values.find((v) => v.id === valueId)
    return value ? tl(value.name) : valueId
  }
  // With two or more variant types, rows are grouped under the first one's values
  const sections =
    variations.length > 1
      ? variations[0].valueIds.map((valueId) => ({
          heading: valueName(0, valueId),
          combos: combos.filter((combo) => combo[0] === valueId),
          from: 1,
        }))
      : [{ heading: null, combos, from: 0 }]

  const fillEmpty = () => {
    setName(fillMissing(name))
    setDescription(fillMissing(description))
    setSpecs((list) =>
      list.map((s) => ({ ...s, label: fillMissing(s.label), value: fillMissing(s.value) })),
    )
  }

  const save = () => {
    setSubmitted(true)
    const missing = missingLang([name])
    if (missing) setLang(missing)
    if (missing || !category || !brand || !price || !groupsValid || !combosValid) return

    const variants = Object.fromEntries(
      sold.map((combo) => [variantKey(combo), { price: comboOf(combo).price ?? price }]),
    )
    productsStore.save({
      id: existing?.id ?? newId(),
      storeId: existing?.storeId ?? OWN_STORE_ID,
      stock: existing?.stock ?? {},
      name: fillMissing(name),
      description: fillMissing(description),
      category,
      brand,
      // Cards show the cheapest way to buy the product
      price: sold.length > 0 ? Math.min(...Object.values(variants).map((v) => v.price)) : price,
      images,
      active,
      variations,
      variants,
      specs: specs
        .filter((spec) => !isBlank(spec.label) && !isBlank(spec.value))
        .map((spec) => ({ label: fillMissing(spec.label), value: fillMissing(spec.value) })),
    })
    navigate(-1)
  }

  const formError = !groupsValid
    ? t('error.pickValues')
    : !combosValid
      ? t('error.combos')
      : undefined

  return (
    <FormScreen
      onSubmit={save}
      onBack={() => navigate(-1)}
      footer={
        <div className="flex flex-col gap-3">
          {submitted && formError && <Alert message={formError} />}
          <Button type="submit" block>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <h1 className="text-2xl font-bold">{t(existing ? 'product.edit' : 'product.new')}</h1>

      <Section title={t('product.photos')} hint={t('product.photos.hint')}>
        <div className="flex flex-wrap gap-3">
          {images.map((src) => (
            <div key={src} className="relative size-24 overflow-hidden rounded-control bg-surface">
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label={t('product.photos.remove')}
                onClick={() => setImages((list) => list.filter((x) => x !== src))}
                className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-canvas/90 text-danger"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-control border-[1.5px] border-dashed border-navy-400 px-1 text-center text-xs font-semibold text-brand active:bg-surface"
          >
            <ImagePlus size={24} />
            {t('product.photos.add')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              setImages((list) => [...list, ...files.map((file) => URL.createObjectURL(file))])
              e.target.value = ''
            }}
          />
        </div>
      </Section>

      <FormLanguage value={lang} onChange={setLang} onFillEmpty={fillEmpty} />

      <div className="flex flex-col gap-4">
        <TextField
          label={t('field.name')}
          autoComplete="off"
          value={name[lang]}
          onChange={(e) => setName(withLang(name, lang, e.target.value))}
          error={submitted && !isComplete(name) ? t('error.bothLanguages') : undefined}
        />
        <TextAreaField
          label={t('product.description')}
          value={description[lang]}
          onChange={(e) => setDescription(withLang(description, lang, e.target.value))}
        />
        <Select
          label={t('filter.category')}
          options={CATEGORIES.map((value) => ({
            value,
            label: t(`catalog.category.${value}`),
          }))}
          value={category}
          onChange={setCategory}
          error={submitted && !category ? t('error.required') : undefined}
        />
        <Select
          label={t('filter.brand')}
          options={BRANDS.map((value) => ({ value, label: value }))}
          value={brand}
          onChange={setBrand}
          error={submitted && !brand ? t('error.required') : undefined}
        />
        <NumberField
          label={t('product.price')}
          value={price}
          onChange={setPrice}
          suffix={t('common.currency')}
          maxDigits={10}
          error={submitted && !price ? t('error.price') : undefined}
        />
      </div>

      <Section title={t('product.variations')} hint={t('product.variations.hint')}>
        {groups.map((group) => {
          const attribute = attributeOf(group)
          const taken = groups.filter((g) => g.id !== group.id).map((g) => g.attributeId)
          return (
            <div key={group.id} className="flex flex-col gap-3 rounded-card bg-surface p-4">
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Select
                    label={t('attribute.edit')}
                    options={attributes
                      .filter((a) => !taken.includes(a.id))
                      .map((a) => ({ value: a.id, label: tl(a.name) }))}
                    value={group.attributeId}
                    onChange={(attributeId) => patchGroup(group.id, { attributeId, valueIds: [] })}
                    error={submitted && !group.attributeId ? t('error.required') : undefined}
                  />
                </div>
                <button
                  type="button"
                  aria-label={t('common.remove')}
                  onClick={() => setGroups((list) => list.filter((g) => g.id !== group.id))}
                  className={cn(iconButton, '-mr-2 mb-1.5')}
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {attribute && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-ink-muted">{t('attribute.values')}</p>
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map((value) => {
                      const on = group.valueIds.includes(value.id)
                      return (
                        <button
                          key={value.id}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          onClick={() =>
                            patchGroup(group.id, {
                              // Keep the directory's order whatever order they are ticked in
                              valueIds: attribute.values
                                .map((v) => v.id)
                                .filter((valueId) =>
                                  valueId === value.id ? !on : group.valueIds.includes(valueId),
                                ),
                            })
                          }
                          className={cn(
                            chip,
                            'flex items-center gap-2 bg-canvas',
                            on ? 'border-primary' : 'border-line text-ink-muted',
                          )}
                        >
                          {value.swatch && (
                            <span
                              className="size-4 rounded-full border border-line"
                              style={{ background: value.swatch }}
                            />
                          )}
                          {tl(value.name)}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setAddingTo(attribute)}
                      className={cn(
                        chip,
                        'flex items-center gap-1 border-dashed border-navy-400 text-brand',
                      )}
                    >
                      <Plus size={16} />
                      {t('attribute.newValue')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {groups.length < attributes.length && (
          <Button
            variant="secondary"
            block
            onClick={() =>
              setGroups((list) => [...list, { id: draftId(), attributeId: null, valueIds: [] }])
            }
          >
            <Plus size={20} />
            {t('variation.addGroup')}
          </Button>
        )}
        <p className="text-sm text-ink-muted">{t('attribute.note')}</p>
      </Section>

      {combos.length > 0 && (
        <Section
          title={`${t('product.combos')} (${sold.length} / ${combos.length})`}
          hint={t('product.combos.hint')}
          action={
            <button
              type="button"
              onClick={() =>
                combos.forEach((combo) =>
                  setCombo(combo, { on: true, price: comboOf(combo).price ?? price }),
                )
              }
              className="shrink-0 text-sm font-semibold text-brand"
            >
              {t('product.combos.all')}
            </button>
          }
        >
          {sections.map((section) => (
            <div key={section.heading ?? 'all'} className="rounded-card bg-surface px-4 py-1">
              {section.heading && (
                <p className="flex items-baseline justify-between border-b border-line py-2.5 font-semibold">
                  {section.heading}
                  <span className="text-sm font-normal text-ink-muted">
                    {section.combos.filter((combo) => comboOf(combo).on).length} /{' '}
                    {section.combos.length}
                  </span>
                </p>
              )}
              {section.combos.map((combo) => {
                const draft = comboOf(combo)
                const label = combo
                  .slice(section.from)
                  .map((valueId, i) => valueName(i + section.from, valueId))
                  .join(' · ')
                return (
                  <div
                    key={variantKey(combo)}
                    className="flex flex-col gap-2 border-b border-line py-2.5 last:border-b-0"
                  >
                    <Checkbox
                      label={label}
                      checked={draft.on}
                      onChange={(on) => setCombo(combo, { on, price: draft.price ?? price })}
                    />
                    {draft.on && (
                      <NumberField
                        label={t('product.price')}
                        value={draft.price}
                        onChange={(value) => setCombo(combo, { price: value })}
                        suffix={t('common.currency')}
                        maxDigits={10}
                        error={submitted && !draft.price ? t('error.price') : undefined}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </Section>
      )}

      <Section title={t('product.specs')}>
        {specs.map((spec) => (
          <div key={spec.id} className="flex items-end gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
              <TextField
                label={t('field.name')}
                autoComplete="off"
                value={spec.label[lang]}
                onChange={(e) =>
                  patchSpec(spec.id, { label: withLang(spec.label, lang, e.target.value) })
                }
              />
              <TextField
                label={t('spec.value')}
                autoComplete="off"
                value={spec.value[lang]}
                onChange={(e) =>
                  patchSpec(spec.id, { value: withLang(spec.value, lang, e.target.value) })
                }
              />
            </div>
            <button
              type="button"
              aria-label={t('common.remove')}
              onClick={() => setSpecs((list) => list.filter((s) => s.id !== spec.id))}
              className={cn(iconButton, '-mr-2 mb-1.5')}
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <Button
          variant="secondary"
          block
          onClick={() =>
            setSpecs((list) => [...list, { id: draftId(), label: emptyText(), value: emptyText() }])
          }
        >
          <Plus size={20} />
          {t('product.specs.add')}
        </Button>
      </Section>

      <div className="flex flex-col gap-2">
        <Checkbox
          label={t('product.visible')}
          description={t('product.visible.hint')}
          checked={active}
          onChange={setActive}
        />
        <p className="text-sm text-ink-muted">{t('product.stockNote')}</p>
      </div>

      {addingTo && (
        <NewValueSheet
          attribute={addingTo}
          onClose={() => setAddingTo(null)}
          onAdded={(valueId) =>
            setGroups((list) =>
              list.map((g) =>
                g.attributeId === addingTo.id ? { ...g, valueIds: [...g.valueIds, valueId] } : g,
              ),
            )
          }
        />
      )}
    </FormScreen>
  )
}

type NewValueProps = {
  attribute: Attribute
  onClose: () => void
  onAdded: (valueId: string) => void
}

/** Adds a value to the directory without leaving the product form: its name in each language. */
function NewValueSheet({ attribute, onClose, onAdded }: NewValueProps) {
  const { t, tl } = useI18n()
  const [name, setName] = useState<LocalizedText>(emptyText())
  const [swatch, setSwatch] = useState(SWATCH_PRESETS[0])
  const [submitted, setSubmitted] = useState(false)

  const add = (e: FormEvent) => {
    // The sheet's form sits inside the product form in React's tree: keep the submit to itself
    e.preventDefault()
    e.stopPropagation()
    setSubmitted(true)
    if (!isComplete(name)) return
    const value = {
      id: newId(),
      name: fillMissing(name),
      swatch: attribute.color ? swatch : undefined,
    }
    attributesStore.update(attribute.id, { values: [...attribute.values, value] })
    onAdded(value.id)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={`${tl(attribute.name)}: ${t('attribute.newValue')}`}>
      <form onSubmit={add} noValidate className="flex flex-col gap-4 pt-1 pb-1">
        <TextField
          label="Oʻzbekcha"
          autoComplete="off"
          value={name.uz}
          onChange={(e) => setName(withLang(name, 'uz', e.target.value))}
          error={submitted && name.uz.trim() === '' ? t('error.required') : undefined}
        />
        <TextField
          label="Русский"
          autoComplete="off"
          value={name.ru}
          onChange={(e) => setName(withLang(name, 'ru', e.target.value))}
          error={submitted && name.ru.trim() === '' ? t('error.required') : undefined}
        />
        {attribute.color && <SwatchPicker value={swatch} onChange={setSwatch} />}
        <Button type="submit" block className="mt-2">
          {t('common.save')}
        </Button>
      </form>
    </Sheet>
  )
}
