import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Card } from '../types'
import { SmallCard } from './SmallCard'

interface Props {
  cards: Card[]
  onUpdated: (card: Card) => void
  onDeleted: (id: string) => void
}

export function BoardLeft({ cards, onUpdated, onDeleted }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'left' })

  return (
    <div style={{ ...styles.panel, background: isOver ? '#1e2d4a' : '#16213e' }}>
      <div style={styles.header}>
        小白板條區
        <span style={styles.count}>{cards.length}</span>
      </div>
      <div ref={setNodeRef} style={styles.list}>
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <SmallCard key={card.id} card={card} onUpdated={onUpdated} onDeleted={onDeleted} />
          ))}
        </SortableContext>
        {cards.length === 0 && (
          <div style={styles.empty}>尚無白板條<br />輸入無線電內容後將出現於此</div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    flex: '0 0 300px',
    borderRight: '1px solid #0f3460',
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
    padding: '10px 12px',
    minHeight: 80,
  },
  empty: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 1.8,
  },
}
