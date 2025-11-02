<template>
  <div class="ai-training-view">
    <AIPanel />
  </div>
</template>

<script>
import AIPanel from '@/components/ai/AIPanel.vue'

export default {
  name: 'AITrainingView',
  components: {
    AIPanel
  }
}
</script>

<style scoped>
.ai-training-view {
  height: 100%;
  overflow-y: auto;
}
</style>
