import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const { filePath, content } = await req.json()

  const contentDir = path.join(process.cwd(), 'content')
  const absolutePath = path.resolve(filePath)

  if (!absolutePath.startsWith(contentDir)) {
    return Response.json({ error: 'Invalid path' }, { status: 400 })
  }

  await writeFile(absolutePath, content, 'utf-8')
  return Response.json({ ok: true })
}
