import type { StatusTone } from '@/shared/ui/StatusBadge'
import type { ApplicationStatus } from './clients'

export const applicationStatusTone: Record<ApplicationStatus, StatusTone> = {
  pending: 'warning',
  creating: 'info',
  processing: 'info',
  received: 'info',
  handed: 'success',
  rejected: 'danger',
  closed: 'neutral',
  cancelled: 'neutral',
}
