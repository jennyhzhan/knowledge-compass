'use client'

import { useState } from 'react'

interface ChatBarProps {
  placeholder?: string
  onSend?: (msg: string) => void
}

export function ChatBar({ placeholder = 'Ask Compass…', onSend }: ChatBarProps) {
  const [value, setValue] = useState('')

  const send = () => {
    if (!value.trim()) return
    onSend?.(value.trim())
    setValue('')
  }

  return (
    <div className="input-box bg-white rounded-2xl border border-transparent">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-stone-900 placeholder-stone-400 outline-none text-sm"
        />
        <button
          onClick={send}
          disabled={!value.trim()}
          className="shrink-0 h-7 px-3 rounded-lg text-xs font-medium bg-stone-900 text-white disabled:opacity-25 hover:bg-stone-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}
