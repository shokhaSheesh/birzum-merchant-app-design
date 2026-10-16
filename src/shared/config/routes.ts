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
  manageProducts: '/manage/products',
  manageProduct: '/manage/products/:id',
  manageInventory: '/manage/inventory',
  manageAttributes: '/manage/attributes',
  manageAttribute: '/manage/attributes/:id',
  manageLocations: '/manage/locations',
  manageLocation: '/manage/locations/:id',
  manageStaff: '/manage/staff',
  manageStaffMember: '/manage/staff/:id',
  manageReviews: '/manage/reviews',
  settlements: '/settlements',
  manageRoles: '/manage/roles',
  manageRole: '/manage/roles/:id',
  /** The separate app for shoppers. Its screens will live under this path. */
  customerApp: '/customer',
  customerHome: '/customer/home',
  customerPinSetup: '/customer/pin/new',
  customerSecurity: '/customer/security',
  customerPersonal: '/customer/me',
  customerWelcome: '/customer/welcome',
  customerStores: '/customer/stores',
  customerStore: '/customer/stores/:id',
  customerSearch: '/customer/search',
  customerCategories: '/customer/categories',
  customerCategory: '/customer/categories/:category',
  customerProducts: '/customer/products',
  customerNotifications: '/customer/notifications',
  customerFavorites: '/customer/favorites',
  customerCart: '/customer/cart',
  customerCheckout: '/customer/checkout',
  customerPayments: '/customer/payments',
  customerPaymentHistory: '/customer/payments/history',
  customerScoring: '/customer/limit',
  customerSupport: '/customer/support',
  customerChat: '/customer/support/chat',
  customerProduct: '/customer/product/:id',
  customerPurchases: '/customer/purchases',
  customerPurchase: '/customer/purchases/:number',
  customerCards: '/customer/cards',
  customerAddCard: '/customer/cards/new',
  customerProfile: '/customer/profile',
  kit: '/kit',
  theme: '/theme',
  language: '/language',
  customerLanguage: '/customer/language',
  customerTheme: '/customer/theme',
  /** Gallery of loading, error and empty states, for developers. */
  states: '/states',
  stateDemo: '/states/:kind',
} as const

export const stateDemoPath = (kind: string) => `/states/${kind}`
export const clientPath = (id: string) => `/clients/${id}`
export const clientAddCardPath = (id: string) => `/clients/${id}/cards/new`
export const clientContractPath = (id: string, term: number) =>
  `/clients/${id}/contract/new?term=${term}`
export const applicationPath = (number: number) => `/applications/${number}`
export const customerProductPath = (id: string) => `/customer/product/${id}`
export const customerPurchasePath = (number: number) => `/customer/purchases/${number}`
export const customerStorePath = (id: string) => `/customer/stores/${id}`
/** A category's subcategories, for a category that has any. */
export const customerCategoryPath = (category: string) => `/customer/categories/${category}`
/** Where tapping a category goes: its subcategories when it has any, else its products. */
export const customerCategoryTarget = (category: string, hasSubcategories: boolean) =>
  hasSubcategories ? customerCategoryPath(category) : customerProductsPath({ category })
/** The product listing, optionally narrowed by a search text, category, subcategory, brand or shop. */
export function customerProductsPath(
  filter: { q?: string; category?: string; sub?: string; brand?: string; store?: string } = {},
) {
  const query = new URLSearchParams(
    Object.entries(filter).filter((entry): entry is [string, string] => !!entry[1]),
  ).toString()
  return query ? `/customer/products?${query}` : '/customer/products'
}
/** A management record's form. Pass "new" as the id to create one. */
export const managePath = (
  section: 'products' | 'attributes' | 'locations' | 'staff' | 'roles',
  id: string,
) => `/manage/${section}/${id}`
