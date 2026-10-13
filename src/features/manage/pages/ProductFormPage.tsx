import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BRANDS,
  CATEGORIES,
  OWN_STORE_ID,
  productsStore,
  type Category,
} from '@/entities/catalog/products'
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
import { TextAreaField } from '@/shared/ui/TextAreaField'
import { TextField } from '@/shared/ui/TextField'

type OptionDraft = { id: number; label: string; priceDelta: number | null; swatch?: string }
type GroupDraft = { id: number; name: string; color: boolean; options: OptionDraft[] }
type SpecDraft = { id: number; label: string; value: string }

// Colors a merchant can pick for a color option. Data, not theme: they describe the product.
const SWATCHES = [
  { name: 'Qora', hex: '#2b3440' },
  { name: 'Oq', hex: '#f4f5f6' },
  { name: 'Kumush', hex: '#b9c1c7' },
  { name: 'Koʻk', hex: '#3f74b8' },
  { name: 'Yashil', hex: '#5aa277' },
  { name: 'Binafsha', hex: '#8468c4' },
  { name: 'Qizil', hex: '#c9484a' },
  { name: 'Oltin', hex: '#d6b36a' },
]

// Keys for rows that are added and removed while editing; never saved
let lastDraftId = 0
const draftId = () => ++lastDraftId

const iconButton =
  'grid size-10 shrink-0 place-items-center rounded-full text-danger active:bg-danger-soft'

/** Create or edit a product: photos, what it is, its price, its variants and its characteristics. */
export function ProductFormPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = productsStore.get(id)
  const fileInput = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<string[]>(existing?.images ?? [])
  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState<Category | null>(existing?.category ?? null)
  const [brand, setBrand] = useState<string | null>(existing?.brand ?? null)
  const [price, setPrice] = useState<number | null>(existing?.price ?? null)
  const [description, setDescription] = useState(existing?.description ?? '')
  const [active, setActive] = useState(existing?.active ?? true)
  const [submitted, setSubmitted] = useState(false)
  const [groups, setGroups] = useState<GroupDraft[]>(() =>
    (existing?.variations ?? []).map((variation) => ({
      id: draftId(),
      name: variation.name,
      color: variation.options.some((option) => option.swatch),
      options: variation.options.map((option) => ({
        id: draftId(),
        label: option.label,
        priceDelta: option.priceDelta ?? null,
        swatch: option.swatch,
      })),
    })),
  )
  const [specs, setSpecs] = useState<SpecDraft[]>(() =>
    (existing?.specs ?? []).map(([label, value]) => ({ id: draftId(), label, value })),
  )

  const patchGroup = (groupId: number, patch: Partial<GroupDraft>) =>
    setGroups((list) => list.map((g) => (g.id === groupId ? { ...g, ...patch } : g)))
  const patchOption = (group: GroupDraft, optionId: number, patch: Partial<OptionDraft>) =>
    patchGroup(group.id, {
      options: group.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)),
    })
  const emptyOption = (): OptionDraft => ({ id: draftId(), label: '', priceDelta: null })

  const groupsValid = groups.every(
    (group) =>
      group.name.trim() !== '' &&
      group.options.length > 0 &&
      group.options.every((option) => option.label.trim() !== ''),
  )
  const required = (filled: boolean) => (submitted && !filled ? t('error.required') : undefined)

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    setImages((list) => [...list, ...Array.from(files).map((file) => URL.createObjectURL(file))])
  }

  const save = () => {
    setSubmitted(true)
    if (name.trim() === '' || !category || !brand || !price || !groupsValid) return
    productsStore.save({
      id: existing?.id ?? newId(),
      storeId: existing?.storeId ?? OWN_STORE_ID,
      stock: existing?.stock ?? {},
      name: name.trim(),
      category,
      brand,
      price,
      description: description.trim(),
      images,
      active,
      variations: groups.map((group) => ({
        name: group.name.trim(),
        options: group.options.map((option) => ({
          label: option.label.trim(),
          priceDelta: option.priceDelta ?? undefined,
          swatch: group.color ? (option.swatch ?? SWATCHES[0].hex) : undefined,
        })),
      })),
      specs: specs
        .filter((spec) => spec.label.trim() !== '' && spec.value.trim() !== '')
        .map((spec) => [spec.label.trim(), spec.value.trim()]),
    })
    navigate(-1)
  }

  return (
    <FormScreen
      onSubmit={save}
      onBack={() => navigate(-1)}
      footer={
        <div className="flex flex-col gap-3">
          {submitted && !groupsValid && <Alert message={t('error.variations')} />}
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
              addPhotos(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      </Section>

      <div className="flex flex-col gap-4">
        <TextField
          label={t('field.name')}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={required(name.trim() !== '')}
        />
        <Select
          label={t('filter.category')}
          options={CATEGORIES.map((value) => ({
            value,
            label: t(`catalog.category.${value}`),
          }))}
          value={category}
          onChange={setCategory}
          error={required(category !== null)}
        />
        <Select
          label={t('filter.brand')}
          options={BRANDS.map((value) => ({ value, label: value }))}
          value={brand}
          onChange={setBrand}
          error={required(brand !== null)}
        />
        <NumberField
          label={t('product.price')}
          value={price}
          onChange={setPrice}
          suffix={t('common.currency')}
          maxDigits={10}
          error={submitted && !price ? t('error.price') : undefined}
        />
        <TextAreaField
          label={t('product.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Section title={t('product.variations')} hint={t('product.variations.hint')}>
        {groups.map((group, index) => (
          <div key={group.id} className="flex flex-col gap-3 rounded-card bg-surface p-4">
            <div className="flex min-h-10 items-center justify-between">
              <p className="font-semibold">{t('variation.group', { n: String(index + 1) })}</p>
              <button
                type="button"
                aria-label={t('common.remove')}
                onClick={() => setGroups((list) => list.filter((g) => g.id !== group.id))}
                className={cn(iconButton, '-mr-2')}
              >
                <Trash2 size={20} />
              </button>
            </div>
            <TextField
              label={t('variation.name')}
              autoComplete="off"
              placeholder="Xotira"
              value={group.name}
              onChange={(e) => patchGroup(group.id, { name: e.target.value })}
              error={submitted && group.name.trim() === '' ? t('error.required') : undefined}
            />
            <Checkbox
              label={t('variation.color')}
              checked={group.color}
              onChange={(color) => patchGroup(group.id, { color })}
            />

            {group.options.map((option) => (
              <div key={option.id} className="flex flex-col gap-3 border-t border-line pt-3">
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <TextField
                      label={t('variation.option')}
                      autoComplete="off"
                      value={option.label}
                      onChange={(e) => patchOption(group, option.id, { label: e.target.value })}
                      error={
                        submitted && option.label.trim() === '' ? t('error.required') : undefined
                      }
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={t('common.remove')}
                    onClick={() =>
                      patchGroup(group.id, {
                        options: group.options.filter((o) => o.id !== option.id),
                      })
                    }
                    className={cn(iconButton, 'mb-1.5 -mr-2')}
                  >
                    <X size={20} />
                  </button>
                </div>
                {group.color && (
                  <div
                    role="radiogroup"
                    aria-label={t('variation.swatch')}
                    className="flex flex-wrap gap-2"
                  >
                    {SWATCHES.map((swatch) => {
                      const selected = option.swatch === swatch.hex
                      return (
                        <button
                          key={swatch.hex}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={swatch.name}
                          onClick={() =>
                            patchOption(group, option.id, {
                              swatch: swatch.hex,
                              label: option.label.trim() === '' ? swatch.name : option.label,
                            })
                          }
                          className={cn(
                            'size-9 rounded-full border-2 p-0.5',
                            selected ? 'border-primary' : 'border-transparent',
                          )}
                        >
                          <span
                            className="block size-full rounded-full border border-line"
                            style={{ background: swatch.hex }}
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
                <NumberField
                  label={t('variation.extra')}
                  value={option.priceDelta}
                  onChange={(priceDelta) => patchOption(group, option.id, { priceDelta })}
                  suffix={t('common.currency')}
                  maxDigits={9}
                />
              </div>
            ))}
            <Button
              variant="ghost"
              block
              onClick={() => patchGroup(group.id, { options: [...group.options, emptyOption()] })}
            >
              <Plus size={20} />
              {t('variation.addOption')}
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          block
          onClick={() =>
            setGroups((list) => [
              ...list,
              { id: draftId(), name: '', color: false, options: [emptyOption()] },
            ])
          }
        >
          <Plus size={20} />
          {t('variation.addGroup')}
        </Button>
      </Section>

      <Section title={t('product.specs')}>
        {specs.map((spec) => (
          <div key={spec.id} className="flex items-end gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
              <TextField
                label={t('field.name')}
                autoComplete="off"
                value={spec.label}
                onChange={(e) =>
                  setSpecs((list) =>
                    list.map((s) => (s.id === spec.id ? { ...s, label: e.target.value } : s)),
                  )
                }
              />
              <TextField
                label={t('spec.value')}
                autoComplete="off"
                value={spec.value}
                onChange={(e) =>
                  setSpecs((list) =>
                    list.map((s) => (s.id === spec.id ? { ...s, value: e.target.value } : s)),
                  )
                }
              />
            </div>
            <button
              type="button"
              aria-label={t('common.remove')}
              onClick={() => setSpecs((list) => list.filter((s) => s.id !== spec.id))}
              className={cn(iconButton, 'mb-1.5 -mr-2')}
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <Button
          variant="secondary"
          block
          onClick={() => setSpecs((list) => [...list, { id: draftId(), label: '', value: '' }])}
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
    </FormScreen>
  )
}
