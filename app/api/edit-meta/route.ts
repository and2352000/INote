import { NextRequest } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const contentDir = path.join(process.cwd(), 'content')

  if (body.type === 'category') {
    const { name, title, description } = body
    if (!name || !/^[a-z0-9-]+$/.test(name)) {
      return Response.json({ error: '無效的分類 ID' }, { status: 400 })
    }
    if (!title?.trim()) {
      return Response.json({ error: '請填寫顯示名稱' }, { status: 400 })
    }
    const filePath = path.join(contentDir, name, '_index.md')
    if (!existsSync(filePath)) {
      return Response.json({ error: '分類不存在' }, { status: 404 })
    }
    const raw = await readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)
    data.title = title.trim()
    if (description?.trim()) {
      data.description = description.trim()
    } else {
      delete data.description
    }
    await writeFile(filePath, matter.stringify(content, data), 'utf-8')
    revalidatePath('/')
    revalidatePath(`/${name}`)
    return Response.json({ ok: true })
  }

  if (body.type === 'article') {
    const { category, slug, title, description } = body
    if (!category || !slug) {
      return Response.json({ error: '缺少參數' }, { status: 400 })
    }
    if (!title?.trim()) {
      return Response.json({ error: '請填寫標題' }, { status: 400 })
    }
    const filePath = path.resolve(path.join(contentDir, category, `${slug}.md`))
    if (!filePath.startsWith(contentDir) || !existsSync(filePath)) {
      return Response.json({ error: '文章不存在' }, { status: 404 })
    }
    const raw = await readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)
    data.title = title.trim()
    if (description?.trim()) {
      data.description = description.trim()
    } else {
      delete data.description
    }
    await writeFile(filePath, matter.stringify(content, data), 'utf-8')
    revalidatePath(`/${category}/${slug}`)
    revalidatePath(`/${category}`)
    return Response.json({ ok: true })
  }

  return Response.json({ error: '無效的請求' }, { status: 400 })
}
