'use client'

import { useState } from 'react'

interface ChatBarProps {
  placeholder?: string
  onSend?: (msg: string) => void
}

export function ChatBar({ placeholder = 'Ask Compass...', onSend }: ChatBarProps) {
  const [value, setValue] = useState('')

  const send = () => {
    if (!value.trim()) return
    onSend?.(value.trim())
    setValue('')
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus-within:border-zinc-600 transition-colors">
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
          className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 outline-none text-sm"
        />
        <button
          onClick={send}
          disabled={!value.trim()}
          className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition-colors px-2 py-1 border border-zinc-700 rounded"
        >
          Send
        </button>
      </div>
    </div>
  )
}
