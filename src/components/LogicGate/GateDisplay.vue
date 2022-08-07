feedfeedNet
<template>
  <div id="outer">
    <div id="io-setup-col">
      <h2>Network setup</h2>
      <div id="net-setup">
        <size-selector v-model="netSizes"></size-selector>
        <button @click="newNet()">Reset network</button>
      </div>
      <h2>Input/Output Testing</h2>
      <div id="io-container">
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
      </div>
    </div>
    <div id="viz-col">
      <h2>View</h2>
      <div id="net-viz">
        <net-visualizer ref="netViz"></net-visualizer>
      </div>
    </div>
    <div id="train-col">
      <h2>Train</h2>
      <div id="data">
        <gate-i-o-selector
          v-model="trainData"
          :inputSize="net.sizes[0]"
          :outputSize="net.sizes[net.sizes.length - 1]"
        >
        </gate-i-o-selector>
      </div>
      <div>
        Epochs: <input v-model="epochs" min="1" type="number" />
        <button @click="trainWithData(epochs)" id="train-button">
          Train on data {{ epochs }} time{{ epochs > 1 ? "s" : "" }}
        </button>
      </div>
    </div>
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
      epochs: 1,
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
  flex: 1 0 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}
#io-setup-col {
  flex: 0 0 25%;
}
#viz-col {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
}
#train-col {
  flex: 0 0 25%;
  display: flex;
  flex-direction: column;
}
#outputs {
  flex: 1 0 10%;
  font-size: x-small;
}
#net-viz {
  flex: 1 0 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}
#data {
  flex: 1 0 0;
  overflow: scroll;
}
#train-button {
  height: 5ch;
}
</style>
