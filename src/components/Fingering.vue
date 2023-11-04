<template>
  <div>
    {{ this.chordNotes }}

    <p>{{ chordTone }}</p>
    <p>{{ chordName }}</p>
  </div>
</template>

<script>
import { GuitarChord, ChordName, ChordSvg } from '../utils/tone.js'

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
      chordNotes: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'],
      currentNote: '',
      chordTone: null,
      chordName: '',
      keyMap: ['1', '#1', 'b2', '2', '#2', 'b3', '3', '4', '#4', 'b5', '5', '#5', 'b6', '6', '#6', 'b7', '7'],
      keyMapEn: ['C', '#C', 'bD', 'D', '#E', 'bE', 'E', 'F', '#F', 'bG', 'G', '#G', 'bA', 'A', '#A', 'bB', 'B'],
      // 创建一个二维数组表示吉他琴弦和品格上的音名
      guitarNotes: [
        ['E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5'],
        ['B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5'],
        ['G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4'],
        ['D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4'],
        ['A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4'],
        ['E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3'],
      ],
    }
  },
  methods: {
    getDistinctNotes(notes) {
      const noteSet = new Set()

      notes.forEach(note => {
        // 提取音符的字母部分
        const noteName = note.match(/[A-Ga-g#b]/)[0]
        if (!noteSet.has(noteName)) {
          noteSet.add(noteName)
        }
      })

      return Array.from(noteSet)
    },
    distinctNotesWithNames(notes) {
      const distinctNotes = this.getDistinctNotes(notes)

      return distinctNotes.map(note => {
        const index = this.keyMapEn.findIndex(name => note == name)
        console.log(index, '--index')
        console.log(this.keyMap[index], '---this.keyMap[index]')
        return this.keyMap[index]
      })
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
    generateChordName(chordTone) {
      const chord = new GuitarChord()
      console.log(chord, '----chord1')
      console.log(chordTone, '----chordTone')
      this.chordName = new ChordName().getChordName(chordTone)
    },
  },
  mounted() {
    // 创建一个SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'finger-panel')
    svg.setAttribute('width', '1500')
    svg.setAttribute('height', '300')

    // 创建14根竖线
    for (let i = 2; i < 15; i++) {
      let line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', i * 100)
      line.setAttribute('y1', 0)
      line.setAttribute('x2', i * 100)
      line.setAttribute('y2', 300)
      line.setAttribute('stroke', 'black')
      line.setAttribute('stroke-width', '4')
      svg.appendChild(line)
    }

    // 创建6根横琴弦
    for (let i = 0; i < 6; i++) {
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
        fret.setAttribute('y2', y) // 略微增加长度以便 hover 效果
        fret.setAttribute('stroke', 'black')
        fret.setAttribute('stroke-width', '4')
        fret.setAttribute('data-set-musicId', this.guitarNotes[i][j + 1])
        // 添加 hover 效果到品格
        fret.addEventListener('mouseenter', () => {
          fret.setAttribute('stroke', 'yellowgreen') // 鼠标悬停时改变颜色
          fret.setAttribute('stroke-width', '6')
        })

        fret.addEventListener('mouseleave', () => {
          fret.setAttribute('stroke', 'black') // 鼠标离开时恢复颜色
          fret.setAttribute('stroke-width', '4')
        })

        // 添加点击事件来生成黑点和音名
        fret.addEventListener('click', () => {
          const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          marker.setAttribute('cx', x + 50)
          marker.setAttribute('cy', y) // 使圆点位于中央
          marker.setAttribute('r', 5)
          marker.setAttribute('fill', 'black')

          svg.appendChild(marker)

          this.currentNote = fret.getAttribute('data-set-musicId')
          this.chordNotes[i] = this.currentNote
          this.chordTone = this.distinctNotesWithNames(this.chordNotes)
          this.generateChordName(this.chordTone.sort())
          console.log(this.chordTone, '--this.chordTone')
          // 添加音名
          const noteText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          noteText.setAttribute('x', x)
          noteText.setAttribute('y', y + 20) // 适当调整位置以避免重叠
          noteText.setAttribute('text-anchor', 'red')
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
