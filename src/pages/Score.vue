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
        v-if="isDrawerOpen || isEditorOpen || isDetailOpen || confirmState.isOpen"
        class="fixed inset-0 z-[50] bg-black/10 backdrop-blur-[3px]"
        @click="handleBackdropClick"
      ></div>
    </transition>
  </Teleport>

  <Teleport to="body">
    <transition :css="false" @enter="drawerEnter" @leave="drawerLeave">
      <aside v-if="isDrawerOpen" ref="drawerEl" class="fixed inset-y-0 right-0 z-[60] w-full sm:w-[420px] glass-panel flex flex-col">
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
                Undone
              </button>
              <button class="rubato-seg-btn" :class="statusFilter === 'done' ? 'is-active' : ''" @click="statusFilter = 'done'">
                Done
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
            <button class="mt-5 rubato-primary" @click="openCreateFromDrawer">
              Add first item
            </button>
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

                      <button
                        class="rubato-toggle"
                        :class="item.status === 'done' ? 'is-on' : ''"
                        @click.stop="toggleItemStatus(item.id)"
                        :aria-label="item.status === 'done' ? 'Mark as undone' : 'Mark as done'"
                      >
                        <span class="rubato-toggle-knob"></span>
                      </button>
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
                <div class="flex items-center gap-2">
                  <button class="rubato-mini" @click="openEdit(item.id)">Edit</button>
                  <button class="rubato-mini rubato-mini-danger" @click="requestDelete(item.id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-7 sm:px-8 py-6 border-t border-black/5">
          <button class="rubato-primary w-full" @click="openCreateFromDrawer">
            + Add
          </button>
        </div>
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
    <transition :css="false" @enter="modalEnter" @leave="modalLeave">
      <div v-if="isDetailOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-5 sm:p-8">
        <div ref="detailEl" class="w-full max-w-[720px] rounded-3xl bg-white/35 backdrop-blur-2xl border border-white/40 shadow-[0_30px_80px_rgba(0,0,0,0.12)] overflow-hidden">
          <div class="px-7 sm:px-8 py-6 border-b border-black/5 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-xs uppercase tracking-[0.28em] opacity-45">{{ detailItem ? itemLabel(detailItem) : '' }}</div>
              <div class="mt-2 font-editorial text-2xl tracking-tight truncate">{{ detailItem?.title }}</div>
              <div class="mt-2 text-xs uppercase tracking-[0.26em] opacity-40">
                {{ detailItem ? itemMetaLine(detailItem) : '' }}
              </div>
            </div>

            <button
              class="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/50 transition-colors border border-white/40 shadow-sm"
              @click="closeDetail"
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

          <div class="px-7 sm:px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div v-if="detailItem?.images?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div v-for="(src, idx) in detailItem.images" :key="idx" class="relative overflow-hidden rounded-2xl border border-white/30 bg-white/10">
                <img :src="src" alt="" class="w-full aspect-[4/5] object-cover" loading="lazy" draggable="false" />
                <div class="absolute inset-0 rubato-img-vignette"></div>
                <div class="absolute inset-0 rubato-img-grain"></div>
              </div>
            </div>

            <div v-if="detailItem?.meta?.description" class="mt-6 text-sm leading-relaxed opacity-75">
              {{ detailItem.meta.description }}
            </div>

            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div v-for="field in detailFields" :key="field.key" class="rounded-2xl border border-white/30 bg-white/15 p-4">
                <div class="text-xs uppercase tracking-[0.28em] opacity-45">{{ field.label }}</div>
                <div class="mt-2 opacity-80">{{ field.value }}</div>
              </div>
            </div>
          </div>

          <div class="px-7 sm:px-8 py-6 border-t border-black/5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <button
              class="rubato-toggle rubato-toggle-lg"
              :class="detailItem?.status === 'done' ? 'is-on' : ''"
              @click="detailItem && toggleItemStatus(detailItem.id)"
            >
              <span class="rubato-toggle-knob"></span>
              <span class="ml-3 text-xs uppercase tracking-[0.28em] opacity-55">
                {{ detailItem ? (detailItem.status === 'done' ? doneLabel(detailItem) : undoneLabel(detailItem)) : '' }}
              </span>
            </button>

            <div class="flex items-center gap-2 justify-end">
              <button class="rubato-secondary" @click="detailItem && openEdit(detailItem.id)">Edit</button>
              <button class="rubato-secondary rubato-secondary-danger" @click="detailItem && requestDelete(detailItem.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>

  <Teleport to="body">
    <transition :css="false" @enter="modalEnter" @leave="modalLeave">
      <div v-if="isEditorOpen" class="fixed inset-0 z-[75] flex items-center justify-center p-5 sm:p-8">
        <div class="w-full max-w-[720px] rounded-3xl bg-white/38 backdrop-blur-2xl border border-white/40 shadow-[0_30px_80px_rgba(0,0,0,0.14)] overflow-hidden">
          <div class="px-7 sm:px-8 py-6 border-b border-black/5 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-xs uppercase tracking-[0.28em] opacity-45">Rubato</div>
              <div class="mt-2 font-editorial text-2xl tracking-tight">{{ editorTitle }}</div>
              <div class="mt-2 text-xs uppercase tracking-[0.26em] opacity-40">
                JSON-driven · localStorage-first
              </div>
            </div>
            <button
              class="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/50 transition-colors border border-white/40 shadow-sm"
              @click="closeEditor"
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

          <form class="px-7 sm:px-8 py-6 max-h-[70vh] overflow-y-auto space-y-5" @submit.prevent="saveDraft">
            <div v-if="formError" class="rounded-2xl border border-white/30 bg-white/20 px-4 py-3 text-sm opacity-75">
              {{ formError }}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="rubato-field">
                <span class="rubato-label">Title</span>
                <input v-model="draft.title" class="rubato-input" type="text" placeholder="Title" />
              </label>

              <label v-if="draft.type === 'exhibition'" class="rubato-field">
                <span class="rubato-label">Category</span>
                <select v-model="draft.category" class="rubato-input">
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                </select>
              </label>

              <label v-if="draft.type === 'book'" class="rubato-field">
                <span class="rubato-label">Author</span>
                <input v-model="draft.meta.author" class="rubato-input" type="text" placeholder="Author" />
              </label>

              <label v-if="draft.type === 'book'" class="rubato-field">
                <span class="rubato-label">Country</span>
                <input v-model="draft.meta.country" class="rubato-input" type="text" placeholder="Country" />
              </label>

              <label v-if="draft.type === 'book'" class="rubato-field">
                <span class="rubato-label">Language</span>
                <input v-model="draft.meta.language" class="rubato-input" type="text" placeholder="Language" />
              </label>

              <label v-if="draft.type === 'exhibition'" class="rubato-field">
                <span class="rubato-label">Location</span>
                <input v-model="draft.meta.location" class="rubato-input" type="text" placeholder="Country / City" />
              </label>

              <label v-if="draft.type === 'exhibition'" class="rubato-field">
                <span class="rubato-label">Time</span>
                <input v-model="draft.meta.time" class="rubato-input" type="text" placeholder="Optional" />
              </label>
            </div>

            <label class="rubato-field">
              <span class="rubato-label">Description</span>
              <textarea v-model="draft.meta.description" class="rubato-input rubato-textarea" rows="3" placeholder="One sentence (optional)"></textarea>
            </label>

            <label class="rubato-field">
              <span class="rubato-label">Status</span>
              <select v-model="draft.status" class="rubato-input">
                <option value="undone">{{ draft.type === 'book' ? 'Unread' : 'Unseen' }}</option>
                <option value="done">{{ draft.type === 'book' ? 'Read' : 'Seen' }}</option>
              </select>
            </label>

            <label class="rubato-field">
              <span class="rubato-label">Images</span>
              <textarea v-model="draft.imagesText" class="rubato-input rubato-textarea" rows="4" placeholder="One URL per line"></textarea>
            </label>

            <div class="flex items-center justify-between gap-4 pt-2">
              <button type="button" class="rubato-secondary rubato-secondary-danger" v-if="draft.id" @click="requestDelete(draft.id)">
                Delete
              </button>
              <div class="flex-1"></div>
              <button type="button" class="rubato-secondary" @click="closeEditor">Cancel</button>
              <button type="submit" class="rubato-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </Teleport>

  <Teleport to="body">
    <transition :css="false" @enter="modalEnter" @leave="modalLeave">
      <div v-if="confirmState.isOpen" class="fixed inset-0 z-[85] flex items-center justify-center p-6">
        <div class="w-full max-w-[520px] rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_30px_90px_rgba(0,0,0,0.16)] overflow-hidden">
          <div class="px-7 sm:px-8 py-6 border-b border-black/5">
            <div class="text-xs uppercase tracking-[0.28em] opacity-45">Confirm</div>
            <div class="mt-2 font-editorial text-xl tracking-tight">Are you sure?</div>
            <div class="mt-3 text-sm opacity-75 leading-relaxed">{{ confirmState.message }}</div>
          </div>
          <div class="px-7 sm:px-8 py-6 flex items-center justify-end gap-2">
            <button class="rubato-secondary" @click="cancelConfirm">Cancel</button>
            <button class="rubato-primary" @click="confirmProceed">Delete</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import gsap from 'gsap'
import MainSvg from '../components/MainSvg.vue'
import FloatingPanel from '../components/FloatingPanel.vue'

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

const STORAGE_KEY = 'rubato.score.items.v1'
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

const detailEl = ref<HTMLElement | null>(null)
const detailItemId = ref<string | null>(null)
const isDetailOpen = computed(() => detailItemId.value !== null)
const detailItem = computed(() => items.value.find(i => i.id === detailItemId.value) ?? null)

const isEditorOpen = ref(false)
const formError = ref<string | null>(null)

type Draft = {
  id: string | null
  type: ItemType
  category: Exclude<Category, null>
  title: string
  meta: Record<string, string>
  imagesText: string
  status: ItemStatus
}

const draft = ref<Draft>({
  id: null,
  type: 'exhibition',
  category: 'domestic',
  title: '',
  meta: {},
  imagesText: '',
  status: 'undone',
})

const confirmState = ref<{ isOpen: boolean; message: string; onConfirm: null | (() => void) }>({
  isOpen: false,
  message: '',
  onConfirm: null,
})

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

const emptyHint = computed(() => {
  if (drawerKind.value === 'exhibitions') {
    return 'Collect exhibitions as a living archive. Add title, location, time, and images.'
  }
  if (drawerKind.value === 'reading') {
    return 'Grow a reading list with author, country, language, and covers.'
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
    const loc = item.meta.location?.trim()
    const time = item.meta.time?.trim()
    if (loc && time) return `${loc} · ${time}`
    if (loc) return loc
    if (time) return time
    return '—'
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
      { key: 'location', label: 'Location', value: item.meta.location || '—' },
      { key: 'time', label: 'Time', value: item.meta.time || '—' },
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

const editorTitle = computed(() => {
  const base = draft.value.type === 'exhibition' ? 'Exhibition' : 'Book'
  return draft.value.id ? `Edit ${base}` : `New ${base}`
})

const getUUID = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const sanitizeItem = (raw: unknown): RubatoItem | null => {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<RubatoItem>
  if (!r.id || typeof r.id !== 'string') return null
  if (r.type !== 'exhibition' && r.type !== 'book') return null
  const category: Category =
    r.type === 'book' ? null : r.category === 'domestic' || r.category === 'international' ? r.category : null
  const title = typeof r.title === 'string' ? r.title : ''
  const status: ItemStatus = r.status === 'done' || r.status === 'undone' ? r.status : 'undone'
  const meta = r.meta && typeof r.meta === 'object' ? (r.meta as Record<string, string>) : {}
  const images = Array.isArray(r.images) ? r.images.filter(v => typeof v === 'string') : []
  const now = Date.now()
  return {
    id: r.id,
    type: r.type,
    category,
    title,
    meta,
    images,
    status,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : now,
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : now,
  }
}

const loadItems = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    items.value = parsed.map(sanitizeItem).filter((v): v is RubatoItem => Boolean(v))
  } catch {
    items.value = []
  }
}

const saveItems = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  } catch {
    return
  }
}

const upsertItem = (next: RubatoItem) => {
  const idx = items.value.findIndex(i => i.id === next.id)
  if (idx >= 0) {
    items.value.splice(idx, 1, next)
  } else {
    items.value.unshift(next)
  }
  saveItems()
}

const removeItem = (id: string) => {
  const idx = items.value.findIndex(i => i.id === id)
  if (idx >= 0) items.value.splice(idx, 1)
  saveItems()
}

const toggleItemStatus = (id: string) => {
  const idx = items.value.findIndex(i => i.id === id)
  if (idx < 0) return
  const cur = items.value[idx]
  const next: RubatoItem = {
    ...cur,
    status: cur.status === 'done' ? 'undone' : 'done',
    updatedAt: Date.now(),
  }
  items.value.splice(idx, 1, next)
  saveItems()
}

const openDrawer = async (kind: NonNullable<typeof drawerKind.value>, anchor: { x: number; y: number }) => {
  isPanelOpen.value = false
  detailItemId.value = null
  isEditorOpen.value = false
  confirmState.value = { isOpen: false, message: '', onConfirm: null }
  drawerKind.value = kind
  statusFilter.value = 'all'
  if (kind === 'exhibitions') drawerExhibitionCategory.value = 'domestic'
  playFlow(anchor)
  await nextTick()
  staggerCards()
}

const closeDrawer = () => {
  drawerKind.value = null
}

const openDetail = async (id: string) => {
  detailItemId.value = id
  await nextTick()
  if (detailEl.value) {
    const children = detailEl.value.querySelectorAll('.rubato-img-grain, img, .font-editorial, .rubato-secondary, .rubato-toggle')
    gsap.fromTo(children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.04 })
  }
}

const closeDetail = () => {
  detailItemId.value = null
}

const openCreateFromDrawer = () => {
  if (drawerKind.value === 'exhibitions') openCreate('exhibition')
  if (drawerKind.value === 'reading') openCreate('book')
}

const openCreate = (type: ItemType) => {
  formError.value = null
  const baseMeta: Record<string, string> =
    type === 'exhibition'
      ? { location: '', time: '', description: '' }
      : { author: '', country: '', language: '', description: '' }
  draft.value = {
    id: null,
    type,
    category: type === 'exhibition' ? (drawerExhibitionCategory.value ?? 'domestic') : 'domestic',
    title: '',
    meta: baseMeta,
    imagesText: '',
    status: 'undone',
  }
  isEditorOpen.value = true
}

const openEdit = (id: string) => {
  const item = items.value.find(i => i.id === id)
  if (!item) return
  formError.value = null
  draft.value = {
    id: item.id,
    type: item.type,
    category: item.type === 'exhibition' ? ((item.category ?? 'domestic') as Exclude<Category, null>) : 'domestic',
    title: item.title,
    meta: { ...item.meta },
    imagesText: item.images.join('\n'),
    status: item.status,
  }
  isEditorOpen.value = true
}

const closeEditor = () => {
  isEditorOpen.value = false
  formError.value = null
}

const saveDraft = () => {
  const title = draft.value.title.trim()
  if (!title) {
    formError.value = 'Title is required.'
    return
  }

  const now = Date.now()
  const type = draft.value.type
  const id = draft.value.id ?? getUUID()
  const images = draft.value.imagesText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  const next: RubatoItem = {
    id,
    type,
    category: type === 'exhibition' ? draft.value.category : null,
    title,
    meta: Object.fromEntries(Object.entries(draft.value.meta).map(([k, v]) => [k, (v ?? '').trim()])),
    images,
    status: draft.value.status,
    createdAt: draft.value.id ? (items.value.find(i => i.id === id)?.createdAt ?? now) : now,
    updatedAt: now,
  }

  upsertItem(next)
  isEditorOpen.value = false
  formError.value = null
  if (drawerKind.value) nextTick().then(staggerCards)
}

const requestDelete = (id: string) => {
  const item = items.value.find(i => i.id === id)
  if (!item) return
  confirmState.value = {
    isOpen: true,
    message: `Delete “${item.title}”? This cannot be undone.`,
    onConfirm: () => {
      removeItem(id)
      if (detailItemId.value === id) detailItemId.value = null
      if (draft.value.id === id) isEditorOpen.value = false
      confirmState.value = { isOpen: false, message: '', onConfirm: null }
    },
  }
}

const cancelConfirm = () => {
  confirmState.value = { isOpen: false, message: '', onConfirm: null }
}

const confirmProceed = () => {
  const fn = confirmState.value.onConfirm
  if (fn) fn()
}

const handleBackdropClick = () => {
  if (confirmState.value.isOpen) return cancelConfirm()
  if (isEditorOpen.value) return closeEditor()
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

const modalEnter = (el: Element, done: () => void) => {
  gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: done })
}

const modalLeave = (el: Element, done: () => void) => {
  gsap.to(el, { opacity: 0, duration: 0.28, ease: 'power2.inOut', onComplete: done })
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
  loadItems()
})
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
</style>
