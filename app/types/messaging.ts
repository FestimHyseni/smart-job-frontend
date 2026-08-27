import type { User } from './user'

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  sender: User | null
  message: string
  read_at: string | null
  created_at: string
}

export interface Conversation {
  id: number
  participants: User[]
  messages: Message[]
  created_at: string
  updated_at: string
}
