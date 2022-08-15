<template>
  <div id="outer">
    <div id="io-setup-col">
      <div id="net-setup">
        <h2>Network setup</h2>
        <size-selector
          v-model="netSizes"
          :locked="{ inputMax: 8, hiddenMax: 16, outputMax: 8, layersMax: 6 }"
          :currentlyTraining="currentlyTraining"
        >
        </size-selector>
        <button @click="newNet()" :disabled="currentlyTraining">
          Reset network
        </button>
      </div>
      <div id="interact">
        <h2>Input/Output Testing</h2>
        <h3>Interact</h3>
        <gate-i-o
          v-model:inputs="inputs"
          :outputs="mostRecentResult"
        ></gate-i-o>
      </div>
      <div id="t-t-outer">
        <h3>Truth Table</h3>
        <div>
          <test-truth-table
            :net="net"
            :trainData="trainData"
          ></test-truth-table>
        </div>
      </div>
    </div>
    <div id="viz-col">
      <h2>View</h2>
      <div id="net-viz">
        <net-visualizer ref="netViz" :net="net"></net-visualizer>
      </div>
    </div>
    <div id="train-col">
      <h2>Train</h2>
      <div>
        Preset data:
        <select @change="newPreset" :disabled="currentlyTraining">
          <option
            value="-1"
            :selected="
              -1 ==
              examples.findIndex(
                (x) => JSON.stringify(x.data) === JSON.stringify(trainData)
              )
            "
          ></option>
          <option
            v-for="(ex, index) in examples"
            :key="index"
            :value="index"
            :disabled="
              !(
                ex.inputSize == net.sizes[0] &&
                ex.outputSize == net.sizes[net.sizes.length - 1]
              )
            "
            :selected="
              index ==
              examples.findIndex(
                (x) => JSON.stringify(x.data) === JSON.stringify(trainData)
              )
            "
          >
            {{ ex.name }} {{ ex.inputSize }}/{{ ex.outputSize }}
          </option>
        </select>
      </div>
      <div id="data">
        <gate-train-data
          ref="gateTrainData"
          v-model="trainData"
          :inputSize="net.sizes[0]"
          :outputSize="net.sizes[net.sizes.length - 1]"
          :currentlyTraining="currentlyTraining"
        >
        </gate-train-data>
      </div>
      <div id="train-button-cont">
        <progress-bar
          :numerator="progressNum"
          :denominator="progressDenom"
          :currentlyTraining="currentlyTraining"
        ></progress-bar>
        <div>
          Epochs:
          <input
            v-model="epochs"
            min="1"
            type="number"
            :disabled="currentlyTraining"
          />
          <button
            @click="currentlyTraining = false"
            :disabled="!currentlyTraining"
          >
            Cancel
          </button>
        </div>
        <button
          @click="trainWithData(epochs)"
          id="train-button"
          :disabled="currentlyTraining"
        >
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
import GateTrainData from "./GateTrainData.vue";
import NetVisualizer from "@/components/Network/NetVisualizer.vue";
import SizeSelector from "@/components/Network/SizeSelector.vue";
import { train } from "@/network/network";
import GateIO from "./GateIO.vue";
import { examples } from "@/data/logic-gates/gate-examples";
import ProgressBar from "../ProgressBar.vue";
import { longForLoop } from "@/long-loop";
import TestTruthTable from "./TestTruthTable.vue";

export default defineComponent({
  name: "GateDisplay",
  components: {
    GateTrainData,
    NetVisualizer,
    SizeSelector,
    GateIO,
    ProgressBar,
    TestTruthTable,
  },
  data() {
    return {
      examples: examples,
      netSizes: [2, 2, 1],
      net: new LogicGateNet(),
      inputs: [] as number[],
      mostRecentResult: [] as number[],
      trainData: [] as TrainingExample[],
      currentlyTraining: false,
      epochs: 10000,
      progressNum: 0,
      progressDenom: 1,
    };
  },
  watch: {
    netSizes: {
      deep: true,
      handler() {
        this.newNet();
      },
    },
    inputs: {
      deep: true,
      handler() {
        this.reFeed();
      },
    },
  },
  methods: {
    toggleInput(inputNum: number) {
      this.inputs[inputNum] = this.inputs[inputNum] ? 0 : 1;
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
      if (this.trainData.length < 1) {
        return;
      }
      this.currentlyTraining = true;
      this.progressDenom = epochs;
      this.progressNum = 0;
      setTimeout(
        () =>
          longForLoop(
            epochs,
            20,
            {},
            (index, params) => {
              if (!this.currentlyTraining) {
                params["break"] = true;
              } else {
                train(this.trainData, this.net);
                this.progressNum = index + 1;
                this.reFeed();
                this.updateNetVizVals();
              }
            },
            () => {
              this.currentlyTraining = false;
            }
          ),
        0
      );
    },
    newNet() {
      this.net = new LogicGateNet(this.netSizes);
      this.inputs = new Array(this.net.sizes[0]).fill(0);
      this.newNetViz();
    },
    newNetViz() {
      (this.$refs["netViz"] as typeof NetVisualizer).newNet(this.net);
    },
    updateNetVizVals() {
      (this.$refs["netViz"] as typeof NetVisualizer).updateNetVals(this.net);
    },
    newPreset(data: Event) {
      if (Number((data.target as HTMLOptionElement).value) == -1) {
        return;
      }
      (this.$refs["gateTrainData"] as typeof GateTrainData).setCurList(
        examples[Number((data.target as HTMLOptionElement).value)].data
      );
    },
  },
  mounted() {
    this.newNet();
    this.reFeed();
    // setInterval(this.reFeed, 250);
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
  flex: 0 0 20%;
  display: flex;
  flex-direction: column;
}

#viz-col {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
}

#train-col {
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
}

#net-viz {
  flex: 1 0 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

#data {
  flex: 1 0 0;
  overflow-x: scroll;
  overflow-y: scroll;
}
#interact {
  flex: 1 0 0;
}
#t-t-outer {
  flex: 1 0 0;
  overflow-x: scroll;
  overflow-y: scroll;
}

#train-button {
  height: 5ch;
}

#train-button-cont {
  margin-top: 1ch;
  margin-left: 0.5ch;
  display: flex;
  flex-direction: column;
}
</style>
