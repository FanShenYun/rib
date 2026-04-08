import { useEffect, useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import { LoginPage } from './components/LoginPage'
import { InputArea } from './components/InputArea'
import { BoardLeft } from './components/BoardLeft'
import { BoardRight } from './components/BoardRight'
import { CollabStatusModal } from './components/CollabStatusModal'
import { useCards } from './hooks/useCards'
import { useWebSocket } from './hooks/useWebSocket'
import { updateCard, reorderCards } from './api/client'
import type { Card } from './types'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('token'))
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('displayName') ?? '')

  // Pending drop: card being moved from left → right, awaiting collab status
  const [pendingDrop, setPendingDrop] = useState<{ card: Card } | null>(null)

  const { leftCards, rightCards, load, handleWsMessage, setCards } = useCards()

  useWebSocket(handleWsMessage)

  useEffect(() => {
    if (loggedIn) load()
  }, [loggedIn, load])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleCardUpdated = useCallback((updated: Card) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }, [setCards])

  const handleCardDeleted = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }, [setCards])

  const handleCardCreated = useCallback((card: Card) => {
    setCards((prev) => [...prev, card])
  }, [setCards])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const activeZone = (active.data.current as { zone: string })?.zone
    const activeCard = (active.data.current as { card: Card })?.card

    // Determine target zone
    let targetZone: string
    if (over.id === 'left' || over.id === 'right') {
      targetZone = over.id as string
    } else {
      // Dropped over another card
      targetZone = (over.data.current as { zone: string })?.zone ?? activeZone
    }

    // Disallow right → left
    if (activeZone === 'right' && targetZone === 'left') return

    // Left → right: trigger collab status modal
    if (activeZone === 'left' && targetZone === 'right') {
      setPendingDrop({ card: activeCard })
      return
    }

    // Same zone reorder
    if (activeZone === targetZone) {
      const zoneCards = targetZone === 'left' ? leftCards : rightCards
      const oldIndex = zoneCards.findIndex((c) => c.id === activeId)
      const overId = over.id as string
      const newIndex = zoneCards.findIndex((c) => c.id === overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const reordered = arrayMove(zoneCards, oldIndex, newIndex)
      const updates = reordered.map((c, i) => ({ id: c.id, sort_order: i, zone: targetZone }))

      setCards((prev) => {
        const other = prev.filter((c) => c.zone !== targetZone)
        const updated = reordered.map((c, i) => ({ ...c, sort_order: i }))
        return [...other, ...updated].sort((a, b) => a.sort_order - b.sort_order)
      })
      await reorderCards(updates)
    }
  }, [leftCards, rightCards, setCards])

  const handleCollabConfirm = useCallback(async (status: string) => {
    if (!pendingDrop) return
    const { card } = pendingDrop
    const updated = await updateCard(card.id, {
      zone: 'right',
      collaboration_status: status,
      sort_order: rightCards.length,
    })
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setPendingDrop(null)
  }, [pendingDrop, rightCards.length, setCards])

  const handleLogin = (name: string) => {
    setDisplayName(name)
    setLoggedIn(true)
  }

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div style={styles.root}>
      <div style={styles.topBar}>
        <span style={styles.logo}>無線電情報白板</span>
        <span style={styles.user}>👤 {displayName}</span>
      </div>

      <InputArea onCardCreated={handleCardCreated} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={styles.boards}>
          <BoardLeft
            cards={leftCards}
            onUpdated={handleCardUpdated}
            onDeleted={handleCardDeleted}
          />
          <BoardRight
            cards={rightCards}
            onUpdated={handleCardUpdated}
            onDeleted={handleCardDeleted}
          />
        </div>
      </DndContext>

      {pendingDrop && (
        <CollabStatusModal
          onConfirm={handleCollabConfirm}
          onCancel={() => setPendingDrop(null)}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1a2e',
    color: '#eee',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 20px',
    background: '#0d0d1f',
    borderBottom: '1px solid #0f3460',
    flexShrink: 0,
  },
  logo: { fontWeight: 700, fontSize: 16, color: '#e94560' },
  user: { fontSize: 13, color: '#aaa' },
  boards: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
}
