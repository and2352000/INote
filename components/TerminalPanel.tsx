'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

const TTYD_URL = 'http://localhost:7681'
const DEFAULT_WIDTH = 380

interface Props {
  notePath: string
}

export default function TerminalPanel({ notePath }: Props) {
  const [open, setOpen] = useState(false)
  const [online, setOnline] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(DEFAULT_WIDTH)

  async function checkTtyd() {
    try {
      await fetch(TTYD_URL, { mode: 'no-cors', cache: 'no-store' })
      return true
    } catch {
      return false
    }
  }

  function loadIframe() {
    if (!iframeRef.current) return
    iframeRef.current.src = ''
    const url = notePath
      ? `${TTYD_URL}?arg=-c&arg=${encodeURIComponent(`claude "${notePath}"`)}`
      : TTYD_URL
    requestAnimationFrame(() => {
      if (iframeRef.current) iframeRef.current.src = url
    })
  }

  function openPanel() {
    setOpen(true)
    if (notePath) {
      navigator.clipboard.writeText(notePath).then(() => {
        setShowHint(true)
        setTimeout(() => setShowHint(false), 5000)
      }).catch(() => {})
    }
  }

  function closePanel() {
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return
    const onEnd = () => {
      checkTtyd().then((ok) => {
        setOnline(ok)
        if (ok && iframeRef.current && !iframeRef.current.src) loadIframe()
      })
    }
    panel.addEventListener('transitionend', onEnd, { once: true })
  }, [open])

  function handleCopy() {
    navigator.clipboard.writeText(notePath).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  function handleRetry() {
    checkTtyd().then((ok) => {
      setOnline(ok)
      if (ok) loadIframe()
    })
  }

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    resizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    panelRef.current?.classList.add('resizing')

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizing.current) return
      const delta = startX.current - ev.clientX
      const next = Math.max(280, Math.min(window.innerWidth * 0.9, startWidth.current + delta))
      setWidth(next)
    }
    const onMouseUp = () => {
      resizing.current = false
      panelRef.current?.classList.remove('resizing')
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [width])

  return (
    <>
      <button
        className={`ai-terminal-btn${open ? ' active' : ''}`}
        onClick={open ? closePanel : openPanel}
      >
        AI Edit
      </button>
      <div ref={panelRef} className={`terminal-panel${open ? ' open' : ''}`} style={{ width }}>
        <div className="terminal-resize-handle" onMouseDown={onResizeMouseDown} />
        <div className="terminal-toolbar">
          <span className="terminal-title">🤖 AI Terminal</span>
          <div className="terminal-actions">
            <button
              className={`terminal-copy-btn${copied ? ' copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ 已複製' : '📋 複製路徑'}
            </button>
            <button className="terminal-close" onClick={closePanel}>✕</button>
          </div>
        </div>
        {showHint && (
          <div className="terminal-hint show">
            已複製: {notePath} — 貼到 terminal 後執行 claude 開始 AI 編輯
          </div>
        )}
        {!online && (
          <div className="terminal-offline">
            <div className="terminal-offline-inner">
              <span className="terminal-offline-icon">🔌</span>
              <p>Terminal 未連線</p>
              <code>ttyd -p 7681 --url-arg bash</code>
              <button className="terminal-retry-btn" onClick={handleRetry}>重試連線</button>
            </div>
          </div>
        )}
        <iframe ref={iframeRef} className="terminal-iframe" title="AI Terminal" />
      </div>
    </>
  )
}
