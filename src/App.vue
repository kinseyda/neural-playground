feedfeedNet
<template>
  <emnist-display></emnist-display>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EmnistDisplay from "./components/EmnistDisplay.vue";

export default defineComponent({
  name: "App",
  components: {
    EmnistDisplay,
  },
  data() {
    return {};
  },
  methods: {},
});
</script>

<style></style>
