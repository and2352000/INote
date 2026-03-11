import { NextRequest } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const { name, title, description } = await req.json()

  if (!name || !/^[a-z0-9-]+$/.test(name)) {
    return Response.json({ error: '分類 ID 只能包含小寫英文、數字、連字號' }, { status: 400 })
  }
  if (!title?.trim()) {
    return Response.json({ error: '請填寫顯示名稱' }, { status: 400 })
  }

  const contentDir = path.join(process.cwd(), 'content')
  const dir = path.join(contentDir, name)

  if (existsSync(dir)) {
    return Response.json({ error: '分類已存在' }, { status: 409 })
  }

  await mkdir(dir, { recursive: true })

  const lines = ['---', `title: "${title.trim()}"`, description?.trim() ? `description: "${description.trim()}"` : null, '---', ''].filter((l) => l !== null)
  await writeFile(path.join(dir, '_index.md'), lines.join('\n'), 'utf-8')

  revalidatePath('/')
  revalidatePath(`/${name}`)

  return Response.json({ ok: true, path: `/${name}` })
}
