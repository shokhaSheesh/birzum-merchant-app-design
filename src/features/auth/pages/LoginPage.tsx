import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '@/shared/assets/logo-stacked.png'
import { ROUTES } from '@/shared/config/routes'
import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { PasswordField } from '@/shared/ui/PasswordField'
import { TextField } from '@/shared/ui/TextField'
import { login as requestLogin } from '../api/mockAuth'
import { AuthLayout } from '../components/AuthLayout'
import { FormAlert } from '../components/FormAlert'

export function LoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  const required = (value: string) =>
    submitted && value.trim() === '' ? t('auth.error.required') : undefined

  const submit = async () => {
    setSubmitted(true)
    setFailed(false)
    if (login.trim() === '' || password === '') return

    setLoading(true)
    try {
      const { mustChangePassword } = await requestLogin(login.trim(), password)
      navigate(mustChangePassword ? ROUTES.changePassword : ROUTES.home, { replace: true })
    } catch {
      setFailed(true)
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      onSubmit={submit}
      footer={
        <Button type="submit" block loading={loading}>
          {t('auth.login.submit')}
        </Button>
      }
    >
      <img src={logo} alt="Birzum nasiya" className="w-28" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
        <p className="text-ink-muted">{t('auth.login.subtitle')}</p>
      </div>

      {failed && <FormAlert message={t('auth.error.invalid')} />}

      <div className="flex flex-col gap-4">
        <TextField
          label={t('field.login')}
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          error={required(login)}
        />
        <PasswordField
          label={t('field.password')}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={required(password)}
        />
      </div>
    </AuthLayout>
  )
}
