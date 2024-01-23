export class GuitarChord {
  fretLength: number
  initialTone: Tone[]
  toneMap: Tone[][]

  chordTone: string[]
  rootTone: string
  chordResult: any[]

  constructor() {
    // 吉他的最大品格数
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

  /*
   * @param key 搜寻的音（字符串形式）
   * @param toneArray 音域数组，即某根弦上所有单音类按顺序组成的数组
   * @param fretStart 搜寻的最低品格数
   * @param fretEnd 搜寻的最高品格数
   */

  /*
   * @param key 搜寻的音（字符串形式）
   * @param toneArray 音域数组，即某根弦上所有单音类按顺序组成的数组
   * @param fretStart 搜寻的最低品格数
   * @param fretEnd 搜寻的最高品格数
   */

  findFret(key: string, toneArray: Tone[], fretStart = 0, fretEnd?: number): number[] {
    key = key.replace(/\./g, '')
    let fretArray: number[] = []
    fretStart = fretStart ? fretStart : 0
    fretEnd = fretEnd ? fretEnd + 1 : toneArray.length
    for (let i = fretStart; i < fretEnd; i++) {
      if (Array.isArray(toneArray[i])) {
        let toneStringArray = toneArray[i].map(item => {
          return item.toneNormal
        })
        if (toneStringArray.includes(key)) {
          fretArray.push(i)
        }
      } else {
        if (toneArray[i].toneString.replace(/\./g, '') === key) {
          fretArray.push(i)
        }
      }
    }
    return fretArray
  }

  // 递归遍历范围内的指定和弦的所有位置组合
  /*
   * @param stringIndex 当前遍历到的弦的序号
   * @param toneIndex 上一根弦使用的音的序号（用于相邻的两根弦的音不重复）
   * @param fretStart 遍历的最低品格数
   * @param fretEnd 遍历的最高品格数
   * @param preResult 上一根弦确定的音的结果
   * @param positionSave 保存该轮递归的结果
   */

  calc(stringIndex: number, toneIndex: number | null, fretStart: number, fretEnd: number, preResult: any | null, positionSave: any[]): boolean {
    let toneArray = this.toneMap[stringIndex]
    let result = false

    // 从和弦音的数组里面逐个选出音试探（this.chordTone）在后面提到的函数中复制
    for (let i = 0; i < this.chordTone.length; i++) {
      if (i !== toneIndex) {
        let resultNext = false
        let toneKey = this.chordTone[i]

        // 在品格内查找当前音的位置
        let fret = this.findFret(toneKey, toneArray, fretStart, fretEnd)

        // 品格范围类存在该音
        if (fret.length > 0) {
          // 记录该音的位置，几弦几品与音的数字秒速
          let resultNow = {
            string: stringIndex,
            fret: fret[0],
            key: toneKey,
            pre: null,
          }

          // 在本次记录上保存上一根弦的结果，方便回顾
          resultNow.pre = preResult ? preResult : null
          // 保存本次的结果
          positionSave.push(resultNow)
          // 设置该弦的结果标记
          resultNext = true

          // 没有遍历完所有的6根弦，则继续往下一根弦计算，附带上本次结果记录
          if (stringIndex < this.initialTone.length) {
            let nextStringIndex = stringIndex + 1
            // 该弦上的结果有效标记 取决于它后面的弦的结果也有效
            resultNext = resultNext && this.calc(nextStringIndex, i, fretStart, fretEnd, resultNow, positionSave)
          } else {
            // 所有弦均遍历成功，代表递归结果有效
            resultNext = true
          }

          if (!resultNext) {
            positionSave.pop()
          }
        } else {
          resultNext = false
        }

        result = result || resultNext
      }
    }

    return result
  }

  // 和弦指法过滤器
  filter(positionSave: any[]): any[] {
    // 从六弦开始回溯记录和和弦指法的结果，拆解所有指法的组合
    let allResult = positionSave
      .filter(item => {
        return item.string === this.initialTone.length
      })
      .map(item => {
        let resultItem = [
          {
            string: item.string,
            fret: item.fret,
            key: item.key,
          },
        ]

        while (item.pre) {
          item = item.pre
          resultItem.unshift({
            string: item.string,
            fret: item.fret,
            key: item.key,
          })
        }

        return resultItem
      })

    if (allResult.length > 0) {
      // 依次调用各个过滤器
      return this.integrityFilter(this.fingerFilter(this.rootToneFilter(allResult)))
    } else {
      return []
    }
  }
  // 和弦组成音完整性过滤
  integrityFilter(preResult: any[]): any[] {
    return preResult.filter((chordItem: any) => {
      let keyCount = [...new Set(chordItem.map(item => item.key).filter(key => key != null))].length
      return keyCount == this.chordTone.length
    })
  }
  // 按弦手指数量过滤
  fingerFilter(preResult) {
    return preResult.filter(chordItem => {
      // 按弦的最小品位
      let minFret = Math.min.apply(
        null,
        chordItem.map(item => item.fret).filter(fret => fret != null)
      )
      // 记录需要的手指数量
      let fingerNum = minFret > 0 ? 1 : 0
      chordItem.forEach(item => {
        if (item.fret != null && item.fret > minFret) {
          fingerNum++
        }
      })
      return fingerNum <= 4
    })
  }

  // 根音条件过滤
  rootToneFilter(preResult) {
    let nextResult = new Set()
    preResult.forEach(item => {
      // 允许发声的弦的总数,初始为6
      let realStringLength = 6
      // 从低音弦到高音弦遍历，不符合根音条件则禁止发声
      for (var i = item.length - 1; i >= 0; i--) {
        if (item[i].key !== this.rootTone) {
          item[i].fret = null
          item[i].key = null
          realStringLength--
        } else {
          break
        }
      }
      if (realStringLength >= 4) {
        // 去重复
        nextResult.add(JSON.stringify(item))
      }
    })
    return [...nextResult].map(item => JSON.parse(item))
  }

  // 和弦指法计算入口
  chord(): any[] {
    // debugger
    let chordTone

    if (Array.isArray(arguments[0])) {
      chordTone = arguments[0]
    } else {
      chordTone = Array.prototype.slice.apply(arguments).map(item => {
        let tone = new Tone(item.toString())
        return tone.flat + tone.sharp + tone.key
      })
    }

    this.chordTone = chordTone
    this.rootTone = chordTone[0]
    this.chordResult = []
    let fretArray: number[] = []
    console.log(this.chordTone, '---  this.chordTone')
    chordTone.forEach(item => {
      console.log(this.toneMap, '--this.toneMap')
      for (let i = 1; i < this.toneMap.length; i++) {
        fretArray = fretArray.concat(this.findFret(item, this.toneMap[i]))
      }
    })

    fretArray = [...new Set(fretArray)]
    console.log(fretArray, '---fretArray')
    fretArray.sort((a, b) => a - b)

    for (let i = 0; i < fretArray.length; i++) {
      let fretStart = fretArray[i]
      let fretEnd = fretStart > 0 ? fretStart + 4 : fretStart + 5

      if (fretEnd <= this.fretLength) {
        let positionSave: any[] = []

        if (this.calc(1, null, fretStart, fretEnd, null, positionSave)) {
          this.chordResult.push(...this.filter(positionSave))
        }
      }
    }

    let result = [...new Set(this.chordResult.map(item => JSON.stringify(item)))].map(item => JSON.parse(item))
    // debugger
    return result
  }
}
