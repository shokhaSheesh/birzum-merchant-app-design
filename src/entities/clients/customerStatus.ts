import type { StatusTone } from '@/shared/ui/StatusBadge'
import type { Application, ApplicationStatus } from './clients'
import { paymentSchedule } from './payments'

/**
 * Where an application stands, in the shopper's words. The stages underneath are the
 * merchant's; "overdue" is a running nasiya with a late payment, picked out so it is noticed.
 */
export const CUSTOMER_STATUSES = [
  'review',
  'creating',
  'approved',
  'active',
  'overdue',
  'closed',
  'rejected',
  'cancelled',
] as const
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number]

const fromStage: Record<ApplicationStatus, CustomerStatus> = {
  pending: 'review',
  creating: 'creating',
  processing: 'approved',
  handed: 'active',
  closed: 'closed',
  rejected: 'rejected',
  cancelled: 'cancelled',
}

export function customerStatus(application: Application): CustomerStatus {
  if (
    application.status === 'handed' &&
    paymentSchedule(application).some((payment) => payment.state === 'overdue')
  ) {
    return 'overdue'
  }
  return fromStage[application.status]
}

export const customerStatusTone: Record<CustomerStatus, StatusTone> = {
  review: 'warning',
  creating: 'info',
  approved: 'info',
  active: 'success',
  overdue: 'danger',
  closed: 'neutral',
  rejected: 'danger',
  cancelled: 'neutral',
}
