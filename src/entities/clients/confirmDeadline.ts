import type { Application } from './clients'

/** How long the shop has to confirm a shopper's order before it is rejected by itself. */
export const CONFIRM_HOURS = 24
const HOUR = 60 * 60 * 1000

/** When the shop must have answered a `pending` order: 24 hours after the shopper sent it. */
export function confirmDeadline(application: Application) {
  const sent = application.history?.find((entry) => entry.status === 'pending')?.at
  return new Date((sent ?? application.date).getTime() + CONFIRM_HOURS * HOUR)
}

/** Hours and minutes until the deadline, never below zero. */
export function timeLeft(deadline: Date, now: Date) {
  const minutes = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 60_000))
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 }
}
