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

  useEffect(() => {
    fetchCardDates()
      .then(({ dates: d }) => {
        setDates(d)
        if (d.length > 0) setDate(d[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
        <div className="flex items-center gap-3 px-5 py-3 border-b border-stone-200 shrink-0 bg-stone-50/60">
          <div className="flex gap-1">
            {['all', 'insights', 'fleeting'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  typeFilter === t
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <span className="w-px h-4 bg-stone-200" />
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white border border-stone-200 text-stone-700 text-xs rounded-lg px-3 py-1.5 outline-none hover:border-stone-300"
          >
            {dates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {dates.length === 0 && !loading && (
            <span className="text-stone-400 text-xs">No cards in logbook.</span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Card grid */}
          <div className={`overflow-y-auto ${detail ? 'w-72 shrink-0 border-r border-stone-200' : 'flex-1'}`}>
            {cardLoading ? (
              <p className="p-5 text-stone-400 text-sm">Loading…</p>
            ) : cards.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-stone-400 text-sm">No cards for {date}.</p>
              </div>
            ) : (
              <div className={`p-4 ${!detail ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}`}>
                {cards.map((card) => (
                  <button
                    key={`${card.date}-${card.filename}`}
                    onClick={() => setDetail(detail?.filename === card.filename ? null : card)}
                    className={`w-full text-left p-4 bg-white border rounded-xl hover:border-stone-300 hover:shadow-sm transition-all ${
                      detail?.filename === card.filename ? 'border-stone-400 shadow-sm' : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <p className="flex-1 text-sm font-medium text-stone-700 line-clamp-2">{card.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 font-medium ${
                        card.type === 'insights'
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {card.type === 'insights' ? 'I' : 'F'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">{card.preview}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          {detail && (
            <div className="flex-1 overflow-y-auto p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-base font-medium text-stone-800">{detail.name}</h2>
                  <p className="text-xs text-stone-400 mt-1">{detail.date} · {detail.type}</p>
                </div>
                <button onClick={() => setDetail(null)} className="text-stone-300 hover:text-stone-500 text-sm">✕</button>
              </div>
              <div className="prose prose-stone prose-sm max-w-none">
                <ReactMarkdown>{detail.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
