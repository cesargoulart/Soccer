import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Verifica se a variável de ambiente está acessível
console.log('Google API Key:', import.meta.env.VITE_GOOGLE_API_KEY)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
