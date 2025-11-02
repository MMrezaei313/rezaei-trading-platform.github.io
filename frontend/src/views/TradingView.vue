<template>
  <div class="trading-view">
    <LiveTrading />
  </div>
</template>

<script>
import LiveTrading from '@/components/trading/LiveTrading.vue'

export default {
  name: 'TradingView',
  components: {
    LiveTrading
  }
}
</script>

<style scoped>
.trading-view {
  height: 100%;
  overflow-y: auto;
}
</style>
