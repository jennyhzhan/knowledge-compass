'use client'

import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

interface FocusCardProps {
  title: string
  content: string
  onEdit?: () => void
  onAdd?: () => void
}

type State = 'collapsed' | 'hover' | 'pinned'

export function FocusCard({ title, content, onEdit, onAdd }: FocusCardProps) {
  const [state, setState] = useState<State>('collapsed')
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onMouseEnter = () => {
    if (state === 'pinned') return
    hoverTimer.current = setTimeout(() => setState('hover'), 80)
  }

  const onMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    if (state === 'hover') setState('collapsed')
  }

  const onClick = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setState(state === 'pinned' ? 'collapsed' : 'pinned')
  }

  const expanded = state === 'hover' || state === 'pinned'
  const icon = state === 'pinned' ? '∨' : '›'

  return (
    <div className="relative">
      {/* Title row */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-xl hover:border-stone-300 hover:shadow-sm transition-all text-left"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <span className="text-sm font-medium text-stone-700">{title}</span>
        <span className="text-stone-400 text-sm ml-3 select-none">{icon}</span>
      </button>

      {/* Content panel */}
      {expanded && (
        <div
          className={`bg-white border border-stone-200 rounded-xl p-4 mt-1 shadow-sm ${
            state === 'hover' ? 'absolute left-0 right-0 z-20 shadow-lg' : ''
          }`}
          onMouseEnter={state === 'hover' ? onMouseEnter : undefined}
          onMouseLeave={state === 'hover' ? onMouseLeave : undefined}
        >
          {content ? (
            <div className="prose prose-stone prose-sm max-w-none text-stone-700 leading-relaxed">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-stone-400 text-sm italic">No content yet.</p>
          )}

          {(onAdd || onEdit) && (
            <div className="flex gap-3 mt-3 pt-3 border-t border-stone-100">
              {onAdd && (
                <button className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                  + Add
                </button>
              )}
              {onEdit && (
                <button className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
