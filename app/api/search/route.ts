import { getAllPosts } from '@/lib/posts'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim() ?? ''

  const posts = getAllPosts()

  if (!q || q.length < 2) {
    return Response.json([])
  }

  const results = posts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 8)
    .map((p) => ({
      title: p.title,
      href: `/${p.category}/${p.slug}`,
      description: p.description,
    }))

  return Response.json(results)
}
