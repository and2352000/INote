import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content')

export interface PostMeta {
  slug: string
  title: string
  date?: string
  description?: string
  tags?: string[]
  draft?: boolean
}

export interface Post extends PostMeta {
  content: string
}

export interface Category {
  name: string
  title: string
  description?: string
  count: number
}

export function getPost(category: string, slug: string): Post {
  const filePath = path.join(contentDir, category, `${slug}.md`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ? String(data.date).slice(0, 10) : undefined,
    description: data.description,
    tags: data.tags ?? [],
    draft: data.draft ?? false,
    content,
  }
}

export function getPostsByCategory(category: string): PostMeta[] {
  const dir = path.join(contentDir, category)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== '_index.md')
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'))
      return {
        slug: f.replace('.md', ''),
        title: data.title ?? f.replace('.md', ''),
        date: data.date ? String(data.date).slice(0, 10) : undefined,
        description: data.description,
        tags: data.tags ?? [],
        draft: data.draft ?? false,
      }
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export function getCategories(): Category[] {
  if (!fs.existsSync(contentDir)) return []
  return fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const indexPath = path.join(contentDir, d.name, '_index.md')
      let title = d.name
      let description: string | undefined
      if (fs.existsSync(indexPath)) {
        const { data } = matter(fs.readFileSync(indexPath, 'utf-8'))
        title = data.title ?? d.name
        description = data.description
      }
      const count = getPostsByCategory(d.name).length
      return { name: d.name, title, description, count }
    })
}

export function getAllPosts(): (PostMeta & { category: string })[] {
  return getCategories().flatMap((cat) =>
    getPostsByCategory(cat.name).map((p) => ({ ...p, category: cat.name }))
  )
}

export function getAdjacentPosts(
  category: string,
  slug: string
): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = getPostsByCategory(category)
  const idx = posts.findIndex((p) => p.slug === slug)
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  }
}
