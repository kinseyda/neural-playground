feedfeedNet
<template>
  <gate-display></gate-display>
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

<style></style>
