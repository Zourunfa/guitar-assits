<template>
  <!-- SVG吉他纸板，点击时触发handleClick方法 -->
  <div>
    <GuitarSvg @click="handleClick" />
    <!-- 如果存在按下的音符，显示它 -->
    <div v-if="pressedNote">Pressed Note: {{ pressedNote }}</div>
  </div>
</template>

<script>
import GuitarSvg from "@/assets/guitar.svg";

export default {
  components: {
    // 引入SVG吉他纸板组件
    GuitarSvg,
  },
  data() {
    return {
      // 吉他弦的基本音名
      strings: ["E", "A", "D", "G", "B", "E"],
      // 被按下的品格，初始化为null
      pressedFret: null,
      // 被按下的琴弦，初始化为null
      pressedString: null,
      // 被按下的音符名称，初始化为null
      pressedNote: null,
    };
  },
  methods: {
    // 处理SVG点击事件
    handleClick(event) {
      // 计算点击位置相对于SVG的坐标
      let x = event.clientX - event.target.getBoundingClientRect().left;
      let y = event.clientY - event.target.getBoundingClientRect().top;

      // 根据点击的Y坐标，计算出琴弦的索引
      let stringIndex = Math.floor(y / 50);
      // 根据点击的X坐标，计算出品格的索引
      let fret = Math.floor(x / 200);

      // 如果点击位置有效，则记录被按下的琴弦和品格
      if (stringIndex >= 0 && stringIndex < 6) {
        this.pressedFret = fret;
        this.pressedString = stringIndex;
        // 计算并设置按下的音符名称
        this.calculateNote();
      }
    },
    // 计算按下的音符名称
    calculateNote() {
      // 获取被按下的琴弦的基本音名
      let baseNote = this.strings[this.pressedString];
      // 根据被按下的品格，计算音符的索引
      let newNoteIndex = this.strings.indexOf(baseNote) + this.pressedFret;
      // 设置按下的音符名称
      this.pressedNote = this.strings[newNoteIndex % 6];
      // 注意：此处的音名计算是简化的，实际上应该有一个完整的音名列表来更准确地计算
    },
  },
};
</script>
