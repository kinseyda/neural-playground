<template>
  <div id="number-canvas">
    <number-canvas v-on:imageChange="imageChange"></number-canvas>
    {{ output }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NumberCanvas from "./components/NumberCanvas.vue";
import { Network } from "./network/network";

export default defineComponent({
  name: "App",
  components: {
    NumberCanvas,
  },
  data() {
    return {
      canvasData: [] as number[],
      timeOfChange: 0,
      mostRecentUpdate: 0,
      net: new Network([784, 16, 16, 46]),
      output: [] as number[],
    };
  },
  methods: {
    imageChange(newData: number[]) {
      this.canvasData = newData;
      this.timeOfChange = Date.now();
    },
    reFeed() {
      if (
        Date.now() - this.timeOfChange >= 250 &&
        this.timeOfChange != this.mostRecentUpdate
      ) {
        console.log(this.canvasData);
        this.output = this.net.feed(this.canvasData);
        this.mostRecentUpdate = this.timeOfChange;
      }
    },
  },
  mounted() {
    setInterval(this.reFeed, 100);
  },
});
</script>

<style>
#number-canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
