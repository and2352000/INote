import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { path } = await req.json()
  revalidatePath(path)
  return Response.json({ ok: true })
}
