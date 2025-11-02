<template>
  <div class="dashboard-view">
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from '@/components/dashboard/Dashboard.vue'

export default {
  name: 'DashboardView',
  components: {
    Dashboard
  }
}
</script>

<style scoped>
.dashboard-view {
  height: 100%;
  overflow-y: auto;
}
</style>
