import { is } from '../../tools/index'
import { PositionType } from '../../../types/index'

// 生成一个单音，此音的映射查询与音高的改变，同时可标记记录其在吉他上的位置
export class Tone {
  //所有唱名数组
  syllableMap: string[] = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']
  // 音程
  keyMap: (string | string[])[] = ['1', ['#1', 'b2'], '2', ['#2', 'b3'], '3', '4', ['#4', 'b5'], '5', ['#5', 'b6'], '6', ['#6', 'b7'], '7']
  //所有调名
  intervalMap: (string | string[])[] = ['C', ['#C', 'bD'], 'D', ['#D', 'bE'], 'E', 'F', ['#F', 'bG'], 'G', ['#G', 'bA'], 'A', ['#A', 'bB'], 'B']
  // 单音的字符串表示（去除八度标记）
  toneString: string
  // 单音的字符串表示（去除八度标记）
  toneNormal: string
  // 数字音
  key: string
  // 唱名
  syllableName: string
  // 降半调标记
  flat: string
  // 升半调标记
  sharp: string
  octave: number
  position: PositionType

  constructor(toneString: string = '1', string?: number, fret?: number) {
    this.toneString = toneString
    this.toneNormal = toneString.replace(/\./g, '')
    this.key = toneString.replace(/\.|b|#/g, '')
    this.syllableName = this.syllableMap[+this.key - 1]
    this.flat = toneString.match('b') ? 'b' : ''
    this.sharp = toneString.match('#') ? '#' : ''

    let octave_arr = toneString.split(this.key)
    let octave_flat = octave_arr[0].toString().match(/\./g)
    let octave_sharp = octave_arr[1].toString().match(/\./g)
    // 八度度数
    this.octave = (octave_sharp ? octave_sharp.length : 0) - (octave_flat ? octave_flat.length : 0)
    // 吉他按弦位置
    this.position = { string, fret }
  }

  // 查找此音在音名数组中的位置-- 返回数组的索引号
  findKeyIndex(keyString: string): number {
    return this.keyMap.findIndex((item: string | string[]) => {
      if (Array.isArray(item)) {
        return item.includes(keyString)
      } else if (item === keyString) {
        return true
      } else {
        return false
      }
    })
  }

  //音高增减，num为增或减的半音数量
  step(num: number): Tone | null {
    //
    let keyString = this.flat + this.sharp + this.key
    let len = this.keyMap.length
    let index = this.findKeyIndex(keyString)
    if (index > -1) {
      num = +num
      let nextIndex = parseInt((index + num).toString(), 0)
      let octave = this.octave
      if (nextIndex >= len) {
        let index_gap = nextIndex - len
        octave += Math.floor(index_gap / len) + 1
        nextIndex = index_gap % len
      } else if (nextIndex < 0) {
        let index_gap = nextIndex
        octave += Math.floor(index_gap / len)
        nextIndex = (index_gap % len) + len
      }
      let nextKey = this.keyMap[nextIndex]
      let octaveString = new Array(Math.abs(octave)).fill('.').join('')
      let toneString = ''
      if (!is(nextKey)('Array')) {
        toneString = (octave < 0 ? octaveString : '') + nextKey + (octave > 0 ? octaveString : '')
        return new Tone(toneString, this.position.string, this.position.fret + num)
      } else {
        return (nextKey as any).map(key => {
          return new Tone((octave < 0 ? octaveString : '') + key + (octave > 0 ? octaveString : ''), this.position.string, this.position.fret + num)
        })
      }
    } else {
      return null
    }
  }
}
