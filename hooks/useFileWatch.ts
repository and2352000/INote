'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function useFileWatch() {
  const router = useRouter()
  const pathname = usePathname()
  const routerRef = useRef(router)
  const pathnameRef = useRef(pathname)

  // 保持 ref 最新，不觸發 effect 重跑
  routerRef.current = router
  pathnameRef.current = pathname

  useEffect(() => {
    let ws: WebSocket
    let retryTimer: ReturnType<typeof setTimeout>

    function connect() {
      ws = new WebSocket('ws://localhost:3001')
      ws.onmessage = (e) => {
        try {
          const { path } = JSON.parse(e.data)
          if (path === pathnameRef.current) routerRef.current.refresh()
        } catch {}
      }
      ws.onclose = () => {
        retryTimer = setTimeout(connect, 5000)
      }
    }

    connect()
    return () => {
      clearTimeout(retryTimer)
      if (ws) ws.onclose = null
      ws?.close()
    }
  }, []) // 只在 mount/unmount 時執行一次
}
