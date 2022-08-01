<template>
  <table>
    <colgroup>
      <col span="2" />
      <col class="outlined" />
      <col />
    </colgroup>
    <tr v-for="(data, dataIndex) in curList" :key="dataIndex">
      <td
        v-for="inputDigit in numToBinList(dataIndex, inputSize)"
        :key="inputDigit"
      >
        <button>{{ inputDigit }}</button>
      </td>
      <td
        v-for="(outputDigit, outputIndex) in numToBinList(data, outputSize)"
        :key="outputIndex"
      >
        <button @click="toggleDatum(dataIndex, outputIndex)">
          {{ outputDigit }}
        </button>
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
  },
  methods: {
    emitNewTEList() {
      let arr: TrainingExample[] = this.curList.map((x, index) => {
        return {
          inputs: numToBinList(index, this.inputSize),
          expectedOutputs: numToBinList(x, this.outputSize),
        };
      });
      this.$emit("update:modelValue", arr);
    },
    numToBinList(num: number, size: number) {
      return numToBinList(num, size);
    },
    setCurList() {
      const arr: number[] = [];
      for (let i = 0; i < 2 ** this.inputSize; i++) {
        const input = i,
          output = this.modelValue[i]
            ? binListToNum(this.modelValue[i].expectedOutputs)
            : 0;
        arr[input] = output;
      }
      return arr;
    },
    toggleDatum(input: number, output: number) {
      const oldOutputs = numToBinList(this.curList[input], this.outputSize);
      oldOutputs[output] ^= 1;
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
  border: 1px solid black;
}
</style>
