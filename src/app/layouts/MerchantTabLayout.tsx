import { useEffect } from 'react'
import { loadMe } from '@/entities/merchant/merchantApi'
import { toastError } from '@/shared/api/client'
import { TabLayout } from './TabLayout'
import { merchantTabs } from '../tabs'

/**
 * The merchant app's tabs. When they open, `GET /merchant/me` tells who is signed in, what
 * their role allows and which shops they work in; until it answers the screens show sample data.
 */
export function MerchantTabLayout() {
  useEffect(() => {
    loadMe().catch(toastError)
  }, [])
  return <TabLayout tabs={merchantTabs} />
}
