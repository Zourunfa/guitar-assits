<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import ChordSelect from "./components/ChordSelect.vue";
import ChordDraw from "./components/ChordDraw.vue";
import Fingering from "./components/Fingering.vue";
import { ref } from "vue";

const chordDraw = ref();
const handleDrawChord = (chordTone: string[]) => {
  chordDraw.value.draw(chordTone);
};
</script>

<template>
  <div class="container">
    <Fingering></Fingering>
    <ChordSelect ref="chordSelect" @draw-chord="handleDrawChord"></ChordSelect>
    <ChordDraw ref="chordDraw" />
  </div>
</template>

<style >
.container {
  text-align: center;
}
.chord-svg {
  width: 200px;
  height: 220px;
}
.chord-rect {
  width: 100px;
  height: 100px;
  fill: none;
  stroke: #666;
  stroke-width: 2;
}
.chord-gird {
  stroke: #666;
  stroke-width: 2;
  fill: none;
}
.chord-forbidden,
.chord-blank-circle {
  stroke: #666;
  stroke-width: 1;
  fill: none;
}
.chord-block-circle {
  fill: #333;
}
.chord-barre {
  height: 16px;
  fill: #333;
}
.chord-barre-fret {
  fill: #333;
  font-size: 14px;
  font-weight: 700;
}
.chord-string-key {
  fill: #333;
  font-size: 10px;
  font-weight: 700;
}
.chord-name {
  fill: #333;
  font-size: 20px;
  font-weight: 700;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 700px) {
  .chord-svg {
    width: 140px;
    height: 155px;
  }
}
@media screen and (max-width: 320px) {
  .chord-svg {
    width: 120px;
    height: 135px;
  }
}
</style>
