import { useState } from 'react'

interface Props {
  onConfirm: (status: string) => void
  onCancel: () => void
}

export function CollabStatusModal({ onConfirm, onCancel }: Props) {
  const [status, setStatus] = useState('')

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h3 style={styles.title}>填寫協作組別狀態</h3>
        <p style={styles.hint}>此白板條將移至右側大白板區</p>
        <textarea
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={styles.textarea}
          placeholder="例：搜救組已派遣，預計 15 分鐘到達"
          rows={3}
          autoFocus
        />
        <div style={styles.buttons}>
          <button onClick={onCancel} style={styles.cancel}>取消</button>
          <button onClick={() => onConfirm(status)} style={styles.confirm}>確認移入</button>
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
    width: 380,
  },
  title: { fontSize: 17, color: '#eee', marginBottom: 6 },
  hint: { fontSize: 12, color: '#aaa', marginBottom: 14 },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: '#0f3460',
    border: '1px solid #1a5276',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    resize: 'vertical',
    outline: 'none',
    marginBottom: 18,
  },
  buttons: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  cancel: {
    padding: '8px 20px', borderRadius: 6,
    background: '#0f3460', border: '1px solid #1a5276',
    color: '#eee', cursor: 'pointer', fontSize: 14,
  },
  confirm: {
    padding: '8px 20px', borderRadius: 6,
    background: '#0f3460', border: '1px solid #3498db',
    color: '#3498db', cursor: 'pointer', fontSize: 14, fontWeight: 600,
  },
}
