<template>
  <div>
    <button @click="tTEnabled = !tTEnabled">
      {{ tTEnabled ? "Hide" : "Show" }} table
    </button>
    <table v-if="tTEnabled">
      <tr>
        <td :colspan="net.sizes[0] + 1">Inputs</td>
        <td :colspan="net.sizes[net.sizes.length - 1] + 1" class="left-border">
          Output
        </td>
      </tr>
      <tr
        v-for="(_, dataIndex) in 2 ** net.sizes[0]"
        :key="dataIndex"
        class="data-row"
      >
        <td class="input-index">{{ dataIndex }}</td>
        <td
          v-for="inputDigit in numToBinList(dataIndex, net.sizes[0])"
          :key="inputDigit"
          class="input-digit"
        >
          {{ inputDigit }}
        </td>
        <td
          v-for="(_, outputIndex) in net.sizes[net.sizes.length - 1]"
          :key="outputIndex"
          class="output-digit"
          :class="{
            'left-border': outputIndex == 0,
            good: trainMatrix[dataIndex]
              ? Math.round(outputs[dataIndex][outputIndex]) ==
                trainMatrix[dataIndex][outputIndex]
              : true,
            bad: trainMatrix[dataIndex]
              ? Math.round(outputs[dataIndex][outputIndex]) !=
                trainMatrix[dataIndex][outputIndex]
              : false,
          }"
        >
          {{ outputs[dataIndex][outputIndex].toFixed(0) }}
        </td>
        <td
          class="output-number"
          :class="{
            good: trainMatrix[dataIndex]
              ? binListToNum(outputs[dataIndex].map((x) => Math.round(x))) ==
                binListToNum(trainMatrix[dataIndex])
              : true,
            bad: trainMatrix[dataIndex]
              ? binListToNum(outputs[dataIndex].map((x) => Math.round(x))) !=
                binListToNum(trainMatrix[dataIndex])
              : false,
          }"
        >
          {{ binListToNum(outputs[dataIndex].map((x) => x.toFixed(0))) }}
        </td>
      </tr>
      <tr>
        <td :colspan="net.sizes[0] + 1">Train Accuracies:</td>
        <td
          v-for="(_, outputIndex) in net.sizes[net.sizes.length - 1]"
          :key="outputIndex"
        >
          <small>{{ (getColumnAccuracy(outputIndex) * 100).toFixed(0) }}</small>
        </td>
        <td>
          <small>{{ (getTotalAccuracy() * 100).toFixed(0) }}</small>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { binListToNum, numToBinList } from "@/network/helpers";
import { feed } from "@/network/network";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TestTruthTable",
  props: ["net", "trainData"],
  data() {
    return { tTEnabled: true };
  },
  computed: {
    outputs(): number[][] {
      return Array.from(Array(2 ** this.net.sizes[0]).keys()).map(
        (x) =>
          feed(numToBinList(x, this.net.sizes[0]), this.net)["activations"][
            this.net.sizes.length - 1
          ]
      );
    },
    trainMatrix(): number[][] {
      const trainDataCol = Array(2 ** this.net.sizes[0]);
      for (const td of this.trainData) {
        trainDataCol[binListToNum(td.inputs)] = td.expectedOutputs;
      }
      return trainDataCol;
    },
  },
  methods: {
    numToBinList(num: number, size: number) {
      return numToBinList(num, size);
    },
    feed(num: number) {
      return feed(numToBinList(num, this.net.sizes[0]), this.net)[
        "activations"
      ][this.net.sizes.length - 1];
    },
    binListToNum(nums: number[]) {
      return binListToNum(nums);
    },
    getColumnAccuracy(col: number) {
      const outputCol = this.outputs.map((x) => x[col]);
      const trainDataCol = this.trainMatrix.map((x) => x[col]);
      const corrects = [];
      for (let i = 0; i < outputCol.length; i++) {
        if (trainDataCol[i] == null) {
          corrects[i] = 1;
        } else {
          corrects[i] = Math.round(outputCol[i]) == trainDataCol[i] ? 1 : 0;
        }
      }
      const average = corrects.reduce((a, b) => a + b, 0) / corrects.length;
      return average;
    },
    getTotalAccuracy() {
      if (!this.trainMatrix || this.trainMatrix.length == 0) {
        return 1;
      }
      const arrEq = function (a: number[], b: number[]) {
        if (a.length != b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (a[i] != b[i]) {
            return false;
          }
        }
        return true;
      };
      const corrects: number[] = this.outputs.map((outputRow, index) =>
        this.trainMatrix[index] != null
          ? arrEq(
              outputRow.map((x) => Math.round(x)),
              this.trainMatrix[index]
            )
            ? 1
            : 0
          : 1
      );
      const average = corrects.reduce((a, b) => a + b, 0) / corrects.length;
      return average;
    },
  },
});
</script>

<style scoped>
.good {
  color: green;
}
.bad {
  color: red;
}
.input-index {
  border-right: 1px dashed black;
}
.output-number {
  border-left: 1px dashed black;
}
.left-border {
  border-left: 1px solid black;
}
table {
  width: 100%;
  height: 100%;
  /* margin: 1ch; */
  border-collapse: collapse;
  text-align: center;
}
tr.data-row:nth-child(odd) {
  background-color: #eeeeee;
}
tr.data-row:nth-child(even) {
  background-color: #ffffff;
}
tr.data-row:nth-child(4n - 2) {
  border-top: 1px dashed black;
}
</style>
