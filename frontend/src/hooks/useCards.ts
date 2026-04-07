import { useState, useCallback } from 'react'
import type { Card, WsMessage } from '../types'
import * as api from '../api/client'

export function useCards() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.fetchCards()
      setCards(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleWsMessage = useCallback((msg: WsMessage) => {
    switch (msg.type) {
      case 'card_created':
        setCards((prev) => [...prev, msg.data])
        break
      case 'card_updated':
        setCards((prev) => prev.map((c) => (c.id === msg.data.id ? msg.data : c)))
        break
      case 'card_deleted':
        setCards((prev) => prev.filter((c) => c.id !== msg.data.id))
        break
      case 'cards_reordered':
        setCards(msg.data)
        break
    }
  }, [])

  const leftCards = cards
    .filter((c) => c.zone === 'left')
    .sort((a, b) => a.sort_order - b.sort_order)

  const rightCards = cards
    .filter((c) => c.zone === 'right')
    .sort((a, b) => a.sort_order - b.sort_order)

  return { cards, leftCards, rightCards, loading, error, load, handleWsMessage, setCards }
}
