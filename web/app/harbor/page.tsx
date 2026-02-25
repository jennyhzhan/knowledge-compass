'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { AppShell } from '@/components/AppShell'
import { fetchHarbor, fetchHarborFile, HarborData, HarborFile } from '@/lib/api'

const CATEGORIES = ['concepts', 'frameworks', 'companies', 'people', 'skills'] as const
type Category = (typeof CATEGORIES)[number]

interface DetailFile {
  category: string
  filename: string
  name: string
  content: string
}

export default function HarborPage() {
  const [harbor, setHarbor] = useState<HarborData | null>(null)
  const [cat, setCat] = useState<Category>('concepts')
  const [detail, setDetail] = useState<DetailFile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHarbor()
      .then(({ harbor: h }) => setHarbor(h))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openFile = async (file: HarborFile) => {
    if (detail?.filename === file.filename) { setDetail(null); return }
    try {
      const data = await fetchHarborFile(file.category, file.filename)
      setDetail(data)
    } catch (e) { console.error(e) }
  }

  const files: HarborFile[] = harbor ? harbor[cat] ?? [] : []

  return (
    <AppShell chatPlaceholder="Search harbor…">
      <div className="flex flex-col h-full">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-stone-200 shrink-0 bg-stone-50/60">
          {CATEGORIES.map((c) => {
            const count = harbor?.[c]?.length ?? 0
            return (
              <button
                key={c}
                onClick={() => { setCat(c); setDetail(null) }}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                  cat === c
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'
                }`}
              >
                {c}
                {count > 0 && (
                  <span className={`ml-1.5 ${cat === c ? 'text-stone-300' : 'text-stone-300'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          <div className={`overflow-y-auto p-5 ${detail ? 'w-72 shrink-0 border-r border-stone-200' : 'flex-1'}`}>
            {loading ? (
              <p className="text-stone-400 text-sm">Loading…</p>
            ) : files.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-stone-400 text-sm capitalize">No files in {cat} yet.</p>
              </div>
            ) : (
              <div className={!detail ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}>
                {files.map((f) => (
                  <button
                    key={f.filename}
                    onClick={() => openFile(f)}
                    className={`w-full text-left p-4 bg-white border rounded-xl hover:border-stone-300 hover:shadow-sm transition-all ${
                      detail?.filename === f.filename ? 'border-stone-400 shadow-sm' : 'border-stone-200'
                    }`}
                  >
                    <p className="text-sm font-medium text-stone-700 mb-1">{f.name}</p>
                    {f.description && (
                      <p className="text-xs text-stone-400 line-clamp-2">{f.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {detail && (
            <div className="flex-1 overflow-y-auto p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-base font-medium text-stone-800">{detail.name}</h2>
                  <p className="text-xs text-stone-400 mt-1 capitalize">{detail.category}</p>
                </div>
                <button onClick={() => setDetail(null)} className="text-stone-300 hover:text-stone-500 text-sm">✕</button>
              </div>
              <div className="prose prose-stone prose-sm max-w-none">
                <ReactMarkdown>{detail.content ?? ''}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
