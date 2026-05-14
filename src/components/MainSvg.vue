<template>
  <svg id="_图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1801.17 850.8" class="w-full h-full max-w-full max-h-full">
    <defs>
      <filter id="noteGlow" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#8c7a6b" flood-opacity="0.30" />
        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#ffffff" flood-opacity="0.16" />
        <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#d2e6ff" flood-opacity="0.12" />
      </filter>
    </defs>
    <g class="staff-lines opacity-40">
      <g>
        <path class="cls-7" d="M.59,438.51c172.43,192.63,468.99,347.15,689.94,302.19,150.23-30.57,268.36-154.95,408.31-220.59,215.92-101.28,485.83-49.42,681.81,131"/>
        <path class="cls-7" d="M6.87,343.68c165.93,203.13,440.27,374.04,666.92,338.56,154.1-24.12,280.1-144.79,425.44-204.93,224.24-92.78,495.97-27.88,686.41,163.94"/>
        <path class="cls-7" d="M13.15,248.85c159.42,213.63,411.56,400.93,643.9,374.94,157.97-17.67,291.84-134.63,442.57-189.26,232.56-84.29,506.11-6.34,691,196.89"/>
        <path class="cls-7" d="M19.42,154.02c152.92,224.13,382.85,427.81,620.88,411.32,161.84-11.22,303.58-124.47,459.7-173.59,240.88-75.79,516.25,15.19,695.6,229.84"/>
        <path class="cls-7" d="M25.7,59.19c146.41,234.62,354.14,454.7,597.86,447.69,165.71-4.76,315.32-114.3,476.83-157.92,249.2-67.3,526.39,36.73,700.19,262.78"/>
      </g>
    </g>
    
    <path class="cls-5 interactive-note" data-panel="0" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)" d="M200.1,359.77c-7.46-3.38-15.98-5.28-24.79-5.49.62-15.55,1.35-30.86,2.21-45.3,35.02-19.69,67.38-45,74.82-84.76,10.82-57.86-8.18-82.97-16.82-79.73-8.64,3.24-46.15,10.3-58.28,72.08-3.89,19.79-5.89,38.93-6.98,58.02-28.54,12.18-60.01,25.8-81.04,52.29-38.86,48.95-39.67,104.12,21.85,141.64,19.57,11.94,38.75,15.47,56.08,13.75-1.08,43.1-5.22,75.33-20.84,84.94-22.99,14.14-53.57,9.24-61.47-12.2,2.4,1.14,5.01,1.93,7.79,2.26,13.76,1.63,26.24-8.21,27.87-21.97,1.63-13.76-8.21-26.24-21.97-27.87-15.82-1.87-29.28,7.01-34.53,22.08s5.13,46.2,48.91,51.38c43.77,5.18,59.33-29.55,59.23-70.79-.01-6.2.03-16.1.15-28.49,34.62-5.62,60.85-31.97,66.09-52.71,8.06-31.89-10.31-56.46-38.26-69.13ZM187.05,227.03c12.67-39.46,34.3-48.96,48.39-44.19,14.08,4.77,13.28,44.1-18.73,68.06-9.86,7.38-22.53,13.36-36.32,19.35,1.82-19.54,4.01-34.97,6.66-43.22ZM101.45,449.88c-40.92-36.78-19.04-92.75,28.71-116.65,12.28-6.15,25.6-12.52,38.81-19.57-.21,13.36-.3,26.9-.58,40.81-18.13,1.41-36.67,10.15-49.27,28.37-20.42,29.52,6.26,59.31,20.92,65.3,0,0-17.94-33.74-3.91-51.64,7.73-9.87,19.47-13.65,31.62-13.23-.49,31.95,0,62.81-.43,89.94-19.84,2.31-43.87-3.54-65.87-23.32ZM205.26,452.77c-6.23,9.37-18.15,16.79-32.89,19.64.29-24.29.88-55.92,1.89-88.53,7.75,1.19,15.41,3.91,22.06,7.78,18.95,11.03,23.92,38.55,8.94,61.11Z"/>
    <path class="cls-5 interactive-note" data-panel="1" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)" d="M1637.88,419.46c-6.05-.81-11.01,2.35-15.46,9.3,0,0-1.02-6.95-5.08-8.36-3.48-1.21-12.92-3.13-19.7,22.28l2.35-.07s3.53-10.11,6.18-13.52c2.65-3.41,8.07-5.23,6.86,1.07-1.15,6.02-12.99,50.61-14.03,54.5l-11.68.36.11,3.57,36.75-1.13-.11-3.57-11.44.35,6.41-22.55s2.78,6,10.33,5.76c7.55-.23,16.28-7.91,19.62-22.58,3.34-14.67-4.68-24.57-11.13-25.43ZM1639.43,443.97c-4.11,12.14-10.37,19.31-14.38,18.56-4.02-.75-4.8-9.64-1.4-24.45,3.4-14.81,8.34-15.88,12.72-15.18,3.42.55,7.18,8.93,3.06,21.07Z"/>
    <path class="cls-5 interactive-note" data-panel="2" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)" d="M684.59,432.85c-16.51,2.19-25.06,12.47-28.29,17.42l-10.07-76.01-3.68.84,18.54,139.91,1.15,8.69c36.9-27.5,48.27-46.21,49.57-59.11,1.3-12.9,1.14-35.51-27.22-31.75ZM693.88,468.9c-7.76,21.39-22.69,36.93-29.39,43.14l-7.01-52.93c4.67-6.7,12.86-10.93,21.69-12.1,9.91-1.31,19.39,8.98,14.71,21.89Z"/>
    <path class="cls-5 interactive-note" data-panel="4" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)" d="M451.57,700.5c-7.82,93.53-124.29,87.32-124.29,87.32,96.83-6.07,99.64-90.67,99.64-90.67,7.66-64.61-37.42-57.77-37.42-57.77-20.71,2.18-27.06,13.79-28.72,23.34,3.93-1.98,8.38-2.75,12.92-1.92,12.39,2.27,20.73,15.45,18.61,29.46-2.11,14-13.87,23.52-26.27,21.26-12.4-2.26-20.72-15.44-18.61-29.45.05-.34.13-.65.19-.98,4.86-49.22,41.05-49.98,41.05-49.98,70.69-3.03,62.91,69.38,62.91,69.38ZM484.71,665.04c-5.56-1.01-10.79,3.13-11.72,9.26-.94,6.12,2.82,11.92,8.37,12.92,5.54,1.01,10.79-3.13,11.71-9.26.92-6.12-2.82-11.91-8.36-12.92ZM476.55,719.13c-5.56-1.01-10.8,3.14-11.73,9.28-.91,6.12,2.83,11.91,8.38,12.91,5.56,1.01,10.79-3.12,11.72-9.26.92-6.12-2.82-11.9-8.36-12.93Z"/>

    <g class="other-elements">
      
      <g class="interactive-note" data-panel="3" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)">
        <path class="cls-3" d="M1380.19,514.46c4.52,9.31-3.3,21.34-17.6,26.54-14.27,5.19-29.65,1.69-34.09-7.75-4.37-9.51,3.71-21.23,17.97-26.4,14.28-5.19,29.26-1.82,33.71,7.61Z"/>
        <path class="cls-1" d="M1379.67,520.88c4.99-40.97,10.59-81.84,16.71-122.45"/>
      </g>
   
    </g>

    <g class="interactive-note note-1" data-panel="0" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)">
      <path class="cls-5" d="M532.52,341.9l-124.81-32.21-.15,2.31-.71,10.71-.12,1.82-.86,13.02-7.68,116.35c-8.87-7.59-25.7-6.41-39.11,3.16-14.36,10.26-19.34,26.25-11.12,35.73,8.22,9.47,26.52,8.84,40.89-1.41,9.46-6.76,14.82-16,15.04-24.24h.05s8.45-127.9,8.45-127.9l111.95,28.89-7.61,115.25c-8.87-7.59-25.7-6.41-39.11,3.16-14.36,10.26-19.34,26.25-11.12,35.73,8.22,9.47,26.52,8.84,40.89-1.41,9.47-6.76,14.82-16,15.04-24.24h.05s8.37-126.81,8.37-126.81l.86-13.02.12-1.82.86-13.02v-.03s-.16-.01-.16-.01Z"/>
    </g>

    <g class="interactive-note note-2" data-panel="1" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)">
      <path class="cls-5" d="M770.06,631.42l-.39.09-6.25,1.46-112.22,26.26-6.64,1.55,8.05,25.76,4.02,12.86,3.94,12.61,26.5,84.75c-11.49-4.49-27.61,1.64-37.3,14.61-10.38,13.9-9.45,30.4,2.09,36.85,11.54,6.45,29.31.4,39.69-13.5,6.84-9.16,8.74-19.43,5.96-27.23h.05s-30.34-97.04-30.34-97.04l112.22-26.26,26.5,84.75c-11.49-4.49-27.61,1.64-37.3,14.61-10.38,13.9-9.45,30.4,2.09,36.85,11.54,6.45,29.3.4,39.69-13.5,6.84-9.16,8.74-19.43,5.96-27.23h.05s-46.36-148.26-46.36-148.26ZM663.27,697.85l-4.02-12.86,112.22-26.26,4.02,12.86-112.22,26.26Z"/>
    </g>

    <g class="interactive-note note-3" data-panel="2" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)">
      <path class="cls-3" d="M868.58,509.51c8.9,13.54,1.36,33.91-16.82,45.5-18.19,11.59-40.15,10-49.04-3.54-8.9-13.54-1.36-33.91,16.82-45.5,18.19-11.59,40.15-10,49.04,3.54Z"/>
      <line class="cls-4" x1="869.67" y1="519.64" x2="855.71" y2="325.09"/>
      <path class="cls-3" d="M856.86,341.06s2.05,5.17,32.5,31.06c30.46,25.89,59.34,61.08,8.92,114.55,0,0,29.77-35.69,15-68.46-10.15-22.52-45.52-37.98-53.76-40.02l-2.66-37.13Z"/>
    </g>

    <g class="interactive-note note-4" data-panel="3" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)">
      <path class="cls-5" d="M1257.15,286.14h-211.55v125.56c-8.64-6.17-24.1-4.15-35.89,5.06-12.62,9.87-16.24,24.25-8.08,32.12,8.16,7.87,25.01,6.25,37.63-3.63,8.32-6.51,12.7-14.96,12.4-22.23h.05v-89.59h103.21v78.26c-8.64-6.17-24.1-4.15-35.89,5.06-12.62,9.87-16.24,24.25-8.08,32.12,8.16,7.87,25.01,6.25,37.63-3.63,8.32-6.51,12.7-14.96,12.4-22.23h.05v-89.59h96.13v78.26c-8.64-6.17-24.1-4.15-35.89,5.06-12.62,9.87-16.24,24.25-8.08,32.12,8.16,7.87,25.01,6.25,37.63-3.63,8.32-6.51,12.7-14.96,12.4-22.23h.05v-136.89h-6.11ZM1051.7,321.8v-11.87h103.21v11.87h-103.21ZM1257.15,321.8h-96.13v-11.87h96.13v11.87Z"/>
    </g>

    <g class="interactive-note note-5" data-panel="4" @click="handleNoteClick($event.currentTarget)" @mouseenter="hoverNote($event.currentTarget, true)" @mouseleave="hoverNote($event.currentTarget, false)">
      <path class="cls-5" d="M1537.11,338.82c-.26-.11-.91-.42-1.12.18,0,0-.16.32.15,1.73,0,0,2.81,11.37-2.34,26.18,0,0-4.94,17.18-26.07,25.28,0,0-13.02,5.28-31.16,8.49l27.08-70.95c6.52,7.67,22.66,9.52,37.63,3.94,16.07-5.99,24.7-18.25,19.28-27.39-5.42-9.14-22.84-11.7-38.91-5.72-10.74,4-18.13,10.8-20.25,17.61h0s-57.18,149.82-57.18,149.82l6.11,1.46,2.6-6.8s5.07-10.87,17.47-15.13c0,0,3.42-1.04,6.49-2.43,0,0,43.9-16.45,46.84-55.2,2.05-1.92,4.02-3.97,5.79-6.21,0,0,17.42-21.54,8.23-44.18,0,0-.17-.49-.64-.69ZM1494.19,426.15s-10.87,7.35-31.75,11.59l2.19-5.74c.77-1.86,4.58-9.5,17.82-17.36,0,0,11.45-6.52,14.39-7.89,0,0,12.27-4.68,23.41-13.81-.13,2.62-1.95,18.12-26.07,33.21Z"/>
    </g>

    <g class="small-dots">
      <path class="cls-6 opacity-30" d="M26.45,12.11c16.68.55,33.39-.15,49.96-2.14,4.68-.56,9.35-1.22,14-1.98,1.9-.31,1.09-3.2-.8-2.89-16.26,2.64-32.71,4.04-49.19,4.19-4.66.04-9.32-.02-13.98-.17-1.93-.06-1.93,2.94,0,3h0Z"/>
      <path class="cls-6 opacity-30" d="M141,3c1.93,0,1.93-3,0-3s-1.93,3,0,3h0Z"/>
      <path class="cls-6 opacity-30" d="M916.38,60.69c1.93,0,1.93-3,0-3s-1.93,3,0,3h0Z"/>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';

const emit = defineEmits<{
  (e: 'note-click', payload: { index: number; anchor: { x: number; y: number } }): void;
}>();

let floatTweens: gsap.core.Tween[] = [];
const floatTweenByEl = new WeakMap<SVGGraphicsElement, gsap.core.Tween>();
const hoverState = new WeakMap<SVGGraphicsElement, boolean>();
const leaveTimeoutByEl = new WeakMap<SVGGraphicsElement, number>();
const glowCss =
  'drop-shadow(0 0 10px rgba(140, 122, 107, 0.42)) drop-shadow(0 0 22px rgba(255, 255, 255, 0.22)) drop-shadow(0 0 34px rgba(210, 230, 255, 0.16))';

const getGlowTargets = (el: SVGGraphicsElement): SVGGraphicsElement[] => {
  const tag = el.tagName.toLowerCase();
  if (tag !== 'g') return [el];

  return Array.from(
    (el as SVGGElement).querySelectorAll<SVGGraphicsElement>(
      'path, polygon, polyline, circle, ellipse, rect, line',
    ),
  );
};

const hoverNote = (target: EventTarget | null, isHover: boolean) => {
  const el = target as SVGGraphicsElement | null;
  if (!el) return;

  const prevTimer = leaveTimeoutByEl.get(el);
  if (prevTimer) {
    window.clearTimeout(prevTimer);
    leaveTimeoutByEl.delete(el);
  }

  const floatTween = floatTweenByEl.get(el);

  if (isHover) {
    if (floatTween) floatTween.pause();
    for (const t of getGlowTargets(el)) t.style.filter = glowCss;

    const prev = hoverState.get(el) ?? false;
    if (prev) return;
    hoverState.set(el, true);

    gsap.to(el, {
      scale: 1.015,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    return;
  }

  const timer = window.setTimeout(() => {
    hoverState.set(el, false);
    if (floatTween) floatTween.resume();
    for (const t of getGlowTargets(el)) t.style.filter = '';

    gsap.to(el, {
      scale: 1,
      duration: 0.36,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    leaveTimeoutByEl.delete(el);
  }, 140);

  leaveTimeoutByEl.set(el, timer);
};

const handleNoteClick = (target: EventTarget | null) => {
  const el = target as (SVGGraphicsElement & { dataset?: DOMStringMap }) | null;
  const panelRaw = el?.dataset?.panel;
  if (!panelRaw) return;

  const panelIndex = Number(panelRaw);
  if (!Number.isFinite(panelIndex)) return;

  const rect = el.getBoundingClientRect();
  emit('note-click', {
    index: panelIndex,
    anchor: {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    },
  });
};

onMounted(() => {
  const notes = document.querySelectorAll('.interactive-note');
  
  notes.forEach((note, index) => {
    const el = note as SVGGraphicsElement;
    const bbox = el.getBBox();
    gsap.killTweensOf(el);
    gsap.set(el, {
      opacity: 0,
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: `${bbox.x + bbox.width / 2}px ${bbox.y + bbox.height / 2}px`,
    });

    const yRange = 7 + (index % 3) * 3;
    const duration = 4.2 + (index % 4) * 1.1;
    const delay = index * 0.5;

    const tween = gsap.to(el, {
      y: -yRange,
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      paused: true,
    });
    floatTweens.push(tween);
    floatTweenByEl.set(el, tween);
    
    gsap.fromTo(
      el,
      { opacity: 0, y: 6 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        delay,
        onComplete: () => {
          tween.play(0);
        },
      },
    );
  });
});

onUnmounted(() => {
  floatTweens.forEach(t => t.kill());
});
</script>

<style scoped>
.cls-1 {
  stroke-width: .95px;
}

.cls-1, .cls-2 {
  stroke: #2b2623;
}

.cls-1, .cls-2, .cls-3 {
  fill-rule: evenodd;
}

.cls-1, .cls-2, .cls-4 {
  stroke-miterlimit: 10;
}

.cls-2 {
  stroke-width: .94px;
}

.cls-5 {
  fill: #2b2623;
}

.cls-6 {
  fill: #f2ede4;
}

.cls-7 {
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.17px;
}

.cls-7, .cls-4 {
  fill: none;
  stroke: rgba(43, 38, 35, 0.62);
}

.cls-4 {
  stroke-width: .95px;
}

.interactive-note {
  cursor: pointer;
  transform-origin: center;
  transition: filter 0.3s ease;
  pointer-events: bounding-box;
  will-change: transform;
  fill: #3a332f;
  stroke: rgba(58, 51, 47, 0.55);
}

.interactive-note .cls-1,
.interactive-note .cls-2,
.interactive-note .cls-4 {
  stroke: rgba(58, 51, 47, 0.55);
}

.interactive-note .cls-3,
.interactive-note .cls-5 {
  fill: #3a332f;
}

.interactive-note:hover {
  opacity: 1;
}
</style>
