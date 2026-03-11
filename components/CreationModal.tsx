'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryForm {
  type: 'category'
}

interface ArticleForm {
  type: 'article'
  defaultCategory: string
  categories: string[]
}

type Props = (CategoryForm | ArticleForm) & {
  onClose: () => void
}

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[\u4e00-\u9fff]+/g, '') // strip Chinese
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function CreationModal(props: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const firstRef = useRef<HTMLInputElement>(null)

  // Category fields
  const [catName, setCatName] = useState('')
  const [catTitle, setCatTitle] = useState('')
  const [catDesc, setCatDesc] = useState('')

  // Article fields
  const [artCategory, setArtCategory] = useState(props.type === 'article' ? props.defaultCategory : '')
  const [artTitle, setArtTitle] = useState('')
  const [artSlug, setArtSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugTouched && props.type === 'article') {
      setArtSlug(toSlug(artTitle))
    }
  }, [artTitle, slugTouched, props.type])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (props.type === 'category') {
        const res = await fetch('/api/new-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: catName, title: catTitle, description: catDesc }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        props.onClose()
        router.push(data.path)
        router.refresh()
      } else {
        const res = await fetch('/api/new-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: artCategory, slug: artSlug, title: artTitle }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
        props.onClose()
        router.push(data.path)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={props.onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2 className="modal-title">
          {props.type === 'category' ? '新增分類' : '新增文章'}
        </h2>

        <form onSubmit={handleSubmit} className="modal-form">
          {props.type === 'category' ? (
            <>
              <label className="modal-label">
                分類 ID <span className="modal-hint">（小寫英文 / 數字 / 連字號）</span>
                <input
                  ref={firstRef}
                  className="modal-input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="my-category"
                  required
                />
              </label>
              <label className="modal-label">
                顯示名稱
                <input
                  className="modal-input"
                  value={catTitle}
                  onChange={(e) => setCatTitle(e.target.value)}
                  placeholder="我的分類"
                  required
                />
              </label>
              <label className="modal-label">
                說明 <span className="modal-hint">（選填）</span>
                <input
                  className="modal-input"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="簡短說明"
                />
              </label>
            </>
          ) : (
            <>
              <label className="modal-label">
                分類
                <select
                  className="modal-input"
                  value={artCategory}
                  onChange={(e) => setArtCategory(e.target.value)}
                  required
                >
                  {props.categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="modal-label">
                標題
                <input
                  ref={firstRef}
                  className="modal-input"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="我的第一篇筆記"
                  required
                />
              </label>
              <label className="modal-label">
                Slug <span className="modal-hint">（小寫英文 / 數字 / 連字號）</span>
                <input
                  className="modal-input"
                  value={artSlug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setArtSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }}
                  placeholder="my-first-note"
                  required
                />
              </label>
            </>
          )}

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={props.onClose} disabled={loading}>
              取消
            </button>
            <button type="submit" className="modal-btn-submit" disabled={loading}>
              {loading ? '建立中…' : '建立'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
