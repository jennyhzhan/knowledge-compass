'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { AppShell } from '@/components/AppShell'
import { fetchTemplates, Template } from '@/lib/api'

export default function TemplatePage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selected, setSelected] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
      .then(({ templates: t }) => {
        setTemplates(t)
        if (t.length > 0) setSelected(t[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell chatPlaceholder="Ask about templates…">
      <div className="flex h-full">
        {/* Template list */}
        <aside className="w-52 border-r border-zinc-800 overflow-y-auto shrink-0">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Templates
            </p>
          </div>

          {loading && <p className="p-4 text-zinc-600 text-sm">Loading…</p>}
          {!loading && templates.length === 0 && (
            <p className="p-4 text-zinc-600 text-sm">No templates found.</p>
          )}

          <div className="divide-y divide-zinc-800/40">
            {templates.map((t) => (
              <button
                key={t.filename}
                onClick={() => setSelected(t)}
                className={`w-full px-4 py-3 text-left hover:bg-zinc-900 transition-colors ${
                  selected?.filename === t.filename
                    ? 'bg-zinc-900 border-l-2 border-blue-500 pl-[14px]'
                    : ''
                }`}
              >
                <p className="text-sm text-zinc-300">{t.name}</p>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {selected ? (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-medium text-zinc-200">{selected.name}</h1>
                <p className="text-xs text-zinc-600 mt-1 font-mono">{selected.filename}</p>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{selected.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            !loading && (
              <div className="h-full flex items-center justify-center">
                <p className="text-zinc-700">Select a template to preview</p>
              </div>
            )
          )}
        </div>
      </div>
    </AppShell>
  )
}
