import type { StatusTone } from '@/shared/ui/StatusBadge'
import type { OrderStatus } from './orders'

export const orderStatusTone: Record<OrderStatus, StatusTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}
