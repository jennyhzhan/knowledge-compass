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
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors text-left"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <span className="text-sm font-medium text-zinc-300">{title}</span>
        <span className="text-zinc-500 text-sm ml-3 select-none">{icon}</span>
      </button>

      {/* Content panel */}
      {expanded && (
        <div
          className={`bg-zinc-900 border border-zinc-700 rounded-lg p-4 mt-1 ${
            state === 'hover' ? 'absolute left-0 right-0 z-20 shadow-2xl shadow-black/70' : ''
          }`}
          onMouseEnter={state === 'hover' ? onMouseEnter : undefined}
          onMouseLeave={state === 'hover' ? onMouseLeave : undefined}
        >
          {content ? (
            <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-zinc-600 text-sm italic">No content yet.</p>
          )}

          {(onAdd || onEdit) && (
            <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-800">
              {onAdd && (
                <button className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  + Add
                </button>
              )}
              {onEdit && (
                <button className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
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
