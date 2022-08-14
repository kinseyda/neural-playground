<template>
  <div id="prog-outer">
    <div>
      Progress:
      <div id="progress-stats">
        <div>{{ (level * 100).toFixed(2) }}%</div>
        <div>{{ numerator }} / {{ denominator }}</div>
        <div>{{ formatTime(toComplete) }}</div>
      </div>
    </div>
    <div id="bar-cont">
      <div id="bar" :style="{ width: level * 100 + '%' }"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { formatTimeString } from "@/format";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProgressBar",
  props: { numerator: Number, denominator: Number },
  computed: {
    level(): number {
      return (this.numerator || 0) / (this.denominator || 1);
    },
  },
  data() {
    return {
      lastUpdate: 0,
      numAtLastUpdate: 0,
      toComplete: 0,
      intervalID: -1,
    };
  },
  watch: {
    numerator: {
      handler(newValue, oldValue) {
        if (oldValue == 0) {
          this.intervalID = setInterval(() => {
            const now = Date.now();
            const timeSince = now - this.lastUpdate;
            const rate =
              ((this.numerator || 0) - this.numAtLastUpdate) / timeSince;
            this.toComplete =
              ((this.denominator || 1) - (this.numerator || 0)) / rate;
            this.numAtLastUpdate = this.numerator || 0;
            this.lastUpdate = now;
          }, 1000);
          this.lastUpdate = Date.now();
          this.numAtLastUpdate = 0;
        } else if (newValue == this.denominator) {
          clearInterval(this.intervalID);
          this.toComplete = 0;
        }
      },
    },
  },
  methods: {
    formatTime(num: number) {
      return formatTimeString(num);
    },
  },
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
#progress-stats {
  display: flex;
  flex-direction: row;
}
#progress-stats > div {
  flex: 1 0 0;
}
</style>
