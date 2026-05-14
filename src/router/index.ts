import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Score from '../pages/Score.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/score', name: 'score', component: Score },
  ],
})

