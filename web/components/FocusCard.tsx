'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface FocusCardProps {
  title: string
  content: string
  onSave?: (value: string) => Promise<void>
}

export function FocusCard({ title, content, onSave }: FocusCardProps) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const expanded = pinned || hovered
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(content)
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync draft if content prop changes externally
  useEffect(() => { setDraft(content) }, [content])

  // Auto-resize textarea
  useEffect(() => {
    if (editing && textareaRef.current) {
      const t = textareaRef.current
      t.style.height = 'auto'
      t.style.height = `${t.scrollHeight}px`
      t.focus()
    }
  }, [editing])

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(content)
    setEditing(true)
  }

  const handleCancel = () => {
    setDraft(content)
    setEditing(false)
  }

  const handleSave = async () => {
    if (!onSave) { setEditing(false); return }
    setSaving(true)
    try {
      await onSave(draft)
      setEditing(false)
    } catch {
      // keep editing on error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Title row */}
      <button
        onClick={() => { if (!editing) setPinned((v) => !v) }}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-xl hover:border-stone-300 hover:shadow-sm transition-all text-left"
      >
        <span className="text-sm font-medium text-stone-700">{title}</span>
        <span className="text-stone-400 text-sm ml-3 select-none">{expanded ? '∨' : '›'}</span>
      </button>

      {/* Expanded panel — absolute, overlays content below */}
      {expanded && (
        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-stone-200 border-t-0 rounded-b-xl px-4 pt-3 pb-4 max-h-60 overflow-y-auto shadow-md">
          {editing ? (
            <>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  const t = e.currentTarget
                  t.style.height = 'auto'
                  t.style.height = `${t.scrollHeight}px`
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 resize-none leading-relaxed min-h-[80px]"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleCancel}
                  className="text-xs text-stone-400 hover:text-stone-600 px-3 py-1.5 border border-stone-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs text-white bg-stone-800 hover:bg-stone-700 disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </>
          ) : (
            <>
              {content ? (
                <div className="prose prose-stone prose-sm max-w-none text-stone-700 leading-relaxed">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-stone-400 text-sm italic">No content yet.</p>
              )}
              {onSave && (
                <div className="flex justify-end mt-3 pt-3 border-t border-stone-100">
                  <button
                    onClick={handleEdit}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
