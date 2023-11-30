import { createApp } from 'vue'
import './styles.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './utils/tone.ts'
import './utils/tone.js'
import './utils/test.js'
const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
