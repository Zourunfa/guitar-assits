import { createApp } from 'vue'
import './styles.css'
import App from './App.vue'
import { Tone } from './utils/tone'

debugger
let tone = new Tone('1')

console.log(tone.findKeyIndex('#5'))
console.log(tone.findKeyIndex('2'))

console.log(tone.step(5))
createApp(App).mount('#app')
