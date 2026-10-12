import { shortName } from '@/entities/clients/clientName'
import type { ApplicationWithClient } from '@/entities/clients/useApplications'

/** Matches on application number, client name, JSHSHIR or passport. Spaces and case are ignored. */
export function searchApplications(items: ApplicationWithClient[], query: string) {
  const normalized = query.replace(/\s/g, '').toLowerCase()
  if (normalized === '') return items

  return items.filter(({ application, client }) =>
    [String(application.id), shortName(client), client.pinfl, client.passport].some((field) =>
      field.replace(/\s/g, '').toLowerCase().includes(normalized),
    ),
  )
}
