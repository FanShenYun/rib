import { useState } from 'react'
import { parseRadio, createCard } from '../api/client'
import type { Card, ParseResult } from '../types'

interface Props {
  onCardCreated: (card: Card) => void
}

export function InputArea({ onCardCreated }: Props) {
  const [rawText, setRawText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [preview, setPreview] = useState<ParseResult | null>(null)
  const [editPreview, setEditPreview] = useState<ParseResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawText.trim()) return
    setError('')
    setParsing(true)
    try {
      const result = await parseRadio(rawText.trim())
      setPreview(result)
      setEditPreview({ ...result })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setParsing(false)
    }
  }

  const handleConfirm = async () => {
    if (!editPreview) return
    setSaving(true)
    try {
      const card = await createCard({
        raw_text: rawText,
        time_field: editPreview.time_field,
        location: editPreview.location,
        summary: editPreview.summary,
        zone: 'left',
      })
      onCardCreated(card)
      setRawText('')
      setPreview(null)
      setEditPreview(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setEditPreview(null)
    setError('')
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="輸入無線電監聽內容，例：0930 北側山坡發現傷患一名需要擔架"
          style={styles.input}
          disabled={parsing || !!preview}
        />
        <button type="submit" disabled={parsing || !rawText.trim() || !!preview} style={styles.submitBtn}>
          {parsing ? 'AI 解析中...' : '送出'}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {preview && editPreview && (
        <div style={styles.preview}>
          <div style={styles.previewTitle}>AI 解析結果（可修改）</div>
          <div style={styles.previewFields}>
            <div style={styles.fieldRow}>
              <label style={styles.fieldLabel}>時間</label>
              <input
                style={styles.fieldInput}
                value={editPreview.time_field}
                onChange={(e) => setEditPreview({ ...editPreview, time_field: e.target.value })}
                placeholder="09:30"
              />
            </div>
            <div style={styles.fieldRow}>
              <label style={styles.fieldLabel}>位置</label>
              <input
                style={styles.fieldInput}
                value={editPreview.location}
                onChange={(e) => setEditPreview({ ...editPreview, location: e.target.value })}
                placeholder="北側山坡"
              />
            </div>
            <div style={styles.fieldRow}>
              <label style={styles.fieldLabel}>概述</label>
              <input
                style={styles.fieldInput}
                value={editPreview.summary}
                onChange={(e) => setEditPreview({ ...editPreview, summary: e.target.value })}
                placeholder="事件概述"
              />
            </div>
          </div>
          <div style={styles.previewActions}>
            <button onClick={handleCancel} style={styles.cancelBtn}>取消</button>
            <button onClick={handleConfirm} disabled={saving} style={styles.confirmBtn}>
              {saving ? '建立中...' : '確認建立'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#16213e',
    borderBottom: '1px solid #0f3460',
    padding: '14px 20px',
  },
  form: { display: 'flex', gap: 10 },
  input: {
    flex: 1,
    padding: '10px 14px',
    background: '#0f3460',
    border: '1px solid #1a5276',
    borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none',
  },
  submitBtn: {
    padding: '10px 24px',
    background: '#e94560', border: 'none',
    borderRadius: 6, color: '#fff', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  error: { color: '#e74c3c', fontSize: 13, marginTop: 8 },
  preview: {
    marginTop: 12,
    background: '#0f3460',
    border: '1px solid #1a5276',
    borderRadius: 8, padding: '14px 16px',
  },
  previewTitle: { fontSize: 13, color: '#aaa', marginBottom: 10 },
  previewFields: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  fieldRow: { display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 140px' },
  fieldLabel: { fontSize: 11, color: '#aaa' },
  fieldInput: {
    padding: '7px 10px',
    background: '#16213e',
    border: '1px solid #1a5276',
    borderRadius: 5, color: '#fff', fontSize: 13, outline: 'none',
  },
  previewActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 },
  cancelBtn: {
    padding: '7px 18px', borderRadius: 5,
    background: 'transparent', border: '1px solid #555',
    color: '#aaa', cursor: 'pointer', fontSize: 13,
  },
  confirmBtn: {
    padding: '7px 18px', borderRadius: 5,
    background: '#27ae60', border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
}
