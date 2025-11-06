<!-- rezaei-trading-platform/frontend/src/components/strategies/StrategyList.vue -->
<template>
  <div class="strategy-list">
    <div class="list-header">
      <h3 class="section-title">استراتژی‌های من</h3>
      <div class="header-actions">
        <router-link to="/strategies/new" class="btn btn-primary">
          <i class="icon-plus"></i>
          استراتژی جدید
        </router-link>
        <button 
          class="btn-icon"
          @click="refreshStrategies"
          :disabled="loading"
          title="بروزرسانی"
        >
          <i class="icon-refresh" :class="{ 'animate-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Strategy Stats -->
    <div class="strategy-stats">
      <div class="stat-card">
        <div class="stat-icon active">
          <i class="icon-play"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.active }}</span>
          <span class="stat-label">فعال</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon inactive">
          <i class="icon-pause"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.inactive }}</span>
          <span class="stat-label">غیرفعال</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon profit">
          <i class="icon-trending-up"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatPercentage(stats.avgProfit) }}</span>
          <span class="stat-label">میانگین سود</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="icon-layers"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">کل استراتژی‌ها</span>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="list-controls">
      <div class="controls-left">
        <div class="search-box">
          <input
            v-model="filters.search"
            type="text"
            placeholder="جستجو در استراتژی‌ها..."
            class="search-input"
          />
          <i class="icon-search search-icon"></i>
        </div>
        
        <select v-model="filters.status" class="filter-select">
          <option value="all">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
          <option value="paused">متوقف شده</option>
        </select>
        
        <select v-model="filters.type" class="filter-select">
          <option value="all">همه انواع</option>
          <option value="technical">تکنیکال</option>
          <option value="ai_based">هوش مصنوعی</option>
          <option value="custom">سفارشی</option>
        </select>
      </div>
      
      <div class="controls-right">
        <button 
          class="btn btn-secondary btn-sm"
          @click="showBulkActions = !showBulkActions"
        >
          <i class="icon-check-square"></i>
          اقدامات گروهی
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="showBulkActions" class="bulk-actions">
      <div class="bulk-info">
        <span>{{ selectedStrategies.length }} استراتژی انتخاب شده</span>
      </div>
      <div class="bulk-buttons">
        <button 
          class="btn btn-success btn-sm"
          @click="bulkActivate"
          :disabled="!hasSelectedStrategies"
        >
          <i class="icon-play"></i>
          فعال‌سازی
        </button>
        <button 
          class="btn btn-warning btn-sm"
          @click="bulkDeactivate"
          :disabled="!hasSelectedStrategies"
        >
          <i class="icon-pause"></i>
          غیرفعال‌سازی
        </button>
        <button 
          class="btn btn-danger btn-sm"
          @click="bulkDelete"
          :disabled="!hasSelectedStrategies"
        >
          <i class="icon-trash"></i>
          حذف
        </button>
        <button 
          class="btn btn-secondary btn-sm"
          @click="clearSelection"
        >
          <i class="icon-x"></i>
          انصراف
        </button>
      </div>
    </div>

    <!-- Strategies Grid -->
    <div class="strategies-grid">
      <div v-if="loading" class="loading-state">
        <i class="icon-loader animate-spin"></i>
        <span>در حال بارگذاری استراتژی‌ها...</span>
      </div>

      <div v-else-if="filteredStrategies.length === 0" class="empty-state">
        <i class="icon-cpu"></i>
        <p>هیچ استراتژی یافت نشد</p>
        <router-link to="/strategies/new" class="btn btn-primary">
          ایجاد اولین استراتژی
        </router-link>
      </div>

      <div v-else class="grid-container">
        <div 
          v-for="strategy in filteredStrategies"
          :key="strategy.id"
          class="strategy-card"
          :class="getStrategyCardClass(strategy)"
        >
          <div class="card-header">
            <div class="strategy-info">
              <h4 class="strategy-name">{{ strategy.name }}</h4>
              <span class="strategy-type">{{ getTypeText(strategy.type) }}</span>
            </div>
            <div class="card-actions">
              <input
                type="checkbox"
                v-model="selectedStrategies"
                :value="strategy.id"
                class="strategy-checkbox"
                v-if="showBulkActions"
              />
              <div class="action-menu" v-else>
                <button 
                  class="btn-icon"
                  @click="toggleActionMenu(strategy.id)"
                >
                  <i class="icon-more-vertical"></i>
                </button>
                <div 
                  v-if="activeActionMenu === strategy.id"
                  class="dropdown-menu"
                >
                  <button @click="editStrategy(strategy)" class="dropdown-item">
                    <i class="icon-edit"></i>
                    ویرایش
                  </button>
                  <button @click="cloneStrategy(strategy)" class="dropdown-item">
                    <i class="icon-copy"></i>
                    کپی
                  </button>
                  <button 
                    @click="toggleStrategy(strategy)"
                    class="dropdown-item"
                  >
                    <i :class="strategy.status === 'active' ? 'icon-pause' : 'icon-play'"></i>
                    {{ strategy.status === 'active' ? 'توقف' : 'فعال‌سازی' }}
                  </button>
                  <button 
                    @click="runBacktest(strategy)"
                    class="dropdown-item"
                  >
                    <i class="icon-bar-chart"></i>
                    اجرای بکتست
                  </button>
                  <hr class="dropdown-divider" />
                  <button 
                    @click="deleteStrategy(strategy)"
                    class="dropdown-item danger"
                  >
                    <i class="icon-trash"></i>
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card-content">
            <p class="strategy-description">{{ strategy.description }}</p>
            
            <div class="strategy-meta">
              <div class="meta-item">
                <i class="icon-bar-chart"></i>
                <span>{{ strategy.symbols.length }} نماد</span>
              </div>
              <div class="meta-item">
                <i class="icon-clock"></i>
                <span>{{ strategy.timeframe }}</span>
              </div>
              <div class="meta-item">
                <i class="icon-calendar"></i>
                <span>{{ formatDate(strategy.createdAt) }}</span>
              </div>
            </div>

            <div class="strategy-performance">
              <div class="performance-item">
                <span class="performance-label">سود کل</span>
                <span 
                  class="performance-value"
                  :class="getPerformanceClass(strategy.performance.totalProfit)"
                >
                  {{ formatNumber(strategy.performance.totalProfit) }}
                </span>
              </div>
              <div class="performance-item">
                <span class="performance-label">نرخ برد</span>
                <span class="performance-value">
                  {{ formatPercentage(strategy.performance.winRate) }}
                </span>
              </div>
              <div class="performance-item">
                <span class="performance-label">شارپ</span>
                <span class="performance-value">
                  {{ strategy.performance.sharpeRatio.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="strategy-status">
              <span 
                class="status-badge"
                :class="getStatusClass(strategy.status)"
              >
                <i :class="getStatusIcon(strategy.status)"></i>
                {{ getStatusText(strategy.status) }}
              </span>
            </div>
            <div class="footer-actions">
              <button 
                v-if="strategy.status === 'active'"
                @click="toggleStrategy(strategy)"
                class="btn btn-warning btn-sm"
              >
                <i class="icon-pause"></i>
                توقف
              </button>
              <button 
                v-else
                @click="toggleStrategy(strategy)"
                class="btn btn-success btn-sm"
              >
                <i class="icon-play"></i>
                فعال‌سازی
              </button>
              
              <button 
                @click="viewStrategy(strategy)"
               
