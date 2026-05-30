<template>
  <main class="min-h-[100svh] w-full relative z-10 px-6 sm:px-10 py-10">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-end justify-between gap-6">
        <div class="min-w-0">
          <div class="text-xs uppercase tracking-[0.28em] opacity-45">Rubato</div>
          <h1 class="mt-3 font-editorial text-4xl tracking-tight text-[#2b2623]">Archive Room</h1>
          <div class="mt-2 text-xs uppercase tracking-[0.26em] opacity-40">Admin</div>
        </div>

        <div class="flex items-center gap-4">
          <div v-if="session" class="text-xs font-mono uppercase tracking-[0.22em] opacity-50">
            {{ session.email }}
          </div>
          <button v-if="session" class="admin-link" type="button" @click="signOut">
            Sign out
          </button>
        </div>
      </div>

      <div class="mt-8">
        <div v-if="!isConfigured" class="admin-panel p-6">
          <div class="text-xs uppercase tracking-[0.28em] opacity-45">Missing Config</div>
          <div class="mt-3 text-sm opacity-70 leading-relaxed">
            VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_ADMIN_EMAILS
          </div>
        </div>

        <div v-else-if="!session" class="admin-panel p-6">
          <div class="text-xs uppercase tracking-[0.28em] opacity-45">Sign in</div>
          <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="admin-field">
              <div class="admin-label">Email</div>
              <input v-model="email" class="admin-input" type="email" autocomplete="username" />
            </label>
            <label class="admin-field">
              <div class="admin-label">Password</div>
              <input v-model="password" class="admin-input" type="password" autocomplete="current-password" />
            </label>
          </div>
          <div class="mt-6 flex items-center justify-between gap-4">
            <div class="text-xs uppercase tracking-[0.26em] opacity-45">{{ authHint }}</div>
            <button class="admin-primary" type="button" :disabled="isAuthBusy" @click="signIn">
              {{ isAuthBusy ? '...' : 'Enter' }}
            </button>
          </div>
        </div>

        <div v-else class="mt-6">
          <div class="admin-tabs">
            <button class="admin-tab" :class="activeTab === 'dashboard' ? 'is-active' : ''" @click="activeTab = 'dashboard'">
              Dashboard
            </button>
            <button class="admin-tab" :class="activeTab === 'books' ? 'is-active' : ''" @click="activeTab = 'books'">
              Books
            </button>
            <button class="admin-tab" :class="activeTab === 'exhibitions' ? 'is-active' : ''" @click="activeTab = 'exhibitions'">
              Exhibitions
            </button>
            <button class="admin-tab" :class="activeTab === 'settings' ? 'is-active' : ''" @click="activeTab = 'settings'">
              Settings
            </button>
          </div>

          <div class="mt-6">
            <section v-if="activeTab === 'dashboard'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="admin-card">
                <div class="admin-card-k">Books</div>
                <div class="admin-card-v">{{ stats.booksTotal }}</div>
              </div>
              <div class="admin-card">
                <div class="admin-card-k">Read</div>
                <div class="admin-card-v">{{ stats.booksRead }}</div>
              </div>
              <div class="admin-card">
                <div class="admin-card-k">Unread</div>
                <div class="admin-card-v">{{ stats.booksUnread }}</div>
              </div>
              <div class="admin-card">
                <div class="admin-card-k">Exhibitions</div>
                <div class="admin-card-v">{{ stats.exhibitionsTotal }}</div>
              </div>
              <div class="admin-card">
                <div class="admin-card-k">Seen</div>
                <div class="admin-card-v">{{ stats.exhibitionsSeen }}</div>
              </div>
              <div class="admin-card">
                <div class="admin-card-k">Unseen</div>
                <div class="admin-card-v">{{ stats.exhibitionsUnseen }}</div>
              </div>
            </section>

            <section v-else-if="activeTab === 'books'" class="admin-panel p-6">
              <div class="flex items-end justify-between gap-6">
                <div class="min-w-0">
                  <div class="text-xs uppercase tracking-[0.28em] opacity-45">Books</div>
                  <div class="mt-2 text-sm opacity-70">Create, edit, delete, update status, set cover URL.</div>
                </div>
                <button class="admin-primary" type="button" :disabled="isBusy" @click="createBook">
                  New
                </button>
              </div>

              <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="admin-list">
                  <button
                    v-for="b in books"
                    :key="b.id"
                    class="admin-list-item"
                    :class="selectedBook?.id === b.id ? 'is-active' : ''"
                    @click="selectBook(b.id)"
                  >
                    <div class="text-xs uppercase tracking-[0.26em] opacity-45">{{ b.status }}</div>
                    <div class="mt-1 font-editorial text-lg tracking-tight truncate">{{ b.title || 'Untitled' }}</div>
                    <div class="mt-1 text-xs opacity-55 truncate">{{ [b.author, b.language, b.country].filter(Boolean).join(' · ') || '—' }}</div>
                  </button>
                </div>

                <div class="admin-form">
                  <div v-if="!selectedBook" class="text-sm opacity-60">Select an item.</div>
                  <div v-else class="space-y-4">
                    <label class="admin-field">
                      <div class="admin-label">Title</div>
                      <input v-model="selectedBook.title" class="admin-input" type="text" />
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label class="admin-field">
                        <div class="admin-label">Author</div>
                        <input v-model="selectedBook.author" class="admin-input" type="text" />
                      </label>
                      <label class="admin-field">
                        <div class="admin-label">Language</div>
                        <input v-model="selectedBook.language" class="admin-input" type="text" />
                      </label>
                    </div>
                    <label class="admin-field">
                      <div class="admin-label">Country</div>
                      <input v-model="selectedBook.country" class="admin-input" type="text" />
                    </label>
                    <label class="admin-field">
                      <div class="admin-label">Description</div>
                      <textarea v-model="selectedBook.description" class="admin-input admin-textarea"></textarea>
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label class="admin-field">
                        <div class="admin-label">Status</div>
                        <select v-model="selectedBook.status" class="admin-input">
                          <option value="unread">unread</option>
                          <option value="read">read</option>
                        </select>
                      </label>
                      <label class="admin-field">
                        <div class="admin-label">Cover URL (OSS)</div>
                        <input v-model="selectedBook.cover" class="admin-input" type="url" />
                      </label>
                    </div>
                    <label class="admin-field">
                      <div class="admin-label">Upload Cover (OSS)</div>
                      <input class="admin-input" type="file" accept="image/*" @change="handleBookCoverFile" />
                    </label>

                    <div class="flex items-center justify-between gap-4 pt-2">
                      <button class="admin-link" type="button" :disabled="isBusy" @click="deleteBook(selectedBook.id)">
                        Delete
                      </button>
                      <button class="admin-primary" type="button" :disabled="isBusy" @click="saveBook(selectedBook)">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section v-else-if="activeTab === 'exhibitions'" class="admin-panel p-6">
              <div class="flex items-end justify-between gap-6">
                <div class="min-w-0">
                  <div class="text-xs uppercase tracking-[0.28em] opacity-45">Exhibitions</div>
                  <div class="mt-2 text-sm opacity-70">Create, edit, delete, update status, set cover URL.</div>
                </div>
                <button class="admin-primary" type="button" :disabled="isBusy" @click="createExhibition">
                  New
                </button>
              </div>

              <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="admin-list">
                  <button
                    v-for="e in exhibitions"
                    :key="e.id"
                    class="admin-list-item"
                    :class="selectedExhibition?.id === e.id ? 'is-active' : ''"
                    @click="selectExhibition(e.id)"
                  >
                    <div class="text-xs uppercase tracking-[0.26em] opacity-45">{{ e.status }} · {{ e.region }}</div>
                    <div class="mt-1 font-editorial text-lg tracking-tight truncate">{{ e.title || 'Untitled' }}</div>
                    <div class="mt-1 text-xs opacity-55 truncate">{{ [e.country, e.city, e.date].filter(Boolean).join(' · ') || '—' }}</div>
                  </button>
                </div>

                <div class="admin-form">
                  <div v-if="!selectedExhibition" class="text-sm opacity-60">Select an item.</div>
                  <div v-else class="space-y-4">
                    <label class="admin-field">
                      <div class="admin-label">Title</div>
                      <input v-model="selectedExhibition.title" class="admin-input" type="text" />
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label class="admin-field">
                        <div class="admin-label">Region</div>
                        <select v-model="selectedExhibition.region" class="admin-input">
                          <option value="domestic">domestic</option>
                          <option value="international">international</option>
                        </select>
                      </label>
                      <label class="admin-field">
                        <div class="admin-label">Status</div>
                        <select v-model="selectedExhibition.status" class="admin-input">
                          <option value="unseen">unseen</option>
                          <option value="seen">seen</option>
                        </select>
                      </label>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label class="admin-field">
                        <div class="admin-label">Country</div>
                        <input v-model="selectedExhibition.country" class="admin-input" type="text" />
                      </label>
                      <label class="admin-field">
                        <div class="admin-label">City</div>
                        <input v-model="selectedExhibition.city" class="admin-input" type="text" />
                      </label>
                    </div>
                    <label class="admin-field">
                      <div class="admin-label">Date</div>
                      <input v-model="selectedExhibition.date" class="admin-input" type="text" />
                    </label>
                    <label class="admin-field">
                      <div class="admin-label">Description</div>
                      <textarea v-model="selectedExhibition.description" class="admin-input admin-textarea"></textarea>
                    </label>
                    <label class="admin-field">
                      <div class="admin-label">Cover URL (OSS)</div>
                      <input v-model="selectedExhibition.cover" class="admin-input" type="url" />
                    </label>
                    <label class="admin-field">
                      <div class="admin-label">Upload Cover (OSS)</div>
                      <input class="admin-input" type="file" accept="image/*" @change="handleExhibitionCoverFile" />
                    </label>

                    <div class="flex items-center justify-between gap-4 pt-2">
                      <button class="admin-link" type="button" :disabled="isBusy" @click="deleteExhibition(selectedExhibition.id)">
                        Delete
                      </button>
                      <button class="admin-primary" type="button" :disabled="isBusy" @click="saveExhibition(selectedExhibition)">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section v-else class="admin-panel p-6">
              <div class="text-xs uppercase tracking-[0.28em] opacity-45">Settings</div>
              <div class="mt-3 text-sm opacity-70 leading-relaxed">
                Configure admin emails in VITE_ADMIN_EMAILS. Configure Supabase URL and anon key in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
              </div>
            </section>

            <div v-if="toast" class="admin-toast">
              {{ toast }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type AdminTab = 'dashboard' | 'books' | 'exhibitions' | 'settings'

type Session = {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  email: string
}

type BookRow = {
  id: string
  title: string | null
  author: string | null
  country: string | null
  language: string | null
  description: string | null
  cover: string | null
  status: 'read' | 'unread'
  created_at: string | null
}

type ExhibitionRow = {
  id: string
  title: string | null
  region: 'domestic' | 'international'
  country: string | null
  city: string | null
  date: string | null
  description: string | null
  cover: string | null
  status: 'seen' | 'unseen'
  created_at: string | null
}

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
const allowedEmails = String(import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean)

const isConfigured = computed(() => Boolean(supabaseUrl && supabaseAnonKey && allowedEmails.length))

const activeTab = ref<AdminTab>('dashboard')
const email = ref('')
const password = ref('')
const isAuthBusy = ref(false)
const isBusy = ref(false)
const toast = ref('')
let toastTimer: number | null = null

const session = ref<Session | null>(null)

const books = ref<BookRow[]>([])
const exhibitions = ref<ExhibitionRow[]>([])
const selectedBookId = ref<string | null>(null)
const selectedExhibitionId = ref<string | null>(null)

const selectedBook = computed(() => books.value.find(b => b.id === selectedBookId.value) ?? null)
const selectedExhibition = computed(() => exhibitions.value.find(e => e.id === selectedExhibitionId.value) ?? null)

const stats = ref({
  booksTotal: 0,
  booksRead: 0,
  booksUnread: 0,
  exhibitionsTotal: 0,
  exhibitionsSeen: 0,
  exhibitionsUnseen: 0,
})

const authHint = computed(() => {
  if (!allowedEmails.length) return 'No admin configured.'
  return `Allowed: ${allowedEmails.join(', ')}`
})

const setToast = (msg: string) => {
  toast.value = msg
  if (toastTimer !== null) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
    toastTimer = null
  }, 2200)
}

const authHeaders = () => {
  const s = session.value
  return {
    apikey: supabaseAnonKey,
    Authorization: s ? `Bearer ${s.access_token}` : '',
    'Content-Type': 'application/json',
  } as Record<string, string>
}

const supaAuthFetch = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${supabaseUrl}/auth/v1${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  const text = await res.text()
  const data = text ? (JSON.parse(text) as any) : null
  if (!res.ok) throw new Error(data?.error_description || data?.msg || `Auth error (${res.status})`)
  return data
}

const supaRestFetch = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  })

  const text = await res.text()
  const data = text ? (JSON.parse(text) as any) : null
  if (!res.ok) {
    const msg = data?.message || data?.error || `REST error (${res.status})`
    throw new Error(msg)
  }
  return { data, headers: res.headers }
}

const countTable = async (table: string, extraFilter: string) => {
  const query = `/${table}?select=id&limit=1${extraFilter ? `&${extraFilter}` : ''}`
  const { headers } = await supaRestFetch(query, { method: 'GET', headers: { Prefer: 'count=exact' } })
  const cr = headers.get('content-range') || ''
  const totalStr = cr.split('/')[1] || '0'
  const total = Number(totalStr)
  return Number.isFinite(total) ? total : 0
}

const refreshStats = async () => {
  stats.value = {
    booksTotal: await countTable('books', ''),
    booksRead: await countTable('books', 'status=eq.read'),
    booksUnread: await countTable('books', 'status=eq.unread'),
    exhibitionsTotal: await countTable('exhibitions', ''),
    exhibitionsSeen: await countTable('exhibitions', 'status=eq.seen'),
    exhibitionsUnseen: await countTable('exhibitions', 'status=eq.unseen'),
  }
}

const fetchBooks = async () => {
  const { data } = await supaRestFetch('/books?select=*&order=created_at.desc')
  books.value = Array.isArray(data) ? (data as BookRow[]) : []
}

const fetchExhibitions = async () => {
  const { data } = await supaRestFetch('/exhibitions?select=*&order=created_at.desc')
  exhibitions.value = Array.isArray(data) ? (data as ExhibitionRow[]) : []
}

const ensureAdmin = async (token: string) => {
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Auth error')
  const data = (await res.json()) as any
  const userEmail = String(data?.email || '').toLowerCase().trim()
  if (!allowedEmails.includes(userEmail)) throw new Error('Not allowed')
  return userEmail
}

const signIn = async () => {
  if (!isConfigured.value) return
  isAuthBusy.value = true
  try {
    const data = await supaAuthFetch('/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: email.value.trim(), password: password.value }),
    })
    const token = String(data?.access_token || '')
    const userEmail = await ensureAdmin(token)
    session.value = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      email: userEmail,
    }
    localStorage.setItem('rubato_admin_session', JSON.stringify(session.value))
    password.value = ''
    setToast('Welcome')
    await bootstrap()
  } catch (e: any) {
    session.value = null
    localStorage.removeItem('rubato_admin_session')
    setToast(e?.message || 'Sign-in failed')
  } finally {
    isAuthBusy.value = false
  }
}

const signOut = async () => {
  try {
    const s = session.value
    session.value = null
    localStorage.removeItem('rubato_admin_session')
    if (s?.access_token) {
      await fetch(`${supabaseUrl}/auth/v1/logout`, { method: 'POST', headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${s.access_token}` } })
    }
  } finally {
    setToast('Signed out')
  }
}

const bootstrap = async () => {
  if (!session.value) return
  isBusy.value = true
  try {
    await Promise.all([fetchBooks(), fetchExhibitions(), refreshStats()])
  } finally {
    isBusy.value = false
  }
}

const selectBook = (id: string) => {
  selectedBookId.value = id
}

const selectExhibition = (id: string) => {
  selectedExhibitionId.value = id
}

const createBook = async () => {
  isBusy.value = true
  try {
    const { data } = await supaRestFetch('/books?select=*', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify([{ title: '', author: '', country: '', language: '', description: '', cover: '', status: 'unread' }]),
    })
    const row = Array.isArray(data) ? (data[0] as BookRow) : null
    if (row) {
      books.value = [row, ...books.value]
      selectedBookId.value = row.id
      await refreshStats()
    }
  } catch (e: any) {
    setToast(e?.message || 'Create failed')
  } finally {
    isBusy.value = false
  }
}

const saveBook = async (b: BookRow) => {
  isBusy.value = true
  try {
    const { data } = await supaRestFetch(`/books?id=eq.${encodeURIComponent(b.id)}&select=*`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        title: b.title,
        author: b.author,
        country: b.country,
        language: b.language,
        description: b.description,
        cover: b.cover,
        status: b.status,
      }),
    })
    const row = Array.isArray(data) ? (data[0] as BookRow) : null
    if (row) {
      books.value = books.value.map(v => (v.id === row.id ? row : v))
      await refreshStats()
      setToast('Saved')
    }
  } catch (e: any) {
    setToast(e?.message || 'Save failed')
  } finally {
    isBusy.value = false
  }
}

const deleteBook = async (id: string) => {
  isBusy.value = true
  try {
    await supaRestFetch(`/books?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
    books.value = books.value.filter(v => v.id !== id)
    if (selectedBookId.value === id) selectedBookId.value = null
    await refreshStats()
    setToast('Deleted')
  } catch (e: any) {
    setToast(e?.message || 'Delete failed')
  } finally {
    isBusy.value = false
  }
}

const createExhibition = async () => {
  isBusy.value = true
  try {
    const { data } = await supaRestFetch('/exhibitions?select=*', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify([{ title: '', region: 'international', country: '', city: '', date: '', description: '', cover: '', status: 'unseen' }]),
    })
    const row = Array.isArray(data) ? (data[0] as ExhibitionRow) : null
    if (row) {
      exhibitions.value = [row, ...exhibitions.value]
      selectedExhibitionId.value = row.id
      await refreshStats()
    }
  } catch (e: any) {
    setToast(e?.message || 'Create failed')
  } finally {
    isBusy.value = false
  }
}

const saveExhibition = async (e: ExhibitionRow) => {
  isBusy.value = true
  try {
    const { data } = await supaRestFetch(`/exhibitions?id=eq.${encodeURIComponent(e.id)}&select=*`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        title: e.title,
        region: e.region,
        country: e.country,
        city: e.city,
        date: e.date,
        description: e.description,
        cover: e.cover,
        status: e.status,
      }),
    })
    const row = Array.isArray(data) ? (data[0] as ExhibitionRow) : null
    if (row) {
      exhibitions.value = exhibitions.value.map(v => (v.id === row.id ? row : v))
      await refreshStats()
      setToast('Saved')
    }
  } catch (err: any) {
    setToast(err?.message || 'Save failed')
  } finally {
    isBusy.value = false
  }
}

const uploadToOss = async (file: File) => {
  const req = await fetch('/api/oss/policy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name }),
  })
  const data = (await req.json()) as any
  if (!req.ok) throw new Error(data?.error || 'OSS policy failed')

  const host = String(data?.host || '')
  const url = String(data?.url || '')
  const form = data?.form || {}
  if (!host || !url || !form?.policy) throw new Error('OSS policy invalid')

  const fd = new FormData()
  Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
  fd.append('file', file)

  const up = await fetch(host, { method: 'POST', body: fd })
  if (!up.ok) throw new Error(`OSS upload failed (${up.status})`)
  return url
}

const handleBookCoverFile = async (ev: Event) => {
  const input = ev.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file || !selectedBook.value) return
  isBusy.value = true
  try {
    const url = await uploadToOss(file)
    selectedBook.value.cover = url
    setToast('Uploaded')
  } catch (e: any) {
    setToast(e?.message || 'Upload failed')
  } finally {
    if (input) input.value = ''
    isBusy.value = false
  }
}

const handleExhibitionCoverFile = async (ev: Event) => {
  const input = ev.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file || !selectedExhibition.value) return
  isBusy.value = true
  try {
    const url = await uploadToOss(file)
    selectedExhibition.value.cover = url
    setToast('Uploaded')
  } catch (e: any) {
    setToast(e?.message || 'Upload failed')
  } finally {
    if (input) input.value = ''
    isBusy.value = false
  }
}

const deleteExhibition = async (id: string) => {
  isBusy.value = true
  try {
    await supaRestFetch(`/exhibitions?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
    exhibitions.value = exhibitions.value.filter(v => v.id !== id)
    if (selectedExhibitionId.value === id) selectedExhibitionId.value = null
    await refreshStats()
    setToast('Deleted')
  } catch (e: any) {
    setToast(e?.message || 'Delete failed')
  } finally {
    isBusy.value = false
  }
}

watch(
  () => activeTab.value,
  async t => {
    if (!session.value) return
    if (t === 'dashboard') await refreshStats()
    if (t === 'books') await fetchBooks()
    if (t === 'exhibitions') await fetchExhibitions()
  }
)

onMounted(async () => {
  const raw = localStorage.getItem('rubato_admin_session')
  if (!raw) return
  try {
    const saved = JSON.parse(raw) as Session
    if (!saved?.access_token) return
    const userEmail = await ensureAdmin(saved.access_token)
    session.value = { ...saved, email: userEmail }
    await bootstrap()
  } catch {
    session.value = null
    localStorage.removeItem('rubato_admin_session')
  }
})
</script>

<style scoped>
.admin-panel {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.06);
}

.admin-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-tab {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 0.55rem 0.85rem;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.55;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.admin-tab:hover {
  opacity: 0.8;
}

.admin-tab.is-active {
  opacity: 0.92;
  background: rgba(255, 255, 255, 0.28);
}

.admin-card {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 18px 18px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.06);
}

.admin-card-k {
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.5;
}

.admin-card-v {
  margin-top: 10px;
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 38px;
  letter-spacing: -0.02em;
  opacity: 0.84;
}

.admin-primary {
  border: 1px solid rgba(123, 75, 209, 0.20);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.22) 100%);
  box-shadow: 0 14px 34px rgba(123, 75, 209, 0.10);
  padding: 0.85rem 1.1rem;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.92;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.admin-primary:disabled {
  opacity: 0.45;
}

.admin-primary:not(:disabled):hover {
  transform: translate3d(0, -1px, 0);
  opacity: 1;
}

.admin-link {
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.55;
  transition: opacity 0.2s ease;
}

.admin-link:hover {
  opacity: 0.85;
}

.admin-field {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.admin-label {
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  opacity: 0.52;
}

.admin-input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.44);
  background: rgba(255, 255, 255, 0.16);
  padding: 0.8rem 0.9rem;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.admin-input:focus {
  border-color: rgba(123, 75, 209, 0.28);
  background: rgba(255, 255, 255, 0.22);
}

.admin-textarea {
  resize: vertical;
  min-height: 110px;
}

.admin-list {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.admin-list-item {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  transition: background 0.2s ease, opacity 0.2s ease;
  opacity: 0.82;
}

.admin-list-item:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.18);
}

.admin-list-item.is-active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.26);
}

.admin-form {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.06);
  padding: 16px 16px;
}

.admin-toast {
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 10px 14px;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.85;
}
</style>
