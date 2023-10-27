<script setup lang="ts">
import { reactive } from 'vue'
interface NormalObject {
  [key: string]: any
}

const keyMap = ['1', '#1', 'b2', '2', '#2', 'b3', '3', '4', '#4', 'b5', '5', '#5', 'b6', '6', '#6', 'b7', '7']

interface StateInterface {
  [key: string]: any
  chordTone: string[]
  type: number
}
const state: StateInterface = reactive({
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
  selectWidth: 0,
  isMouseDown: true,
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

function touchStart(index: number, e: TouchEvent | number) {
  let keyBarName = 'keyBar' + (index + 1)
  let _state: NormalObject = {}
  let clientX = isNumber(e) ? e : e.touches[0].clientX
  _state['keyBarShow' + (index + 1)] = true
  state.selectWidth = document.getElementById('key1')!.clientWidth
  state.maxLeft = state.selectWidth * 0.9 - 20
  state.minLeft = state.selectWidth * 0.1
  state.startX = clientX
  state.keyBarX = state[keyBarName]
  Object.assign(state, _state)
}

function touchMove(index: number, e: TouchEvent | number) {
  let keyBarName = 'keyBar' + (index + 1)

  let x = isNumber(e) ? e : e.touches[0].clientX
  let dx = x - state.startX
  let _state: NormalObject = {}
  let resultX = (state.keyBarX + dx) * 0.8
  _state[keyBarName] = resultX < state.minLeft ? state.minLeft : resultX > state.maxLeft ? state.maxLeft : resultX
  let percent = (_state[keyBarName] - state.minLeft) / (state.maxLeft - state.minLeft + 0.01)
  let newKey = keyMap[Math.floor(percent * keyMap.length)]
  _state.chordTone = state.chordTone.concat()
  _state.chordTone[index] = newKey

  Object.assign(state, _state)
}

function touchEnd(index: number) {
  let _state: NormalObject = {}
  _state['keyBarShow' + (index + 1)] = false
  _state.loading = true
  Object.assign(state, _state)
  console.log(state, '----state')
  // this.props.selectFinish(this.state.chordTone)
}

function mouseDown(index: number, e: MouseEvent) {
  if (isMobile()) return
  state.isMouseDown = true
  touchStart(index, e.pageX)
}
function mouseUp(index: number, e: MouseEvent) {
  if (isMobile()) return
  state.isMouseDown = false
  touchEnd(index)
}
function mouseMove(index: number, e: MouseEvent) {
  if (isMobile() || !state.isMouseDown) return
  touchMove(index, e.pageX)
}
function mouseLeave(index: number, e: MouseEvent) {
  if (isMobile() || !state.isMouseDown) return
  state.isMouseDown = false
  touchEnd(index)
}

function chordCountChange(count: number) {
  state.chordTone.slice(0, count)
  state.type = count

  if (count === 4 && state.chordTone.length < 4) {
    state.chordTone.concat(['1'])
    state.keyBar4 = 0
  }
}
</script>

<template>
  <div class="container-chordSelect">
    <div class="key-select">
      <div
        v-for="(key, i) in state.chordTone"
        :key="'vuekey_' + i"
        :id="'key' + (i + 1)"
        class="key-num square"
        @touchstart="touchStart(i, $event)"
        @touchmove="touchMove(i, $event)"
        @touchend="touchEnd(i)"
        @mousedown="mouseDown(i, $event)"
        @mouseup="mouseUp(i, $event)"
        @mousemove="mouseMove(i, $event)"
        @mouseleave="mouseLeave(i, $event)"
      >
        <span class="noselect">{{ key }}</span>
        <div :class="'key-bar' + (state['keyBarShow' + (i + 1)] ? ' keybar-show' : '')" :style="{ left: state['keyBar' + (i + 1)] + 'px' }"></div>
      </div>
    </div>
    <div class="select-notify noselect">左右拖动可改变和弦组成音</div>
    <div class="chord-count">
      <div :class="{ noselect: true, active: state.type === 3 }" @click="chordCountChange(3)">三音和弦</div>
      <div :class="{ noselect: true, active: state.type === 4 }" @click="chordCountChange(4)">四音和弦</div>
    </div>
    <div class="loading-box" :class="{ show: state.loading }">
      <img src="loading.gif" alt="" class="loading" />
    </div>
  </div>
</template>

<style>
.container-chordSelect {
  width: 100%;
}

.square {
  width: 100%;
}
.square:after {
  content: '';
  display: block;
  padding-top: 100%;
}
.key-select {
  width: 100%;
  text-align: center;
  padding: 0 1rem;
  box-sizing: border-box;
  margin-top: 20px;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
}
.key-select .key-num {
  position: relative;
  /*display: inline-block;*/
  background: transparent;
  max-width: 170px;
  min-width: 70px;
  min-height: 70px;
  cursor: pointer;
  -webkit-box-flex: 1;
  flex: 1;
  -webkit-transition: 0.3s ease;
  -ms-transition: 0.3s ease;
  transition: 0.3s ease;
}

.key-select .key-num:before {
  content: '';
  display: block;
  position: absolute;
  left: 50%;
  bottom: 0;
  height: 2px;
  width: 80%;
  background: #ddd;
  z-index: 1;
  -webkit-transform: translate3d(-50%, 0, 0);
  -ms-transform: translate3d(-50%, 0, 0);
  transform: translate3d(-50%, 0, 0);
}
.key-select .key-num:last-of-type {
  margin-right: 0;
}
.key-select .key-num > span {
  position: absolute;
  display: inline-block;
  color: #666;
  top: 50%;
  left: 50%;
  font-size: 40px;
  -webkit-transform: translate3d(-50%, -50%, 0);
  -ms-transform: translate3d(-50%, -50%, 0);
  transform: translate3d(-50%, -50%, 0);
}
.key-select .key-num .key-bar {
  opacity: 0;
  position: absolute;
  left: 20px;
  bottom: 0;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #ddd;
  -webkit-transition: 0.3s ease;
  -ms-transition: 0.3s ease;
  transition: 0.3s ease;
}
.key-select .key-num .key-bar.keybar-show {
  opacity: 1;
}
.select-notify {
  line-height: 50px;
  color: #ddd;
  font-size: 13px;
  text-align: center;
}
.chord-count {
  width: 100%;
  text-align: center;
}
.chord-count > div {
  display: inline-block;
  text-align: center;
  width: 15%;
  line-height: 30px;
  font-size: 13px;
  min-width: 80px;
  max-width: 200px;
  background: #fff;
  color: #aaa;
  margin-right: 10px;
  border-radius: 2px;
  cursor: pointer;
  -webkit-transition: 0.3s ease;
  -ms-transition: 0.3s ease;
  transition: 0.3s ease;
}
.chord-count > div:last-of-type {
  margin-right: 0;
}
.chord-count > div.active {
  background: #ddd;
  color: #666;
}
.loading-box {
  opacity: 0;
  margin-top: 20px;
  width: 100%;
  height: 20px;
  background: #fff;
  text-align: center;
  -webkit-transition: 0.3s ease;
  -ms-transition: 0.3s ease;
  transition: 0.3s ease;
}
.loading-box.show {
  opacity: 1;
  margin: 20px 0;
}
.loading-box .loading {
  height: 100%;
}
.noselect {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
