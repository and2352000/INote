'use client'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { useEffect, useState } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface Props {
  breadcrumbs: BreadcrumbItem[]
  noteActions?: React.ReactNode
}

export default function Topbar({ breadcrumbs, noteActions }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function toggleSidebarMobile() {
    document.getElementById('sidebar')?.classList.toggle('mobile-open')
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar')
    const main = document.getElementById('mainWrapper')
    if (!sidebar) return
    const collapsed = sidebar.classList.toggle('collapsed')
    main?.style.setProperty('margin-left', collapsed ? '0' : 'var(--sidebar-width)')
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }

  return (
    <header className="topbar">
      <button className="sidebar-toggle-mobile" onClick={toggleSidebarMobile} aria-label="選單">
        &#9776;
      </button>
      <nav className="breadcrumb">
        <Link href="/" className="">首頁</Link>
        {breadcrumbs.map((b, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="breadcrumb-sep">/</span>
            {i === breadcrumbs.length - 1 ? (
              <span className="breadcrumb-current">{b.label}</span>
            ) : (
              <Link href={b.href}>{b.label}</Link>
            )}
          </span>
        ))}
      </nav>
      <div className="topbar-actions">
        {noteActions}
        {mounted && <ThemeToggle />}
      </div>
    </header>
  )
}
