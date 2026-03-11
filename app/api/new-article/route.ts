import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const { category, slug, title } = await req.json()

  if (!category || !slug || !/^[a-z0-9-]+$/.test(slug)) {
    return Response.json({ error: 'Slug 只能包含小寫英文、數字、連字號' }, { status: 400 })
  }
  if (!title?.trim()) {
    return Response.json({ error: '請填寫標題' }, { status: 400 })
  }

  const contentDir = path.join(process.cwd(), 'content')
  const categoryDir = path.join(contentDir, category)

  if (!existsSync(categoryDir)) {
    return Response.json({ error: '分類不存在' }, { status: 400 })
  }

  const filePath = path.join(categoryDir, `${slug}.md`)
  if (existsSync(filePath)) {
    return Response.json({ error: '文章已存在' }, { status: 409 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const content = `---\ntitle: "${title.trim()}"\ndate: ${today}\ntags: []\ndraft: false\n---\n\n`
  await writeFile(filePath, content, 'utf-8')

  revalidatePath(`/${category}`)
  revalidatePath(`/${category}/${slug}`)

  return Response.json({ ok: true, path: `/${category}/${slug}` })
}
