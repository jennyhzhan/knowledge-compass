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
      .then(([t, { cards: c }]) => { setToday(t); setCards(c) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell chatPlaceholder="@navigation  @insight  @fleeting…">
      <div className="flex h-full min-h-0">
        {/* Left: Today's Sounding */}
        <div className="flex-1 overflow-y-auto p-7 border-r border-stone-200">
          <div className="mb-5">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Today&apos;s Sounding</p>
            {today && <p className="text-xs text-stone-300 mt-1">{today.date}</p>}
          </div>

          {loading ? (
            <p className="text-stone-400 text-sm">Loading…</p>
          ) : today?.sounding ? (
            <div className="prose prose-stone prose-sm max-w-none">
              <ReactMarkdown>{today.sounding}</ReactMarkdown>
            </div>
          ) : (
            <div className="border border-stone-200 rounded-xl p-6 text-center bg-white">
              <p className="text-stone-400 text-sm">No sounding for today.</p>
              <p className="text-stone-300 text-xs mt-2">
                Run <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-500">@navigation</code> in Claude Code.
              </p>
            </div>
          )}
        </div>

        {/* Right: Today's Cards */}
        <div className="w-72 shrink-0 flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-stone-200 shrink-0 bg-stone-50/60">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Today&apos;s Cards</p>
            {!loading && <p className="text-xs text-stone-300 mt-1">{cards.length} cards</p>}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <p className="p-2 text-stone-400 text-sm">Loading…</p>
            ) : cards.length === 0 ? (
              <div className="border border-stone-200 rounded-xl p-4 text-center bg-white">
                <p className="text-stone-400 text-sm">No cards today.</p>
              </div>
            ) : (
              cards.map((card) => (
                <button
                  key={card.filename}
                  onClick={() => setDetail(detail?.filename === card.filename ? null : card)}
                  className={`w-full text-left p-3 bg-white border rounded-xl hover:border-stone-300 hover:shadow-sm transition-all ${
                    detail?.filename === card.filename ? 'border-stone-400 shadow-sm' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-stone-700 truncate">{card.name}</span>
                    <span className={`text-xs px-1 py-0.5 rounded shrink-0 font-medium ${
                      card.type === 'insights' ? 'bg-stone-100 text-stone-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      {card.type === 'insights' ? 'I' : 'F'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{card.preview}</p>
                </button>
              ))
            )}
          </div>

          {detail && (
            <div className="border-t border-stone-200 p-4 overflow-y-auto max-h-64 bg-stone-50/60">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-stone-700">{detail.name}</p>
                <button onClick={() => setDetail(null)} className="text-stone-300 hover:text-stone-500 text-xs ml-2 shrink-0">✕</button>
              </div>
              <div className="prose prose-stone prose-xs max-w-none">
                <ReactMarkdown>{detail.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
