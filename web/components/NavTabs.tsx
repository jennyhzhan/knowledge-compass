'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Focus', href: '/', description: 'Your daily starting point' },
  { label: 'Chart', href: '/chart', description: 'News updated about today\'s focus' },
  { label: 'Logbook', href: '/logbook', description: 'Discuss insight and deal with noise' },
  { label: 'Harbor', href: '/harbor', description: 'Your knowledge repository' },
  { label: 'Navigation', href: '/navigation', description: 'Summary of Today\'s work' },
  { label: 'Template', href: '/template', description: 'Structure your thoughts' },
]

export function NavTabs() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap justify-center gap-1.5 pt-2 pb-1">
      {TABS.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
        return (
          <Link key={tab.href} href={tab.href} className="relative group">
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
            <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white bg-stone-700 rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
              {tab.description}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
