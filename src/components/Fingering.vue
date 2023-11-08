<template>
  <div class="figering-container">
    <p>现有六根弦各自音名： {{ chordNotes }}</p>

    <p>{{ chordTone }}</p>

    <el-button @click="generateChordName" type="primary">生成和弦名</el-button>
    <p class="chord-name">当前和弦名：{{ chordName }}</p>
    <p class="chord-name">不同根音可能的和弦名：{{ chordNameList }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChordName } from '../utils/tone.js'

const chordNotes = ref(['E4', 'B3', 'G3', 'D3', 'A2', 'E2'])
const currentNote = ref('')
const chordTone = ref(null)
const chordName = ref('')
const keyMap = ['1', '#1', 'b2', '2', '#2', 'b3', '3', '4', '#4', 'b5', '5', '#5', 'b6', '6', '#6', 'b7', '7']
const keyMapEn = ['C', '#C', 'bD', 'D', '#E', 'bE', 'E', 'F', '#F', 'bG', 'G', '#G', 'bA', 'A', '#A', 'bB', 'B']
const chordToneList = ref([])
const chordNameList = ref([])
const guitarNotes = [
  ['E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5'],
  ['B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5'],
  ['G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4'],
  ['D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4'],
  ['A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4'],
  ['E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3'],
]

const compareNotes = (a, b) => {
  const noteA = a.match(/[A-Ga-g#b]+/)[0]
  const noteB = b.match(/[A-Ga-g#b]+/)[0]
  const numA = parseInt(a.match(/\d+/)[0])
  const numB = parseInt(b.match(/\d+/)[0])
  const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

  if (numA !== numB) {
    return numA - numB
  }

  return noteOrder.indexOf(noteA) - noteOrder.indexOf(noteB)
}

const customSort = notes => {
  return notes.sort(compareNotes)
}
// 全排列
const permute = arr => {
  const result = []

  function generatePermutations(currentArr, remainingArr) {
    if (remainingArr.length === 0) {
      result.push(currentArr.slice()) // 添加当前排列到结果数组
      return
    }

    for (let i = 0; i < remainingArr.length; i++) {
      const nextElement = remainingArr[i]
      currentArr.push(nextElement)
      const remaining = remainingArr.slice(0, i).concat(remainingArr.slice(i + 1))
      generatePermutations(currentArr, remaining)
      currentArr.pop() // 回溯，移除添加的元素
    }
  }

  generatePermutations([], arr)
  return result
}

const getDistinctNotes = notes => {
  const noteSet = new Set()

  notes.forEach(note => {
    const noteName = note.match(/[A-Ga-g#b]/)[0]
    if (!noteSet.has(noteName)) {
      noteSet.add(noteName)
    }
  })

  return Array.from(noteSet)
}

const distinctNotesWithNames = notes => {
  const distinctNotes = getDistinctNotes(notes)
  return distinctNotes.map(note => {
    const index = keyMapEn.findIndex(name => note == name)
    return keyMap[index]
  })
}

const generateChordName = () => {
  chordTone.value = customSort(chordNotes.value)
  chordTone.value = distinctNotesWithNames(chordTone.value)

  chordToneList.value = permute(chordTone.value)
  console.log(chordToneList.value, '----chordToneList.value')

  chordNameList.value = chordToneList.value.map(notes => {
    return new ChordName().getChordName(notes)
  })
  chordName.value = new ChordName().getChordName(chordTone.value)
}

const clearNoteCircle = currentLine => {
  console.log(currentLine)
  const circle = document.querySelectorAll(`.line${currentLine}`)
  console.log(circle)
  if (circle) {
    for (let i = 0; i < circle.length; i++) {
      circle[i].parentNode.removeChild(circle[i])
    }
  }
}
function createFingerSvg() {
  // 创建一个SVG元素
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', 'finger-panel')
  svg.setAttribute('width', '1500')
  svg.setAttribute('height', '300')

  // 创建14根竖线
  for (let i = 2; i < 15; i++) {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', (i * 100).toString())
    line.setAttribute('y1', '0')
    line.setAttribute('x2', (i * 100).toString())
    line.setAttribute('y2', '300')
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
      fret.setAttribute('x1', x.toString())
      fret.setAttribute('y1', y.toString())
      fret.setAttribute('x2', (x + 100).toString())
      fret.setAttribute('y2', y.toString()) // 略微增加长度以便 hover 效果
      fret.setAttribute('stroke', 'black')
      fret.setAttribute('stroke-width', '4')
      fret.setAttribute('data-set-musicId', guitarNotes[i][j + 1])

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
        // 先清除一条琴弦上的手指点和音名
        clearNoteCircle(i)

        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        marker.setAttribute('cx', (x + 50).toString())
        marker.setAttribute('cy', y.toString()) // 使圆点位于中央
        marker.setAttribute('r', '5')
        marker.setAttribute('fill', 'black')
        marker.setAttribute('class', `line${i}`)
        svg.appendChild(marker)
        currentNote.value = fret.getAttribute('data-set-musicId')
        chordNotes.value[i] = currentNote.value

        // 添加音名
        const noteText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        noteText.setAttribute('x', x.toString())
        noteText.setAttribute('y', (y + 20).toString()) // 适当调整位置以避免重叠
        noteText.setAttribute('class', `line${i}`)
        noteText.setAttribute('text-anchor', 'red')
        noteText.textContent = `音名${currentNote.value}` // 请替换为实际的音名
        svg.appendChild(noteText)
      })

      svg.appendChild(fret)
    }
  }

  // 将SVG添加到页面中
  document.querySelector('.figering-container').appendChild(svg)
}
onMounted(() => {
  createFingerSvg()
})
</script>

<style>
.el-tabs__nav-scroll {
  display: flex;
  justify-content: center;
}
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

.chord-name {
  font-size: 30px;
}
</style>
