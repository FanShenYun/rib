import { useState } from 'react'
import { login } from '../api/client'

interface Props {
  onLogin: (displayName: string) => void
}

export function LoginPage({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await login(password, displayName)
      localStorage.setItem('token', token)
      localStorage.setItem('displayName', displayName)
      onLogin(displayName)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.box}>
        <h1 style={styles.title}>無線電情報白板</h1>
        <p style={styles.subtitle}>聯訓計畫組專用系統</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>存取密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="輸入存取密碼"
            autoFocus
          />
          <label style={styles.label}>顯示名稱</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            style={styles.input}
            placeholder="例：計畫組-王小明"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '驗證中...' : '進入系統'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1a2e',
  },
  box: {
    background: '#16213e',
    border: '1px solid #0f3460',
    borderRadius: 12,
    padding: '40px 48px',
    width: 380,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 2,
  },
  input: {
    padding: '10px 14px',
    background: '#0f3460',
    border: '1px solid #1a5276',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
  },
  error: {
    color: '#e94560',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    padding: '12px',
    background: '#e94560',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
}
