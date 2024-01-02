export function is(data: any) {
  return function (type: string) {
    return Object.prototype.toString.call(data) === `[object ${type}]`
  }
}

export class Tone {
  syllableMap: string[] = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'] //所有唱名数组
  keyMap: (string | string[])[] = ['1', ['#1', 'b2'], '2', ['#2', 'b3'], '3', '4', ['#4', 'b5'], '5', ['#5', 'b6'], '6', ['#6', 'b7'], '7'] // 音程
  intervalMap: (string | string[])[] = ['C', ['#C', 'bD'], 'D', ['#D', 'bE'], 'E', 'F', ['#F', 'bG'], 'G', ['#G', 'bA'], 'A', ['#A', 'bB'], 'B'] //所有调名
  toneString: string // 单音的字符串表示
  toneNormal: string // 单音的字符串表示（去除八度标记）
  key: string // 数字音
  syllableName: string // 唱名
  flat: string // 降半调标记
  sharp: string // 升半调标记
  octave: number
  position: { string: number; fret: number }

  constructor(toneString: string = '1', string: number, fret: number) {
    this.toneString = toneString
    this.toneNormal = toneString.replace(/\./g, '')
    this.key = toneString.replace(/\.|b|#/g, '')
    this.syllableName = this.syllableMap[+this.key - 1]
    this.flat = toneString.match('b') ? 'b' : ''
    this.sharp = toneString.match('#') ? '#' : ''

    let octave_arr = toneString.split(this.key)
    let octave_flat = octave_arr[0].toString().match(/\./g)
    let octave_sharp = octave_arr[1].toString().match(/\./g)
    this.octave = (octave_sharp ? octave_sharp.length : 0) - (octave_flat ? octave_flat.length : 0)
    this.position = { string, fret }
  }

  //
  findKeyIndex(keyString: string): number {
    return this.keyMap.findIndex(item => {
      if (Array.isArray(item)) {
        return item.includes(keyString)
      } else if (item === keyString) {
        return true
      } else {
        return false
      }
    })
  }

  step(num: number): Tone | null {
    let keyString = this.flat + this.sharp + this.key
    let len = this.keyMap.length
    let index = this.findKeyIndex(keyString)

    if (index > -1) {
      num = +num
      let nextIndex = parseInt((index + num).toString(), 0)
      let octave = this.octave
      let index_gap = nextIndex - len

      if (nextIndex >= len) {
        octave += Math.floor(index_gap / len) + 1
        nextIndex = index_gap % len
      } else if (nextIndex < 0) {
        let index_gap = nextIndex
        octave += Math.floor(index_gap / len)
        nextIndex = (index_gap % len) + len
      }

      let nextKey = this.keyMap[nextIndex]
      let octaveString = new Array(Math.abs(octave)).fill('.').join('')
      let tongString = ''

      if (!is(nextKey)('Array')) {
        tongString = (octave < 0 ? octaveString : '') + nextKey + (octave > 0 ? octaveString : '')
        return new Tone(this.toneString, this.position.string, this.position.fret + num)
      } else {
        return (nextKey as string[]).map(key => {
          return new Tone((octave < 0 ? octaveString : '') + key + (octave > 0 ? octaveString : ''), this.position.string, this.position.fret + num) as Tone
        })
      }
    } else {
      return null
    }
  }
}
