import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import 'leaflet/dist/leaflet.css'

const app = createApp(App)

if (import.meta.env.VITE_APP_ENV === 'development') {
  app.config.devtools = false
} else {
  app.config.devtools = false
}

// Disable Vue Devtools entirely
if (typeof window !== 'undefined' && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = undefined // Disable Devtools global hook
}

console.log(app.config)

app.mount('#app')
