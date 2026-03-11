import type { Metadata } from 'next'
import '../styles/main.css'
import { getCategories, getPostsByCategory } from '@/lib/posts'
import Sidebar from '@/components/Sidebar'
import FileWatcher from '@/components/FileWatcher'

export const metadata: Metadata = {
  title: "Aaron's Note",
  description: '個人知識庫',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategories().map((cat) => ({
    ...cat,
    posts: getPostsByCategory(cat.name).map((p) => ({ slug: p.slug, title: p.title })),
  }))

  return (
    <html lang="zh-TW">
      <body className="layout-app">
        <Sidebar categories={categories} />
        <div className="main-wrapper" id="mainWrapper">
          {children}
        </div>
        <FileWatcher />
      </body>
    </html>
  )
}
