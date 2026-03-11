'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Search from './Search'
import CreationModal from './CreationModal'
import type { Category } from '@/lib/posts'

const CATEGORY_ICONS: Record<string, string> = {
  dev: '💻',
  ecommerce: '🛒',
  investment: '📈',
  life: '🌱',
}

interface SidebarPost {
  slug: string
  title: string
}

interface Props {
  categories: (Category & { posts?: SidebarPost[] })[]
}

type ModalState =
  | { type: 'category' }
  | { type: 'article'; defaultCategory: string }
  | null

export default function Sidebar({ categories }: Props) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    const seg = pathname.split('/')[1]
    if (seg) setOpenSections((s) => new Set([...s, seg]))
  }, [pathname])

  useEffect(() => {
    const collapsed = localStorage.getItem('sidebar-collapsed') === 'true'
    const sidebar = document.getElementById('sidebar')
    const main = document.getElementById('mainWrapper')
    if (collapsed && sidebar && main) {
      sidebar.classList.add('collapsed')
      main.style.marginLeft = '40px'
    }
  }, [])

  function toggleSection(name: string) {
    setOpenSections((s) => {
      const next = new Set(s)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function toggleDesktop() {
    const sidebar = document.getElementById('sidebar')
    const main = document.getElementById('mainWrapper')
    if (!sidebar) return
    const collapsed = sidebar.classList.toggle('collapsed')
    if (main) main.style.marginLeft = collapsed ? '40px' : 'var(--sidebar-width)'
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }

  const categoryNames = categories.map((c) => c.name)

  return (
    <>
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="site-title">Aaron&apos;s Note</Link>
          <button className="sidebar-toggle" id="sidebarToggle" onClick={toggleDesktop} aria-label="收合側欄">
            ◀
          </button>
        </div>
        <Search />
        <nav className="sidebar-nav">
          <ul className="nav-tree">
            {categories.map((cat) => {
              const isOpen = openSections.has(cat.name)
              const isCatActive = pathname.startsWith(`/${cat.name}`)
              return (
                <li key={cat.name} className="nav-section">
                  <div className={`nav-section-header${isCatActive ? ' active' : ''}`}>
                    <span className="nav-icon">{CATEGORY_ICONS[cat.name] ?? '📁'}</span>
                    <Link href={`/${cat.name}`}>{cat.title}</Link>
                    <button
                      className="nav-new-btn"
                      onClick={(e) => { e.stopPropagation(); setModal({ type: 'article', defaultCategory: cat.name }) }}
                      aria-label={`在 ${cat.title} 新增文章`}
                      title="新增文章"
                    >
                      +
                    </button>
                    <button
                      className="toggle-btn"
                      onClick={() => toggleSection(cat.name)}
                      aria-label="展開/收合"
                      style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    >
                      ▾
                    </button>
                  </div>
                  {isOpen && cat.posts && (
                    <ul className="nav-children open">
                      {cat.posts.map((post) => {
                        const href = `/${cat.name}/${post.slug}`
                        const isCurrent = pathname === href
                        return (
                          <li key={post.slug} className={`nav-item${isCurrent ? ' current' : ''}`}>
                            <Link href={href}>{post.title}</Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-new-category-btn" onClick={() => setModal({ type: 'category' })}>
            + 新增分類
          </button>
        </div>
      </aside>

      {modal?.type === 'category' && (
        <CreationModal type="category" onClose={() => setModal(null)} />
      )}
      {modal?.type === 'article' && (
        <CreationModal
          type="article"
          defaultCategory={modal.defaultCategory}
          categories={categoryNames}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
