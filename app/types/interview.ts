export type InterviewType = 'online' | 'physical' | 'phone'
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Interview {
  id: number
  application_id: number
  scheduled_at: string
  type: InterviewType
  location: string | null
  meeting_url: string | null
  notes: string | null
  status: InterviewStatus
}

export interface InterviewPayload {
  application_id: number
  scheduled_at: string
  type: InterviewType
  location?: string | null
  meeting_url?: string | null
  notes?: string | null
}
