import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Card } from '../types'
import { LargeCard } from './LargeCard'

interface Props {
  cards: Card[]
  onUpdated: (card: Card) => void
  onDeleted: (id: string) => void
}

export function BoardRight({ cards, onUpdated, onDeleted }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'right' })

  return (
    <div style={{ ...styles.panel, background: isOver ? '#1e2d4a' : '#12192b' }}>
      <div style={styles.header}>
        大白板條區
        <span style={styles.count}>{cards.length}</span>
      </div>
      <div ref={setNodeRef} style={styles.list}>
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <LargeCard key={card.id} card={card} onUpdated={onUpdated} onDeleted={onDeleted} />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <div style={styles.empty}>將左側白板條拖入此區<br />可升級為大白板條</div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'background 0.2s',
  },
  header: {
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 700,
    color: '#aaa',
    borderBottom: '1px solid #0f3460',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  count: {
    background: '#0f3460',
    color: '#7fb3d3',
    borderRadius: 10,
    padding: '1px 7px',
    fontSize: 11,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    minHeight: 80,
  },
  empty: {
    color: '#444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 1.8,
  },
}
