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

  // 获取某个音在音程上的位置
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
  // 音高增减，num为增或减的半音数量
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

// 和弦svg绘图
class ChordSvg {
  constructor() {
    this.SVG_NS = 'http://www.w3.org/2000/svg'
    this.XLINK_NS = 'http://www.w3.org/1999/xlink'
    this.ATTR_MAP = {
      className: 'class',
      svgHref: 'href',
    }
    this.NS_MAP = {
      svgHref: this.XLINK_NS,
    }
    this.initChordSvg()
    this.minFret = 0
  }
  // 创建svg相关元素
  createSVG(tag, attributes) {
    let elem = document.createElementNS(this.SVG_NS, tag)
    for (let attribute in attributes) {
      let name = attribute in this.ATTR_MAP ? this.ATTR_MAP[attribute] : attribute
      let value = attributes[attribute]
      if (attribute in this.NS_MAP) {
        elem.setAttributeNS(this.NS_MAP[attribute], name, value)
      } else {
        elem.setAttribute(name, value)
      }
    }
    return elem
  }
  // 创建use标签
  createUse(href, x, y) {
    return this.createSVG('use', {
      svgHref: href,
      x: x,
      y: y,
    })
  }
  // 设置禁止弹奏的叉号位置，位于几弦
  setForbidden(svg, string = 6) {
    svg.appendChild(this.createUse('#forbidden', 25 + 20 * (6 - string), 30))
  }
  // 设置空弦弹奏的空心圈位置，位于几弦
  setOpen(svg, string = 6) {
    svg.appendChild(this.createUse('#blank_circle', 25 + 20 * (6 - string), 30))
  }
  // 设置指法按弦位置，几弦几品
  setFinger(svg, string = 6, fret = 0) {
    if (+fret > 0 && +fret <= 5) {
      svg.appendChild(this.createUse('#block_circle', 25 + 20 * (6 - string), 35 + 20 * fret))
    }
  }
  // 设置大横按位置
  setBarre(svg, stringTo, fret, barreFret) {
    if (fret > 0 && fret <= 5) {
      svg.appendChild(
        this.createSVG('rect', {
          className: 'chord-barre',
          width: stringTo * 20,
          x: 15 + 20 * (6 - stringTo),
          y: 27 + 20 * fret,
          rx: 8,
          ry: 8,
        })
      )
    }
  }
  // 设置把位偏移的数字提示
  setFretOffset(svg, fret, fretOffset, isBarreCover) {
    if (fret > 0) {
      let text = this.createSVG('text', {
        className: 'chord-barre-fret',
        x: isBarreCover ? 1 : 8,
        y: 40 + fret * 20,
      })
      text.innerHTML = fretOffset
      svg.appendChild(text)
    }
  }
  // 设置每根弦在按住和弦后的发音名
  setStringKey(svg, string, keyName) {
    let xFixed = keyName.length === 2 ? -4 : 0
    let text = this.createSVG('text', {
      className: 'chord-string-key',
      x: 21.5 + 20 * (6 - string) + xFixed,
      y: 160,
    })
    text.innerHTML = keyName
    svg.appendChild(text)
  }
  // 设置和弦名称
  setChordName(svg, name = '') {
    let xFixed = /\.\.\./.test(name) ? 10 : 0
    let text = this.createSVG('text', {
      className: 'chord-name',
      x: 75 - name.toString().length * 7 + xFixed,
      y: 20,
    })
    text.innerHTML = name
    svg.appendChild(text)
  }
  // 初始化svg
  initChordSvg() {
    // svg元素
    this.svg = this.createSVG('svg', {
      className: 'chord-svg',
      viewBox: '0 0 150 150',
      preserveAspectRatio: 'xMidYMin meet',
    })
    // 和弦图方块
    this.chordRect = this.createSVG('rect', {
      className: 'chord-rect',
      x: 25,
      y: 45,
      rx: 5,
      ry: 5,
    })
    // 和弦网格，代表弦和品
    this.chordGird = this.createSVG('path', {
      className: 'chord-gird',
      d: 'M25 65 L125 65 M25 85 L125 85 M25 105 L125 105 M25 125 L125 125 M45 45 L45 145 M65 45 L65 145 M85 45 L85 145 M105 45 L105 145 M25 40 L125 40',
    })
    // 用于放置可复用的svg元素
    this.defs = this.createSVG('defs')
    // 禁止按弦的叉号标志
    this.g_forbidden = this.createSVG('g', {
      id: 'forbidden',
    })
    this.g_forbidden.appendChild(
      this.createSVG('path', {
        className: 'chord-forbidden',
        d: 'M-5 -5 L5 5 M-5 5 L5 -5',
      })
    )
    // 空弦弹奏的空心圈标志
    this.g_blank_circle = this.createSVG('g', {
      id: 'blank_circle',
    })
    this.g_blank_circle.appendChild(
      this.createSVG('circle', {
        className: 'chord-blank-circle',
        cx: 0,
        cy: 0,
        r: 6,
      })
    )
    // 表示按弦位置的实心圈标志
    this.g_block_circle = this.createSVG('g', {
      id: 'block_circle',
    })
    this.g_block_circle.appendChild(
      this.createSVG('circle', {
        className: 'chord-block-circle',
        cx: 0,
        cy: 0,
        r: 8,
      })
    )
    // 可复用元素加入
    this.defs.appendChild(this.g_forbidden)
    this.defs.appendChild(this.g_blank_circle)
    this.defs.appendChild(this.g_block_circle)
    // svg子元素加入
    this.svg.appendChild(this.chordRect)
    this.svg.appendChild(this.chordGird)
    this.svg.appendChild(this.defs)
  }
  // 绘制和弦svg图案
  /*
   * @param chordTone 和弦组成音数组
   * @param chord 和弦指法结果
   * @param target svg指法图dom容器
   */
  drawChord(chordTone, chord, target) {
    let svg = this.svg.cloneNode(true)
    let fretArr = chord.map(item => item.fret).filter(fret => fret != null)
    // 和弦指法中出现的最高品格位置
    let maxFret = Math.max.apply(null, fretArr)
    // 和弦指法中出现的最低品位位置
    let minFret = Math.min.apply(null, fretArr)
    // svg指法图案的起始品格位置相对于吉他上0品位置的偏移量
    let fretOffset = maxFret <= 5 ? 0 : minFret
    // 记录指法最低品位可能需要大横按的按弦数
    let barreCount = 0
    // 大横按初始只横跨1弦到1弦（相当于没横按）
    let barreStringTo = 1
    // 实例化用于计算和弦名称的类
    let chordName = new ChordName()
    // 遍历和弦指法数组
    chord.forEach(item => {
      if (item.fret == null) {
        // 某根弦没标记品格位置时禁止该弦弹奏
        this.setForbidden(svg, item.string)
      } else if (item.fret === 0) {
        // 某根弦没标记的品格位置为0品时标记空弦弹奏
        this.setOpen(svg, item.string)
      } else {
        // 剩下的指法绘制其对应的按法位置
        this.setFinger(svg, item.string, fretOffset > 0 ? item.fret - fretOffset + 1 : item.fret)
      }
      // 当按在该和弦的最低品格位置的指法反复出现时
      if (item.fret === minFret) {
        // 计算大横按的跨度
        barreStringTo = item.string > barreStringTo ? item.string : barreStringTo
        // 计算大横按实际按弦的数量
        barreCount++
      }
      // 在允许弹奏的弦的下方标记其对应的音名
      if (item.fret != null) {
        this.setStringKey(svg, item.string, chordName.getKeyName(item.key))
      }
    })
    // 将真实的按弦品格位置转换为相对于svg图案上的品格位置
    let relativeFret = fretOffset > 0 ? minFret - fretOffset + 1 : minFret
    if (barreCount > 1) {
      // 横按数大于1才需要使用大横按
      this.setBarre(svg, barreStringTo, relativeFret, minFret)
    }
    // 在图案左侧绘制品格位置偏移标记
    this.setFretOffset(svg, relativeFret, minFret, barreStringTo === 6)
    // 在图案上侧绘制和弦名称
    this.setChordName(svg, chordName.getChordName(chordTone))
    // 将生成号的svg图案塞到指定结构中
    target ? target.appendChild(svg) : document.body.appendChild(svg)
  }
}
