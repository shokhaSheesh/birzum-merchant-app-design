import { Outlet } from 'react-router-dom'

/** Full-bleed on phones; a centered phone-width column on larger screens. */
export function DeviceLayout() {
  return (
    <div className="mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-canvas">
      <Outlet />
    </div>
  )
}
