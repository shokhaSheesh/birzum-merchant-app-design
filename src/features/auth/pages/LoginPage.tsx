import { useNavigate } from 'react-router-dom'
import logo from '@/shared/assets/logo-stacked.png'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col justify-between bg-canvas px-5 pt-20 pb-8">
      <div className="flex flex-col gap-3">
        <img src={logo} alt="Birzum nasiya" className="w-32" />
        <h1 className="text-2xl font-bold">Kirish</h1>
        <p className="text-ink-muted">Dizayn tasdiqlangach shu yerda yigʻiladi.</p>
      </div>
      <Button block onClick={() => navigate(ROUTES.home)}>
        Kirish
      </Button>
    </div>
  )
}
