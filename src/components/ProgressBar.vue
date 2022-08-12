<template>
  <div id="prog-outer">
    <div>Progress: {{ (level * 100).toFixed(2) }}%</div>
    <div id="bar-cont">
      <div id="bar" :style="{ width: level * 100 + '%' }"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProgressBar",
  props: ["level"],
  data() {
    return {};
  },
  watch: {},
  methods: {},
});
</script>
<style scoped>
#prog-outer {
  display: flex;
  flex-direction: column;
}
#bar-cont {
  height: 5ex;
  border: 1px solid black;
}
#bar {
  height: 5ex;
  background: lightgray;
}
</style>
