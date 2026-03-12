'use client'
import { useEffect, useRef } from 'react'

interface Props {
  x: number
  y: number
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export default function ContextMenu({ x, y, onEdit, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div ref={ref} className="context-menu" style={{ top: y, left: x }}>
      <button
        className="context-menu-item"
        onClick={() => { onClose(); onEdit() }}
      >
        編輯基礎資訊
      </button>
      <button
        className="context-menu-item context-menu-item-danger"
        onClick={() => { onClose(); onDelete() }}
      >
        刪除
      </button>
    </div>
  )
}
