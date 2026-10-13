import type { Application } from './clients'

export type PaymentState = 'paid' | 'due' | 'overdue'
export type Payment = { number: number; dueDate: Date; amount: number; state: PaymentState }

/**
 * The monthly payments of an application, one per month of its term, starting the month
 * after it was filed. Mock rule for what is paid: everything before today is paid, except
 * that an even-numbered running application has its latest one overdue, so that state can
 * be seen. The real schedule and payments come from the backend.
 */
export function paymentSchedule(application: Application, today = new Date()): Payment[] {
  const { details } = application
  if (!details) return []

  const payments = Array.from({ length: details.term }, (_, i) => {
    const dueDate = new Date(
      application.date.getFullYear(),
      application.date.getMonth() + 1 + i,
      details.paymentDay,
    )
    const settled = application.status === 'closed' || dueDate < today
    return {
      number: i + 1,
      dueDate,
      amount: details.monthlyPayment,
      state: settled ? 'paid' : 'due',
    }
  }) as Payment[]

  const latestPast = payments.filter((payment) => payment.dueDate < today).at(-1)
  if (latestPast && application.status === 'handed' && application.id % 2 === 0) {
    latestPast.state = 'overdue'
  }
  return payments
}

/** Applications in these statuses have goods with the client and payments running or finished. */
export const hasSchedule = (application: Application) =>
  !!application.details && (application.status === 'handed' || application.status === 'closed')
