import { useState } from 'react'
import type { Card } from '../types'

interface Props {
  card: Card
  onSave: (updates: Partial<Card>) => void
  onCancel: () => void
}

export function EditModal({ card, onSave, onCancel }: Props) {
  const [timeField, setTimeField] = useState(card.time_field ?? '')
  const [location, setLocation] = useState(card.location ?? '')
  const [summary, setSummary] = useState(card.summary ?? '')
  const [collabStatus, setCollabStatus] = useState(card.collaboration_status ?? '')

  const handleSave = () => {
    const updates: Partial<Card> = {
      time_field: timeField || null,
      location: location || null,
      summary: summary || null,
    }
    if (card.zone === 'right') {
      updates.collaboration_status = collabStatus || null
    }
    onSave(updates)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h3 style={styles.title}>編輯白板條</h3>
        <div style={styles.fields}>
          <label style={styles.label}>時間</label>
          <input style={styles.input} value={timeField} onChange={(e) => setTimeField(e.target.value)} placeholder="09:30" />

          <label style={styles.label}>位置</label>
          <input style={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="北側山坡" />

          <label style={styles.label}>概述</label>
          <textarea style={styles.textarea} value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="事件概述" />

          {card.zone === 'right' && (
            <>
              <label style={styles.label}>協作組別狀態</label>
              <textarea
                style={styles.textarea}
                value={collabStatus}
                onChange={(e) => setCollabStatus(e.target.value)}
                rows={2}
                placeholder="搜救組已派遣..."
              />
            </>
          )}
        </div>
        <div style={styles.buttons}>
          <button onClick={onCancel} style={styles.cancel}>取消</button>
          <button onClick={handleSave} style={styles.save}>儲存</button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  box: {
    background: '#16213e',
    border: '1px solid #0f3460',
    borderRadius: 10,
    padding: '28px 36px',
    width: 420,
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  title: { fontSize: 17, color: '#eee', marginBottom: 20 },
  fields: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 12, color: '#aaa' },
  input: {
    padding: '8px 12px',
    background: '#0f3460',
    border: '1px solid #1a5276',
    borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none',
  },
  textarea: {
    padding: '8px 12px',
    background: '#0f3460',
    border: '1px solid #1a5276',
    borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none',
    resize: 'vertical',
  },
  buttons: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 },
  cancel: {
    padding: '8px 20px', borderRadius: 6,
    background: '#0f3460', border: '1px solid #1a5276',
    color: '#eee', cursor: 'pointer', fontSize: 14,
  },
  save: {
    padding: '8px 20px', borderRadius: 6,
    background: '#27ae60', border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
  },
}
