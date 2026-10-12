import { Check, Circle, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { PasswordField } from '@/shared/ui/PasswordField'
import { changePassword } from '../api/mockAuth'
import { AuthLayout } from '../components/AuthLayout'

const rules: { label: TranslationKey; test: (password: string) => boolean }[] = [
  { label: 'auth.rule.length', test: (p) => p.length >= 8 },
  { label: 'auth.rule.letter', test: (p) => /\p{L}/u.test(p) },
  { label: 'auth.rule.digit', test: (p) => /\d/.test(p) },
]

export function ChangePasswordPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const strong = rules.every((rule) => rule.test(password))
  const matches = password === confirm

  const submit = async () => {
    setSubmitted(true)
    if (!strong || !matches) return

    setLoading(true)
    await changePassword(password)
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <AuthLayout
      onSubmit={submit}
      footer={
        <Button type="submit" block loading={loading}>
          {t('auth.change.submit')}
        </Button>
      }
    >
      <span className="grid size-14 place-items-center rounded-full bg-green-200 text-navy-900">
        <KeyRound size={26} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold">{t('auth.change.title')}</h1>
        <p className="text-ink-muted">{t('auth.change.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4">
        <PasswordField
          label={t('field.newPassword')}
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={submitted && !strong ? t('auth.error.weak') : undefined}
        />
        <ul className="flex flex-col gap-1.5">
          {rules.map((rule) => {
            const passed = rule.test(password)
            const Icon = passed ? Check : Circle
            return (
              <li
                key={rule.label}
                className={cn(
                  'flex items-center gap-2 text-sm',
                  passed ? 'font-medium text-success' : 'text-ink-muted',
                )}
              >
                <Icon size={16} strokeWidth={passed ? 3 : 2} />
                {t(rule.label)}
              </li>
            )
          })}
        </ul>
        <PasswordField
          label={t('field.confirmPassword')}
          name="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={submitted && strong && !matches ? t('auth.error.mismatch') : undefined}
        />
      </div>
    </AuthLayout>
  )
}
