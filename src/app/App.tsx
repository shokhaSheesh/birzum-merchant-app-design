import { RouterProvider } from 'react-router-dom'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import { router } from './router'

export function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  )
}
