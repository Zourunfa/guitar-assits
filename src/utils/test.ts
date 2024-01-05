import { GuitarChord } from './tone'
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
        return new Tone(toneString, this.position.string, (this.position as any).fret + num)
      } else {
        return (nextKey as any).map(key => {
          return new Tone((octave < 0 ? octaveString : '') + key + (octave > 0 ? octaveString : ''), this.position.string, this.position?.fret + num)
        })
      }
    } else {
      return null
    }
  }
}

let tone = new Tone('1')

console.log(tone, '---tone')
console.log(tone.findKeyIndex('#5'))
console.log(tone.step(5))

export class ChordName {
  private toneUtil: Tone

  constructor() {
    this.toneUtil = new Tone()
  }

  private getToneSpace(tonePre: string, toneNext: string): number {
    let toneSpace = this.toneUtil.findKeyIndex(toneNext) - this.toneUtil.findKeyIndex(tonePre)
    return (toneSpace = toneSpace < 0 ? toneSpace + 12 : toneSpace)
  }

  private isMajorThird(tonePre: string, toneNext: string): boolean {
    return this.getToneSpace(tonePre, toneNext) === 4
  }

  private isMinorThird(tonePre: string, toneNext: string): boolean {
    return this.getToneSpace(tonePre, toneNext) === 3
  }

  private isMajorMajorThird(tonePre: string, toneNext: string): boolean {
    return this.getToneSpace(tonePre, toneNext) === 5
  }

  private isMinorMinorThird(tonePre: string, toneNext: string): boolean {
    return this.getToneSpace(tonePre, toneNext) === 2
  }

  private isMajorChord(chordTone: string[]): boolean {
    return this.isMajorThird(chordTone[0], chordTone[1]) && this.isMinorThird(chordTone[1], chordTone[2])
  }

  private isMinorChord(chordTone: string[]): boolean {
    return this.isMinorThird(chordTone[0], chordTone[1]) && this.isMajorThird(chordTone[1], chordTone[2])
  }

  private isAugmentedChord(chordTone: string[]): boolean {
    return this.isMajorThird(chordTone[0], chordTone[1]) && this.isMajorThird(chordTone[1], chordTone[2])
  }

  private isDiminishedChord(chordTone: string[]): boolean {
    return this.isMinorThird(chordTone[0], chordTone[1]) && this.isMinorThird(chordTone[1], chordTone[2])
  }

  private isSus4(chordTone: string[]): boolean {
    return this.isMajorMajorThird(chordTone[0], chordTone[1]) && this.isMinorMinorThird(chordTone[1], chordTone[2])
  }

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

  private isAugmentedSeventhChord(chordTone: string[]): boolean {
    if (chordTone.length < 4) return false
    return this.isAugmentedChord(chordTone) && this.isMinorThird(chordTone[2], chordTone[3])
  }

  private getKeyName(key: string): string {
    let keyName = this.toneUtil.intervalMap[this.toneUtil.findKeyIndex(key)]
    if (Array.isArray(keyName)) {
      keyName = /b/.test(key) ? keyName[1] : keyName[0]
    }
    return keyName
  }

  getChordName(chordTone: string[]): string {
    let rootKey = chordTone[0]
    let chordRootName = this.getKeyName(rootKey)
    let suffix = '...'
    let suffixArr: { fn: (chordTone: string[]) => boolean; suffix: string }[]

    let chord3SuffixMap = [
      {
        fn: this.isMajorChord,
        suffix: '',
      },
      {
        fn: this.isMinorChord,
        suffix: 'm',
      },
      {
        fn: this.isAugmentedChord,
        suffix: 'aug',
      },
      {
        fn: this.isDiminishedChord,
        suffix: 'dim',
      },
      {
        fn: this.isSus4,
        suffix: 'sus4',
      },
    ]

    let chord4SuffixMap = [
      {
        fn: this.isMajorMinorSeventhChord,
        suffix: '7',
      },
      {
        fn: this.isMinorMajorSeventhChord,
        suffix: 'mM7',
      },
      {
        fn: this.isMajorMajorSeventhChord,
        suffix: 'maj7',
      },
      {
        fn: this.isMinorMinorSeventhChord,
        suffix: 'm7',
      },
      {
        fn: this.isDiminishedSeventhChord,
        suffix: 'dim7',
      },
      {
        fn: this.isHalfDiminishedSeventhChord,
        suffix: 'm7-5',
      },
      {
        fn: this.isHalfAugmentedSeventhChord,
        suffix: '7#5',
      },

      {
        fn: this.isAugmentedSeventhChord,
        suffix: 'aug7',
      },
    ]

    if (chordTone.length === 3) {
      suffixArr = chord3SuffixMap.filter(item => {
        return item.fn.bind(this, chordTone)()
      })
      suffix = suffixArr.length > 0 ? suffixArr[0].suffix : suffix
    } else {
      suffixArr = chord4SuffixMap.filter(item => {
        return item.fn.bind(this, chordTone)()
      })
      suffix = suffixArr.length > 0 ? suffixArr[0].suffix : suffix
    }

    return chordRootName + suffix
  }
}

var chordName = new ChordName()
console.log(chordName, '---chordName')
console.log(chordName.getChordName(['1', '3', '5']))

export class GuitarChord {
  fretLength: number
  initialTone: Tone[]
  toneMap: Tone[][]

  chordTone: string[]
  rootTone: string
  chordResult: any[]

  constructor() {
    // 吉他的最大品格数量
    this.fretLength = 15
    // 构建1到6弦的初始音
    this.initialTone = [new Tone('3.', 1, 0), new Tone('7', 2, 0), new Tone('5', 3, 0), new Tone('2', 4, 0), new Tone('.6', 5, 0), new Tone('.3', 6, 0)]
    // 用于吉他上所有位置对应的音
    this.toneMap = []
    // 从1到6弦，从品数的低到高，依次计算每个位置的音
    for (let string = 1; string <= this.initialTone.length; string++) {
      this.toneMap[string] = []
      for (let fret = 0; fret <= this.fretLength; fret++) {
        this.toneMap[string].push(this.initialTone[string - 1].step(fret))
      }
    }
  }
}
