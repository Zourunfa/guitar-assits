<script setup lang="ts">
import { ref, reactive } from 'vue'

const keyMap: string[] = ['1', '#1', 'b2', '2', '#2', 'b3', '3', '4', '#4', 'b5', '5', '#5', 'b6', '6', '#6', 'b7', '7']
const state = reactive({
  chordTone: ['1', '3', '5'],
  type: 3,
  keyBar1: 0,
  keyBar2: 38,
  keyBar3: 54,
  keyBar4: 0,
  keyBarShow1: false,
  keyBarShow2: false,
  keyBarShow3: false,
  keyBarShow4: false,
  loading: false,
})
function isArray(data: any) {
  return Object.prototype.toString.call(data) === '[object Array]'
}
function isNumber(data: any) {
  return Object.prototype.toString.call(data) === '[object Number]'
}
function isMobile() {
  return !!navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
}
</script>

<template>
  <form class="row" @submit.prevent="greet">
    <input id="greet-input" v-model="name" placeholder="Enter a name..." />
    <button type="submit">Greet</button>
  </form>

  <p>{{ greetMsg }}</p>
</template>
