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
import { CustomerHomePage } from '@/features/customer-app/pages/CustomerHomePage'
import { HomePage } from '@/features/home/pages/HomePage'
import { KitPage } from '@/features/kit/pages/KitPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { ROUTES } from '@/shared/config/routes'
import { DeviceLayout } from './layouts/DeviceLayout'
import { TabLayout } from './layouts/TabLayout'

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
      { path: ROUTES.customerApp, element: <CustomerHomePage /> },
      {
        element: <TabLayout />,
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
