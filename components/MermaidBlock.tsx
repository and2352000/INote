'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  code: string
}

let mermaidInitialized = false

async function initMermaid(theme: string) {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
  })
  mermaidInitialized = true
  return mermaid
}

function getTheme() {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') ?? 'light'
}

export default function MermaidBlock({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const theme = getTheme()
        const mermaid = await initMermaid(theme)
        if (cancelled) return

        const { svg } = await mermaid.render(idRef.current, code)
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = svg
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Mermaid render failed')
      }
    }

    render()

    const observer = new MutationObserver(() => {
      mermaidInitialized = false
      idRef.current = `mermaid-${Math.random().toString(36).slice(2, 9)}`
      render()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [code])

  if (error) {
    return (
      <div className="mermaid-error">
        <p className="mermaid-error-title">Mermaid syntax error</p>
        <pre className="mermaid-error-detail">{error}</pre>
        <pre className="mermaid-error-source"><code>{code}</code></pre>
      </div>
    )
  }

  return <div ref={containerRef} className="mermaid-container" />
}
