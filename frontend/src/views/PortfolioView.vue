<template>
  <div class="portfolio-view">
    <PortfolioOverview />
  </div>
</template>

<script>
import PortfolioOverview from '@/components/portfolio/PortfolioOverview.vue'

export default {
  name: 'PortfolioView',
  components: {
    PortfolioOverview
  }
}
</script>

<style scoped>
.portfolio-view {
  height: 100%;
  overflow-y: auto;
}
</style>
