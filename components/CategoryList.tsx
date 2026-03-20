'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Topbar from './Topbar'
import ViewToggle from './ViewToggle'

interface PostMeta {
  slug: string
  title: string
  date?: string
  description?: string
  tags?: string[]
}

interface Props {
  category: string
  catTitle: string
  catDescription?: string
  posts: PostMeta[]
}

const STORAGE_KEY = 'note-view-mode'

export default function CategoryList({ category, catTitle, catDescription, posts }: Props) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'list' || saved === 'grid') {
      setViewMode(saved)
    }
    setMounted(true)
  }, [])

  function handleChange(mode: 'list' | 'grid') {
    setViewMode(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }

  return (
    <>
      <Topbar
        breadcrumbs={[{ label: catTitle, href: `/${category}` }]}
        noteActions={mounted ? <ViewToggle viewMode={viewMode} onChange={handleChange} /> : undefined}
      />
      <main className="content page-list">
        <div className="page-header">
          <h1>{catTitle}</h1>
          {catDescription && <p>{catDescription}</p>}
        </div>
        <div className={`notes-grid view-${viewMode}`}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/${category}/${post.slug}`} className="note-card">
              <span className="note-card-icon">📄</span>
              <div>
                <h3>{post.title}</h3>
                {post.description && <p>{post.description}</p>}
                {post.date && <time>{post.date}</time>}
                {post.tags && post.tags.length > 0 && (
                  <div className="note-card-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="note-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
          {posts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>尚無筆記</p>}
        </div>
      </main>
    </>
  )
}
