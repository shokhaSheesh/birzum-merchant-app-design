export type NotificationType = 'new' | 'approved' | 'contract' | 'closed' | 'rejected' | 'cancelled'

export type AppNotification = {
  id: string
  type: NotificationType
  /** The application the notification is about. */
  applicationNumber: number
  date: Date
  read: boolean
}

// Invented sample notifications about the mock applications. Replace with the API.
export const applicationNotifications: AppNotification[] = [
  {
    id: '0',
    type: 'approved',
    applicationNumber: 252394,
    date: new Date(2026, 7, 6, 10, 40),
    read: true,
  },
  {
    id: '1',
    type: 'rejected',
    applicationNumber: 252416,
    date: new Date(2026, 7, 6, 16, 42),
    read: false,
  },
  {
    id: '2',
    type: 'contract',
    applicationNumber: 252401,
    date: new Date(2026, 7, 6, 14, 20),
    read: false,
  },
  {
    id: '3',
    type: 'rejected',
    applicationNumber: 252394,
    date: new Date(2026, 7, 6, 11, 5),
    read: true,
  },
  {
    id: '4',
    type: 'cancelled',
    applicationNumber: 251870,
    date: new Date(2026, 7, 3, 18, 31),
    read: true,
  },
  {
    id: '5',
    type: 'closed',
    applicationNumber: 240118,
    date: new Date(2026, 6, 30, 9, 15),
    read: true,
  },
]

export const unreadCount = applicationNotifications.filter((n) => !n.read).length
