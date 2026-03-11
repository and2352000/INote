'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Result {
  title: string
  href: string
  description?: string
}

export default function Search() {
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [noResult, setNoResult] = useState(false)
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value.trim()
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!q || q.length < 2) {
      setOpen(false)
      return
    }
    timerRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data: Result[] = await res.json()
      setResults(data)
      setNoResult(data.length === 0)
      setOpen(true)
    }, 150)
  }

  function handleBlur() {
    setTimeout(() => setOpen(false), 150)
  }

  return (
    <div className="search-box">
      <input
        id="search-input"
        type="search"
        placeholder="搜尋..."
        onChange={handleInput}
        onBlur={handleBlur}
        autoComplete="off"
      />
      <div id="search-results" className={`search-results${open ? ' open' : ''}`}>
        {noResult ? (
          <div className="search-result-item">找不到結果</div>
        ) : (
          results.map((r) => (
            <div
              key={r.href}
              className="search-result-item"
              onMouseDown={() => router.push(r.href)}
            >
              <strong>{r.title}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
