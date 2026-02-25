'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Focus', href: '/' },
  { label: 'Chart', href: '/chart' },
  { label: 'Logbook', href: '/logbook' },
  { label: 'Harbor', href: '/harbor' },
  { label: 'Navigation', href: '/navigation' },
  { label: 'Template', href: '/template' },
]

export function NavTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 px-3 py-2">
      {TABS.map((tab) => {
        const active =
          tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center py-1.5 px-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              active
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
