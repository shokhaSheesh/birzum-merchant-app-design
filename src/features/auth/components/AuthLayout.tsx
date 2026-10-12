import type { ReactNode } from 'react'
import { FormScreen } from '@/shared/ui/FormScreen'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'

type Props = {
  onSubmit: () => void
  onBack?: () => void
  footer: ReactNode
  children: ReactNode
}

/** Auth screens are form screens with the language switcher at the top right. */
export function AuthLayout(props: Props) {
  return <FormScreen {...props} headerEnd={<LanguageSwitcher />} />
}
