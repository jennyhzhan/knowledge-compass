'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchToday, fetchUserConfig, updateTodayField, generateNavigation, TodayData } from '@/lib/api'
import { FocusCard } from '@/components/FocusCard'

const NAVIGATION_TRIGGER = 'Focus confirmed. Start and check chart/sounding today'

const TABS = [
  { label: 'Focus', href: '/', description: 'Your daily starting point' },
  { label: 'Chart', href: '/chart', description: 'News updated about today\'s focus' },
  { label: 'Logbook', href: '/logbook', description: 'Discuss insight and deal with noise' },
  { label: 'Harbor', href: '/harbor', description: 'Your knowledge repository' },
  { label: 'Navigation', href: '/navigation', description: 'Summary of Today\'s work' },
  { label: 'Template', href: '/template', description: 'Structure your thoughts' },
]

function greeting(name: string): string {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return `Good morning, ${name}. Any new discoveries today?`
  if (h >= 12 && h < 18) return `Good afternoon, ${name}. What are you exploring today?`
  if (h >= 18) return `Good evening, ${name}. Any changes to today's goals?`
  return `Great to see you again, ${name}.`
}

export default function FocusPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [name, setName] = useState('there')
  const [today, setToday] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [vaultName, setVaultName] = useState('')
  const [vaultExists, setVaultExists] = useState(false)

  useEffect(() => {
    Promise.all([fetchToday(), fetchUserConfig()])
      .then(([todayData, userConfig]) => {
        setToday(todayData)
        setName(userConfig.name || 'there')
        setVaultName(userConfig.vault_name || '')
        setVaultExists(userConfig.vault_exists || false)
        // Pre-fill only if today's navigation hasn't started yet
        if (!todayData.sounding_exists) {
          setMessage(NAVIGATION_TRIGGER)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6] text-stone-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 pt-8 shrink-0">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-lg font-medium tracking-tight text-stone-700 hover:text-stone-900 transition-colors"
          >
            ◈&nbsp;&nbsp;Compass
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                {TABS.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col px-4 py-2.5 hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-sm text-stone-800">{tab.label}</span>
                    <span className="text-xs text-stone-400 mt-0.5">{tab.description}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
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
                  className={`w-full bg-transparent placeholder-stone-400 outline-none text-sm resize-none min-h-[2.5rem] max-h-36 leading-relaxed px-1.5 pt-1 ${message === NAVIGATION_TRIGGER ? 'text-blue-600' : 'text-stone-900'}`}
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const t = e.currentTarget
                    t.style.height = 'auto'
                    t.style.height = `${t.scrollHeight}px`
                  }}
                />
                {/* Bottom bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button className="h-8 w-8 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors flex items-center justify-center text-lg leading-none">
                      +
                    </button>
                    <button
                      title={vaultExists ? vaultName : 'Vault not connected'}
                      className="h-8 px-2 rounded-lg flex items-center gap-1.5 hover:bg-stone-100 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={vaultExists ? 'text-green-500' : 'text-stone-400'}>
                        <path d="M1.5 4.5A1 1 0 012.5 3.5h2.086a1 1 0 01.707.293l.914.914H11.5a1 1 0 011 1V10.5a1 1 0 01-1 1h-9a1 1 0 01-1-1V4.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                      </svg>
                      {vaultExists && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                          <span className="text-xs text-green-600 max-w-[100px] truncate">{vaultName}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <button
                    disabled={!message.trim() || sending}
                    onClick={async () => {
                      setSending(true)
                      try {
                        await generateNavigation()
                        router.push('/chart')
                      } finally {
                        setSending(false)
                      }
                    }}
                    className="h-8 px-4 rounded-lg text-xs font-medium bg-stone-900 text-white disabled:opacity-30 hover:bg-stone-700 transition-colors"
                  >
                    {sending ? '…' : 'Send'}
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation pills — like Claude's quick-action buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              {TABS.map((tab) => (
                <Link key={tab.href} href={tab.href} className="relative group">
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
                  <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white bg-stone-700 rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                    {tab.description}
                  </span>
                </Link>
              ))}
            </div>

            {/* Focus cards */}
            {!loading && today && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <FocusCard
                  title="Long-term Focus"
                  content={today.task}
                  onSave={async (v) => {
                    await updateTodayField('task', v)
                    setToday((prev) => prev ? { ...prev, task: v } : prev)
                  }}
                />
                <FocusCard
                  title="Today's Focus"
                  content={today.focus}
                  onSave={async (v) => {
                    await updateTodayField('focus', v)
                    setToday((prev) => prev ? { ...prev, focus: v } : prev)
                  }}
                />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
