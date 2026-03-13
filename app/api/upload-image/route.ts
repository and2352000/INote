import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const EXT_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'File too large' }, { status: 400 })
  }

  const ext = EXT_MAP[file.type]
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
  const imagesDir = path.join(process.cwd(), 'public', 'images')
  const filePath = path.join(imagesDir, filename)

  await mkdir(imagesDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  return Response.json({ url: `/images/${filename}` })
}
