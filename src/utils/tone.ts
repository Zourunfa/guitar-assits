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
  position: { string?: number; fret?: number }

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
    this.octave = (octave_sharp ? octave_sharp.length : 0) - (octave_flat ? octave_flat.length : 0)
    this.position = { string, fret }
  }

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
      let nextIndex = parseInt(index + num, 0)
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
        return nextKey.map(key => {
          return new Tone((octave < 0 ? octaveString : '') + key + (octave > 0 ? octaveString : ''), this.position.string, this.position.fret + num)
        })
      }
    } else {
      return null
    }
  }
}

let tone = new Tone('1')

console.log(tone.findKeyIndex('#5'))

class ChordName {
  private toneUtil: Tone
  constructor(chordTone: string[]) {
    this.toneUtil = new Tone()
  }

  private getToneSpace(tonePre: string, toneNext: string): number {
    let toneSpace = this.toneUtil.findKeyIndex(toneNext) - this.toneUtil.findKeyIndex(tonePre)

    return (toneSpace = toneSpace < 0 ? toneSpace + 12 : toneSpace)
  }

  // 大三度
  private isMajorThird(tonePre: string, toneNext: string): boolean {
    return this.getToneSpace(tonePre, toneNext) === 4
  }
  // 小三度
  private isMinorThird(tonePre: string, toneNext: string): boolean {
    return this.getToneSpace(tonePre, toneNext) === 3
  }
  // 增三度
  private isMajorMajorThird(tonePre: string, toneNext: string): boolean {
    return this.getToneSpace(tonePre, toneNext) === 5
  }
  // 减三度
  private isMinorMinorThird(tonePre: string, toneNext: string): boolean {
    return this.getToneSpace(tonePre, toneNext) === 2
  }
  // 大三和弦 = 大三度 + 小三度
  private isMajorChord(chordTone: string[]): boolean {
    return this.isMajorThird(chordTone[0], chordTone[1]) && this.isMinorThird(chordTone[1], chordTone[2])
  }
  // 小三和弦 = 小三度 + 大三度
  private isMinorChord(chordTone: string[]): boolean {
    return this.isMinorThird(chordTone[0], chordTone[1]) && this.isMajorThird(chordTone[1], chordTone[2])
  }
  // 增三和弦 = 大三度 + 大三度
  private isAugmentedChord(chordTone: string[]): boolean {
    return this.isMajorThird(chordTone[0], chordTone[1]) && this.isMajorThird(chordTone[1], chordTone[2])
  }
  // 小三和弦 = 小三度 + 小三度
  private isDiminishedChord(chordTone: string[]): boolean {
    return this.isMinorThird(chordTone[0], chordTone[1]) && this.isMinorThird(chordTone[1], chordTone[2])
  }
  // 挂四和弦 =  增三度 +  减三度
  private isSus4(chordTone: string[]): boolean {
    return this.isMajorMajorThird(chordTone[0], chordTone[1]) && this.isMinorMinorThird(chordTone[1], chordTone[2])
  }
  // 大小七和弦/属七和弦 7 / Mm7 =
  private isMajorMinorSeventhChord(chordTone: string[]): boolean {
    if (chordTone.length < 4) return false
    return this.isMajorChord(chordTone) && this.isMinorThird(chordTone[2], chordTone[3])
  }

  private isMinorMajorSeventhChord(chordTone: string[]): boolean {
    if (chordTone.length < 4) return false
    return this.isMinorChord(chordTone) && this.isMajorThird(chordTone[2], chordTone[3])
  }

  private isMajorMajorSeventhChord(chordTone: string[]): boolean {
    if (chordTone.length < 4) return false
    return this.isMajorChord(chordTone) && this.isMajorThird(chordTone[2], chordTone[3])
  }

  private isMinorMinorSeventhChord(chordTone: string[]): boolean {
    if (chordTone.length < 4) return false
    return this.isMinorChord(chordTone) && this.isMinorThird(chordTone[2], chordTone[3])
  }

  private isDiminishedSeventhChord(chordTone: string[]): boolean {
    if (chordTone.length < 4) return false
    return this.isDiminishedChord(chordTone) && this.isMinorThird(chordTone[2], chordTone[3])
  }

  private isHalfDiminishedSeventhChord(chordTone: string[]): boolean {
    if (chordTone.length < 4) return false
    return this.isDiminishedChord(chordTone) && this.isMajorThird(chordTone[2], chordTone[3])
  }

  private isHalfAugmentedSeventhChord(chordTone: string[]): boolean {
    if (chordTone.length < 4) return false
    return this.isAugmentedChord(chordTone) && this.isMinorMinorThird(chordTone[2], chordTone[3])
  }
}
