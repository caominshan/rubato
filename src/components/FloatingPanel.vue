<template>
  <Teleport to="body">
    <transition
      @enter="enter"
      @leave="leave"
      :css="false"
    >
      <div v-if="isOpen" class="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 glass-panel flex flex-col p-10 sm:p-16">
        <!-- Close button -->
        <button 
          @click="$emit('close')" 
          class="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/50 transition-colors border border-white/40 shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Content -->
        <div class="mt-12 flex-1 flex flex-col overflow-y-auto">
          <h2 class="font-editorial text-4xl mb-4 tracking-tight">{{ title }}</h2>
          <p class="text-sm uppercase tracking-widest opacity-50 mb-12">0{{ index + 1 }} // {{ title }}</p>
          
          <div class="prose prose-sm prose-stone leading-relaxed opacity-80 text-balance flex-1">
            <slot></slot>
          </div>

          <!-- Footer of panel -->
          <div class="mt-12 pt-8 border-t border-black/5 flex items-center justify-between text-xs opacity-40 uppercase tracking-widest">
            <span>Archival Access</span>
            <span>2026.05</span>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
  
  <Teleport to="body">
    <transition name="fade">
      <div 
        v-if="isOpen" 
        @click="$emit('close')"
        class="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
      ></div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import gsap from 'gsap';

defineProps<{
  isOpen: boolean;
  title: string;
  index: number;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const enter = (el: Element, done: () => void) => {
  gsap.fromTo(el,
    { x: '100%', opacity: 0 },
    { x: '0%', opacity: 1, duration: 0.6, ease: 'power3.out', onComplete: done }
  );
  
  // Staggered reveal for children
  const children = el.querySelectorAll('h2, p, .prose, .border-t');
  gsap.fromTo(children,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power2.out' }
  );
};

const leave = (el: Element, done: () => void) => {
  gsap.to(el, {
    x: '100%',
    opacity: 0,
    duration: 0.5,
    ease: 'power3.in',
    onComplete: done
  });
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
