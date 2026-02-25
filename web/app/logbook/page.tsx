'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { AppShell } from '@/components/AppShell'
import { fetchCards, fetchCardDates, Card } from '@/lib/api'

const TYPE_LABELS: Record<string, string> = { all: 'All', insights: 'Insight', fleeting: 'Fleeting' }

export default function LogbookPage() {
  const [dates, setDates] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [cards, setCards] = useState<Card[]>([])
  const [detail, setDetail] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [cardLoading, setCardLoading] = useState(false)

  // Load available dates once
  useEffect(() => {
    fetchCardDates()
      .then(({ dates: d }) => {
        setDates(d)
        if (d.length > 0) setDate(d[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Reload cards when date or type changes
  useEffect(() => {
    if (!date) return
    setCardLoading(true)
    setDetail(null)
    const type = typeFilter !== 'all' ? typeFilter : undefined
    fetchCards(date, type)
      .then(({ cards: c }) => setCards(c))
      .catch(console.error)
      .finally(() => setCardLoading(false))
  }, [date, typeFilter])

  return (
    <AppShell chatPlaceholder="Find cards about…">
      <div className="flex flex-col h-full">
        {/* Filter bar */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-zinc-800 shrink-0">
          <div className="flex gap-1">
            {['all', 'insights', 'fleeting'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  typeFilter === t
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <span className="w-px h-4 bg-zinc-800" />

          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded px-3 py-1.5 outline-none"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {dates.length === 0 && !loading && (
            <span className="text-zinc-600 text-xs">No cards found in logbook.</span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Card grid / list */}
          <div
            className={`overflow-y-auto ${
              detail ? 'w-72 shrink-0 border-r border-zinc-800' : 'flex-1'
            }`}
          >
            {cardLoading ? (
              <p className="p-5 text-zinc-600 text-sm">Loading…</p>
            ) : cards.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-zinc-600 text-sm">No cards for {date}.</p>
              </div>
            ) : (
              <div
                className={`p-4 ${
                  !detail ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'
                }`}
              >
                {cards.map((card) => (
                  <button
                    key={`${card.date}-${card.filename}`}
                    onClick={() =>
                      setDetail(detail?.filename === card.filename ? null : card)
                    }
                    className={`w-full text-left p-4 bg-zinc-900 border rounded-lg hover:border-zinc-600 transition-colors ${
                      detail?.filename === card.filename
                        ? 'border-blue-500/40'
                        : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <p className="flex-1 text-sm font-medium text-zinc-200 line-clamp-2">
                        {card.name}
                      </p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                          card.type === 'insights'
                            ? 'bg-blue-900/40 text-blue-300'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {card.type === 'insights' ? 'I' : 'F'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                      {card.preview}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {detail && (
            <div className="flex-1 overflow-y-auto p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-base font-medium text-zinc-200">{detail.name}</h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    {detail.date} &middot; {detail.type}
                  </p>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="text-zinc-600 hover:text-zinc-400 text-sm leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{detail.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
