// 提示消息类型
export interface InfoMessageType {
  hasAnswer: string[]
  hasSvg: string[]
  noAnswer: string[]
}

// 位置类型
export interface PositionType {
  string: number
  fret: number
}
export interface NormalObject {
  [key: string]: any
}
export interface StateInterface {
  [key: string]: any
  chordTone: string[]
  type: number
}
