'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import matter from 'gray-matter'

interface Props {
  rawContent: string
  notePath: string
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'yaml-error'

function validateFrontmatter(text: string): boolean {
  try {
    matter(text)
    return true
  } catch {
    return false
  }
}

export default function MarkdownEditor({ rawContent, notePath }: Props) {
  const [content, setContent] = useState(rawContent)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const save = useCallback(async (text: string) => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: notePath, content: text }),
      })
      if (!res.ok) throw new Error()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }, [notePath])

  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(e.clipboardData.files).find(f => f.type.startsWith('image/'))
    if (!file) return

    e.preventDefault()
    const textarea = textareaRef.current!
    const pos = textarea.selectionStart
    const placeholder = '![uploading...]()'

    const before = content.slice(0, pos)
    const after = content.slice(pos)
    const newContent = `${before}${placeholder}${after}`
    setContent(newContent)
    setSaveStatus('saving')

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      const inserted = `![](${url})`
      setContent(c => {
        const updated = c.replace(placeholder, inserted)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => save(updated), 0)
        return updated
      })
      setSaveStatus('idle')
    } catch {
      setContent(c => c.replace(placeholder, ''))
      setSaveStatus('error')
    }
  }, [content, save])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!validateFrontmatter(text)) {
        setSaveStatus('yaml-error')
        return
      }
      save(text)
    }, 1500)
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  return (
    <div className="editor-container">
      <div className="editor-status-bar">
        {saveStatus === 'saving' && <span className="status-saving">儲存中…</span>}
        {saveStatus === 'saved' && <span className="status-saved">✓ 已儲存</span>}
        {saveStatus === 'error' && <span className="status-error">✕ 儲存失敗</span>}
        {saveStatus === 'yaml-error' && <span className="status-error">⚠ YAML 格式錯誤，未儲存</span>}
        {saveStatus === 'idle' && <span className="status-idle">{notePath.split('/').pop()}</span>}
      </div>
      <div className="editor-split">
        <div className="editor-pane">
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={content}
            onChange={handleChange}
            onPaste={handlePaste}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="preview-pane">
          <div className="note-body editor-preview-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
