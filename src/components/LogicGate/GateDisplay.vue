feedfeedNet
<template>
  <div id="outer">
    <div v-for="inputNum in net.sizes[0]" :key="inputNum">
      <button @click="toggleInput(inputNum)">
        {{ inputNum - 1 }}
      </button>
    </div>
    {{ inputs }}
    <div id="outputs">
      <ol start="0">
        <li v-for="(out, index) in mostRecentResult" :key="index">
          <b>{{ out.toFixed(2) }}</b>
        </li>
      </ol>
    </div>
    <div>
      <size-selector v-model="netSizes"></size-selector>
    </div>
    <div id="net-viz">
      <net-visualizer ref="netViz"></net-visualizer>
    </div>
    <div id="data">
      <gate-i-o-selector
        v-model="trainData"
        :inputSize="net.sizes[0]"
        :outputSize="net.sizes[net.sizes.length - 1]"
      ></gate-i-o-selector>
    </div>
    <button @click="trainWithData(50)">Train on data 50 times</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getHottest, numToBinList } from "@/network/helpers";
import { LogicGateNet } from "@/network/nets/logic-gate-net";
import { feed, TrainingExample } from "@/network/network";
import GateIOSelector from "./GateIOSelector.vue";
import NetVisualizer from "@/components/Network/NetVisualizer.vue";
import SizeSelector from "@/components/Network/SizeSelector.vue";
import { train } from "@/network/network";

export default defineComponent({
  name: "GateDisplay",
  components: { GateIOSelector, NetVisualizer, SizeSelector },
  data() {
    return {
      netSizes: [2, 2, 1],
      net: new LogicGateNet(),
      inputs: [] as number[],
      mostRecentResult: [] as number[],
      trainData: [] as TrainingExample[],
      curAccuracy: 0,
    };
  },
  watch: {
    netSizes: {
      deep: true,
      handler() {
        this.newNet();
      },
    },
  },
  methods: {
    toggleInput(inputNum: number) {
      this.inputs[inputNum - 1] = this.inputs[inputNum - 1] ? 0 : 1;
      this.reFeed();
    },
    reFeed() {
      const activs = feed(this.inputs, this.net)["activations"];
      this.mostRecentResult = activs[activs.length - 1];
    },
    getHottest(arr: number[]) {
      return getHottest(arr);
    },
    trainWithData(epochs: number) {
      for (let i = 0; i < epochs; i++) {
        train(this.trainData, this.net);
      }
      this.updateVisualizer();
    },
    newNet() {
      this.net = new LogicGateNet(this.netSizes);
      this.inputs = new Array(this.net.sizes[0]).fill(0);
      this.updateVisualizer();
    },
    updateVisualizer() {
      (this.$refs["netViz"] as typeof NetVisualizer).updateNet(this.net);
    },
  },
  mounted() {
    this.newNet();
    this.reFeed();
    setInterval(this.reFeed, 250);
  },
});
</script>

<style scoped>
#outer {
  display: flex;
  flex-direction: row;
}
#outputs {
  flex: 1 0 10%;
  font-size: x-small;
}
#net-viz {
  flex: 1 0 50%;
  width: 50ch;
  height: 50ch;
}
</style>
