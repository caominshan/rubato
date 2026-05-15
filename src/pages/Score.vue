<template>
  <main class="flex-1 flex items-center justify-center p-8 sm:p-16 relative z-10">
    <div ref="svgContainer" class="w-full max-w-6xl aspect-[2/1] relative flex items-center justify-center opacity-0">
      <MainSvg @note-click="handleNoteClick" />
    </div>
  </main>

  <Teleport to="body">
    <svg
      v-if="flow.isActive"
      :key="flow.key"
      class="fixed inset-0 z-[55] pointer-events-none"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(74, 45, 92, 0.00)" />
          <stop offset="22%" stop-color="rgba(74, 45, 92, 0.25)" />
          <stop offset="60%" stop-color="rgba(116, 73, 156, 0.55)" />
          <stop offset="100%" stop-color="rgba(168, 124, 226, 0.00)" />
        </linearGradient>
        <filter id="flowGlow" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#7b4bd1" flood-opacity="0.25" />
          <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#7b4bd1" flood-opacity="0.16" />
        </filter>
      </defs>

      <g filter="url(#flowGlow)">
        <path
          v-for="(d, i) in flow.paths"
          :key="i"
          :d="d"
          pathLength="1"
          fill="none"
          stroke="url(#flowGrad)"
          :stroke-width="i === 0 ? 0.32 : 0.22"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="flow-path"
        />
      </g>
    </svg>
  </Teleport>

  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="isDrawerOpen || isDetailOpen"
        class="fixed inset-0 z-[50] bg-black/10 backdrop-blur-[3px]"
        @click="handleBackdropClick"
      ></div>
    </transition>
  </Teleport>

  <Teleport to="body">
    <transition :css="false" @enter="drawerEnter" @leave="drawerLeave">
      <aside
        v-if="isDrawerOpen"
        ref="drawerEl"
        class="fixed inset-y-0 right-0 z-[60] w-full sm:w-[clamp(380px,35vw,520px)] glass-panel flex flex-col"
      >
        <div class="px-7 sm:px-8 pt-7 sm:pt-8 pb-5 border-b border-black/5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-xs uppercase tracking-[0.28em] opacity-50">Rubato Score</div>
              <h2 class="mt-2 font-editorial text-3xl tracking-tight text-[#2b2623]">
                {{ drawerTitle }}
              </h2>
              <div class="mt-2 text-xs uppercase tracking-[0.28em] opacity-40">
                {{ drawerSubtitle }}
              </div>
            </div>

            <button
              class="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/50 transition-colors border border-white/40 shadow-sm"
              @click="closeDrawer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 1L1 13M1 1L13 13"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div v-if="drawerKind === 'exhibitions'" class="mt-5 flex items-center gap-2">
            <button
              class="rubato-tab"
              :class="drawerExhibitionCategory === 'domestic' ? 'is-active' : ''"
              @click="drawerExhibitionCategory = 'domestic'"
            >
              China Exhibitions
            </button>
            <button
              class="rubato-tab"
              :class="drawerExhibitionCategory === 'international' ? 'is-active' : ''"
              @click="drawerExhibitionCategory = 'international'"
            >
              Global Exhibitions
            </button>
          </div>

          <div class="mt-5 flex items-center justify-between gap-3">
            <div class="text-xs uppercase tracking-[0.28em] opacity-40">
              {{ filteredItems.length }} items
            </div>

            <div class="rubato-seg">
              <button class="rubato-seg-btn" :class="statusFilter === 'all' ? 'is-active' : ''" @click="statusFilter = 'all'">
                All
              </button>
              <button class="rubato-seg-btn" :class="statusFilter === 'undone' ? 'is-active' : ''" @click="statusFilter = 'undone'">
                {{ undoneFilterLabel }}
              </button>
              <button class="rubato-seg-btn" :class="statusFilter === 'done' ? 'is-active' : ''" @click="statusFilter = 'done'">
                {{ doneFilterLabel }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-7 sm:px-8 py-6">
          <div v-if="filteredItems.length === 0" class="rounded-2xl border border-white/30 bg-white/20 p-6">
            <div class="text-xs uppercase tracking-[0.28em] opacity-45">Empty</div>
            <div class="mt-2 text-sm opacity-70 leading-relaxed">
              {{ emptyHint }}
            </div>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="rubato-item-card group"
              @pointermove="handleCardPointerMove($event)"
              @pointerleave="handleCardPointerLeave($event)"
            >
              <button class="w-full text-left" @click="openDetail(item.id)">
                <div class="rubato-card-surface">
                  <div class="relative h-[96px] overflow-hidden">
                    <div v-if="item.images[0]" class="absolute inset-0">
                      <img
                        :src="item.images[0]"
                        alt=""
                        class="rubato-card-img w-full h-full object-cover"
                        loading="lazy"
                        draggable="false"
                      />
                      <div class="absolute inset-0 rubato-img-vignette"></div>
                      <div class="absolute inset-0 rubato-img-grain"></div>
                    </div>
                    <div v-else class="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-black/5">
                      <div class="absolute inset-0 rubato-img-grain"></div>
                    </div>
                  </div>

                  <div class="p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="text-[12px] uppercase tracking-[0.28em] opacity-40">
                          {{ itemLabel(item) }}
                        </div>
                        <div class="mt-2 font-editorial text-lg leading-tight tracking-tight truncate">
                          {{ item.title }}
                        </div>
                      </div>

                      <div class="rubato-toggle" :class="item.status === 'done' ? 'is-on' : ''" aria-hidden="true">
                        <span class="rubato-toggle-knob"></span>
                      </div>
                    </div>

                    <div class="mt-2 text-xs opacity-55 leading-relaxed">
                      {{ itemMetaLine(item) }}
                    </div>

                    <div v-if="item.meta.description" class="mt-2 text-sm opacity-70 line-clamp-2 leading-snug">
                      {{ item.meta.description }}
                    </div>
                  </div>
                </div>
              </button>

              <div class="mt-2 flex items-center justify-between gap-3 px-1">
                <div class="text-xs uppercase tracking-[0.26em] opacity-35">
                  {{ item.status === 'done' ? doneLabel(item) : undoneLabel(item) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-7 sm:px-8 py-6 border-t border-black/5"></div>
      </aside>
    </transition>
  </Teleport>

  <FloatingPanel
    :is-open="isPanelOpen"
    :title="currentTitle"
    :index="currentIndex"
    @close="isPanelOpen = false"
  >
    <div v-html="currentContent"></div>
  </FloatingPanel>

  <Teleport to="body">
    <transition :css="false" @enter="receiptSheetEnter" @leave="receiptSheetLeave">
      <section
        v-if="isDetailOpen"
        class="fixed inset-y-0 left-0 top-0 z-[65] pointer-events-none sm:right-[clamp(380px,35vw,520px)]"
      >
        <div class="receipt-sheet pointer-events-auto">
          <div class="receipt-scroll h-[100vh] w-full flex items-start justify-center px-5 sm:px-10 pt-0 pb-10" @click.self="closeDetail">
            <article ref="receiptEl" class="receipt-paper">
              <div class="absolute inset-0 rubato-img-grain"></div>
              <div class="relative px-7 pt-8 pb-7">
                <div class="flex items-start justify-between gap-5">
                  <div class="min-w-0">
                    <div class="receipt-line text-[11px] uppercase tracking-[0.34em] opacity-55">Rubato Archive</div>
                    <div class="receipt-line mt-3 font-editorial text-[34px] leading-[1.05] tracking-tight receipt-accent break-words">
                      {{ detailItem?.title }}
                    </div>
                    <div class="receipt-line mt-4 text-[12px] uppercase tracking-[0.22em] receipt-accent opacity-80">
                      {{ detailItem ? itemLabel(detailItem) : '' }}
                    </div>
                  </div>
                </div>

                <div class="receipt-line mt-5 text-[11px] font-mono uppercase tracking-[0.26em] opacity-45">
                  {{ receiptMetaLine }}
                </div>

                <div class="receipt-line mt-5 receipt-dotbar" aria-hidden="true"></div>

                <div class="mt-6 space-y-2.5">
                  <div v-for="field in detailFields" :key="field.key" class="receipt-line receipt-row">
                    <div class="receipt-k">{{ field.label }}</div>
                    <div class="receipt-v">{{ field.value }}</div>
                  </div>
                </div>

                <div v-if="receiptGallery.length" class="receipt-line mt-6">
                  <div class="text-[11px] font-mono uppercase tracking-[0.26em] opacity-55">Gallery</div>
                  <div v-if="receiptCarouselSlides.length" class="mt-3">
                    <div class="receipt-carousel-frame w-full aspect-[4/5]">
                      <div ref="receiptCarouselStripEl" class="receipt-carousel-strip">
                        <div v-for="(src, idx) in receiptCarouselSlides" :key="`${idx}-${src}`" class="receipt-carousel-cell">
                          <img :src="src" alt="" class="w-full h-full object-cover" loading="lazy" draggable="false" @error="handleReceiptImgError" />
                        </div>
                      </div>
                    </div>

                    <div v-if="receiptGallery.length > 1" class="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] opacity-50">
                      <div>{{ receiptGalleryIndex + 1 }} / {{ receiptGallery.length }}</div>
                      <div class="select-none">Auto</div>
                    </div>
                  </div>
                </div>

                <div v-if="detailItem?.meta?.description" class="receipt-line mt-6 text-sm leading-relaxed opacity-75">
                  {{ detailItem.meta.description }}
                </div>

                <div class="receipt-line mt-7 receipt-dotbar" aria-hidden="true"></div>

                <div class="receipt-line mt-5 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] opacity-50">
                  <div>Printed</div>
                  <div>{{ printedAtText }}</div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import MainSvg from '../components/MainSvg.vue'
import FloatingPanel from '../components/FloatingPanel.vue'
import booksJson from '../../content/books.json'
import exhibitionsJson from '../../content/exhibitions.json'

const svgContainer = ref<HTMLElement | null>(null)

type ItemType = 'exhibition' | 'book'
type Category = 'domestic' | 'international' | null
type ItemStatus = 'done' | 'undone'

type RubatoItem = {
  id: string
  type: ItemType
  category: Category
  title: string
  meta: Record<string, string>
  images: string[]
  status: ItemStatus
  createdAt: number
  updatedAt: number
}

type NoteClickPayload = { index: number; anchor: { x: number; y: number } }

const notesData = [
  {
    title: 'Inspiration',
    content:
      '<p>A collection of fleeting thoughts, visual bookmarks, and cognitive fragments. Here lies the raw material that fuels the creative engine.</p><br><p>Observation is the first act of creation. By curating what we consume, we shape what we produce.</p>',
  },
  {
    title: 'AI Notes',
    content:
      '<p>Experiments at the intersection of human intuition and machine intelligence. Exploring latent spaces, prompt engineering, and algorithmic serendipity.</p><br><p>The machine is not a replacement, but a collaborator—a mirror reflecting our own complexities back at us.</p>',
  },
  {
    title: 'Projects',
    content:
      '<p>Structured endeavors and shipped products. From concept to execution, a timeline of digital artifacts built with intention and precision.</p><br><p>Every project is a hypothesis tested against reality.</p>',
  },
  {
    title: 'Learning',
    content:
      '<p>The continuous process of unlearning and relearning. Technical deep dives, architectural patterns, and philosophical inquiries into software design.</p><br><p>Mastery is an asymptote. We can approach it, but never truly reach it.</p>',
  },
  {
    title: 'Exhibition Archive',
    content:
      '<p>A curated gallery of past works, failed experiments, and deprecated prototypes. Preserving the digital footprint of a constantly evolving mind.</p><br><p>Even in obsolescence, there is beauty. The archive is a testament to growth.</p>',
  },
] as const

const isPanelOpen = ref(false)
const currentIndex = ref(0)

const currentTitle = computed(() => notesData[currentIndex.value].title)
const currentContent = computed(() => notesData[currentIndex.value].content)
const exhibitionsNoteIndex = 1
const readingNoteIndex = 4

const items = ref<RubatoItem[]>([])
const statusFilter = ref<'all' | ItemStatus>('all')

const drawerEl = ref<HTMLElement | null>(null)
const drawerKind = ref<'exhibitions' | 'reading' | null>(null)
const isDrawerOpen = computed(() => drawerKind.value !== null)
const drawerExhibitionCategory = ref<Exclude<Category, null>>('domestic')

const flow = ref<{ isActive: boolean; key: number; paths: string[]; anchor: { x: number; y: number } | null }>({
  isActive: false,
  key: 0,
  paths: [],
  anchor: null,
})

const receiptEl = ref<HTMLElement | null>(null)
const detailItemId = ref<string | null>(null)
const isDetailOpen = computed(() => detailItemId.value !== null)
const detailItem = computed(() => items.value.find(i => i.id === detailItemId.value) ?? null)
const printedAt = ref<number>(Date.now())
const printedAtText = computed(() => new Date(printedAt.value).toLocaleString())
const receiptMetaLine = computed(() => (detailItem.value ? itemMetaLine(detailItem.value) : '—'))
const brokenReceiptImages = ref<Record<string, true>>({})
const receiptGallery = computed(() => {
  const raw = detailItem.value?.images ?? []
  const uniq = Array.from(new Set(raw.map(s => (s || '').trim()).filter(Boolean)))
  return uniq.filter(src => !brokenReceiptImages.value[src])
})
const receiptGalleryIndex = ref(0)
const receiptCarouselStripEl = ref<HTMLElement | null>(null)
const receiptCarouselTween = ref<gsap.core.Tween | null>(null)
const receiptCarouselSlides = computed(() => {
  const base = receiptGallery.value
  if (base.length <= 1) return base
  return base.concat(base)
})

watch(
  () => receiptGallery.value.length,
  len => {
    if (len <= 0) receiptGalleryIndex.value = 0
    else if (receiptGalleryIndex.value >= len) receiptGalleryIndex.value = 0
  }
)

const drawerTitle = computed(() => {
  if (drawerKind.value === 'exhibitions') return 'Exhibitions'
  if (drawerKind.value === 'reading') return 'Reading List'
  return ''
})

const drawerSubtitle = computed(() => {
  if (drawerKind.value === 'exhibitions') return drawerExhibitionCategory.value === 'domestic' ? 'Domestic / China' : 'International / Global'
  if (drawerKind.value === 'reading') return 'Books'
  return ''
})

const doneFilterLabel = computed(() => {
  if (drawerKind.value === 'reading') return 'Read'
  return 'Seen'
})

const undoneFilterLabel = computed(() => {
  if (drawerKind.value === 'reading') return 'Unread'
  return 'Unseen'
})

const emptyHint = computed(() => {
  if (drawerKind.value === 'exhibitions') {
    return 'No entries yet. Edit content/exhibitions.json and redeploy.'
  }
  if (drawerKind.value === 'reading') {
    return 'No entries yet. Edit content/books.json and redeploy.'
  }
  return ''
})

const scopedItems = computed(() => {
  if (drawerKind.value === 'exhibitions') {
    return items.value
      .filter(i => i.type === 'exhibition')
      .filter(i => i.category === drawerExhibitionCategory.value)
  }
  if (drawerKind.value === 'reading') return items.value.filter(i => i.type === 'book')
  return []
})

const filteredItems = computed(() => {
  const base = scopedItems.value.slice().sort((a, b) => b.updatedAt - a.updatedAt)
  if (statusFilter.value === 'all') return base
  return base.filter(i => i.status === statusFilter.value)
})

const itemLabel = (item: RubatoItem) => {
  if (item.type === 'book') return 'Book'
  if (item.category === 'domestic') return 'China Exhibition'
  return 'Global Exhibition'
}

const doneLabel = (item: RubatoItem) => {
  if (item.type === 'book') return 'Read'
  return 'Seen'
}

const undoneLabel = (item: RubatoItem) => {
  if (item.type === 'book') return 'Unread'
  return 'Unseen'
}

const itemMetaLine = (item: RubatoItem) => {
  if (item.type === 'exhibition') {
    const country = item.meta.country?.trim()
    const city = item.meta.city?.trim()
    const date = item.meta.date?.trim()
    const location = [country, city].filter(Boolean).join(' / ')

    const fallbackLoc = item.meta.location?.trim()
    const fallbackTime = item.meta.time?.trim()

    const parts = [location || fallbackLoc, date || fallbackTime].filter(Boolean)
    return parts.length ? parts.join(' · ') : '—'
  }
  const author = item.meta.author?.trim()
  const country = item.meta.country?.trim()
  const language = item.meta.language?.trim()
  const bits = [author, country, language].filter(Boolean)
  return bits.length ? bits.join(' · ') : '—'
}

const detailFields = computed(() => {
  const item = detailItem.value
  if (!item) return [] as Array<{ key: string; label: string; value: string }>

  if (item.type === 'exhibition') {
    return [
      { key: 'country', label: 'Country', value: item.meta.country || item.meta.location || '—' },
      { key: 'city', label: 'City', value: item.meta.city || '—' },
      { key: 'date', label: 'Date', value: item.meta.date || item.meta.time || '—' },
      { key: 'status', label: 'Status', value: item.status === 'done' ? 'Seen' : 'Unseen' },
    ]
  }

  return [
    { key: 'author', label: 'Author', value: item.meta.author || '—' },
    { key: 'country', label: 'Country', value: item.meta.country || '—' },
    { key: 'language', label: 'Language', value: item.meta.language || '—' },
    { key: 'status', label: 'Status', value: item.status === 'done' ? 'Read' : 'Unread' },
  ]
})

const getUUID = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

type ExhibitionContent = {
  id?: string
  title?: string
  region?: 'domestic' | 'international'
  country?: string
  city?: string
  date?: string
  status?: 'done' | 'undone' | 'seen' | 'unseen'
  description?: string
  cover?: string
  gallery?: string[]
}

type BookContent = {
  id?: string
  title?: string
  author?: string
  country?: string
  language?: string
  status?: 'done' | 'undone' | 'read' | 'unread'
  description?: string
  cover?: string
  gallery?: string[]
}

const normalizeStatus = (type: ItemType, raw: unknown): ItemStatus => {
  if (raw === 'done' || raw === 'undone') return raw
  if (type === 'exhibition') return raw === 'seen' ? 'done' : raw === 'unseen' ? 'undone' : 'undone'
  return raw === 'read' ? 'done' : raw === 'unread' ? 'undone' : 'undone'
}

const loadItemsFromContent = (): RubatoItem[] => {
  const now = Date.now()
  const list: RubatoItem[] = []

  const books = Array.isArray(booksJson) ? (booksJson as BookContent[]) : []
  for (const v of books) {
    const id = (v.id || '').trim() || getUUID()
    const title = (v.title || '').trim()
    if (!title) continue
    const images = [v.cover, ...(v.gallery ?? [])].map(s => (s || '').trim()).filter(Boolean)
    list.push({
      id,
      type: 'book',
      category: null,
      title,
      meta: {
        author: (v.author || '').trim(),
        country: (v.country || '').trim(),
        language: (v.language || '').trim(),
        description: (v.description || '').trim(),
      },
      images,
      status: normalizeStatus('book', v.status),
      createdAt: now,
      updatedAt: now,
    })
  }

  const exhibitions = Array.isArray(exhibitionsJson) ? (exhibitionsJson as ExhibitionContent[]) : []
  for (const v of exhibitions) {
    const id = (v.id || '').trim() || getUUID()
    const title = (v.title || '').trim()
    if (!title) continue
    const category: Category = v.region === 'domestic' || v.region === 'international' ? v.region : null
    const images = [v.cover, ...(v.gallery ?? [])].map(s => (s || '').trim()).filter(Boolean)
    list.push({
      id,
      type: 'exhibition',
      category,
      title,
      meta: {
        country: (v.country || '').trim(),
        city: (v.city || '').trim(),
        date: (v.date || '').trim(),
        description: (v.description || '').trim(),
      },
      images,
      status: normalizeStatus('exhibition', v.status),
      createdAt: now,
      updatedAt: now,
    })
  }

  return list
}

const initItems = () => {
  items.value = loadItemsFromContent()
}

const cubicBezier = (p1x: number, p1y: number, p2x: number, p2y: number) => {
  const cx = 3 * p1x
  const bx = 3 * (p2x - p1x) - cx
  const ax = 1 - cx - bx
  const cy = 3 * p1y
  const by = 3 * (p2y - p1y) - cy
  const ay = 1 - cy - by
  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  const solveCurveX = (x: number) => {
    let t2 = x
    for (let i = 0; i < 8; i += 1) {
      const x2 = sampleCurveX(t2) - x
      if (Math.abs(x2) < 1e-6) return t2
      const d2 = sampleCurveDerivativeX(t2)
      if (Math.abs(d2) < 1e-6) break
      t2 -= x2 / d2
    }
    let t0 = 0
    let t1 = 1
    t2 = x
    for (let i = 0; i < 20; i += 1) {
      const x2 = sampleCurveX(t2)
      if (Math.abs(x2 - x) < 1e-6) return t2
      if (x > x2) t0 = t2
      else t1 = t2
      t2 = (t1 - t0) * 0.5 + t0
    }
    return t2
  }
  return (x: number) => sampleCurveY(solveCurveX(x))
}

const receiptEase = cubicBezier(0.25, 1, 0.5, 1)

const animateReceipt = () => {
  const paper = receiptEl.value
  if (!paper) return
  gsap.killTweensOf(paper)
  gsap.set(paper, { clipPath: 'inset(0% 0% 100% 0%)' })

  const lines = paper.querySelectorAll<HTMLElement>('.receipt-line')
  gsap.killTweensOf(lines)
  gsap.set(lines, { opacity: 0, y: 10 })

  gsap.to(paper, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: receiptEase })
  gsap.to(lines, { opacity: 1, y: 0, duration: 0.55, ease: receiptEase, delay: 0.12, stagger: 0.03 })
}

const handleReceiptImgError = (ev: Event) => {
  const img = ev.target as HTMLImageElement | null
  if (!img) return
  const failing = (img.currentSrc || img.src || '').trim()
  if (!failing) return
  brokenReceiptImages.value = { ...brokenReceiptImages.value, [failing]: true }
}

const stopReceiptCarousel = () => {
  if (receiptCarouselTween.value) {
    receiptCarouselTween.value.kill()
    receiptCarouselTween.value = null
  }
}

const startReceiptCarousel = () => {
  stopReceiptCarousel()
  if (!isDetailOpen.value) return
  const n = receiptGallery.value.length
  if (n <= 1) return
  const strip = receiptCarouselStripEl.value
  if (!strip) return

  const secondsPerSlide = 4.2
  const total = n * secondsPerSlide
  let lastIdx = -1

  gsap.set(strip, { xPercent: 0 })
  receiptCarouselTween.value = gsap.to(strip, {
    xPercent: -100 * n,
    duration: total,
    ease: 'none',
    repeat: -1,
    onUpdate: () => {
      const xp = Number(gsap.getProperty(strip, 'xPercent'))
      const idx = n > 0 ? Math.floor((-xp) / 100) % n : 0
      if (idx !== lastIdx) {
        lastIdx = idx
        receiptGalleryIndex.value = idx
      }
    },
  })
}

const openDrawer = async (kind: NonNullable<typeof drawerKind.value>, anchor: { x: number; y: number }) => {
  isPanelOpen.value = false
  detailItemId.value = null
  drawerKind.value = kind
  statusFilter.value = 'all'
  if (kind === 'exhibitions') drawerExhibitionCategory.value = 'domestic'
  playFlow(anchor)
  await nextTick()
  staggerCards()
}

const closeDrawer = () => {
  drawerKind.value = null
  closeDetail()
}

const openDetail = async (id: string) => {
  printedAt.value = Date.now()
  receiptGalleryIndex.value = 0
  if (window.innerWidth < 640) drawerKind.value = null
  detailItemId.value = id
  await nextTick()
  animateReceipt()
  startReceiptCarousel()
}

const closeDetail = () => {
  detailItemId.value = null
}

const handleBackdropClick = () => {
  if (isDetailOpen.value) return closeDetail()
  if (isDrawerOpen.value) return closeDrawer()
}

const playFlow = (anchor: { x: number; y: number }) => {
  const w = window.innerWidth
  const h = window.innerHeight
  const nx = (anchor.x / w) * 100
  const ny = (anchor.y / h) * 100
  const tx = 98
  const ty = 14 + (anchor.y / h) * 72

  const bend = Math.max(10, Math.min(22, Math.abs(tx - nx) * 0.22))
  const paths = [
    `M ${nx} ${ny} C ${nx + bend} ${ny - 6}, ${tx - 18} ${ty - 8}, ${tx} ${ty}`,
    `M ${nx} ${ny} C ${nx + bend * 0.9} ${ny + 1}, ${tx - 16} ${ty + 7}, ${tx} ${ty + 4}`,
    `M ${nx} ${ny} C ${nx + bend * 0.75} ${ny - 1}, ${tx - 14} ${ty + 12}, ${tx} ${ty + 9}`,
  ]

  flow.value = {
    isActive: true,
    key: flow.value.key + 1,
    paths,
    anchor,
  }

  nextTick().then(() => {
    const els = document.querySelectorAll<SVGPathElement>('.flow-path')
    gsap.killTweensOf(els)
    gsap.set(els, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 0.95 })
    gsap.to(els, { strokeDashoffset: 0, duration: 0.75, ease: 'power2.out', stagger: 0.04 })
    gsap.to(els, { opacity: 0, duration: 0.7, ease: 'power2.inOut', delay: 0.55 })
    window.setTimeout(() => {
      flow.value.isActive = false
    }, 1100)
  })
}

const staggerCards = () => {
  const root = drawerEl.value
  if (!root) return
  const cards = root.querySelectorAll('.rubato-item-card')
  if (!cards.length) return
  gsap.killTweensOf(cards)
  gsap.fromTo(cards, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.06 })
}

const handleCardPointerMove = (ev: PointerEvent) => {
  const card = ev.currentTarget as HTMLElement | null
  if (!card) return
  const rect = card.getBoundingClientRect()
  const px = (ev.clientX - rect.left) / rect.width
  const py = (ev.clientY - rect.top) / rect.height
  const ox = (px - 0.5) * 2
  const oy = (py - 0.5) * 2
  card.style.setProperty('--px', String(ox))
  card.style.setProperty('--py', String(oy))
}

const handleCardPointerLeave = (ev: PointerEvent) => {
  const card = ev.currentTarget as HTMLElement | null
  if (!card) return
  card.style.setProperty('--px', '0')
  card.style.setProperty('--py', '0')
}

const drawerEnter = (el: Element, done: () => void) => {
  gsap.fromTo(el, { x: '100%', opacity: 0 }, { x: '0%', opacity: 1, duration: 0.6, ease: 'power3.out', onComplete: done })
}

const drawerLeave = (el: Element, done: () => void) => {
  gsap.to(el, { x: '100%', opacity: 0, duration: 0.5, ease: 'power3.in', onComplete: done })
}

const receiptSheetEnter = (el: Element, done: () => void) => {
  gsap.fromTo(el, { yPercent: -110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.62, ease: 'power3.out', onComplete: done })
}

const receiptSheetLeave = (el: Element, done: () => void) => {
  gsap.to(el, { yPercent: -110, opacity: 0, duration: 0.5, ease: 'power3.in', onComplete: done })
}

const onKeydown = (ev: KeyboardEvent) => {
  if (ev.key === 'Escape' && isDetailOpen.value) closeDetail()
}

const handleNoteClick = (payload: NoteClickPayload) => {
  const index = payload.index
  if (index === exhibitionsNoteIndex) return openDrawer('exhibitions', payload.anchor)
  if (index === readingNoteIndex) return openDrawer('reading', payload.anchor)

  currentIndex.value = index
  isPanelOpen.value = true
}

onMounted(() => {
  if (!svgContainer.value) return
  gsap.to(svgContainer.value, { opacity: 1, duration: 1.6, ease: 'power2.out' })
  initItems()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  stopReceiptCarousel()
})

watch(
  () => isDetailOpen.value,
  open => {
    if (open) startReceiptCarousel()
    else stopReceiptCarousel()
  }
)

watch(
  () => receiptGallery.value.join('|'),
  () => {
    if (isDetailOpen.value) startReceiptCarousel()
  }
)
</script>

<style scoped>
.flow-path {
  vector-effect: non-scaling-stroke;
}

.rubato-tab {
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 9999px;
  padding: 0.55rem 0.9rem;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.6;
  transition: opacity 0.25s ease, background 0.25s ease, transform 0.25s ease;
  will-change: transform;
}

.rubato-tab:hover {
  opacity: 0.78;
  transform: translate3d(0, -1px, 0);
}

.rubato-tab.is-active {
  opacity: 0.92;
  background: rgba(255, 255, 255, 0.32);
}

.rubato-seg {
  display: inline-flex;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.rubato-seg-btn {
  padding: 0.4rem 0.7rem;
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  opacity: 0.55;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.rubato-seg-btn:hover {
  opacity: 0.78;
}

.rubato-seg-btn.is-active {
  opacity: 0.92;
  background: rgba(255, 255, 255, 0.32);
}

.rubato-card-surface {
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.06);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  will-change: transform;
}

.rubato-item-card {
  --px: 0;
  --py: 0;
}

.rubato-item-card:hover .rubato-card-surface {
  transform: translate3d(0, -4px, 0);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.08);
}

.rubato-card-img {
  transform: translate3d(calc(var(--px) * 6px), calc(var(--py) * 6px), 0) scale(1.04);
  transition: transform 0.25s ease;
  will-change: transform;
}

.rubato-img-vignette {
  background: radial-gradient(120% 90% at 50% 35%, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.0) 60%),
    radial-gradient(80% 90% at 55% 50%, rgba(0, 0, 0, 0.0) 30%, rgba(0, 0, 0, 0.22) 100%);
  mix-blend-mode: multiply;
}

.rubato-img-grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.06'/%3E%3C/svg%3E");
  background-size: 240px 240px;
  mix-blend-mode: multiply;
  opacity: 0.35;
}

.rubato-toggle {
  width: 46px;
  height: 26px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.16);
  position: relative;
  flex: 0 0 auto;
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.rubato-toggle.is-on {
  background: rgba(123, 75, 209, 0.18);
  border-color: rgba(123, 75, 209, 0.30);
  box-shadow: 0 0 0 1px rgba(123, 75, 209, 0.08), 0 10px 26px rgba(123, 75, 209, 0.10);
}

.rubato-toggle-knob {
  position: absolute;
  top: 50%;
  left: 4px;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.78);
  transform: translate3d(0, -50%, 0);
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.25s ease;
  will-change: transform;
}

.rubato-toggle.is-on .rubato-toggle-knob {
  transform: translate3d(20px, -50%, 0);
  background: rgba(255, 255, 255, 0.86);
}

.rubato-toggle-lg {
  width: auto;
  padding: 0 14px 0 10px;
  display: inline-flex;
  align-items: center;
}

.rubato-mini {
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.rubato-mini:hover {
  opacity: 0.75;
}

.rubato-mini-danger {
  opacity: 0.42;
}

.rubato-mini-danger:hover {
  opacity: 0.72;
}

.rubato-primary {
  border-radius: 1.25rem;
  padding: 0.9rem 1.1rem;
  font-size: 12px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(43, 38, 35, 0.88);
  border: 1px solid rgba(123, 75, 209, 0.20);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.22) 100%);
  box-shadow: 0 14px 34px rgba(123, 75, 209, 0.10);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.rubato-primary:hover {
  transform: translate3d(0, -1px, 0);
  border-color: rgba(123, 75, 209, 0.30);
  box-shadow: 0 18px 46px rgba(123, 75, 209, 0.14);
}

.rubato-secondary {
  border-radius: 1.1rem;
  padding: 0.8rem 1rem;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.22);
  opacity: 0.75;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.rubato-secondary:hover {
  opacity: 0.9;
  transform: translate3d(0, -1px, 0);
}

.rubato-secondary-danger {
  border-color: rgba(180, 60, 60, 0.20);
}

.rubato-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rubato-label {
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  opacity: 0.5;
}

.rubato-input {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.44);
  background: rgba(255, 255, 255, 0.18);
  padding: 0.75rem 0.9rem;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.rubato-input:focus {
  border-color: rgba(123, 75, 209, 0.28);
  background: rgba(255, 255, 255, 0.24);
}

.rubato-textarea {
  resize: vertical;
  min-height: 96px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.receipt-paper {
  width: 380px;
  max-width: calc(100vw - 48px);
  position: relative;
  overflow: hidden;
  border-radius: 0px;
  background: #fbfbfa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.12);
  clip-path: inset(0% 0% 100% 0%);
  will-change: clip-path;
}

.receipt-sheet {
  width: 100%;
  height: 100vh;
}

.receipt-accent {
  color: rgba(93, 165, 110, 0.9);
}

.receipt-scroll {
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.receipt-scroll::-webkit-scrollbar {
  display: none;
}

.receipt-dotbar {
  height: 10px;
  border-radius: 0px;
  background-image: radial-gradient(circle, rgba(93, 165, 110, 0.75) 2px, transparent 2.6px);
  background-size: 14px 10px;
  background-position: 0 0;
  opacity: 0.95;
}

.receipt-carousel-frame {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: rgba(0, 0, 0, 0.04);
}

.receipt-carousel-strip {
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.receipt-carousel-cell {
  flex: 0 0 100%;
  height: 100%;
}

.receipt-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.45;
}

.receipt-k {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  opacity: 0.58;
}

.receipt-v {
  text-align: right;
  opacity: 0.78;
  word-break: break-word;
  max-width: 60%;
}
</style>
