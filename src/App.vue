<template>
  <div id="number-canvas">
    <NumberCanvas />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NumberCanvas from "./components/NumberCanvas.vue";

export default defineComponent({
  name: "App",
  components: {
    NumberCanvas,
  },
});
</script>

<style>
#number-canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
