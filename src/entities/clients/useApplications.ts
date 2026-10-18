import { useMemo } from 'react'
import { OWN_STORE_ID } from '@/entities/catalog/products'
import type { Application, Client } from './clients'
import { useClients } from './useClients'

export type ApplicationWithClient = { application: Application; client: Client }

/** Whether an application was filed with the signed-in merchant's shop. */
export const isOwn = (application: Application) =>
  (application.storeId ?? OWN_STORE_ID) === OWN_STORE_ID

/**
 * Every client's applications with the merchant's shop in one list, newest first. Orders still
 * in Birzum's check are left out: the merchant only sees what Birzum approved.
 */
export function useApplications() {
  const clients = useClients()

  return useMemo<ApplicationWithClient[]>(
    () =>
      clients
        .flatMap((client) =>
          client.applications
            .filter((application) => isOwn(application) && application.status !== 'checking')
            .map((application) => ({ application, client })),
        )
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
