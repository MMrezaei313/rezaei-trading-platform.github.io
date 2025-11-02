<template>
  <div class="strategies-view">
    <StrategyBuilder />
  </div>
</template>

<script>
import StrategyBuilder from '@/components/strategies/StrategyBuilder.vue'

export default {
  name: 'StrategiesView',
  components: {
    StrategyBuilder
  }
}
</script>

<style scoped>
.strategies-view {
  height: 100%;
  overflow-y: auto;
}
</style>
