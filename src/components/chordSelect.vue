<script setup lang="ts">
import { ref, reactive } from 'vue'
interface NormalObject {
  [key: string]: any
}

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

function touchStart(index: number, e: any) {
  let keyBarName = 'keyBar' + (index + 1)
  let _state: NormalObject = {}
  let clientX = isNumber(e) ? e : e.touches[0].clientX
  _state['keyBarShow' + (index + 1)] = true
  state.selectWidth = document.getElementById('key1')!.clientWidth
  state.maxLeft = state.selectWidth * 0.9 - 20
  state.minLeft = state.selectWidth * 0.1
  state.startX = clientX
  state.keyBarX = state.state[keyBarName]
  state.value = _state
}

function touchMove(index: number, e: any) {
  let keyBarName = 'keyBar' + (index + 1)

  let x = isNumber(e) ? e : e.touches[0].clientX
  let dx = x - state.startX
  let _state: NormalObject = {}
  let resultX = (state.keyBarX + dx) * 0.8
  _state[keyBarName] = resultX < state.minLeft ? state.minLeft : resultX > state.maxLeft ? state.maxLeft : resultX
  let percent = (_state[keyBarName] - state.minLeft) / (state.maxLeft - state.minLeft + 0.01)
  let newKey = state.keyMap[Math.floor(percent * state.keyMap.length)]
  _state.chordTone = state.state.chordTone.concat()
  _state.chordTone[index] = newKey
  state.value = _state
}

function touchEnd(index: number, e: any) {
  let _state: NormalObject = {}
  _state['keyBarShow' + (index + 1)] = false
  _state.loading = true
  state.value = _state
  // this.props.selectFinish(this.state.chordTone)
}

function mouseDown(index: number, e: any) {
  if (isMobile()) return
  state.isMouseDown = true
  touchStart(index, e.pageX)
}
function mouseUp(index: number, e?: any) {
  if (state.isMobile()) return
  state.isMouseDown = false
  touchEnd(index, _)
}
function mouseMove(index: number, e: any) {
  if (isMobile() || !state.isMouseDown) return
  touchMove(index, e.pageX)
}
function mouseLeave(index: number, e?: any) {
  if (isMobile() || !state.isMouseDown) return
  state.isMouseDown = false
  touchEnd(index)
}
</script>

<template>
      <div :class="container-chordSelect">
        <div :class="key-select">
      
            <div
            v-for="(key,i) in state.chordTone"
              :key=${reactkey} + i
              :id=`${key}+i+1`
              :class="key-num square"
              @onTouchStart=touchStart(i)
              @onTouchMove=touchMove(i)
              @onTouchEnd=touchEnd(i)
              @onMouseDown=mouseDown(i)
              @onMouseUp=mouseUp(i)
              @nMouseMove=mouseMove(i)
              @onMouseLeave=mouseLeave(i)

          
            >
              <span :class="noselect">{key}</span>
              <div :class='key-bar' + state['keyBarShow' + flag] ? ' keybar-show' : '')} style={{ left: this.state['keyBar' + flag] + 'px' }}></div>
            </div>
    
      </div>
        <div :class="select-notify noselect">左右拖动可改变和弦组成音</div>
        <div :class="chord-count">
          <div :class={this.state.type === 3 ? 'noselect active' : 'noselect'} onClick={this.chordCountChange.bind(this, 3)}>
            三音和弦
          </div>
          <div :class={this.state.type === 4 ? 'noselect active' : 'noselect'} onClick={this.chordCountChange.bind(this, 4)}>
            四音和弦
          </div>
        </div>
        <div :class={'loading-box' + (this.state.loading ? ' show' : '')}>
          <img src={loading} alt="" :class="loading" />
        </div>
      </div>
</template>
