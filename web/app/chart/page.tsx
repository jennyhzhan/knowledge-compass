'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { AppShell } from '@/components/AppShell'
import { fetchCharts, Chart } from '@/lib/api'

export default function ChartPage() {
  const [charts, setCharts] = useState<Chart[]>([])
  const [selected, setSelected] = useState<Chart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharts()
      .then(({ charts: data }) => {
        setCharts(data)
        if (data.length > 0) setSelected(data[0])
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell chatPlaceholder="Ask about sounding content…">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-52 border-r border-stone-200 overflow-y-auto shrink-0 flex flex-col bg-stone-50/60">
          <div className="px-4 py-3 border-b border-stone-200 shrink-0">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">
              Daily Soundings
            </p>
          </div>

          {loading && <p className="p-4 text-stone-400 text-sm">Loading…</p>}
          {error && <p className="p-4 text-red-400 text-xs">{error}</p>}
          {!loading && !error && charts.length === 0 && (
            <p className="p-4 text-stone-400 text-sm">No soundings yet.</p>
          )}

          <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
            {charts.map((c) => (
              <button
                key={c.date}
                onClick={() => setSelected(c)}
                className={`w-full px-4 py-3 text-left hover:bg-stone-100 transition-colors ${
                  selected?.date === c.date
                    ? 'bg-white border-l-2 border-stone-700 pl-[14px]'
                    : ''
                }`}
              >
                <p className="text-sm text-stone-700 font-medium">{c.date}</p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{c.preview.slice(0, 50)}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {selected ? (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-medium text-stone-800">{selected.date}</h1>
                <p className="text-xs text-stone-400 mt-1">Daily Sounding</p>
              </div>
              <div className="prose prose-stone prose-sm max-w-none">
                <ReactMarkdown>{selected.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            !loading && (
              <div className="h-full flex items-center justify-center">
                <p className="text-stone-300">Select a sounding to view</p>
              </div>
            )
          )}
        </div>
      </div>
    </AppShell>
  )
}
