'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Search from './Search'
import CreationModal from './CreationModal'
import ContextMenu from './ContextMenu'
import EditMetaModal, { type EditTarget } from './EditMetaModal'
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

type ContextMenuState = {
  x: number
  y: number
  target: EditTarget
} | null

export default function Sidebar({ categories }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<ModalState>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)

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

  function openContextMenu(e: React.MouseEvent, target: EditTarget) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, target })
  }

  async function handleDelete(target: EditTarget) {
    const label =
      target.kind === 'category' ? `分類「${target.title}」` : `文章「${target.title}」`
    if (!confirm(`確定要刪除${label}嗎？此操作無法復原。`)) return

    const body =
      target.kind === 'category'
        ? { type: 'category', name: target.name }
        : { type: 'article', category: target.category, slug: target.slug }

    const res = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      if (target.kind === 'category' && pathname.startsWith(`/${target.name}`)) {
        router.push('/')
      } else if (
        target.kind === 'article' &&
        pathname === `/${target.category}/${target.slug}`
      ) {
        router.push(`/${target.category}`)
      }
      router.refresh()
    }
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
                  <div
                    className={`nav-section-header${isCatActive ? ' active' : ''}`}
                    onContextMenu={(e) =>
                      openContextMenu(e, {
                        kind: 'category',
                        name: cat.name,
                        title: cat.title,
                        description: cat.description,
                      })
                    }
                  >
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
                          <li
                            key={post.slug}
                            className={`nav-item${isCurrent ? ' current' : ''}`}
                            onContextMenu={(e) =>
                              openContextMenu(e, {
                                kind: 'article',
                                category: cat.name,
                                slug: post.slug,
                                title: post.title,
                              })
                            }
                          >
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

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => setEditTarget(contextMenu.target)}
          onDelete={() => handleDelete(contextMenu.target)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {editTarget && (
        <EditMetaModal target={editTarget} onClose={() => setEditTarget(null)} />
      )}

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
