<template>
  <table>
    <colgroup>
      <col :span="inputSize" />
      <col />
      <col v-for="num in outputSize" :key="num" class="outlined" />
    </colgroup>
    <tr>
      <td :colspan="inputSize"><small>Inputs</small></td>
      <td><small>Use</small></td>
      <td :colspan="outputSize"><small>Outputs</small></td>
    </tr>
    <tr v-for="(_, dataIndex) in 2 ** inputSize" :key="dataIndex">
      <td
        v-for="inputDigit in numToBinList(dataIndex, inputSize)"
        :key="inputDigit"
      >
        <button>{{ inputDigit }}</button>
      </td>
      <td>
        <button @click="curList[dataIndex] = -1 - curList[dataIndex]">
          {{ curList[dataIndex] != -1 }}
        </button>
      </td>
      <td v-for="(_, outputIndex) in outputSize" :key="outputIndex">
        <div v-if="curList[dataIndex] != -1">
          <button @click="toggleDatum(dataIndex, outputIndex)">
            {{ numToBinList(curList[dataIndex], outputSize)[outputIndex] }}
          </button>
        </div>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import { binListToNum, numToBinList } from "@/network/helpers";
import { TrainingExample } from "@/network/network";
import { defineComponent } from "vue";

export default defineComponent({
  name: "GateIOSelector",
  props: ["modelValue", "inputSize", "outputSize"],
  data() {
    return {
      curList: this.setCurList() as number[],
    };
  },
  emits: ["update:modelValue"],
  watch: {
    curList: {
      deep: true,
      handler() {
        this.emitNewTEList();
      },
    },
    inputSize: {
      handler() {
        this.curList = this.setCurList();
      },
    },
    outputSize: {
      handler() {
        this.curList = this.setCurList();
      },
    },
  },
  methods: {
    emitNewTEList() {
      const arr: TrainingExample[] = [];
      for (let i = 0; i < this.curList.length; i++) {
        if (this.curList[i] != -1) {
          arr.push({
            inputs: numToBinList(i, this.inputSize),
            expectedOutputs: numToBinList(this.curList[i], this.outputSize),
          });
        }
      }
      this.$emit("update:modelValue", arr);
    },
    numToBinList(num: number, size: number) {
      return numToBinList(num, size);
    },
    setCurList() {
      const arr: number[] = [];
      for (let i = 0; i < 2 ** this.inputSize; i++) {
        const input = this.modelValue[i]
            ? binListToNum(this.modelValue[i].inputs)
            : i,
          output = this.modelValue[i]
            ? binListToNum(this.modelValue[i].expectedOutputs) <
              2 ** this.outputSize // If output size has shrunk, use max value if necessary
              ? binListToNum(this.modelValue[i].expectedOutputs)
              : 2 ** this.outputSize - 1
            : -1;
        console.log(`input:${input}, output:${output}`);
        arr[input] = output;
      }
      return arr;
    },
    toggleDatum(input: number, output: number) {
      const oldOutputs = numToBinList(this.curList[input], this.outputSize);
      oldOutputs[output] ^= 1; // toggle via xor
      this.curList[input] = binListToNum(oldOutputs);
    },
  },
});
</script>

<style scoped>
table {
  border-collapse: collapse;
}
.outlined {
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  border-left: 1px solid black;
}
.outlined:last-of-type {
  border-right: 1px solid black;
}
.outlined ~ .outlined {
  /* We apply left border to all columns but then un-apply it for any outlined column that is after another outlined column (ie any column besides the first)  */
  border-left: none;
}
</style>
