import { NextRequest } from 'next/server'
import { rm, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const contentDir = path.join(process.cwd(), 'content')

  if (body.type === 'category') {
    const { name } = body
    if (!name || !/^[a-z0-9-]+$/.test(name)) {
      return Response.json({ error: '無效的分類 ID' }, { status: 400 })
    }
    const dir = path.resolve(path.join(contentDir, name))
    if (!dir.startsWith(contentDir) || !existsSync(dir)) {
      return Response.json({ error: '分類不存在' }, { status: 404 })
    }
    await rm(dir, { recursive: true, force: true })
    revalidatePath('/')
    return Response.json({ ok: true })
  }

  if (body.type === 'article') {
    const { category, slug } = body
    if (!category || !slug) {
      return Response.json({ error: '缺少參數' }, { status: 400 })
    }
    const filePath = path.resolve(path.join(contentDir, category, `${slug}.md`))
    if (!filePath.startsWith(contentDir) || !existsSync(filePath)) {
      return Response.json({ error: '文章不存在' }, { status: 404 })
    }
    await unlink(filePath)
    revalidatePath(`/${category}`)
    return Response.json({ ok: true })
  }

  return Response.json({ error: '無效的請求' }, { status: 400 })
}
