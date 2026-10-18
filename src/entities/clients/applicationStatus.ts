import type { StatusTone } from '@/shared/ui/StatusBadge'
import type { ApplicationStatus } from './clients'

export const applicationStatusTone: Record<ApplicationStatus, StatusTone> = {
  checking: 'info',
  pending: 'warning',
  processing: 'info',
  handed: 'success',
  rejected: 'danger',
  closed: 'neutral',
  cancelled: 'neutral',
}
