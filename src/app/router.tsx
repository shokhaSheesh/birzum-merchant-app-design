import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { ROUTES } from '@/shared/config/routes'
import { DeviceLayout } from './layouts/DeviceLayout'
import { TabLayout } from './layouts/TabLayout'

export const router = createBrowserRouter([
  {
    element: <DeviceLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      {
        element: <TabLayout />,
        children: [
          { path: ROUTES.home, element: <HomePage /> },
          { path: ROUTES.applications, element: <ApplicationsPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
        ],
      },
      { path: '*', element: <Navigate to={ROUTES.home} replace /> },
    ],
  },
])
