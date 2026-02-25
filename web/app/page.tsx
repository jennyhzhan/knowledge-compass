'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchToday, fetchUserConfig, TodayData } from '@/lib/api'
import { FocusCard } from '@/components/FocusCard'

const TABS = [
  { label: 'Focus', href: '/' },
  { label: 'Chart', href: '/chart' },
  { label: 'Logbook', href: '/logbook' },
  { label: 'Harbor', href: '/harbor' },
  { label: 'Navigation', href: '/navigation' },
  { label: 'Template', href: '/template' },
]

function greeting(name: string): string {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return `Good morning, ${name}. Any new discoveries today?`
  if (h >= 12 && h < 18) return `Good afternoon, ${name}. What are you exploring today?`
  if (h >= 18) return `Good evening, ${name}. Any changes to today's goals?`
  return `Great to see you again, ${name}.`
}

export default function FocusPage() {
  const [name, setName] = useState('there')
  const [today, setToday] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([fetchToday(), fetchUserConfig()])
      .then(([todayData, userConfig]) => {
        setToday(todayData)
        setName(userConfig.name || 'there')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6] text-stone-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 shrink-0">
        <span className="text-sm font-medium tracking-tight text-stone-700">◈ Compass</span>
        <div className="flex items-center gap-2">
          <button className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors">
            Search
          </button>
          <button className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors">
            Settings
          </button>
        </div>
      </header>

      {/* Main — vertically centered content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center py-10 px-4">
          <div className="w-full max-w-[680px] flex flex-col gap-5">

            {/* Greeting */}
            <div className="text-center pb-1">
              {loading ? (
                <p className="text-stone-400 text-lg">Loading…</p>
              ) : (
                <p className="text-stone-600 text-[1.35rem] font-light leading-snug">
                  {greeting(name)}
                </p>
              )}
            </div>

            {/* Claude-style input box */}
            <div className="input-box bg-white rounded-[20px] border border-transparent cursor-text">
              <div className="flex flex-col mx-3.5 mt-3.5 mb-2.5 gap-3">
                {/* Text area */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                  }}
                  placeholder="Ask Compass…"
                  rows={1}
                  className="w-full bg-transparent text-stone-900 placeholder-stone-400 outline-none text-sm resize-none min-h-[2.5rem] max-h-36 leading-relaxed px-1.5 pt-1"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const t = e.currentTarget
                    t.style.height = 'auto'
                    t.style.height = `${t.scrollHeight}px`
                  }}
                />
                {/* Bottom bar */}
                <div className="flex items-center justify-between">
                  <button className="h-8 w-8 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors flex items-center justify-center text-lg leading-none">
                    +
                  </button>
                  <button
                    disabled={!message.trim()}
                    className="h-8 px-4 rounded-lg text-xs font-medium bg-stone-900 text-white disabled:opacity-30 hover:bg-stone-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation pills — like Claude's quick-action buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              {TABS.map((tab) => (
                <Link key={tab.href} href={tab.href}>
                  <button
                    className={`
                      h-8 px-3 rounded-lg text-sm border transition-all active:scale-[0.995]
                      ${tab.href === '/'
                        ? 'bg-stone-800 text-white border-stone-800'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-800 hover:border-stone-300'}
                    `}
                  >
                    {tab.label}
                  </button>
                </Link>
              ))}
            </div>

            {/* Focus cards */}
            {!loading && today && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <FocusCard title="Long-term Focus" content={today.task} />
                <FocusCard
                  title="Today's Focus"
                  content={today.focus}
                  onAdd={() => {}}
                  onEdit={() => {}}
                />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
