// 检测数据类型的公用方法
function is(data) {
  return function (type) {
    return Object.prototype.toString.call(data) === `[object ${type}]`
  }
}
/**
可以借用简谱的标记方式，数字1、2、3、4、5、6、7，
分别代表唱名的do、re、mi、fa、sol、la、si；
当这个音升半调时，在数字的前面加上#，例如#1（升do），
降半调时，在数字前面加上b，例如b1（降do）；
当标记一个音的高八度音时，在数字的右侧加一个“点号”，
例如1.（高音do），#2.（高音升re）（因为字符串没法像简谱那样在数字顶部加点号），
当标记一个音的低八度音时，在数字的左侧加一个“点号”，例如.1（低音do），
.b2（低音降re）；
 */

// 单音类，用于音的映射与音高的改变，同时可标记记录其在吉他上的位置
export class Tone {
  constructor(toneString = '1', string, fret) {
    // 所有的唱名数组
    this.syllableMap = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']
    // 音程
    this.keyMap = ['1', ['#1', 'b2'], '2', ['#2', 'b3'], '3', '4', ['#4', 'b5'], '5', ['#5', 'b6'], '6', ['#6', 'b7'], '7'] // 音程
    // 所有调名
    this.intervalMap = ['C', ['#C', 'bD'], 'D', ['#D', 'bE'], 'E', 'F', ['#F', 'bG'], 'G', ['#G', 'bA'], 'A', ['#A', 'bB'], 'B'] //所有调名
    // 单音的字符串表示
    this.toneString = toneString
    // 单音的字符串表示（去除八度标记）
    this.toneNormal = toneString.replace(/\./g, '')
    // 数字音
    this.key = toneString.replace(/\.|b|#/g, '')
    // 唱名
    this.syllableName = this.syllableMap[+this.key - 1]
    // 降半调标记
    this.flat = toneString.match('b') ? 'b' : ''
    // 升半调标记
    this.sharp = toneString.match('#') ? '#' : ''
    // 去掉数字音的形式
    let octave_arr = toneString.split(this.key)
    //
    let octave_flat = octave_arr[0].toString().match(/\./g)
    let octave_sharp = octave_arr[1].toString().match(/\./g)
    console.log(this.key, '--thiskey')
    console.log(octave_arr, '--octave_arr')
    console.log(octave_flat, '---octave_flat')
    console.log(octave_sharp, '---octave_sharp')
    // 八度度数
    this.octave = (octave_sharp ? octave_sharp.length : 0) - (octave_flat ? octave_flat.length : 0) // 八度度数
    console.log(this.octave, '--octave')
    this.position = {
      // 第几弦
      string: string,
      // 第几品格
      fret: fret,
    }
  }

  // 获取某个音在音程上的位置
  findKeyIndex(keyString) {
    return this.keyMap.findIndex(item => {
      if (is(item)('Array')) {
        return item.includes(keyString)
      } else if (item === keyString) {
        return true
      } else {
        return false
      }
    })
  }

  // 音高增减，num为增或减的半音数量
  step(num) {
    // debugger
    // 组合升降调之后的最终音名
    let keyString = this.flat + this.sharp + this.key
    // 音程数组的长度
    let len = this.keyMap.length
    // 此音名在音程上位置
    let index = this.findKeyIndex(keyString)
    //

    if (index > -1) {
      num = +num
      // 计算改变音高后的音在音程上的位置
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
      // 计算并添加高低八度的记号
      let octaveString = new Array(Math.abs(octave)).fill('.').join('')
      let toneString = ''
      if (!is(nextKey)('Array')) {
        toneString = (octave < 0 ? octaveString : '') + nextKey + (octave > 0 ? octaveString : '')
        return new this.constructor(toneString, this.position.string, this.position.fret + num)
      } else {
        // 可能得到两个音高一样但标记方式不一样的音
        return nextKey.map(key => {
          return new this.constructor((octave < 0 ? octaveString : '') + key + (octave > 0 ? octaveString : ''), this.position.string, this.position.fret + num)
        })
      }
    } else {
      return null
    }
  }
}

let tone = new Tone('#6...')

console.log(tone.step(5), '----step')

export class GuitarChord {
  constructor() {
    // 吉他的最大品格数
    this.fretLength = 15
    // 构建1到6弦的初始音
    this.initialTone = [new Tone('3.', 1, 0), new Tone('7', 2, 0), new Tone('5', 3, 0), new Tone('2', 4, 0), new Tone('.6', 5, 0), new Tone('.3', 6, 0)]
    // 用于吉他上所有位置对应的音
    this.toneMap = []
  }
}

// 和弦名称推导
export class ChordName {
  constructor(chordTone) {
    // 实例化一个单音类做工具，用来计算音与各种标记的映射关系
    this.toneUtil = new Tone()
  }

  // 获取两个音的间隔跨度
  getToneSpace(tonePre, toneNext) {
    let toneSpace = this.toneUtil.findKeyIndex(toneNext) - this.toneUtil.findKeyIndex(tonePre)
    return (toneSpace = toneSpace < 0 ? toneSpace + 12 : toneSpace)
  }

  // 大三度 4个半音
  isMajorThird(tonePre, toneNext) {
    return this.getToneSpace(tonePre, toneNext) === 4
  }

  // 小三度
  isMinorThird(tonePre, toneNext) {
    return this.getToneSpace(tonePre, toneNext) === 3
  }
  // 增三度
  isMajorMajorThird(tonePre, toneNext) {
    return this.getToneSpace(tonePre, toneNext) === 5
  }
  // 减三度
  isMinorMinorThird(tonePre, toneNext) {
    return this.getToneSpace(tonePre, toneNext) === 2
  }

  // 大三和弦
  isMajorChord(chordTone) {
    // 大三度 +  小三度
    return this.isMajorThird(chordTone[0], chordTone[1]) && this.isMinorThird(chordTone[1], chordTone[2])
  }
  // 小三和弦
  isMajorChord(chordTone) {
    //小三度 + 大三度
    return this.isMinorThird(chordTone[0], chordTone[1]) && this.isMajorThird(chordTone[1], chordTone[2])
  }

  // 增三和弦
  isAugmentedChord(chordTone) {
    // 大三度 + 大三度
    return this.isMinorThird(chordTone[0], chordTone[1]) && this.isMinorThird(chordTone[1], chordTone[2])
  }

  // 减三和弦
  isDiminishedChord(chordTone) {
    // 小三度 + 小三度
    return this.isMinorThird(chordTone[0], chordTone[1]) && this.isMinorThird(hordTone[1], chordTone[2])
  }

  // 挂四和弦
  isSus4(chordTone) {
    // 增三度 + 减三度
    return this.isMajorMajorThird(chordTone[0], chordTone[1]) && this.isMinorMinorThird(chordTone[1], chordTone[2])
  }

  // 四个音

  // // 大小七和弦/ 属7和弦
  isMajorMinorSeventhChord(chordTone) {
    if (chordTone.length < 4) return false
    //  大三度 +  小三度 + 小三度
    // 大三度
    return this.isMajorChord(chordTone) && this.isMinorThird(chordTone[2], chordTone[3])
  }

  // 小大七和弦
  isMajorMinorSeventhChord(chordTone) {
    if (chordTone.length < 4) return false
    //  小三度 +  大三度 + 大三度
    // 小三和弦 + 大三度
    return this.isMinorChord(chordTone) && this.isMajorThird(chordTone[2], chordTone[3])
  }

  // 大七和弦
  isMajorMinorSeventhChord(chordTone) {
    if (chordTone.length < 4) {
      return false
    }
    // 大三和弦+大三度
    return this.isMajorChord(chordTone) && this.isMajorThird(chordTone[2], chordTone[3])
  }

  // 小七和弦
  isMinorMinorSeventhChord(chordTone) {
    if (chordTone.length < 4) {
      return false
    }
    // 小三和弦 + 小三度
    return this.isMinorChord(chordTone) && this.isMinorThird(chordTone[2], chordTone[3])
  }

  // 减七和弦 dim7
  isDiminishedSeventhChord(chordTone) {
    if (chordTone.length < 4) {
      return false
    }
    // 减三和弦 + 大三度
    return this.isDiminishedChord(chordTone) && this.isMinorThird(chordTone[2], chordTone[3])
  }

  // 半减七和弦 m7-5
  isHalfDiminishedSeventhChord(chordTone) {
    if (chordTone.length < 4) return false
    return this.isDiminishedChord(chordTone) && this.isMajorThird(chordTone[2], chordTone[3])
  }
  // 增属七和弦  7#5 / M7+5
  isHalfAugmentedSeventhChord(chordTone) {
    if (chordTone.length < 4) return false
    return this.isAugmentedChord(chordTone) && this.isMinorMinorThird(chordTone[2], chordTone[3])
  }
  // 增大七和弦 aug7 / Maj7#5
  isAugmentedSeventhChord(chordTone) {
    if (chordTone.length < 4) return false
    return this.isAugmentedChord(chordTone) && this.isMinorThird(chordTone[2], chordTone[3])
  }

  // 获取音对应的根音和弦名
  getKeyName(key) {
    let keyName = this.toneUtil.intervalMap[this.toneUtil.findKeyIndex(key)]

    if (is(keyName)('Array')) {
      keyName = /b/.test(key) ? keyName[1] : keyName[0]
    }

    return keyName
  }

  // 计算和弦名

  getChordName(chordTone) {
    // 根音
    let rootKey = chordTone[0]
    // 和弦的字母名
    let chordRootName = this.getKeyName(rootKey)
    // 和弦字母后面的具体修饰名
    let suffix = '...'
    let suffixArr = []
    // 三音和弦的遍历方法及对应的修饰名
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

    // 四音和弦的遍历方法及对应修饰名
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
    // 拼接起来得到完整的和弦名
    return chordRootName + suffix
  }
}

export class ChordSvg {
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

    console.log(text.innerHTML, '--- text.innerHTML ')
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
    // debugger
    let svg = this.svg.cloneNode(true)

    let fretArr = chord.map(item => item.fret).filter(fret => fret != null)
    console.log(chord, '---chord')
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
