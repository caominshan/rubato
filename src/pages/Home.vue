<template>
  <main class="relative min-h-[100svh] w-full overflow-hidden">
    <div ref="rootEl" class="absolute inset-0 opacity-0">
      <div ref="staffWrapEl" class="staff-bg pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <Enter2Svg preserveAspectRatio="xMidYMid slice" class="w-full h-full opacity-[0.16] blur-[1.2px] mix-blend-multiply" />
      </div>

      <div class="absolute inset-0 z-10 pointer-events-none">
        <div
          v-for="idx in noteCount"
          :key="idx"
          :ref="(el) => setNoteRef(el, idx - 1)"
          class="note absolute left-0 top-0 opacity-0"
        >
          <component :is="SignVariants[idx - 1]" class="note-svg w-8 sm:w-9 h-auto" />
        </div>
      </div>

      <div
        ref="watchEl"
        class="watch-center absolute h-[min(90svh,940px)] w-auto max-w-[1040px] aspect-[680/696] select-none z-30"
        @click="openPanel"
      >
        <div class="watch-shell absolute inset-0">
          <div class="absolute inset-0 flex items-center justify-center">
            <TimeSvg class="w-full h-full opacity-75 mix-blend-multiply relative z-10" />
          </div>

          <svg
            class="absolute inset-0 w-full h-full z-30"
            viewBox="0 0 680 696.32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="handShadow" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
                <feDropShadow dx="0" dy="1" stdDeviation="1.4" flood-color="#000000" flood-opacity="0.14" />
              </filter>
              <filter id="secondGlow" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
                <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#8c7a6b" flood-opacity="0.28" />
                <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#ffffff" flood-opacity="0.12" />
              </filter>
              <filter
                id="portalPurpleGlow"
                x="-80%"
                y="-80%"
                width="260%"
                height="260%"
                color-interpolation-filters="sRGB"
              >
                <feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="#8A5CF6" flood-opacity="0.70" />
                <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#8A5CF6" flood-opacity="0.48" />
                <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#8A5CF6" flood-opacity="0.32" />
                <feDropShadow dx="0" dy="0" stdDeviation="34" flood-color="#C4B5FD" flood-opacity="0.22" />
              </filter>
              <radialGradient id="pinGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#fffef0" stop-opacity="0.9" />
                <stop offset="55%" stop-color="#d9c3a5" stop-opacity="0.55" />
                <stop offset="100%" stop-color="#2b2623" stop-opacity="0.30" />
              </radialGradient>
              <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
                <stop offset="42%" stop-color="#ffffff" stop-opacity="0.06" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </linearGradient>
              <clipPath id="dialClip">
                <circle :cx="cx" :cy="cy" r="276" />
              </clipPath>
              <path
                id="portalTextArc"
                :d="`M ${cx - 64} ${cy - 26} A 64 64 0 0 0 ${cx + 64} ${cy - 26}`"
              />
            </defs>

            <g opacity="0.72">
              <line
                v-for="i in 60"
                :key="i"
                :x1="cx"
                :y1="cy - tickRadius"
                :x2="cx"
                :y2="cy - tickRadius + 12"
                stroke="rgba(43, 38, 35, 0.24)"
                stroke-width="1.2"
                stroke-linecap="round"
                :transform="`rotate(${(i - 1) * 6} ${cx} ${cy})`"
              />
            </g>

            <g clip-path="url(#dialClip)" opacity="0.28" style="mix-blend-mode: screen">
              <ellipse
                :cx="cx - 120"
                :cy="cy - 150"
                rx="330"
                ry="180"
                fill="url(#glassSheen)"
                transform="rotate(-18 340 348)"
              />
              <ellipse
                :cx="cx + 110"
                :cy="cy + 110"
                rx="280"
                ry="150"
                fill="url(#glassSheen)"
                transform="rotate(22 340 348)"
                opacity="0.28"
              />
            </g>

            <g opacity="0.85">
              <text
                :x="cx"
                :y="cy - 84"
                text-anchor="middle"
                class="dial-logo"
                fill="rgba(43, 38, 35, 0.70)"
              >RUBATO</text>
              <text
                :x="cx"
                :y="cy - 62"
                text-anchor="middle"
                class="dial-sub"
                fill="rgba(92, 85, 78, 0.58)"
              >MECHANICAL SYSTEM</text>
            </g>

            <g :transform="`rotate(${hourAngle} ${cx} ${cy})`" filter="url(#handShadow)">
              <line
                :x1="cx"
                :y1="cy + 18"
                :x2="cx"
                :y2="cy - hourLen"
                stroke="rgba(21, 18, 16, 0.96)"
                stroke-width="6"
                stroke-linecap="round"
              />
              <line
                :x1="cx - 0.7"
                :y1="cy + 18"
                :x2="cx - 0.7"
                :y2="cy - hourLen"
                stroke="rgba(255, 254, 240, 0.06)"
                stroke-width="1.2"
                stroke-linecap="round"
              />
            </g>

            <g :transform="`rotate(${minuteAngle} ${cx} ${cy})`" filter="url(#handShadow)">
              <line
                :x1="cx"
                :y1="cy + 24"
                :x2="cx"
                :y2="cy - minuteLen"
                stroke="rgba(21, 18, 16, 0.92)"
                stroke-width="4"
                stroke-linecap="round"
              />
              <line
                :x1="cx - 0.6"
                :y1="cy + 24"
                :x2="cx - 0.6"
                :y2="cy - minuteLen"
                stroke="rgba(255, 254, 240, 0.05)"
                stroke-width="1"
                stroke-linecap="round"
              />
            </g>

            <g :transform="`rotate(${secondAngle} ${cx} ${cy})`" filter="url(#secondGlow)">
              <line
                :x1="cx"
                :y1="cy + 34"
                :x2="cx"
                :y2="cy - secondLen"
                stroke="rgba(140, 122, 107, 0.92)"
                stroke-width="1.6"
                stroke-linecap="round"
              />
              <line
                :x1="cx"
                :y1="cy + 34"
                :x2="cx"
                :y2="cy + 78"
                stroke="rgba(140, 122, 107, 0.62)"
                stroke-width="1.6"
                stroke-linecap="round"
              />
              <circle :cx="cx" :cy="cy - secondLen + 8" r="2.2" fill="rgba(140, 122, 107, 0.88)" />
              <circle :cx="cx" :cy="cy + 78" r="6.2" fill="rgba(255, 254, 240, 0.10)" stroke="rgba(140, 122, 107, 0.62)" stroke-width="1" />
              <circle :cx="cx" :cy="cy + 78" r="2.2" fill="rgba(43, 38, 35, 0.28)" />
            </g>

            <circle :cx="cx" :cy="cy" r="10" fill="url(#pinGrad)" stroke="rgba(0, 0, 0, 0.08)" stroke-width="1" />
            <circle :cx="cx" :cy="cy" r="3.5" fill="rgba(43, 38, 35, 0.65)" />

            <g
              class="portal-engrave"
              :class="{ 'is-visible': isPortalHovered || isPortalHintAutoVisible, 'is-hovered': isPortalHovered }"
            >
              <text class="portal-engrave-text" text-anchor="middle">
                <textPath href="#portalTextArc" startOffset="50%">
                  Enter Rubato
                </textPath>
              </text>
            </g>

            <g class="portal">
              <circle
                ref="portalGlowEl"
                :cx="cx"
                :cy="cy"
                r="26"
                fill="rgba(138, 92, 246, 0.16)"
                class="portal-glow"
                filter="url(#portalPurpleGlow)"
              />
              <circle
                ref="portalRingEl"
                :cx="cx"
                :cy="cy"
                r="22"
                fill="none"
                stroke="rgba(140, 122, 107, 0.22)"
                stroke-width="1"
                class="portal-pulse portal-pulse-a"
              />
              <circle
                ref="portalRing2El"
                :cx="cx"
                :cy="cy"
                r="22"
                fill="none"
                stroke="rgba(140, 122, 107, 0.18)"
                stroke-width="1"
                class="portal-pulse portal-pulse-b"
              />
              <circle
                :cx="cx"
                :cy="cy"
                r="24"
                fill="none"
                stroke="rgba(138, 92, 246, 0.38)"
                stroke-width="1"
                class="portal-burst"
                filter="url(#portalPurpleGlow)"
              />
              <circle
                ref="portalCoreEl"
                :cx="cx"
                :cy="cy"
                r="8.5"
                fill="rgba(138, 92, 246, 0.44)"
                class="portal-core"
                filter="url(#portalPurpleGlow)"
              />
              <circle
                :cx="cx"
                :cy="cy"
                r="18"
                fill="transparent"
                class="portal-hit"
                @mouseenter.stop="setPortalHover(true)"
                @mouseleave.stop="setPortalHover(false)"
                @click.stop="enterPortal"
              />
            </g>
          </svg>

          <div class="absolute inset-0 pointer-events-none">
            <div class="watch-light absolute inset-0"></div>
          </div>
        </div>

      </div>

      <div class="pointer-events-none relative z-10 min-h-[100svh] flex items-end justify-center pb-10 sm:pb-14">
        <div class="text-[11px] uppercase tracking-[0.32em] text-[#5c554e] opacity-40">
          Tap the dial for status
        </div>
      </div>
    </div>
  </main>

  <FloatingPanel
    :is-open="isPanelOpen"
    title="Rubato System"
    :index="0"
    @close="isPanelOpen = false"
  >
    <div class="space-y-6">
      <div>
        <div class="text-xs uppercase tracking-[0.28em] opacity-40">Current Time</div>
        <div class="mt-2 font-editorial text-4xl tracking-tight">{{ digitalTime }}</div>
        <div class="mt-1 text-xs uppercase tracking-[0.24em] opacity-40">{{ digitalDate }}</div>
      </div>

      <div class="space-y-2">
        <div class="text-xs uppercase tracking-[0.28em] opacity-40">Rubato System Status</div>
        <div class="text-sm opacity-70">Sync: Active · Motion: Continuous · Dial: Mechanical</div>
      </div>

      <button
        class="inline-flex items-center justify-center w-full rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.26em] border border-black/10 bg-white/25 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
        @click="goScore"
      >
        进入 /score
      </button>
    </div>
  </FloatingPanel>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import FloatingPanel from '../components/FloatingPanel.vue'
import TimeSvg from '../../pics/time.svg?component'
import Enter2Svg from '../../pics/enter2.svg?component'
import SignSvg from '../../pics/sign.svg?component'
import Sign2Svg from '../../pics/sign2.svg?component'
import Sign3Svg from '../../pics/sign3.svg?component'
import Sign4Svg from '../../pics/sign4.svg?component'
import Sign5Svg from '../../pics/sign5.svg?component'

const router = useRouter()

const rootEl = ref<HTMLElement | null>(null)
const watchEl = ref<HTMLElement | null>(null)
const staffWrapEl = ref<HTMLElement | null>(null)
const noteEls = ref<(HTMLElement | null)[]>([])
const isPanelOpen = ref(false)
const isPortalHovered = ref(false)
const isPortalHintAutoVisible = ref(false)
const portalGlowEl = ref<SVGCircleElement | null>(null)
const portalRingEl = ref<SVGCircleElement | null>(null)
const portalRing2El = ref<SVGCircleElement | null>(null)
const portalCoreEl = ref<SVGCircleElement | null>(null)

const SignVariants = [SignSvg, Sign2Svg, Sign3Svg, Sign4Svg, Sign5Svg] as const
const noteCount = SignVariants.length
const setNoteRef = (el: unknown, idx: number) => {
  if (idx < 0) return
  noteEls.value[idx] = el instanceof HTMLElement ? el : null
}

const vbWidth = 680
const vbHeight = 696.32
const cx = vbWidth / 2
const cy = vbHeight / 2
const tickRadius = 262
const hourLen = 150
const minuteLen = 215
const secondLen = 242

const now = ref(new Date())
const hourAngle = ref(0)
const minuteAngle = ref(0)
const secondAngle = ref(0)
let rafId = 0

type NotePalette = { fill: string; glow: string; hueShiftDeg: number }
type NoteState = {
  idx: number
  startAt: number
  pathDur: number
  attractDur: number
  restDur: number
  appearDur: number
  amp: number
  driftFreq: number
  laneOffset: number
  laneWanderAmp: number
  laneWanderFreq: number
  rotAmp: number
  rotFreq: number
  scaleAmp: number
  scaleFreq: number
  phase: number
  palette: NotePalette
  alive: boolean
  lastCycle: number
  sinkOffsetX: number
  sinkOffsetY: number
  sinkCurveK: number
  sinkCurveSign: number
}

type PathCache = {
  samples: { x: number; y: number; nx: number; ny: number; c: number; time: number }[]
}

let pathCache: PathCache | null = null
let noteStates: NoteState[] = []
let hintTimer = 0

const palettes: NotePalette[] = [
  { fill: '#2E2637', glow: '#D9D3E6', hueShiftDeg: 1.2 },
  { fill: '#3A2F45', glow: '#D9D3E6', hueShiftDeg: 1.4 },
  { fill: '#362B44', glow: '#D9D3E6', hueShiftDeg: 1.0 },
]

const hexToRgb = (hex: string) => {
  const v = hex.replace('#', '').trim()
  const n = v.length === 3 ? v.split('').map((c) => c + c).join('') : v
  const num = Number.parseInt(n, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return { r, g, b }
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

const buildPathCache = () => {
  const root = rootEl.value
  const wrap = staffWrapEl.value
  if (!root || !wrap) return null

  const staffSvg = wrap.querySelector('svg') as SVGSVGElement | null
  if (!staffSvg) return null

  const paths = Array.from(wrap.querySelectorAll('path')) as SVGPathElement[]
  const rootRect = root.getBoundingClientRect()
  const ctmSvg = staffSvg.getScreenCTM()
  if (!ctmSvg) return null

  const best = paths.reduce<{
    el: SVGPathElement | null
    span: number
    len: number
  }>(
    (acc, el) => {
      try {
        const len = el.getTotalLength()
        const ctmPath = el.getCTM()
        if (!ctmPath) return acc

        const steps = 220
        let xMin = Number.POSITIVE_INFINITY
        let xMax = Number.NEGATIVE_INFINITY
        for (let i = 0; i <= steps; i++) {
          const p = el.getPointAtLength((i / steps) * len)
          const screen = new DOMPoint(p.x, p.y).matrixTransform(ctmPath).matrixTransform(ctmSvg)
          const x = screen.x - rootRect.left
          if (x < xMin) xMin = x
          if (x > xMax) xMax = x
        }

        const span = xMax - xMin
        if (span > acc.span + 1) return { el, span, len }
        if (Math.abs(span - acc.span) <= 1 && len > acc.len) return { el, span, len }
        return acc
      } catch {
        return acc
      }
    },
    { el: null, span: 0, len: 0 },
  )

  const staffPath = best.el
  if (!staffPath) return null
  const ctmPath = staffPath.getCTM()
  if (!ctmPath) return null

  const total = staffPath.getTotalLength()
  const n = 900
  const ptsFull: { x: number; y: number }[] = []
  for (let i = 0; i <= n; i++) {
    const p = staffPath.getPointAtLength((i / n) * total)
    const screen = new DOMPoint(p.x, p.y).matrixTransform(ctmPath).matrixTransform(ctmSvg)
    ptsFull.push({ x: screen.x - rootRect.left, y: screen.y - rootRect.top })
  }

  const idxMaxX = ptsFull.reduce((bestIdx, p, i) => (p.x > ptsFull[bestIdx].x ? i : bestIdx), 0)
  const idxMinX = ptsFull
    .slice(0, idxMaxX + 1)
    .reduce((bestIdx, p, i) => (p.x < ptsFull[bestIdx].x ? i : bestIdx), 0)

  const pts =
    idxMaxX - idxMinX >= 24
      ? ptsFull.slice(idxMinX, idxMaxX + 1)
      : ptsFull

  const angles: number[] = []
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[Math.min(pts.length - 1, i + 1)]
    angles.push(Math.atan2(p1.y - p0.y, p1.x - p0.x))
  }

  const curvature: number[] = []
  for (let i = 0; i < angles.length; i++) {
    const a0 = angles[Math.max(0, i - 1)]
    const a1 = angles[Math.min(angles.length - 1, i + 1)]
    let d = a1 - a0
    while (d > Math.PI) d -= Math.PI * 2
    while (d < -Math.PI) d += Math.PI * 2
    curvature.push(Math.abs(d))
  }

  const curvMax = Math.max(...curvature, 0.0001)
  const timeRaw: number[] = [0]
  const curvFactor = 7.5
  let acc = 0
  for (let i = 1; i < pts.length; i++) {
    const pA = pts[i - 1]
    const pB = pts[i]
    const ds = Math.hypot(pB.x - pA.x, pB.y - pA.y)
    const c = curvature[i] / curvMax
    const dt = ds * (1 + curvFactor * Math.pow(c, 1.35))
    acc += dt
    timeRaw.push(acc)
  }
  const totalTime = acc || 1
  const timeNorm = timeRaw.map((t) => t / totalTime)

  const samples = pts.map((p, i) => {
    const a = angles[i]
    const nx = -Math.sin(a)
    const ny = Math.cos(a)
    const c = curvature[i] / curvMax
    return { x: p.x, y: p.y, nx, ny, c, time: timeNorm[i] }
  })

  return { samples }
}

const samplePath = (t: number) => {
  const cache = pathCache
  if (!cache) return null
  const s = cache.samples
  const u = clamp01(t)

  let lo = 0
  let hi = s.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (s[mid].time < u) lo = mid + 1
    else hi = mid
  }

  const i1 = Math.min(s.length - 1, Math.max(1, lo))
  const i0 = i1 - 1
  const a = s[i0]
  const b = s[i1]
  const denom = b.time - a.time || 1e-6
  const k = clamp01((u - a.time) / denom)
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    nx: a.nx + (b.nx - a.nx) * k,
    ny: a.ny + (b.ny - a.ny) * k,
    c: a.c + (b.c - a.c) * k,
  }
}

const spawnNotes = (nowMs: number) => {
  noteStates = Array.from({ length: noteCount }, (_, idx): NoteState => {
    const palette = palettes[idx % palettes.length]
    const phase = Math.random() * Math.PI * 2
    const baseAngle = (idx / Math.max(1, noteCount)) * Math.PI * 2
    const angle = baseAngle + (Math.random() * 0.7 - 0.35)
    const radius = 10 + Math.random() * 22
    const sinkCurveSign = Math.random() < 0.5 ? -1 : 1
    return {
      idx,
      startAt: nowMs + idx * 2400,
      pathDur: 16000 + Math.random() * 2600,
      attractDur: 2000 + Math.random() * 600,
      restDur: 1500 + Math.random() * 800,
      appearDur: 780,
      amp: 2 + Math.random() * 4,
      driftFreq: 0.35 + Math.random() * 0.25,
      laneOffset: -16 + Math.random() * 32,
      laneWanderAmp: 1.2 + Math.random() * 2.4,
      laneWanderFreq: 0.05 + Math.random() * 0.08,
      rotAmp: 2.2 + Math.random() * 1.0,
      rotFreq: 0.18 + Math.random() * 0.2,
      scaleAmp: 0.05 + Math.random() * 0.03,
      scaleFreq: 0.22 + Math.random() * 0.18,
      phase,
      palette,
      alive: true,
      lastCycle: -1,
      sinkOffsetX: Math.cos(angle) * radius,
      sinkOffsetY: Math.sin(angle) * radius,
      sinkCurveK: 1.05 + Math.random() * 0.55,
      sinkCurveSign,
    }
  })
}

const updateNotes = (nowMs: number) => {
  if (!rootEl.value || !watchEl.value || !pathCache) return
  const rootRect = rootEl.value.getBoundingClientRect()
  const watchRect = watchEl.value.getBoundingClientRect()
  const cxRoot = watchRect.left + watchRect.width / 2 - rootRect.left
  const cyRoot = watchRect.top + watchRect.height / 2 - rootRect.top

  for (const st of noteStates) {
    const el = noteEls.value[st.idx]
    if (!el) continue

    const t0 = nowMs - st.startAt
    if (t0 < 0) {
      el.style.opacity = '0'
      continue
    }

    const total = st.pathDur + st.attractDur + st.restDur
    const cycle = Math.floor(t0 / total)
    const loopT = t0 - cycle * total
    const pathT = clamp01(loopT / st.pathDur)
    const attractT = clamp01((loopT - st.pathDur) / st.attractDur)
    const inRest = loopT > st.pathDur + st.attractDur

    if (cycle !== st.lastCycle) {
      st.lastCycle = cycle
    }

    if (inRest) {
      el.style.opacity = '0'
      continue
    }

    const appear = smoothstep(0, st.appearDur, loopT)
    const pt = samplePath(pathT)
    if (!pt) continue

    const bendLock = 1 - pt.c * 0.72
    const drift = Math.sin((nowMs / 1000) * Math.PI * 2 * st.driftFreq + st.phase) * st.amp * bendLock
    const xDrift = pt.nx * drift
    const yDrift = pt.ny * drift

    const laneWander =
      Math.sin((nowMs / 1000) * Math.PI * 2 * st.laneWanderFreq + st.phase * 0.6) * st.laneWanderAmp * bendLock
    const lane = (st.laneOffset + laneWander) * bendLock

    const nearCenter = smoothstep(0.78, 1, pathT)
    const gravity = nearCenter * nearCenter
    const pullScale = 1 - gravity * 0.08 - attractT * 0.14

    const breathe = Math.sin((nowMs / 1000) * Math.PI * 2 * st.scaleFreq + st.phase * 1.7) * st.scaleAmp
    const baseScale = (0.95 + breathe) * (0.96 + appear * 0.04) * pullScale

    const rot = Math.sin((nowMs / 1000) * Math.PI * 2 * st.rotFreq + st.phase * 0.9) * st.rotAmp

    let x = pt.x + xDrift + pt.nx * lane
    let y = pt.y + yDrift + pt.ny * lane

    if (attractT > 0) {
      const end = samplePath(1)
      const a = easeInOutCubic(attractT)
      if (end) {
        const targetX = cxRoot + st.sinkOffsetX
        const targetY = cyRoot + st.sinkOffsetY

        const tx = end.ny
        const ty = -end.nx

        const dx = targetX - end.x
        const dy = targetY - end.y
        const dist = Math.hypot(dx, dy) || 1
        const vx = dx / dist
        const vy = dy / dist
        const px = -vy * st.sinkCurveSign
        const py = vx * st.sinkCurveSign

        const lead = Math.min(260, Math.max(120, dist * 0.34 * st.sinkCurveK))
        const side = Math.min(220, Math.max(80, dist * 0.28 * st.sinkCurveK))

        const p0x = end.x
        const p0y = end.y
        const p1x = end.x + tx * lead + end.nx * (lane * 0.25)
        const p1y = end.y + ty * lead + end.ny * (lane * 0.25)
        const p2x = targetX - vx * Math.min(90, dist * 0.16) + px * side + end.nx * (lane * 0.1)
        const p2y = targetY - vy * Math.min(90, dist * 0.16) + py * side + end.ny * (lane * 0.1)
        const p3x = targetX
        const p3y = targetY

        const inv = 1 - a
        x =
          inv * inv * inv * p0x +
          3 * inv * inv * a * p1x +
          3 * inv * a * a * p2x +
          a * a * a * p3x
        y =
          inv * inv * inv * p0y +
          3 * inv * inv * a * p1y +
          3 * inv * a * a * p2y +
          a * a * a * p3y
      } else {
        x = x + (cxRoot - x) * a
        y = y + (cyRoot - y) * a
      }

      if (attractT < 0.06 && portalGlowEl.value) {
        gsap.killTweensOf(portalGlowEl.value)
        gsap.to(portalGlowEl.value, { opacity: 1, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 })
      }
    }

    const { r, g, b } = hexToRgb(st.palette.fill)
    const glow = hexToRgb(st.palette.glow)
    const hue = (Math.sin((nowMs / 1000) * Math.PI * 2 * 0.04 + st.phase) * st.palette.hueShiftDeg).toFixed(2)
    const glowBoost = 0.10 + nearCenter * 0.14 + attractT * 0.18
    const opacityBreath = 0.86 + 0.06 * Math.sin((nowMs / 1000) * Math.PI * 2 * 0.12 + st.phase * 0.7)

    el.style.setProperty('--note-fill', `rgba(${r}, ${g}, ${b}, 0.92)`)
    el.style.color = `rgba(${r}, ${g}, ${b}, 0.92)`
    el.style.opacity = String((1 - attractT) * appear * opacityBreath)
    el.style.filter = `drop-shadow(0 0 10px rgba(${glow.r}, ${glow.g}, ${glow.b}, ${glowBoost})) drop-shadow(0 0 18px rgba(${glow.r}, ${glow.g}, ${glow.b}, ${glowBoost * 0.55})) hue-rotate(${hue}deg)`
    if (isPortalHovered.value && attractT === 0) {
      const dx = cxRoot - x
      const dy = cyRoot - y
      const dist = Math.hypot(dx, dy) || 1
      const field = smoothstep(520, 120, dist)
      const pull = field * 0.022
      x += dx * pull
      y += dy * pull
    }

    el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${baseScale})`
  }
}

const digitalTime = computed(() => {
  const d = now.value
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
})

const digitalDate = computed(() => {
  const d = now.value
  const yyyy = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mo}.${da}`
})

const update = () => {
  const d = new Date()
  now.value = d
  const ms = d.getMilliseconds()
  const s = d.getSeconds() + ms / 1000
  const m = d.getMinutes() + s / 60
  const h = (d.getHours() % 12) + m / 60

  secondAngle.value = s * 6
  minuteAngle.value = m * 6
  hourAngle.value = h * 30

  updateNotes(performance.now())
  rafId = requestAnimationFrame(update)
}

const openPanel = () => {
  isPanelOpen.value = true
}

const goScore = () => {
  router.push('/score')
  isPanelOpen.value = false
}

const setPortalHover = (v: boolean) => {
  isPortalHovered.value = v
  if (portalGlowEl.value) {
    gsap.to(portalGlowEl.value, { opacity: v ? 0.85 : 0.45, scale: v ? 1.06 : 1, duration: 0.45, ease: 'power2.out' })
  }
  if (portalRingEl.value) {
    gsap.to(portalRingEl.value, { opacity: v ? 0.85 : 0.35, duration: 0.45, ease: 'power2.out' })
  }
  if (portalRing2El.value) {
    gsap.to(portalRing2El.value, { opacity: v ? 0.8 : 0.28, duration: 0.45, ease: 'power2.out' })
  }
  if (portalCoreEl.value) {
    gsap.to(portalCoreEl.value, { opacity: v ? 0.9 : 0.65, scale: v ? 1.08 : 1, duration: 0.42, ease: 'power2.out' })
  }
}

const enterPortal = async () => {
  isPanelOpen.value = false
  const tl = gsap.timeline()
  if (portalRingEl.value) {
    tl.to(portalRingEl.value, { opacity: 1, duration: 0.10, ease: 'power2.out' }, 0)
    tl.to(portalRingEl.value, { scale: 6.2, opacity: 0, duration: 0.85, ease: 'power2.out' }, 0.05)
  }
  if (portalRing2El.value) {
    tl.to(portalRing2El.value, { opacity: 0.95, duration: 0.10, ease: 'power2.out' }, 0)
    tl.to(portalRing2El.value, { scale: 8.2, opacity: 0, duration: 1.05, ease: 'power2.out' }, 0.02)
  }
  if (portalGlowEl.value) {
    tl.to(portalGlowEl.value, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0)
    tl.to(portalGlowEl.value, { scale: 3.8, opacity: 0, duration: 0.95, ease: 'power2.out' }, 0.06)
  }
  if (portalCoreEl.value) {
    tl.to(portalCoreEl.value, { opacity: 1, duration: 0.10, ease: 'power2.out' }, 0)
    tl.to(portalCoreEl.value, { scale: 0.72, opacity: 0, duration: 0.45, ease: 'power2.inOut' }, 0.18)
  }
  if (rootEl.value) {
    tl.to(rootEl.value, { filter: 'blur(20px)', opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 0.18)
  }
  tl.call(() => {
    router.push('/score')
  })
}

onMounted(() => {
  pathCache = buildPathCache()
  spawnNotes(performance.now())

  hintTimer = window.setTimeout(() => {
    isPortalHintAutoVisible.value = true
  }, 2000)

  rafId = requestAnimationFrame(update)

  if (!rootEl.value) return
  gsap.set(rootEl.value, { opacity: 1 })
  gsap.fromTo(
    rootEl.value,
    { opacity: 0, filter: 'blur(16px)', y: 18 },
    { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.2, ease: 'power3.out' },
  )

  if (watchEl.value) {
    gsap.fromTo(
      watchEl.value,
      { opacity: 0, filter: 'blur(12px)', scale: 0.985 },
      { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.35, ease: 'power3.out', delay: 0.25 },
    )
  }

  if (portalGlowEl.value) {
    gsap.set(portalGlowEl.value, { opacity: 0.45, scale: 1 })
  }

  if (portalRingEl.value) {
    gsap.set(portalRingEl.value, { opacity: 0.35, scale: 1 })
  }

  if (portalRing2El.value) {
    gsap.set(portalRing2El.value, { opacity: 0.28, scale: 1 })
  }

  if (portalCoreEl.value) {
    gsap.set(portalCoreEl.value, { opacity: 0.65, scale: 1 })
  }

})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  window.clearTimeout(hintTimer)
})
</script>

<style scoped>
.watch-center {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: transform 360ms cubic-bezier(0.4, 0, 0.2, 1);
}

.watch-center:hover {
  transform: translate(-50%, -50%) translateY(-2px);
}

.staff-bg {
  width: 100vw;
  height: 100svh;
}

.note {
  will-change: transform, opacity, filter;
  transform: translate3d(0, 0, 0);
}

.note :deep(rect),
.note :deep(polygon) {
  fill: currentColor !important;
}

.note :deep(path) {
  fill: currentColor !important;
}

.note :deep(svg) {
  color: var(--note-fill, rgba(43, 38, 35, 0.78));
}

.note :deep(svg) {
  overflow: visible;
}

.portal-hit {
  cursor: pointer;
  pointer-events: all;
}

.portal-glow,
.portal-pulse,
.portal-core {
  transform-box: fill-box;
  transform-origin: center;
}

.portal-glow {
  animation: portalGlowBreath 5.8s ease-in-out infinite;
  filter: blur(1.6px);
  opacity: 0.78;
}

.portal-core {
  animation: portalCoreBreath 5.2s ease-in-out infinite;
  opacity: 0.92;
}

.portal-core {
  mix-blend-mode: screen;
}

.watch-center:hover .portal-core {
  mix-blend-mode: screen;
}

.portal-pulse {
  animation: portalPulse 6.0s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  opacity: 0.32;
}

.portal-burst {
  transform-box: fill-box;
  transform-origin: center;
  animation: portalBurst 4.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  opacity: 0.22;
}

.portal-burst {
  animation-delay: 0.9s;
}

.portal-pulse-a {
  animation-delay: 0s;
}

.portal-pulse-b {
  animation-delay: 2.4s;
}

.portal-engrave {
  opacity: 0;
  filter: blur(8px);
  transition:
    opacity 620ms cubic-bezier(0.4, 0, 0.2, 1),
    filter 760ms cubic-bezier(0.4, 0, 0.2, 1);
}

.portal-engrave.is-visible {
  opacity: 0.72;
  filter: blur(0px);
}

.portal-engrave.is-hovered {
  opacity: 0.92;
}

.portal-engrave-text {
  font-size: 13px;
  font-weight: 360;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  fill: rgba(46, 38, 55, 0.92);
  paint-order: stroke;
  stroke: rgba(237, 227, 208, 0.10);
  stroke-width: 1.4;
  text-shadow:
    0 0 18px rgba(46, 38, 55, 0.26),
    0 0 36px rgba(138, 92, 246, 0.18),
    0 0 62px rgba(196, 181, 253, 0.12);
  opacity: 0.98;
  animation: engraveBreath 6.8s ease-in-out infinite;
}

@keyframes engraveBreath {
  0% { opacity: 0.62; }
  50% { opacity: 0.92; }
  100% { opacity: 0.62; }
}

@keyframes portalGlowBreath {
  0% { opacity: 0.34; transform: scale(1); }
  50% { opacity: 0.62; transform: scale(1.06); }
  100% { opacity: 0.34; transform: scale(1); }
}

@keyframes portalCoreBreath {
  0% { opacity: 0.54; transform: scale(1); }
  50% { opacity: 0.82; transform: scale(1.04); }
  100% { opacity: 0.54; transform: scale(1); }
}

@keyframes portalPulse {
  0% { opacity: 0; transform: scale(1); }
  22% { opacity: 0.22; transform: scale(1.04); }
  60% { opacity: 0.14; transform: scale(1.18); }
  100% { opacity: 0; transform: scale(1.42); }
}

@keyframes portalBurst {
  0% { opacity: 0; transform: scale(1); }
  12% { opacity: 0.28; transform: scale(1.05); }
  55% { opacity: 0.18; transform: scale(1.48); }
  100% { opacity: 0; transform: scale(2.15); }
}

.watch-shell {
  transition:
    box-shadow 420ms cubic-bezier(0.4, 0, 0.2, 1),
    filter 420ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;
}

.watch-center:hover .watch-shell {
  box-shadow: none;
}

.dial-logo {
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 18px;
  letter-spacing: 0.32em;
}

.dial-sub {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 9px;
  letter-spacing: 0.26em;
}

.cta {
  transition:
    transform 360ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 420ms cubic-bezier(0.4, 0, 0.2, 1),
    background-color 420ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 420ms cubic-bezier(0.4, 0, 0.2, 1);
}

.cta:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 0, 0, 0.16);
  background-color: rgba(255, 255, 255, 0.30);
  box-shadow:
    0 18px 70px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.26) inset,
    0 0 34px rgba(140, 122, 107, 0.20);
}

.watch-light {
  background:
    radial-gradient(ellipse at 50% 34%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 55%),
    radial-gradient(ellipse at 60% 66%, rgba(138, 77, 15, 0.10) 0%, rgba(138, 77, 15, 0) 62%);
  mix-blend-mode: screen;
  opacity: 0.34;
  clip-path: ellipse(42% 42% at 50% 50%);
  filter: blur(10px);
  transition: opacity 420ms cubic-bezier(0.4, 0, 0.2, 1);
}

.watch-center:hover .watch-light {
  opacity: 0.46;
}
</style>
