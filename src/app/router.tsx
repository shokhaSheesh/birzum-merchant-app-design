import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ConfirmLoginPage } from '@/features/auth/pages/ConfirmLoginPage'
import { CalculatorPage } from '@/features/calculator/pages/CalculatorPage'
import { ClientsPage } from '@/features/clients/pages/ClientsPage'
import { NewClientPage } from '@/features/clients/pages/NewClientPage'
import { KitPage } from '@/features/kit/pages/KitPage'
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
      {
        element: <TabLayout />,
        children: [
          { path: ROUTES.clients, element: <ClientsPage /> },
          { path: ROUTES.applications, element: <ApplicationsPage /> },
          { path: ROUTES.calculator, element: <CalculatorPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
        ],
      },
      { path: '*', element: <Navigate to={ROUTES.clients} replace /> },
    ],
  },
])
