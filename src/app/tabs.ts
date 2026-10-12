import {
  Calculator,
  FileText,
  House,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserRound,
  Users,
} from 'lucide-react'
import { ROUTES } from '@/shared/config/routes'
import type { Tab } from '@/shared/ui/TabBar'

export const merchantTabs: Tab[] = [
  { to: ROUTES.home, label: 'nav.home', icon: House },
  { to: ROUTES.clients, label: 'nav.clients', icon: Users },
  { to: ROUTES.calculator, label: 'nav.calculator', icon: Calculator, center: true },
  { to: ROUTES.applications, label: 'nav.applications', icon: FileText },
  { to: ROUTES.profile, label: 'nav.profile', icon: UserRound },
]

export const customerTabs: Tab[] = [
  { to: ROUTES.customerHome, label: 'nav.home', icon: House },
  { to: ROUTES.customerStores, label: 'customer.nav.stores', icon: Store },
  { to: ROUTES.customerCart, label: 'customer.nav.cart', icon: ShoppingCart, center: true },
  { to: ROUTES.customerPurchases, label: 'customer.nav.purchases', icon: ShoppingBag },
  { to: ROUTES.customerProfile, label: 'nav.profile', icon: UserRound },
]
