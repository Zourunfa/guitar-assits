<script setup lang="ts">
import { ref, reactive } from 'vue'

const keyMap = ['1', '#1', 'b2', '2', '#2', 'b3', '3', '4', '#4', 'b5', '5', '#5', 'b6', '6', '#6', 'b7', '7']
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
  startX: 0,
  minLeft: 0,
  maxLeft: 0,
  keyBarX: 0,
  keyBarName: '',
  selectWidth: '',
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

function touchStart(index: number, e: any) {
  let keyBarName = 'keyBar' + (index + 1)
  let _state = {}
  let clientX = isNumber(e) ? e : e.touches[0].clientX
  _state['keyBarShow' + (index + 1)] = true
  state.selectWidth = document.getElementById('key1')!.clientWidth
  state.maxLeft = state.selectWidth * 0.9 - 20
  state.minLeft = state.selectWidth * 0.1
  state.startX = clientX
  state.keyBarX = state.state[keyBarName]
  state.setState(_state)
}

// function touchMove(index: number, e: any) {
//   let keyBarName = 'keyBar' + (index + 1)

//   let x = isNumber(e) ? e : e.touches[0].clientX
//   let dx = x - startX
//   let _state = {}
//   let resultX = (state.keyBarX + dx) * 0.8
//   _state[keyBarName] = resultX < state.minLeft ? state.minLeft : resultX > state.maxLeft ? this.maxLeft : resultX
//   let percent = (_state[keyBarName] - this.minLeft) / (this.maxLeft - this.minLeft + 0.01)
//   let newKey = this.keyMap[Math.floor(percent * this.keyMap.length)]
//   _state.chordTone = this.state.chordTone.concat()
//   _state.chordTone[index] = newKey

//   this.setState(_state)
// }
</script>

<template></template>
