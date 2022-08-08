<template>
  <div id="io-container">
    <div id="io-inputs">
      <p>Inputs:</p>
      <div id="io-in-top-spacer"></div>
      <table>
        <tr>
          <td>Index</td>
          <td>Input</td>
        </tr>
        <tr
          v-for="(_, inputNum) in inputs.length"
          :key="inputNum"
          class="input-row"
        >
          <td class="io-index">{{ inputNum }}</td>
          <td>
            <button @click="toggleInput(inputNum)">
              {{ inputs[inputNum] }}
            </button>
          </td>
        </tr>
        <tr>
          <td colspan="1">As number:</td>
          <td>
            {{ binListToNum(inputs) }}
          </td>
        </tr>
      </table>
      <div id="io-in-bottom-spacer"></div>
    </div>
    <div id="io-outputs">
      <p>Outputs:</p>
      <div id="io-out-top-spacer"></div>
      <table>
        <tr>
          <td>Index</td>
          <td colspan="3">Output</td>
        </tr>
        <tr
          v-for="(output, outputNum) in outputs"
          :key="outputNum"
          class="output-row"
        >
          <td class="io-index">{{ outputNum }}</td>
          <td>{{ output.toFixed(2) }}</td>
          <td>≈</td>
          <td>{{ output.toFixed(0) }}</td>
        </tr>
        <tr>
          <td colspan="3">As number:</td>
          <td>
            {{ binListToNum(outputs.map((x: number) => Number(x.toFixed(0)))) }}
          </td>
        </tr>
      </table>
      <div id="io-out-bottom-spacer"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { binListToNum } from "@/network/helpers";

export default defineComponent({
  name: "GateTrainData",
  props: ["inputs", "outputs"],
  data() {
    return {};
  },
  emits: ["update:inputs"],
  watch: {},
  methods: {
    toggleInput(index: number) {
      this.$emit(
        "update:inputs",
        [...this.inputs].map((val, mapIndex) =>
          mapIndex == index ? 1 ^ val : val
        )
      );
    },
    binListToNum(list: number[]) {
      return binListToNum(list);
    },
  },
});
</script>

<style scoped>
#io-container {
  display: flex;
  flex-direction: row;
}

#io-inputs {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
}

#io-outputs {
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
}

#io-in-top-spacer,
#io-in-bottom-spacer,
#io-out-top-spacer,
#io-out-bottom-spacer {
  flex: 1 0 0;
}

.io-index {
  border-right: 1px dashed black;
}

tr.input-row:nth-child(even),
tr.output-row:nth-child(even) {
  background-color: #eeeeee;
}

tr.input-row:nth-child(odd),
tr.output-row:nth-child(odd) {
  background-color: #ffffff;
}

tr.input-row {
  background-color: red;
}

div#io-container > div > table {
  border-collapse: collapse;
  margin-left: 0.5ch;
  margin-right: 0.5ch;
  text-align: center;
}

div#io-container > div > table > tr {
  height: 2em;
}
</style>
