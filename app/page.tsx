import Link from 'next/link'
import { getCategories } from '@/lib/posts'
import Topbar from '@/components/Topbar'

const CATEGORY_ICONS: Record<string, string> = {
  dev: '💻',
  ecommerce: '🛒',
  investment: '📈',
  life: '🌱',
}

export default function HomePage() {
  const categories = getCategories()

  return (
    <>
      <Topbar breadcrumbs={[]} />
      <main className="content">
        <div className="home-hero">
          <h1>Aaron&apos;s Note</h1>
          <p>個人知識庫</p>
        </div>
        <div className="home-sections">
          {categories.map((cat) => (
            <Link key={cat.name} href={`/${cat.name}`} className="section-card-home">
              <span className="section-icon">{CATEGORY_ICONS[cat.name] ?? '📁'}</span>
              <div>
                <h3>{cat.title}</h3>
                <p>{cat.description ?? `${cat.count} 篇筆記`}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
