import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readFileSync } from 'fs'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getCategories, getPost, getPostsByCategory, getAdjacentPosts } from '@/lib/posts'
import ArticleClient from '@/components/ArticleClient'
import { mdxComponents } from '@/components/MdxComponents'
import path from 'path'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  return getCategories().flatMap((cat) =>
    getPostsByCategory(cat.name).map((p) => ({ category: cat.name, slug: p.slug }))
  )
}

export default async function PostPage({ params }: Props) {
  const { category, slug } = await params

  let post
  try {
    post = getPost(category, slug)
  } catch {
    notFound()
  }

  const categories = getCategories()
  const cat = categories.find((c) => c.name === category)
  const { prev, next } = getAdjacentPosts(category, slug)

  const notePath = path.join(process.cwd(), 'content', category, `${slug}.md`)
  const rawContent = readFileSync(notePath, 'utf-8')

  return (
    <ArticleClient
      breadcrumbs={[
        { label: cat?.title ?? category, href: `/${category}` },
        { label: post.title, href: `/${category}/${slug}` },
      ]}
      notePath={notePath}
      rawContent={rawContent}
    >
      <article className="note-article">
        <header className="note-header">
          <div className="note-header-top">
            <h1>{post.title}</h1>
          </div>
          <div className="note-meta">
            {post.date && <time>{post.date}</time>}
            {post.tags && post.tags.length > 0 && (
              <div className="tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </header>
        <div className="note-body">
          <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} components={mdxComponents} />
        </div>
        {(prev || next) && (
          <nav className="note-nav">
            <div>
              {prev && (
                <Link href={`/${category}/${prev.slug}`} className="nav-prev">
                  ← {prev.title}
                </Link>
              )}
            </div>
            <div>
              {next && (
                <Link href={`/${category}/${next.slug}`} className="nav-next">
                  {next.title} →
                </Link>
              )}
            </div>
          </nav>
        )}
      </article>
    </ArticleClient>
  )
}
