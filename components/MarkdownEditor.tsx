'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  rawContent: string
  notePath: string
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function MarkdownEditor({ rawContent, notePath }: Props) {
  const [content, setContent] = useState(rawContent)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(text), 1500)
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
        {saveStatus === 'idle' && <span className="status-idle">{notePath.split('/').pop()}</span>}
      </div>
      <div className="editor-split">
        <div className="editor-pane">
          <textarea
            className="editor-textarea"
            value={content}
            onChange={handleChange}
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
