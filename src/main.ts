import { createApp } from 'vue'
import './styles.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// import './utils/tone.ts'
import './utils/tone.js'
<<<<<<< HEAD
=======
import './utils/test.ts'
>>>>>>> b2ca05985d24b068cbc4f792dea9c9c8dd6ee164
import './utils/test.js'
const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
