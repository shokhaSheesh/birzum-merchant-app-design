import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ApplicationDetailPage } from '@/features/applications/pages/ApplicationDetailPage'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ConfirmLoginPage } from '@/features/auth/pages/ConfirmLoginPage'
import { CalculatorPage } from '@/features/calculator/pages/CalculatorPage'
import { AddCardPage } from '@/features/clients/pages/AddCardPage'
import { ClientDetailPage } from '@/features/clients/pages/ClientDetailPage'
import { ClientsPage } from '@/features/clients/pages/ClientsPage'
import { NewClientPage } from '@/features/clients/pages/NewClientPage'
import { NewContractPage } from '@/features/clients/pages/NewContractPage'
import { CustomerProfilePage } from '@/features/customer-app/pages/CustomerProfilePage'
import { FavoritesPage } from '@/features/customer-app/pages/FavoritesPage'
import { CartPage } from '@/features/customer-app/pages/CartPage'
import { CategoriesPage } from '@/features/customer-app/pages/CategoriesPage'
import { CustomerNotificationsPage } from '@/features/customer-app/pages/CustomerNotificationsPage'
import { CustomerHomePage } from '@/features/customer-app/pages/CustomerHomePage'
import { ProductPage } from '@/features/customer-app/pages/ProductPage'
import { ProductsPage } from '@/features/customer-app/pages/ProductsPage'
import { PurchasesPage } from '@/features/customer-app/pages/PurchasesPage'
import { SearchPage } from '@/features/customer-app/pages/SearchPage'
import { StorePage } from '@/features/customer-app/pages/StorePage'
import { StoresPage } from '@/features/customer-app/pages/StoresPage'
import { CustomerAuthPage } from '@/features/customer-auth/pages/CustomerAuthPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { KitPage } from '@/features/kit/pages/KitPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { ROUTES } from '@/shared/config/routes'
import { DeviceLayout } from './layouts/DeviceLayout'
import { TabLayout } from './layouts/TabLayout'
import { CustomerTabLayout } from './layouts/CustomerTabLayout'
import { merchantTabs } from './tabs'

export const router = createBrowserRouter([
  {
    element: <DeviceLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.changePassword, element: <ChangePasswordPage /> },
      { path: ROUTES.confirmLogin, element: <ConfirmLoginPage /> },
      { path: ROUTES.kit, element: <KitPage /> },
      { path: ROUTES.newClient, element: <NewClientPage /> },
      { path: ROUTES.clientDetail, element: <ClientDetailPage /> },
      { path: ROUTES.clientAddCard, element: <AddCardPage /> },
      { path: ROUTES.clientContract, element: <NewContractPage /> },
      { path: ROUTES.applicationDetail, element: <ApplicationDetailPage /> },
      { path: ROUTES.notifications, element: <NotificationsPage /> },
      { path: ROUTES.customerApp, element: <CustomerAuthPage /> },
      {
        element: <CustomerTabLayout />,
        children: [
          { path: ROUTES.customerHome, element: <CustomerHomePage /> },
          { path: ROUTES.customerStores, element: <StoresPage /> },
          { path: ROUTES.customerCart, element: <CartPage /> },
          { path: ROUTES.customerPurchases, element: <PurchasesPage /> },
          { path: ROUTES.customerProfile, element: <CustomerProfilePage /> },
        ],
      },
      { path: ROUTES.customerProduct, element: <ProductPage /> },
      { path: ROUTES.customerStore, element: <StorePage /> },
      { path: ROUTES.customerSearch, element: <SearchPage /> },
      { path: ROUTES.customerCategories, element: <CategoriesPage /> },
      { path: ROUTES.customerProducts, element: <ProductsPage /> },
      { path: ROUTES.customerNotifications, element: <CustomerNotificationsPage /> },
      { path: ROUTES.customerFavorites, element: <FavoritesPage /> },
      {
        element: <TabLayout tabs={merchantTabs} />,
        children: [
          { path: ROUTES.home, element: <HomePage /> },
          { path: ROUTES.clients, element: <ClientsPage /> },
          { path: ROUTES.applications, element: <ApplicationsPage /> },
          { path: ROUTES.calculator, element: <CalculatorPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
        ],
      },
      { path: '*', element: <Navigate to={ROUTES.home} replace /> },
    ],
  },
])
