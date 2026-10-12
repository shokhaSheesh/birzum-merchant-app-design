import type { StatusTone } from '@/shared/ui/StatusBadge'
import type { ApplicationStatus } from './clients'

export const applicationStatusTone: Record<ApplicationStatus, StatusTone> = {
  processing: 'warning',
  rejected: 'danger',
  closed: 'neutral',
  cancelled: 'neutral',
}
