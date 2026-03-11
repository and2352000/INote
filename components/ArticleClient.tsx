'use client'
import { useState } from 'react'
import Topbar from './Topbar'
import TerminalPanel from './TerminalPanel'
import MarkdownEditor from './MarkdownEditor'

interface BreadcrumbItem {
  label: string
  href: string
}

interface Props {
  breadcrumbs: BreadcrumbItem[]
  notePath: string
  rawContent: string
  children: React.ReactNode
}

export default function ArticleClient({ breadcrumbs, notePath, rawContent, children }: Props) {
  const [editMode, setEditMode] = useState(false)

  return (
    <>
      <Topbar
        breadcrumbs={breadcrumbs}
        noteActions={
          <>
            <button
              className={`edit-toggle-btn${editMode ? ' active' : ''}`}
              onClick={() => setEditMode((e) => !e)}
              aria-label={editMode ? '切換為閱讀模式' : '切換為編輯模式'}
            >
              {editMode ? '👁 閱讀' : '✏️ 編輯'}
            </button>
            <TerminalPanel notePath={notePath} />
          </>
        }
      />
      {editMode ? (
        <MarkdownEditor rawContent={rawContent} notePath={notePath} />
      ) : (
        <main className="content">{children}</main>
      )}
    </>
  )
}
