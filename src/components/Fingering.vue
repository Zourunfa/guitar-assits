<template>
  <div>
    <div v-if="chordNotes.length >= 3">
      <button @click="generateChord">Generate Chord</button>
    </div>
    <div v-if="chordNotes.length === 3">
      Chord Notes: {{ chordNotes.join(", ") }}
    </div>
    <div v-else>
      <p>Click on three different positions to generate a chord.</p>
    </div>
  </div>
</template>

<script>
// import { Guitar as GuitarSvg } from "../assets/fingerPanel.svg?component";

export default {
  components: {
    // GuitarSvg,
  },
  data() {
    return {
      strings: ["E", "A", "D", "G", "B", "E"],
      pressedFret: null,
      pressedString: null,
      pressedNote: null,
      chordNotes: [],
    };
  },
  methods: {
    handleClick(event) {
      let x = event.clientX - event.target.getBoundingClientRect().left;
      let y = event.clientY - event.target.getBoundingClientRect().top;

      let stringIndex = Math.floor(y / 50);
      let fret = Math.floor(x / 200);

      if (stringIndex >= 0 && stringIndex < 6) {
        this.pressedFret = fret;
        this.pressedString = stringIndex;
        this.calculateNote();

        // 在按下位置添加标记
        this.addMarker(x, y);
      }
    },
    calculateNote() {
      let baseNote = this.strings[this.pressedString];
      let newNoteIndex = this.strings.indexOf(baseNote) + this.pressedFret;
      this.pressedNote = this.strings[newNoteIndex % 6];

      // 检查是否已经存在于和弦音符列表，避免重复
      if (!this.chordNotes.includes(this.pressedNote)) {
        this.chordNotes.push(this.pressedNote);
      }
    },
    addMarker(x, y) {
      // 在点击位置添加一个10px黑色圆点
      let marker = document.createElement("div");
      marker.style.width = "10px";
      marker.style.height = "10px";
      marker.style.backgroundColor = "black";
      marker.style.position = "absolute";
      marker.style.left = x + "px";
      marker.style.top = y + "px";
      document.body.appendChild(marker);
    },
    generateChord() {
      // 生成和弦的逻辑在这里，根据 this.chordNotes 数组中的音符
      // 可以添加代码来确定和弦类型，显示和弦图表等
      console.log("Generating chord with notes:", this.chordNotes);
    },
  },
  mounted() {
    function createGuitarSVG() {
      // 创建 SVG 根元素
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "finger-panel");
      svg.setAttribute("width", "1500");
      svg.setAttribute("height", "300");

      // 创建 6 根琴弦
      for (let i = 1; i <= 6; i++) {
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("x1", "0");
        line.setAttribute("y1", (i * 50).toString());
        line.setAttribute("x2", "1500");
        line.setAttribute("y2", (i * 50).toString());
        line.setAttribute("stroke", "black");
        line.setAttribute("id", `string${i}`);
        line.setAttribute("data-note", ["E", "A", "D", "G", "B", "E"][i - 1]);
        svg.appendChild(line);
      }

      // 创建 15 个品格
      for (let i = 1; i <= 15; i++) {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", (100 + i * 100).toString());
        rect.setAttribute("y", "0");
        rect.setAttribute("width", "5");
        rect.setAttribute("height", "300");
        rect.setAttribute("fill", "black");
        rect.setAttribute("id", `fret${i}`);
        rect.setAttribute("class", `fret`);
        svg.appendChild(rect);
      }

      return svg;
    }
    createGuitarSVG();
    // 使用函数创建 SVG，并添加到文档中
    const guitarSVG = createGuitarSVG();
    document.body.appendChild(guitarSVG);

    // 获取SVG元素
    const svg = document.querySelector(".finger-panel");
    console.log(svg, "----svg");
    // 获取所有琴弦元素
    const strings = svg.querySelectorAll("line");

    // 获取所有品格元素
    const frets = svg.querySelectorAll("rect");

    // 添加事件监听器来处理琴弦点击
    strings.forEach((string) => {
      string.addEventListener("click", () => {
        // 在琴弦上添加标记（例如10px黑色圆点）
        const marker = document.createElement("circle");
        marker.setAttribute("cx", 20);
        marker.setAttribute("cy", parseInt(string.getAttribute("y1")));
        marker.setAttribute("r", 5);
        marker.setAttribute("fill", "black");
        svg.appendChild(marker);
      });
    });

    // 添加事件监听器来处理品格点击
    frets.forEach((fret) => {
      fret.addEventListener("click", () => {
        // 在品格上标记音名
        const note = document.createElement("text");
        note.setAttribute("x", parseInt(fret.getAttribute("x")) + 2);
        note.setAttribute("y", 290);
        note.textContent = fret.id;
        console.log(note.textContent, "----note.textContent");
        svg.appendChild(note);
      });
    });
  },
};
</script>
<style>
#fret {
  /* 品格的默认样式 */
  fill: black;
  /* 其他样式属性 */

  /* 鼠标悬停状态的样式 */
  transition: fill 0.2s; /* 添加过渡效果 */
}

.fret:hover {
  fill: red; /* 悬停状态时的样式，例如将颜色更改为红色 */
  /* 其他悬停状态时的样式属性 */
}
</style>
