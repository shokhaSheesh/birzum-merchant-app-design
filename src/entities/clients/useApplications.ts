import { useMemo } from 'react'
import type { Application, Client } from './clients'
import { useClients } from './useClients'

export type ApplicationWithClient = { application: Application; client: Client }

/** Every client's applications in one list, newest first. */
export function useApplications() {
  const clients = useClients()

  return useMemo<ApplicationWithClient[]>(
    () =>
      clients
        .flatMap((client) => client.applications.map((application) => ({ application, client })))
        .sort(
          (a, b) =>
            b.application.date.getTime() - a.application.date.getTime() ||
            b.application.id - a.application.id,
        ),
    [clients],
  )
}

export const useApplication = (number: number) =>
  useApplications().find(({ application }) => application.id === number)
