<template>
  <div>
    <div v-if="chordNotes.length >= 3">
      <button @click="generateChord">Generate Chord</button>
    </div>
    <div v-if="chordNotes.length === 3">Chord Notes: {{ chordNotes.join(', ') }}</div>
    <div v-else>
      <p>Click on three different positions to generate a chord.</p>
    </div>
  </div>
</template>

<script>
// import { Guitar as GuitarSvg } from "../assets/fingerPanel.svg?component";

export default {
  components: {
    // GuitarSvg,
  },
  data() {
    return {
      strings: ['E', 'A', 'D', 'G', 'B', 'E'],
      pressedFret: null,
      pressedString: null,
      pressedNote: null,
      chordNotes: [],
    }
  },
  methods: {
    handleClick(event) {
      let x = event.clientX - event.target.getBoundingClientRect().left
      let y = event.clientY - event.target.getBoundingClientRect().top

      let stringIndex = Math.floor(y / 50)
      let fret = Math.floor(x / 200)

      if (stringIndex >= 0 && stringIndex < 6) {
        this.pressedFret = fret
        this.pressedString = stringIndex
        this.calculateNote()

        // 在按下位置添加标记
        this.addMarker(x, y)
      }
    },
    calculateNote() {
      let baseNote = this.strings[this.pressedString]
      let newNoteIndex = this.strings.indexOf(baseNote) + this.pressedFret
      this.pressedNote = this.strings[newNoteIndex % 6]

      // 检查是否已经存在于和弦音符列表，避免重复
      if (!this.chordNotes.includes(this.pressedNote)) {
        this.chordNotes.push(this.pressedNote)
      }
    },
    addMarker(x, y) {
      // 在点击位置添加一个10px黑色圆点
      let marker = document.createElement('div')
      marker.style.width = '10px'
      marker.style.height = '10px'
      marker.style.backgroundColor = 'black'
      marker.style.position = 'absolute'
      marker.style.left = x + 'px'
      marker.style.top = y + 'px'
      document.body.appendChild(marker)
    },
    generateChord() {
      // 生成和弦的逻辑在这里，根据 this.chordNotes 数组中的音符
      // 可以添加代码来确定和弦类型，显示和弦图表等
      console.log('Generating chord with notes:', this.chordNotes)
    },
  },
  mounted() {
    // 创建一个SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'finger-panel')
    svg.setAttribute('width', '1500')
    svg.setAttribute('height', '300')

    // 创建6根横琴弦
    for (let i = 0; i < 1; i++) {
      // 计算当前琴弦的Y坐标
      const y = i * 50 + 25

      // 创建15段，每段的长度为100（总宽度1500/15）
      for (let j = 0; j < 15; j++) {
        // 计算当前品格的X坐标
        const x = j * 100 + 100

        // 创建品格，表示品格的横线
        const fret = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        fret.setAttribute('x1', x)
        fret.setAttribute('y1', y)
        fret.setAttribute('x2', x + 100)
        fret.setAttribute('y2', y + 30) // 略微增加长度以便 hover 效果
        fret.setAttribute('stroke', 'black')

        // 添加 hover 效果到品格
        fret.addEventListener('mouseenter', () => {
          fret.setAttribute('stroke', 'gray') // 鼠标悬停时改变颜色
        })

        fret.addEventListener('mouseleave', () => {
          fret.setAttribute('stroke', 'black') // 鼠标离开时恢复颜色
        })

        // 添加点击事件来生成黑点和音名
        fret.addEventListener('click', () => {
          const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          marker.setAttribute('cx', x)
          marker.setAttribute('cy', y + 5) // 使圆点位于中央
          marker.setAttribute('r', 5)
          marker.setAttribute('fill', 'black')
          svg.appendChild(marker)

          // 添加音名
          const noteText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          noteText.setAttribute('x', x)
          noteText.setAttribute('y', y + 20) // 适当调整位置以避免重叠
          noteText.setAttribute('text-anchor', 'middle')
          noteText.textContent = `音名${i * 15 + j + 1}` // 请替换为实际的音名
          svg.appendChild(noteText)
        })

        svg.appendChild(fret)
      }
    }

    // 将SVG添加到页面中
    document.body.appendChild(svg)
  },
}
</script>
<style>
#fret {
  /* 品格的默认样式 */
  fill: black;
  /* 其他样式属性 */

  /* 鼠标悬停状态的样式 */
  transition: fill 0.2s; /* 添加过渡效果 */
}

.fret:hover {
  fill: red; /* 悬停状态时的样式，例如将颜色更改为红色 */
  /* 其他悬停状态时的样式属性 */
}
</style>
