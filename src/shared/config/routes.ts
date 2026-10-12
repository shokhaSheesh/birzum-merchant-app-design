export const ROUTES = {
  login: '/login',
  changePassword: '/change-password',
  confirmLogin: '/confirm-login',
  clients: '/',
  newClient: '/clients/new',
  clientDetail: '/clients/:id',
  clientAddCard: '/clients/:id/cards/new',
  applications: '/applications',
  calculator: '/calculator',
  profile: '/profile',
  kit: '/kit',
} as const

export const clientPath = (id: string) => `/clients/${id}`
export const clientAddCardPath = (id: string) => `/clients/${id}/cards/new`
