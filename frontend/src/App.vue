<template>
  <div id="app" class="app-container">
    <Navbar v-if="isAuthenticated" />
    <Sidebar v-if="isAuthenticated" />
    
    <main :class="['main-content', { 'with-sidebar': isAuthenticated }]">
      <router-view />
    </main>

    <LoadingOverlay 
      :active="globalLoading" 
      :can-cancel="false"
      color="#2c5aa0"
      background-color="#1a1a1a"
    />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Navbar from '@/components/shared/Navbar.vue'
import Sidebar from '@/components/shared/Sidebar.vue'
import LoadingOverlay from 'vue-loading-overlay'

export default {
  name: 'App',
  components: {
    Navbar,
    Sidebar,
    LoadingOverlay
  },
  setup() {
    const store = useStore()
    
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const globalLoading = computed(() => store.state.globalLoading)

    return {
      isAuthenticated,
      globalLoading
    }
  }
}
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: 'Vazir', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-content {
  min-height: calc(100vh - 60px);
  transition: margin-right 0.3s ease;

  &.with-sidebar {
    margin-right: 250px;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-right: 0;
  }
}
</style>
