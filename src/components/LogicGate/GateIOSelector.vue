<template>
  <div id="table-cont">
    <div id="input-col">
      <table>
        <colgroup>
          <col :span="inputSize" />
        </colgroup>
        <tr>
          <td :colspan="inputSize">
            <small>Inputs</small>
          </td>
        </tr>
        <tr
          v-for="(_, dataIndex) in 2 ** inputSize"
          :key="dataIndex"
          class="data-row"
        >
          <td
            v-for="inputDigit in numToBinList(dataIndex, inputSize)"
            :key="inputDigit"
            class="input-digit"
          >
            <span>{{ inputDigit }}</span>
          </td>
        </tr>
      </table>
    </div>
    <div id="use-col">
      <table>
        <colgroup>
          <col />
        </colgroup>
        <tr>
          <td>
            <small>Enabled</small>
          </td>
        </tr>
        <tr
          v-for="(_, dataIndex) in 2 ** inputSize"
          :key="dataIndex"
          class="data-row"
        >
          <td>
            <button @click="curList[dataIndex] = -1 - curList[dataIndex]">
              {{ curList[dataIndex] != -1 }}
            </button>
          </td>
        </tr>
        <tr>
          <td><button @click="toggleAll">All</button></td>
        </tr>
      </table>
    </div>
    <div id="output-col">
      <table>
        <colgroup>
          <col v-for="num in outputSize" :key="num" class="outlined" />
        </colgroup>
        <tr>
          <td :colspan="outputSize">
            <small>Outputs</small>
          </td>
        </tr>
        <tr
          v-for="(_, dataIndex) in 2 ** inputSize"
          :key="dataIndex"
          class="data-row"
        >
          <td
            v-for="(_, outputIndex) in outputSize"
            :key="outputIndex"
            class="output-digit"
          >
            <button
              v-if="curList[dataIndex] != -1"
              @click="toggleDatum(dataIndex, outputIndex)"
            >
              {{ numToBinList(curList[dataIndex], outputSize)[outputIndex] }}
            </button>
          </td>
        </tr>
      </table>
    </div>
  </div>
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
    toggleAll() {
      if (this.curList.includes(-1)) {
        this.curList = this.curList.map((x) => (x == -1 ? 0 : x));
      } else {
        this.curList = new Array(2 ** this.inputSize).fill(-1);
      }
    },
  },
});
</script>

<style scoped>
table {
  width: 100%;
  /* margin: 1ch; */
  border-collapse: collapse;
  text-align: center;
}
tr.data-row:nth-child(even) {
  background-color: #eeeeee;
}
tr.data-row:nth-child(odd) {
  background-color: #ffffff;
}
tr.data-row:nth-child(4n -1) {
  border-top: 1px dashed black;
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

td {
  height: 2em;
}
#table-cont {
  display: flex;
  flex-direction: row;
  margin: 0.5ch;
}
#input-col {
  flex: 1 0 0;
}
#output-col {
  margin-top: -0.5px;
  /* margin to fix offset caused by solid border on output column, just to make those dashed lines line up */
  flex: 1 0 0;
}
button {
  /* width: 100%;
  height: 95%; */
  border-radius: 0;
  border: 1px solid black;
}
small {
  margin-left: 1ch;
  margin-right: 1ch;
}
</style>
