import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import Paper from '../views/Paper.vue'
import Preset from '../views/Preset.vue'
import Grade from '../views/Grade.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/Home',
    name: 'Home',
    component: Home
  },
  {
    path: '/Paper',
    name: 'Paper',
    component: Paper
  },
  {
    path: '/Preset',
    name: 'Preset',
    component: Preset
  },
  {
    path: '/Grade',
    name: 'Grade',
    component: Grade
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
