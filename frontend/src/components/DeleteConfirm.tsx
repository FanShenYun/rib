interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirm({ onConfirm, onCancel }: Props) {
  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <p style={styles.text}>確定要刪除這張白板條嗎？</p>
        <div style={styles.buttons}>
          <button onClick={onCancel} style={styles.cancel}>取消</button>
          <button onClick={onConfirm} style={styles.confirm}>確認刪除</button>
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
    minWidth: 280,
    textAlign: 'center',
  },
  text: { fontSize: 16, color: '#eee', marginBottom: 24 },
  buttons: { display: 'flex', gap: 12, justifyContent: 'center' },
  cancel: {
    padding: '8px 24px', borderRadius: 6,
    background: '#0f3460', border: '1px solid #1a5276',
    color: '#eee', cursor: 'pointer', fontSize: 14,
  },
  confirm: {
    padding: '8px 24px', borderRadius: 6,
    background: '#e94560', border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
  },
}
