import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '../types'
import { DeleteConfirm } from './DeleteConfirm'
import { EditModal } from './EditModal'
import { updateCard, deleteCard } from '../api/client'

interface Props {
  card: Card
  onUpdated: (card: Card) => void
  onDeleted: (id: string) => void
}

export function LargeCard({ card, onUpdated, onDeleted }: Props) {
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const isUrgent = card.urgency === 'urgent'

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { zone: card.zone, card } })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const handleDelete = async () => {
    await deleteCard(card.id)
    onDeleted(card.id)
    setShowDelete(false)
  }

  const handleSave = async (updates: Partial<Card>) => {
    const updated = await updateCard(card.id, updates)
    onUpdated(updated)
    setShowEdit(false)
  }

  const toggleUrgency = async () => {
    const updated = await updateCard(card.id, {
      urgency: isUrgent ? 'normal' : 'urgent',
    })
    onUpdated(updated)
  }

  const bg = isUrgent ? '#c0392b' : '#1a5276'
  const textColor = '#fff'

  return (
    <>
      <div ref={setNodeRef} style={{ ...styles.card, background: bg, color: textColor, ...style }} {...attributes}>
        <div style={styles.dragHandle} {...listeners} title="拖拉排序">⠿</div>
        <div style={styles.content}>
          <div style={styles.topRow}>
            <div style={styles.fields}>
              <span style={styles.fieldItem}>⏱ {card.time_field || '—'}</span>
              <span style={styles.fieldItem}>📍 {card.location || '—'}</span>
            </div>
            <span style={{ ...styles.urgencyBadge, background: isUrgent ? '#e74c3c' : '#2471a3' }}>
              {isUrgent ? '⚠ 緊急' : '◎ 非緊急'}
            </span>
          </div>
          <div style={styles.summary}>{card.summary || '（無概述）'}</div>
          {card.collaboration_status && (
            <div style={styles.collab}>
              <span style={styles.collabLabel}>協作狀態：</span>
              {card.collaboration_status}
            </div>
          )}
          <div style={styles.meta}>建立者：{card.created_by}</div>
          <div style={styles.actions}>
            <button onClick={toggleUrgency} style={{ ...styles.btn, borderColor: isUrgent ? '#f1948a' : '#7fb3d3' }}>
              {isUrgent ? '切換非緊急' : '切換緊急'}
            </button>
            <button onClick={() => setShowEdit(true)} style={styles.btn}>編輯</button>
            <button onClick={() => setShowDelete(true)} style={{ ...styles.btn, borderColor: '#f1948a' }}>刪除</button>
          </div>
        </div>
      </div>

      {showDelete && (
        <DeleteConfirm onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
      )}
      {showEdit && (
        <EditModal card={card} onSave={handleSave} onCancel={() => setShowEdit(false)} />
      )}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 8,
    padding: '12px 14px',
    marginBottom: 10,
    boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
    display: 'flex',
    gap: 8,
  },
  dragHandle: {
    fontSize: 18,
    cursor: 'grab',
    userSelect: 'none',
    flexShrink: 0,
    paddingTop: 2,
    opacity: 0.6,
  },
  content: { flex: 1, minWidth: 0 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  fields: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  fieldItem: { fontSize: 13, fontWeight: 600 },
  urgencyBadge: {
    fontSize: 11, padding: '2px 8px',
    borderRadius: 12, fontWeight: 700, flexShrink: 0,
    color: '#fff',
  },
  summary: { fontSize: 13, lineHeight: 1.5, marginBottom: 6 },
  collab: { fontSize: 12, opacity: 0.85, marginBottom: 4 },
  collabLabel: { fontWeight: 600 },
  meta: { fontSize: 11, opacity: 0.7, marginBottom: 8 },
  actions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  btn: {
    padding: '3px 10px', fontSize: 11,
    background: 'transparent', border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: 4, cursor: 'pointer', color: '#fff',
  },
}
