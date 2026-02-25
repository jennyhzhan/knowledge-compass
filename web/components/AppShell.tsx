'use client'

import Link from 'next/link'
import { ChatBar } from './ChatBar'
import { NavTabs } from './NavTabs'

interface AppShellProps {
  children: React.ReactNode
  chatPlaceholder?: string
  onChatSend?: (msg: string) => void
}

export function AppShell({ children, chatPlaceholder, onChatSend }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-100 hover:text-white transition-colors"
        >
          <span className="text-base font-medium tracking-tight">◈ Compass</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 border border-zinc-800 rounded">
            Search
          </button>
          <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 border border-zinc-800 rounded">
            Settings
          </button>
        </div>
      </header>

      {/* Main content — each page controls its own scroll */}
      <main className="flex-1 min-h-0">{children}</main>

      {/* Bottom dock */}
      <div className="shrink-0 border-t border-zinc-800">
        <ChatBar placeholder={chatPlaceholder} onSend={onChatSend} />
        <NavTabs />
      </div>
    </div>
  )
}
