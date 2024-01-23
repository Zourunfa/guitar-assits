import { Tone } from '../tone/index'
export class ChordName {
  private toneUtil: Tone

  constructor() {
    // Assuming Tone class requires some parameters in the constructor
    this.toneUtil = new Tone(/* Pass required parameters */)
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
    let suffixArr: any[] = []

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
