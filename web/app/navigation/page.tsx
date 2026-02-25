'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { AppShell } from '@/components/AppShell'
import { fetchToday, fetchCards, TodayData, Card } from '@/lib/api'

export default function NavigationPage() {
  const [today, setToday] = useState<TodayData | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [detail, setDetail] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchToday(), fetchCards()])
      .then(([t, { cards: c }]) => {
        setToday(t)
        setCards(c)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell chatPlaceholder="@navigation  @insight  @fleeting…">
      <div className="flex h-full min-h-0 gap-0">
        {/* Left: Today's Sounding */}
        <div className="flex-1 overflow-y-auto p-7 border-r border-zinc-800">
          <div className="mb-5">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Today&apos;s Sounding
            </p>
            {today && <p className="text-xs text-zinc-700 mt-1">{today.date}</p>}
          </div>

          {loading ? (
            <p className="text-zinc-600 text-sm">Loading…</p>
          ) : today?.sounding ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{today.sounding}</ReactMarkdown>
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-lg p-6 text-center">
              <p className="text-zinc-600 text-sm">No sounding for today.</p>
              <p className="text-zinc-700 text-xs mt-2">
                Run{' '}
                <code className="bg-zinc-800 px-1.5 py-0.5 rounded font-mono">@navigation</code>{' '}
                in Claude Code to generate one.
              </p>
            </div>
          )}
        </div>

        {/* Right: Today's Cards */}
        <div className="w-72 shrink-0 flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-zinc-800 shrink-0">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Today&apos;s Cards
            </p>
            {!loading && (
              <p className="text-xs text-zinc-700 mt-1">{cards.length} cards</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <p className="p-2 text-zinc-600 text-sm">Loading…</p>
            ) : cards.length === 0 ? (
              <div className="border border-zinc-800 rounded-lg p-4 text-center">
                <p className="text-zinc-600 text-sm">No cards today.</p>
              </div>
            ) : (
              cards.map((card) => (
                <button
                  key={card.filename}
                  onClick={() =>
                    setDetail(detail?.filename === card.filename ? null : card)
                  }
                  className={`w-full text-left p-3 bg-zinc-900 border rounded-lg hover:border-zinc-600 transition-colors ${
                    detail?.filename === card.filename
                      ? 'border-blue-500/40'
                      : 'border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-300 truncate">
                      {card.name}
                    </span>
                    <span
                      className={`text-xs px-1 py-0.5 rounded shrink-0 ${
                        card.type === 'insights'
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {card.type === 'insights' ? 'I' : 'F'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {card.preview}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Inline detail */}
          {detail && (
            <div className="border-t border-zinc-800 p-4 overflow-y-auto max-h-64">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-zinc-300">{detail.name}</p>
                <button
                  onClick={() => setDetail(null)}
                  className="text-zinc-600 hover:text-zinc-400 text-xs ml-2 shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="prose prose-invert prose-xs max-w-none text-zinc-400">
                <ReactMarkdown>{detail.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
