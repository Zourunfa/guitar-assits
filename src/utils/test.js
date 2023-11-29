// 检测数据类型的公用方法
function is(data) {
  return function (type) {
    return Object.prototype.toString.call(data) === `[object ${type}]`
  }
}

// module.exports = {
//   Tone: Tone,
//   GuitarChord: GuitarChord,
//   ChordName: ChordName,
//   ChordSvg: ChordSvg,
// }

// 示例
// let chord = new GuitarChord();
// let chordTone = ['1', '3', '5'];
// let chordResult = chord.chord(chordTone);
// let svg = new ChordSvg();
// chordResult.forEach((chordItem) => {
// 	svg.drawChord(chordTone, chordItem);
// });
