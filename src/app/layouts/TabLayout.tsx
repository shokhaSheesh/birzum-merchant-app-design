import { Outlet } from 'react-router-dom'
import { TabBar } from '@/shared/ui/TabBar'

export function TabLayout() {
  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <TabBar />
    </>
  )
}
