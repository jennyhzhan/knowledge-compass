const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(err || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(err || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ---------- Types ----------

export interface UserConfig {
  name: string
  version: string
}

export interface TodayData {
  date: string
  task: string
  focus: string
  note: string
  sounding: string | null
  sounding_exists: boolean
  course_exists: boolean
  cards: { insights: string[]; fleeting: string[] }
}

export interface Card {
  name: string
  filename: string
  type: string
  date: string
  content: string
  preview: string
}

export interface Chart {
  date: string
  filename: string
  content: string
  preview: string
}

export interface Course {
  date: string
  filename: string
  task: string
  focus: string
  summary: string
  next: string
}

export interface HarborFile {
  name: string
  filename: string
  category: string
  description: string
  preview: string
}

export interface HarborData {
  concepts: HarborFile[]
  frameworks: HarborFile[]
  companies: HarborFile[]
  people: HarborFile[]
  skills: HarborFile[]
}

export interface Template {
  name: string
  filename: string
  content: string
  preview: string
}

// ---------- API calls ----------

export const fetchUserConfig = () => get<UserConfig>('/config/user')
export const fetchToday = () => get<TodayData>('/today')
export const fetchCardDates = () => get<{ dates: string[] }>('/cards/dates')
export const fetchCards = (date?: string, type?: string) => {
  const params = new URLSearchParams()
  if (date) params.set('date', date)
  if (type) params.set('type', type)
  const qs = params.toString()
  return get<{ date: string; cards: Card[] }>(`/cards${qs ? `?${qs}` : ''}`)
}
export const fetchCharts = () => get<{ charts: Chart[] }>('/charts')
export const fetchChart = (date: string) => get<{ date: string; content: string }>(`/charts/${date}`)
export const fetchCourses = () => get<{ courses: Course[] }>('/courses')
export const fetchCourse = (date: string) => get<Course & { content: string; note: string }>(`/courses/${date}`)
export const fetchHarbor = () => get<{ harbor: HarborData }>('/harbor')
export const fetchHarborFile = (category: string, filename: string) =>
  get<{ category: string; filename: string; name: string; content: string }>(
    `/harbor/${category}/${filename}`
  )
export const fetchTemplates = () => get<{ templates: Template[] }>('/templates')
export const createFleetingCard = (title: string, content: string, tags?: string[]) =>
  post<{ path: string; message: string }>('/cards/fleeting', { title, content, tags })
