import fs from 'node:fs/promises'

const must = (name) => {
  const v = String(process.env[name] || '').trim()
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

const supabaseUrl = must('SUPABASE_URL')
const serviceKey = must('SUPABASE_SERVICE_ROLE_KEY')

const rest = async (path, init = {}) => {
  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(data?.message || data?.error || `REST ${res.status}`)
  return data
}

const readJson = async (rel) => {
  const buf = await fs.readFile(new URL(rel, import.meta.url), 'utf-8')
  return JSON.parse(buf)
}

const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v || '').trim())

const toBookRow = (v) => ({
  id: isUuid(v.id) ? v.id : undefined,
  title: v.title || null,
  author: v.author || null,
  country: v.country || null,
  language: v.language || null,
  description: v.description || null,
  cover: v.cover || null,
  status: v.status === 'read' ? 'read' : 'unread',
})

const toExhibitionRow = (v) => ({
  id: isUuid(v.id) ? v.id : undefined,
  title: v.title || null,
  region: v.region === 'domestic' ? 'domestic' : 'international',
  country: v.country || null,
  city: v.city || null,
  date: v.date || null,
  description: v.description || null,
  cover: v.cover || null,
  status: v.status === 'seen' ? 'seen' : 'unseen',
})

const main = async () => {
  const books = await readJson('../content/books.json')
  const exhibitions = await readJson('../content/exhibitions.json')

  const bookRows = Array.isArray(books) ? books.map(toBookRow).filter(r => r.title) : []
  const exhibitionRows = Array.isArray(exhibitions) ? exhibitions.map(toExhibitionRow).filter(r => r.title) : []

  if (bookRows.length) {
    await rest('/books?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(bookRows),
    })
  }

  if (exhibitionRows.length) {
    await rest('/exhibitions?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(exhibitionRows),
    })
  }

  console.log(`Seeded: books=${bookRows.length} exhibitions=${exhibitionRows.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
