'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { FocusCard } from '@/components/FocusCard'
import { fetchToday, fetchUserConfig, TodayData } from '@/lib/api'

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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchToday(), fetchUserConfig()])
      .then(([todayData, userConfig]) => {
        setToday(todayData)
        setName(userConfig.name || 'there')
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell chatPlaceholder="Ask Compass...">
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-16">
          {/* Greeting */}
          <div className="text-center mb-14">
            {loading ? (
              <p className="text-zinc-600 text-lg animate-pulse">Loading…</p>
            ) : error ? (
              <div className="text-zinc-500 text-sm space-y-1">
                <p>Could not reach the Compass server.</p>
                <p className="text-zinc-700 text-xs font-mono">
                  cd server &amp;&amp; uvicorn main:app --reload
                </p>
              </div>
            ) : (
              <p className="text-zinc-300 text-xl font-light tracking-wide">{greeting(name)}</p>
            )}
          </div>

          {/* Focus cards */}
          {!loading && !error && today && (
            <div className="grid grid-cols-2 gap-4">
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
    </AppShell>
  )
}
