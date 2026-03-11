import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategories, getPostsByCategory } from '@/lib/posts'
import Topbar from '@/components/Topbar'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.name }))
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const categories = getCategories()
  const cat = categories.find((c) => c.name === category)
  if (!cat) notFound()

  const posts = getPostsByCategory(category)

  return (
    <>
      <Topbar breadcrumbs={[{ label: cat.title, href: `/${category}` }]} />
      <main className="content page-list">
        <div className="page-header">
          <h1>{cat.title}</h1>
          {cat.description && <p>{cat.description}</p>}
        </div>
        <div className="notes-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/${category}/${post.slug}`} className="note-card">
              <span className="note-card-icon">📄</span>
              <div>
                <h3>{post.title}</h3>
                {post.description && <p>{post.description}</p>}
                {post.date && <time>{post.date}</time>}
              </div>
            </Link>
          ))}
          {posts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>尚無筆記</p>}
        </div>
      </main>
    </>
  )
}
