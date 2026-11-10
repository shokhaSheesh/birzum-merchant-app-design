import { ownAttributesStore, type Attribute } from '@/entities/catalog/attributes'
import {
  OWN_STORE_ID,
  productsStore,
  variantKey,
  type Category,
  type Moderation,
  type ModerationReason,
  type Product,
} from '@/entities/catalog/products'
import type { Review } from '@/entities/catalog/reviews'
import { api } from '@/shared/api/client'
import type { LocalizedText } from '@/shared/i18n/dictionaries'
import { createStore } from '@/shared/lib/createStore'
import { summarizeSchedule, locationsStore, type Location, type WorkDay } from './locations'
import { rolesStore, type Permission, type RoleId } from './roles'
import { setCurrentStaffId, staffStore, type StaffMember } from './staff'

/**
 * Everything the merchant app asks of the backend (`/api/v1/merchant/*`, see
 * birzum-mobile-api.md §1). Each `load*` fetches and puts the result into the store the screens
 * already read; each `save*` and `remove*` calls the API first and updates the store from the
 * answer, so a screen never shows something the server refused.
 */

const TIYIN = 100
const toSum = (tiyin: number) => Math.round(tiyin / TIYIN)
const toTiyin = (sum: number) => Math.round(sum * TIYIN)
const nothing = <T>(value: T | '' | null | undefined): T | undefined => value || undefined

// ----- Me (§1.1) ------------------------------------------------------------------------

type StaffDto = {
  id: string
  login: string
  first_name: string
  last_name: string
  email: string
  phone: string
  pinfl: string
  role: RoleId
  location_ids: string[]
  active: boolean
  must_change_password: boolean
}

type LocationDto = {
  id: string
  name: LocalizedText
  address: LocalizedText
  phone: string
  active: boolean
  location?: { lat: number; lng: number } | null
  schedule?: WorkDay[] | null
}

type MeDto = {
  staff: StaffDto
  permissions: Permission[]
  merchant: { id: string; name: string }
  locations: LocationDto[]
}

/** The shop the signed-in staff member works for. */
export const merchantStore = createStore<{ id: string; name: string }>([])

const toStaff = (dto: StaffDto): StaffMember => ({
  id: dto.id,
  firstName: dto.first_name,
  lastName: dto.last_name,
  phone: dto.phone,
  login: dto.login,
  email: dto.email,
  pinfl: dto.pinfl,
  temporaryPassword: dto.must_change_password,
  roleId: dto.role,
  locationIds: dto.location_ids,
  active: dto.active,
})

const toLocation = (dto: LocationDto): Location => {
  const schedule = dto.schedule ?? []
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    phone: dto.phone,
    active: dto.active,
    schedule,
    hours: summarizeSchedule(schedule),
    point: dto.location ?? null,
  }
}

/** `GET /merchant/me`: who is signed in, what their role allows, their shop and shops. */
export async function loadMe() {
  const me = await api<MeDto>('/merchant/me')
  setCurrentStaffId(me.staff.id)
  merchantStore.replace([me.merchant])
  staffStore.save(toStaff(me.staff))
  const roles = rolesStore.getAll()
  rolesStore.replace(
    roles.map((role) =>
      role.id === me.staff.role ? { ...role, permissions: me.permissions } : role,
    ),
  )
  await loadLocations()
}

let signedIn: Promise<void> | undefined
/** `loadMe` once: screens that need to know who is signed in (to guard self-delete) wait for it. */
export function ensureMe() {
  signedIn ??= loadMe().catch((error: unknown) => {
    signedIn = undefined
    throw error
  })
  return signedIn
}

// ----- Locations (§1.2) -------------------------------------------------------------------

export async function loadLocations() {
  const { items } = await api<{ items: LocationDto[] }>('/merchant/locations')
  locationsStore.replace(items.map(toLocation))
}

export type LocationInput = Pick<
  Location,
  'name' | 'address' | 'phone' | 'active' | 'schedule' | 'point'
>

export async function saveLocation(id: string | undefined, input: LocationInput) {
  const body = {
    name: input.name,
    address: input.address,
    phone: input.phone,
    active: input.active,
    // A PUT replaces the whole object: leaving these out would clear them
    location: input.point,
    schedule: input.schedule,
  }
  const dto = id
    ? await api<LocationDto>(`/merchant/locations/${id}`, { method: 'PUT', body })
    : await api<LocationDto>('/merchant/locations', { method: 'POST', body })
  locationsStore.save(toLocation(dto))
}

export async function removeLocation(id: string) {
  await api(`/merchant/locations/${id}`, { method: 'DELETE' })
  locationsStore.remove(id)
  // The server also takes the shop off every staff member's list
  for (const member of staffStore.getAll()) {
    staffStore.update(member.id, {
      locationIds: member.locationIds.filter((locationId) => locationId !== id),
    })
  }
}

// ----- Variation types (§1.3) ---------------------------------------------------------------

type AttributeDto = {
  id: string
  name: LocalizedText
  color: boolean
  values: { id: string; name: LocalizedText; swatch: string }[]
}

const toAttribute = (dto: AttributeDto): Attribute => ({
  id: dto.id,
  name: dto.name,
  color: dto.color,
  values: dto.values.map((value) => ({
    id: value.id,
    name: value.name,
    swatch: nothing(value.swatch),
  })),
})

export async function loadAttributes() {
  const { items } = await api<{ items: AttributeDto[] }>('/merchant/variation-types')
  ownAttributesStore.replace(items.map(toAttribute))
}

export type AttributeInput = {
  name: LocalizedText
  color: boolean
  values: { id: string; name: LocalizedText; swatch?: string }[]
}

/** A value the server does not know yet goes out with an empty id; the server gives it one. */
function attributeBody(existing: Attribute | undefined, input: AttributeInput) {
  const known = new Set(existing?.values.map((value) => value.id))
  return {
    name: input.name,
    color: input.color,
    values: input.values.map((value) => ({
      id: known.has(value.id) ? value.id : '',
      name: value.name,
      swatch: input.color ? (value.swatch ?? '') : '',
    })),
  }
}

export async function saveAttribute(existing: Attribute | undefined, input: AttributeInput) {
  const body = attributeBody(existing, input)
  const dto = existing
    ? await api<AttributeDto>(`/merchant/variation-types/${existing.id}`, { method: 'PUT', body })
    : await api<AttributeDto>('/merchant/variation-types', { method: 'POST', body })
  const saved = toAttribute(dto)
  ownAttributesStore.save(saved)
  return saved
}

/** Adds one value to a type and returns it with the id the server gave it. */
export async function addAttributeValue(
  attribute: Attribute,
  value: { name: LocalizedText; swatch?: string },
) {
  const saved = await saveAttribute(attribute, {
    name: attribute.name,
    color: attribute.color,
    values: [...attribute.values, { id: '', ...value }],
  })
  const before = new Set(attribute.values.map((v) => v.id))
  return saved.values.find((v) => !before.has(v.id))
}

export async function removeAttribute(id: string) {
  await api(`/merchant/variation-types/${id}`, { method: 'DELETE' })
  ownAttributesStore.remove(id)
}

// ----- Products (§1.4) and stock (§1.5) -------------------------------------------------------

type ProductDto = {
  id: string
  name: LocalizedText
  category: Category
  subcategory: string
  brand: string
  price_tiyin: number
  description: LocalizedText
  variations: { attribute_id: string; value_ids: string[] }[]
  variants: Record<string, { price_tiyin: number }>
  specs: Product['specs']
  images: Product['images']
  value_images: Record<string, string[]>
  active: boolean
  moderation: {
    state: 'pending' | 'approved' | 'rejected'
    submitted_at: string
    was_live: boolean
    decided_at: string
    reason: string
    comment: string
  }
}

type StockDto = { product_id: string; location_id: string; variant_key: string; count: number }

const toModeration = (dto: ProductDto['moderation']): Moderation => {
  if (dto.state === 'approved') return { state: 'approved', decidedAt: new Date(dto.decided_at) }
  if (dto.state === 'rejected')
    return {
      state: 'rejected',
      decidedAt: new Date(dto.decided_at),
      reason: dto.reason as ModerationReason,
      comment: dto.comment,
    }
  return { state: 'pending', submittedAt: new Date(dto.submitted_at), wasLive: dto.was_live }
}

const toProduct = (dto: ProductDto, stock: Product['stock'] = {}): Product => ({
  id: dto.id,
  name: dto.name,
  category: dto.category,
  subcategory: nothing(dto.subcategory),
  brand: dto.brand,
  price: toSum(dto.price_tiyin),
  storeId: OWN_STORE_ID,
  description: dto.description,
  variations: dto.variations.map((variation) => ({
    attributeId: variation.attribute_id,
    valueIds: variation.value_ids,
  })),
  variants: Object.fromEntries(
    Object.entries(dto.variants).map(([key, variant]) => [
      key,
      { price: toSum(variant.price_tiyin) },
    ]),
  ),
  stock,
  specs: dto.specs,
  images: dto.images,
  valueImages: dto.value_images,
  active: dto.active,
  moderation: toModeration(dto.moderation),
})

const PAGE = 100

/** Every page of a paginated list (the API gives at most 100 a page). */
async function allPages<T>(path: string, query: Record<string, string | number> = {}) {
  const items: T[] = []
  for (let page = 1; page <= 20; page++) {
    const data = await api<{ items: T[]; total: number }>(path, {
      query: { ...query, page, limit: PAGE },
    })
    items.push(...data.items)
    if (items.length >= data.total || data.items.length === 0) break
  }
  return items
}

const stockOfProducts = (rows: StockDto[]) => {
  const stock: Record<string, Product['stock']> = {}
  for (const row of rows) {
    const byLocation = (stock[row.product_id] ??= {})
    ;(byLocation[row.location_id] ??= {})[row.variant_key] = row.count
  }
  return stock
}

/** The shop's products with their stock; the sample products of the other shops stay as they are. */
export async function loadProducts() {
  const [items, stock] = await Promise.all([
    allPages<ProductDto>('/merchant/products'),
    api<{ items: StockDto[] }>('/merchant/inventory'),
  ])
  const byProduct = stockOfProducts(stock.items)
  const own = items.map((dto) => toProduct(dto, byProduct[dto.id]))
  productsStore.replace([
    ...own,
    ...productsStore.getAll().filter((product) => product.storeId !== OWN_STORE_ID),
  ])
}

export type ProductInput = Pick<
  Product,
  | 'name'
  | 'description'
  | 'category'
  | 'subcategory'
  | 'brand'
  | 'price'
  | 'variations'
  | 'variants'
  | 'specs'
  | 'images'
  | 'valueImages'
  | 'active'
>

function productBody(input: ProductInput) {
  return {
    name: input.name,
    category: input.category,
    subcategory: input.subcategory ?? '',
    brand: input.brand,
    price_tiyin: toTiyin(input.price),
    description: input.description,
    variations: input.variations.map((variation) => ({
      attribute_id: variation.attributeId,
      value_ids: variation.valueIds,
    })),
    variants: Object.fromEntries(
      Object.entries(input.variants).map(([key, variant]) => [
        key,
        { price_tiyin: toTiyin(variant.price) },
      ]),
    ),
    specs: input.specs,
    images: input.images,
    value_images: input.valueImages,
    active: input.active,
  }
}

/** Every save goes to the admin for moderation again; the answer carries the new state. */
export async function saveProduct(existing: Product | undefined, input: ProductInput) {
  const body = productBody(input)
  const dto = existing
    ? await api<ProductDto>(`/merchant/products/${existing.id}`, { method: 'PUT', body })
    : await api<ProductDto>('/merchant/products', { method: 'POST', body })
  // The server drops the stock of variants that are no longer sold
  const sold = new Set(Object.keys(dto.variants))
  const stock = Object.fromEntries(
    Object.entries(existing?.stock ?? {}).map(([locationId, byVariant]) => [
      locationId,
      Object.fromEntries(
        Object.entries(byVariant).filter(([key]) => sold.size === 0 || sold.has(key)),
      ),
    ]),
  )
  productsStore.save(toProduct(dto, stock))
}

export async function removeProduct(id: string) {
  await api(`/merchant/products/${id}`, { method: 'DELETE' })
  productsStore.remove(id)
}

/** Sets the count of one variant at one shop. Refused with 409 until the product is approved. */
export async function saveStock(
  product: Product,
  locationId: string,
  valueIds: string[],
  count: number,
) {
  const key = variantKey(valueIds)
  await api('/merchant/inventory', {
    method: 'PUT',
    body: { product_id: product.id, location_id: locationId, variant_key: key, count },
  })
  const current = productsStore.get(product.id) ?? product
  productsStore.update(product.id, {
    stock: { ...current.stock, [locationId]: { ...current.stock[locationId], [key]: count } },
  })
}

// ----- Reviews (§1.6) ---------------------------------------------------------------------------

type ReviewDto = {
  id: string
  author: string
  rating: number
  text: string
  product_name: string
  created_at: string
}

export async function loadReviews(page: number) {
  const data = await api<{
    items: ReviewDto[]
    total: number
    page: number
    limit: number
    average_rating: number
  }>('/merchant/reviews', { query: { page, limit: 20 } })
  const items: Review[] = data.items.map((dto) => ({
    id: dto.id,
    storeId: OWN_STORE_ID,
    author: dto.author,
    rating: dto.rating,
    text: dto.text,
    date: new Date(dto.created_at),
    productName: dto.product_name,
  }))
  return { items, total: data.total, average: data.average_rating }
}

// ----- Staff (§1.7) ----------------------------------------------------------------------------------

export async function loadStaff() {
  await ensureMe()
  const { items } = await api<{ items: StaffDto[] }>('/merchant/staff')
  staffStore.replace(items.map(toStaff))
}

export type StaffInput = {
  login: string
  firstName: string
  lastName: string
  email: string
  phone: string
  /** Empty keeps the stored one when editing. */
  pinfl: string
  /** Empty keeps the old password when editing. */
  password: string
  roleId: RoleId
  locationIds: string[]
  active: boolean
  temporaryPassword: boolean
}

export async function saveStaff(id: string | undefined, input: StaffInput) {
  const body = {
    login: input.login,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    pinfl: input.pinfl,
    password: input.password,
    role: input.roleId,
    location_ids: input.locationIds,
    active: input.active,
    must_change_password: input.temporaryPassword,
  }
  const dto = id
    ? await api<StaffDto>(`/merchant/staff/${id}`, { method: 'PUT', body })
    : await api<StaffDto>('/merchant/staff', { method: 'POST', body })
  staffStore.save(toStaff(dto))
}

export async function removeStaff(id: string) {
  await api(`/merchant/staff/${id}`, { method: 'DELETE' })
  staffStore.remove(id)
}

// ----- Map keys (§1.8) -----------------------------------------------------------------------------------

export type MapKey = { id: string; kind: 'mapkit' | 'maps'; key: string }

/** `GET /merchant/geo/keys`: the Yandex keys for the map, one per kind. */
export async function loadMapKeys() {
  const { items } = await api<{ items: MapKey[] }>('/merchant/geo/keys')
  return items
}

/**
 * The map rejected `expiredId`: ask for another key of the same kind. Do this once; if the
 * new key fails too, switch the map off. An empty `expiredId` (the fallback key has no id)
 * must not be sent.
 */
export async function rotateMapKey(kind: MapKey['kind'], expiredId: string) {
  return api<MapKey>(`/merchant/geo/keys/${kind}`, {
    query: { expired_id: expiredId || undefined },
  })
}
