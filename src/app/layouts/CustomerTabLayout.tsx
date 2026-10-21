import { useCart } from '@/entities/cart/cartStore'
import { customerTabs } from '../tabs'
import { TabLayout } from './TabLayout'

/** The shopper's tabs in the green tone, with the number of items in the cart on the middle button. */
export function CustomerTabLayout() {
  const { count } = useCart()
  return (
    <TabLayout
      tone="green"
      tabs={customerTabs.map((tab) => (tab.center ? { ...tab, badge: count } : tab))}
    />
  )
}
