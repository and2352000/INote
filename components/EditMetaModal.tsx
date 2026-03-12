'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export type EditTarget =
  | { kind: 'category'; name: string; title: string; description?: string }
  | { kind: 'article'; category: string; slug: string; title: string; description?: string }

interface Props {
  target: EditTarget
  onClose: () => void
}

export default function EditMetaModal({ target, onClose }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(target.title)
  const [description, setDescription] = useState(target.description ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body =
        target.kind === 'category'
          ? { type: 'category', name: target.name, title, description }
          : { type: 'article', category: target.category, slug: target.slug, title, description }
      const res = await fetch('/api/edit-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      onClose()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const label = target.kind === 'category' ? '分類' : '文章'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2 className="modal-title">編輯{label}基礎資訊</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="modal-label">
            顯示名稱
            <input
              ref={firstRef}
              className="modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="modal-label">
            說明 <span className="modal-hint">（選填）</span>
            <input
              className="modal-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="簡短說明"
            />
          </label>
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose} disabled={loading}>
              取消
            </button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              {loading ? '儲存中…' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
