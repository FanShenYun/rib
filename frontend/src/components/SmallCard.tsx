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

export function SmallCard({ card, onUpdated, onDeleted }: Props) {
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

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

  return (
    <>
      <div ref={setNodeRef} style={{ ...styles.card, ...style }} {...attributes}>
        <div style={styles.dragHandle} {...listeners} title="拖拉排序">⠿</div>
        <div style={styles.content}>
          <div style={styles.row}>
            <span style={styles.badge}>⏱</span>
            <span style={styles.field}>{card.time_field || '—'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.badge}>📍</span>
            <span style={styles.field}>{card.location || '—'}</span>
          </div>
          <div style={styles.summary}>{card.summary || '（無概述）'}</div>
          <div style={styles.meta}>建立者：{card.created_by}</div>
          <div style={styles.actions}>
            <button onClick={() => setShowEdit(true)} style={styles.editBtn}>編輯</button>
            <button onClick={() => setShowDelete(true)} style={styles.deleteBtn}>刪除</button>
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
    background: '#fff',
    color: '#222',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    display: 'flex',
    gap: 8,
    cursor: 'default',
  },
  dragHandle: {
    color: '#999',
    fontSize: 18,
    cursor: 'grab',
    userSelect: 'none',
    flexShrink: 0,
    paddingTop: 2,
  },
  content: { flex: 1, minWidth: 0 },
  row: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 },
  badge: { fontSize: 11 },
  field: { fontSize: 12, fontWeight: 600, color: '#333' },
  summary: { fontSize: 12, color: '#555', margin: '4px 0', lineHeight: 1.4 },
  meta: { fontSize: 11, color: '#999', marginBottom: 6 },
  actions: { display: 'flex', gap: 6 },
  editBtn: {
    padding: '3px 10px', fontSize: 11,
    background: '#eef', border: '1px solid #99c',
    borderRadius: 4, cursor: 'pointer', color: '#335',
  },
  deleteBtn: {
    padding: '3px 10px', fontSize: 11,
    background: '#fee', border: '1px solid #c99',
    borderRadius: 4, cursor: 'pointer', color: '#533',
  },
}
