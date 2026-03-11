import chokidar from 'chokidar'
import { WebSocketServer, WebSocket } from 'ws'
import { filePathToRoute } from './lib/filePathToRoute'

const WSS_PORT = 3001
const NEXT_URL = 'http://localhost:3000'

const wss = new WebSocketServer({ port: WSS_PORT })
const clients = new Set<WebSocket>()

wss.on('connection', (ws) => {
  clients.add(ws)
  ws.on('close', () => clients.delete(ws))
})

console.log(`[watcher] WebSocket server listening on ws://localhost:${WSS_PORT}`)

chokidar.watch('./content/**/*.md').on('change', async (filePath) => {
  const route = filePathToRoute(filePath)
  console.log(`[watcher] changed: ${filePath} → ${route}`)

  try {
    await fetch(`${NEXT_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: route }),
    })
  } catch (e) {
    console.error('[watcher] revalidate failed:', e)
  }

  const msg = JSON.stringify({ path: route })
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg)
  })
})

console.log('[watcher] watching content/**/*.md')
