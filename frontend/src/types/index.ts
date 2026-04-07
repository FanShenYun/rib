export type Zone = 'left' | 'right'
export type Urgency = 'normal' | 'urgent'

export interface Card {
  id: string
  raw_text: string
  time_field: string | null
  location: string | null
  summary: string | null
  zone: Zone
  sort_order: number
  collaboration_status: string | null
  urgency: Urgency
  created_by: string
  created_at: string
  updated_at: string
}

export interface ParseResult {
  time_field: string
  location: string
  summary: string
}

export type WsMessage =
  | { type: 'card_created'; data: Card }
  | { type: 'card_updated'; data: Card }
  | { type: 'card_deleted'; data: { id: string } }
  | { type: 'cards_reordered'; data: Card[] }
  | { type: 'ping' }
