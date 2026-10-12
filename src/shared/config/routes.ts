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
  customerCatalog: '/customer/catalog',
  customerPayments: '/customer/payments',
  customerPurchases: '/customer/purchases',
  customerProfile: '/customer/profile',
  kit: '/kit',
} as const

export const clientPath = (id: string) => `/clients/${id}`
export const clientAddCardPath = (id: string) => `/clients/${id}/cards/new`
export const clientContractPath = (id: string, term: number) =>
  `/clients/${id}/contract/new?term=${term}`
export const applicationPath = (number: number) => `/applications/${number}`
