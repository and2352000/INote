'use client'

interface Props {
  viewMode: 'list' | 'grid'
  onChange: (mode: 'list' | 'grid') => void
}

export default function ViewToggle({ viewMode, onChange }: Props) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
        onClick={() => onChange('list')}
        aria-label="列表模式"
        title="列表模式"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="2" width="14" height="2" rx="0.5" />
          <rect x="1" y="7" width="14" height="2" rx="0.5" />
          <rect x="1" y="12" width="14" height="2" rx="0.5" />
        </svg>
      </button>
      <button
        className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
        onClick={() => onChange('grid')}
        aria-label="卡片模式"
        title="卡片模式"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
    </div>
  )
}
