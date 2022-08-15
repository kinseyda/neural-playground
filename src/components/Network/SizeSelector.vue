<template>
  <table>
    <colgroup>
      <col v-for="(_, index) in modelValue" :key="index" class="outlined" />
      <col class="outlined" />
    </colgroup>
    <tr>
      <td v-for="(_, index) in modelValue" :key="index">
        <button @click="increment(index)" :disabled="currentlyTraining">
          ▲
        </button>
      </td>
      <td rowspan="3">
        <button id="add-button" @click="add()" :disabled="currentlyTraining">
          +
        </button>
      </td>
    </tr>
    <tr>
      <td v-for="(size, index) in modelValue" :key="index">{{ size }}</td>
    </tr>
    <tr>
      <td v-for="(_, index) in modelValue" :key="index">
        <button @click="decrement(index)" :disabled="currentlyTraining">
          ▼
        </button>
      </td>
    </tr>
    <tr>
      <td v-for="(_, index) in modelValue" :key="index">
        <button @click="remove(index)" :disabled="currentlyTraining">-</button>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import { binListToNum, numToBinList } from "@/network/helpers";
import { TrainingExample } from "@/network/network";
import { defineComponent } from "vue";
interface Locked {
  inputMax?: number;
  hiddenMax?: number;
  outputMax?: number;
  layersMax?: number;
}
export default defineComponent({
  name: "SizeSelector",
  props: ["modelValue", "locked", "currentlyTraining"],
  data() {
    return {
      curList: this.modelValue as number[],
    };
  },
  emits: ["update:modelValue"],
  watch: {
    curList: {
      deep: true,
      handler() {
        this.emitNewList();
      },
    },
  },
  methods: {
    emitNewList() {
      this.$emit("update:modelValue", this.curList);
    },
    increment(index: number) {
      this.curList[index] += 1;
      this.checkSizes();
    },
    decrement(index: number) {
      this.curList[index] -= 1;
      this.checkSizes();
    },
    remove(index: number) {
      if (this.curList.length > 2) this.curList.splice(index, 1);
      this.checkSizes();
    },
    add() {
      if (this.curList.length < ((this.locked as Locked).layersMax || Infinity))
        this.curList.push(1);
    },
    checkSizes() {
      for (let i = 0; i < this.curList.length; i++) {
        let maxSize = (this.locked as Locked).hiddenMax || Infinity;
        if (i == 0) maxSize = (this.locked as Locked).inputMax || Infinity;
        if (i == this.curList.length - 1)
          maxSize = (this.locked as Locked).outputMax || Infinity;

        if (this.curList[i] > maxSize) this.curList[i] = maxSize;

        if (this.curList[i] < 1) this.curList[i] = 1;
      }
    },
  },
});
</script>

<style scoped>
table {
  border-collapse: collapse;
  padding: 0;
  margin: 0;
}
td {
  text-align: center;
  padding: 0;
  margin: 0;
}
tr {
  height: 3ch;
  padding: 0;
  margin: 0;
}
button {
  width: 3ch;
  height: 3ch;
  padding: 0;
}
button#add-button {
  height: 10ch;
}
.outlined {
  border: 1px solid black;
}
</style>
