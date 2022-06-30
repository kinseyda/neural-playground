<template>
  <div id="outer">
    <div id="number-canvas">
      <number-canvas v-on:imageChange="imageChange"></number-canvas>
      <button @click="net.loadEmnist()">Load</button>
      <button @click="net.runMiniBatch(100)">Train</button>
      <button @click="curAccuracy = net.getPredictedAccuracy()">
        Predict Accuracy
      </button>
      <button @click="reFeed">ReFeed</button>
      <button @click="runLots">Run lots of trainings</button>
      <p v-if="net.emnist">Accuracy: {{ curAccuracy }}</p>
      <p v-if="net.emnist">
        Hottest: {{ String.fromCharCode(emnistLabels[net.getHottestOutput()]) }}
      </p>
    </div>
    <div id="outputs">
      <ol start="0">
        <li v-for="(out, index) in output" :key="out.activation">
          {{ emnistLabels[index] }}/<b>{{
            String.fromCharCode(emnistLabels[index])
          }}</b
          >: {{ out.toFixed(25) }}
        </li>
      </ol>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NumberCanvas from "./components/NumberCanvas.vue";
import { EmnistNet } from "./network/emnist-net";
import { emnistLabels } from "./data/emnist-labels";
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
      net: new EmnistNet(),
      output: [] as number[],
      emnistLabels: emnistLabels,
      curAccuracy: 0,
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
        this.output = this.net.feed(this.canvasData);
        this.mostRecentUpdate = this.timeOfChange;
      }
    },
    runLots() {
      this.net.runNBatches(100, 100);
    },
  },
  mounted() {
    // setInterval(this.reFeed, 100);
  },
});
</script>

<style>
#number-canvas {
  flex: 1 0 50%;
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
#outer {
  display: flex;
  flex-direction: row;
}
#outputs {
  flex: 1 0 50%;
  font-size: x-small;
}
</style>
