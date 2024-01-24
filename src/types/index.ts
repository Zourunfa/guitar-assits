// 提示消息类型
interface InfoMessageType {
  hasAnswer: string[]
  hasSvg: string[]
  noAnswer: string[]
}

// 位置类型
interface PositionType {
  string: number
  fret: number
}
interface NormalObject {
  [key: string]: any
}
interface StateInterface {
  [key: string]: any
  chordTone: string[]
  type: number
}
