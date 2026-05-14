<template>
  <div class="bg-cinematic min-h-screen w-full flex flex-col relative overflow-hidden font-sans text-[#2b2623]">
    <div class="digital-glow"></div>
    <RouterView />
    <div class="fixed bottom-8 left-8 text-xs uppercase tracking-[0.3em] opacity-40 mix-blend-multiply z-10 pointer-events-none">
      AI / Art / Design
    </div>
    <div class="fixed bottom-8 right-8 text-xs uppercase tracking-[0.3em] opacity-40 mix-blend-multiply z-10 pointer-events-none">
      Digital Space
    </div>
  </div>
</template>
