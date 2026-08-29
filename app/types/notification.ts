export type NotificationType =
  | 'application_submitted'
  | 'application_status_updated'
  | 'new_application_received'
  | 'interview_scheduled'

export interface AppNotification {
  id: number
  user_id: number
  type: NotificationType
  title: string
  message: string
  read_at: string | null
  created_at: string
}
