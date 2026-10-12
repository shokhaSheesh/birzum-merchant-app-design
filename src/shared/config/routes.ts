export const ROUTES = {
  login: '/login',
  changePassword: '/change-password',
  confirmLogin: '/confirm-login',
  home: '/',
  clients: '/clients',
  newClient: '/clients/new',
  clientDetail: '/clients/:id',
  clientAddCard: '/clients/:id/cards/new',
  clientContract: '/clients/:id/contract/new',
  applications: '/applications',
  applicationDetail: '/applications/:number',
  calculator: '/calculator',
  profile: '/profile',
  notifications: '/notifications',
  /** The separate app for shoppers. Its screens will live under this path. */
  customerApp: '/customer',
  customerHome: '/customer/home',
  customerStores: '/customer/stores',
  customerStore: '/customer/stores/:id',
  customerSearch: '/customer/search',
  customerCategories: '/customer/categories',
  customerProducts: '/customer/products',
  customerNotifications: '/customer/notifications',
  customerFavorites: '/customer/favorites',
  customerCart: '/customer/cart',
  customerProduct: '/customer/product/:id',
  customerPurchases: '/customer/purchases',
  customerProfile: '/customer/profile',
  kit: '/kit',
} as const

export const clientPath = (id: string) => `/clients/${id}`
export const clientAddCardPath = (id: string) => `/clients/${id}/cards/new`
export const clientContractPath = (id: string, term: number) =>
  `/clients/${id}/contract/new?term=${term}`
export const applicationPath = (number: number) => `/applications/${number}`
export const customerProductPath = (id: string) => `/customer/product/${id}`
export const customerStorePath = (id: string) => `/customer/stores/${id}`
/** The product listing, optionally narrowed by a search text, category or brand. */
export function customerProductsPath(
  filter: { q?: string; category?: string; brand?: string } = {},
) {
  const query = new URLSearchParams(
    Object.entries(filter).filter((entry): entry is [string, string] => !!entry[1]),
  ).toString()
  return query ? `/customer/products?${query}` : '/customer/products'
}
