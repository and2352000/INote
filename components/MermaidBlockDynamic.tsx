'use client'
import dynamic from 'next/dynamic'

const MermaidBlock = dynamic(() => import('./MermaidBlock'), {
  ssr: false,
  loading: () => <div className="mermaid-container">Loading diagram...</div>,
})

export default function MermaidBlockDynamic({ code }: { code: string }) {
  return <MermaidBlock code={code} />
}
