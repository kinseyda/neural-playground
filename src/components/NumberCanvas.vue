<template>
  <div id="container">
    <canvas
      @mousedown="start"
      @mouseup="finish"
      @mousemove="draw"
      @mouseover="finish"
      id="canvas"
    />
    <button id="clear" @click="clear">Clear</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NumberCanvas",
  props: {},
  data() {
    return {
      painting: false,
      canvas: null as any, // HTMLCanvasElement
      canvasContext: null as any, // CanvasRenderingContext2D
      curX: 0,
      curY: 0,
    };
  },
  methods: {
    start(e: MouseEvent) {
      this.painting = true;
      this.setPosition(e);
      this.draw(e);
    },
    finish() {
      this.painting = false;
    },
    draw(e: MouseEvent) {
      if (!this.painting) {
        return;
      }
      this.canvasContext.beginPath();

      this.canvasContext.lineWidth = 2;
      this.canvasContext.lineCap = "round";

      this.canvasContext.moveTo(this.curX, this.curY);
      this.setPosition(e);
      this.canvasContext.lineTo(this.curX, this.curY);

      this.canvasContext.stroke();
    },
    setPosition(e: MouseEvent) {
      const rect = this.canvas.getBoundingClientRect();
      this.curX = (e.clientX - rect.left) * (28 / 300); //x position within the element.
      this.curY = (e.clientY - rect.top) * (28 / 300); //y position within the element.
    },
    clear() {
      this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
  },
  mounted() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.canvasContext = this.canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    this.canvasContext.canvas.width = 28;
    this.canvasContext.canvas.height = 28;
  },
});
</script>

<style scoped>
#canvas {
  border: 2px solid black;
}
#container {
  width: 300px;
  display: flex;
  flex-direction: column;
}
#clear {
  width: 300px;
  height: 100px;
  border: 1px solid black;
}
</style>
