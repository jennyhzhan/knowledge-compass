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
    <div className="flex flex-wrap justify-center gap-1.5 pt-2 pb-1">
      {TABS.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
        return (
          <Link key={tab.href} href={tab.href}>
            <button
              className={`
                h-7 px-3 rounded-lg text-xs border transition-all active:scale-[0.995]
                ${active
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100 hover:text-stone-700 hover:border-stone-300'}
              `}
            >
              {tab.label}
            </button>
          </Link>
        )
      })}
    </div>
  )
}
