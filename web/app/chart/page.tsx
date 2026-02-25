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
        <aside className="w-56 border-r border-zinc-800 overflow-y-auto shrink-0 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Daily Soundings
            </p>
          </div>

          {loading && <p className="p-4 text-zinc-600 text-sm">Loading…</p>}
          {error && <p className="p-4 text-red-500 text-xs">{error}</p>}
          {!loading && !error && charts.length === 0 && (
            <p className="p-4 text-zinc-600 text-sm">No soundings yet.</p>
          )}

          <div className="overflow-y-auto flex-1 divide-y divide-zinc-800/40">
            {charts.map((c) => (
              <button
                key={c.date}
                onClick={() => setSelected(c)}
                className={`w-full px-4 py-3 text-left hover:bg-zinc-900 transition-colors ${
                  selected?.date === c.date ? 'bg-zinc-900 border-l-2 border-blue-500 pl-[14px]' : ''
                }`}
              >
                <p className="text-sm text-zinc-300">{c.date}</p>
                <p className="text-xs text-zinc-600 mt-0.5 truncate">{c.preview.slice(0, 50)}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {selected ? (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-medium text-zinc-200">{selected.date}</h1>
                <p className="text-xs text-zinc-600 mt-1">Daily Sounding</p>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{selected.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            !loading && (
              <div className="h-full flex items-center justify-center">
                <p className="text-zinc-700">Select a sounding to view</p>
              </div>
            )
          )}
        </div>
      </div>
    </AppShell>
  )
}
