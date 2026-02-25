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
    <div className="flex flex-col h-screen bg-[#faf9f6] text-stone-900 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 shrink-0 bg-[#faf9f6]">
        <Link href="/" className="text-sm font-medium tracking-tight text-stone-700 hover:text-stone-900 transition-colors">
          ◈ Compass
        </Link>
        <div className="flex items-center gap-2">
          <button className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors">
            Search
          </button>
          <button className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors">
            Settings
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 min-h-0">{children}</main>

      {/* Bottom dock */}
      <div className="shrink-0 bg-[#faf9f6] border-t border-stone-200 px-4 pt-3 pb-2">
        <ChatBar placeholder={chatPlaceholder} onSend={onChatSend} />
        <NavTabs />
      </div>
    </div>
  )
}
