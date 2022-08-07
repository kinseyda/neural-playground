<template>
  <div id="app-outer">
    <h1>Neural Playground - Logic gates</h1>

    <gate-display></gate-display>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import GateDisplay from "./components/LogicGate/GateDisplay.vue";

export default defineComponent({
  name: "App",
  components: {
    GateDisplay,
  },
  data() {
    return {};
  },
  methods: {},
});
</script>

<style>
#app-outer {
  position: absolute;
  top: 1ch;
  left: 1ch;
  right: 1ch;
  bottom: 1ch;
  display: flex;
  flex-direction: column;
}
</style>
