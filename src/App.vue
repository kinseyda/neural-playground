<template>
  <div id="outer">
    <div id="number-canvas">
      <number-canvas
        ref="numCan"
        v-on:imageChange="imageChange"
      ></number-canvas>
      <button @click="net.loadEmnist()">Load</button>
      <button @click="net.runMiniBatch(100)">Train</button>
      <button @click="curAccuracy = net.getPredictedAccuracy()">
        Predict Accuracy
      </button>
      <button @click="reFeed">ReFeed</button>
      <button @click="runLots">Run lots of trainings</button>
      <button @click="putExample">Random Example Image</button>
      <p v-if="net.emnist">Accuracy out of 100 examples: {{ curAccuracy }}</p>
      <p v-if="net.emnist">
        Hottest: {{ String.fromCharCode(emnistLabels[net.getHottestOutput()]) }}
      </p>
    </div>
    <div id="outputs">
      <ol start="0">
        <li v-for="(out, index) in net.outputActivations" :key="out.index">
          {{ emnistLabels[index] }}/<b>{{
            String.fromCharCode(emnistLabels[index])
          }}</b
          >: <b>{{ out.toFixed(2) }}</b>
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
        this.net.feed(this.canvasData);
        this.mostRecentUpdate = this.timeOfChange;
      }
    },
    runLots() {
      this.net.runNBatches(600, 100);
    },
    putExample() {
      const ex = this.net.generateMiniBatch(1)[0];
      console.log(ex.expectedOutputs.indexOf(1));
      (this.$refs["numCan"] as typeof NumberCanvas).replaceImage(ex.inputs);
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
