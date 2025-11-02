/**
 * Utility functions for formatting data in the trading platform
 */

/**
 * Format currency values
 */
export const formatCurrency = (value, currency = 'IRR', locale = 'fa-IR') => {
  if (value === null || value === undefined) return '—'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

/**
 * Format percentage values
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '—'
  
  const formatted = new Intl.NumberFormat('fa-IR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100)
  
  return formatted
}

/**
 * Format large numbers with abbreviations
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '—'
  
  const absValue = Math.abs(value)
  
  if (absValue >= 1e12) {
    return (value / 1e12).toFixed(decimals) + 'T'
  } else if (absValue >= 1e9) {
    return (value / 1e9).toFixed(decimals) + 'B'
  } else if (absValue >= 1e6) {
    return (value / 1e6).toFixed(decimals) + 'M'
  } else if (absValue >= 1e3) {
    return (value / 1e3).toFixed(decimals) + 'K'
  } else {
    return new Intl.NumberFormat('fa-IR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }
}

/**
 * Format date and time
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—'
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }
  
  return new Date(date).toLocaleDateString('fa-IR', { ...defaultOptions, ...options })
}

export const formatTime = (date, options = {}) => {
  if (!date) return '—'
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
  
  return new Date(date).toLocaleTimeString('fa-IR', { ...defaultOptions, ...options })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return `${formatDate(date)} - ${formatTime(date)}`
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—'
  
  const now = new Date()
  const diffMs = now - new Date(date)
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSecs < 60) {
    return 'همین الان'
  } else if (diffMins < 60) {
    return `${diffMins} دقیقه قبل`
  } else if (diffHours < 24) {
    return `${diffHours} ساعت قبل`
  } else if (diffDays < 7) {
    return `${diffDays} روز قبل`
  } else {
    return formatDate(date)
  }
}

/**
 * Format order status
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    'OPEN': 'باز',
    'FILLED': 'تکمیل شده',
    'CANCELLED': 'لغو شده',
    'REJECTED': 'رد شده',
    'PARTIAL': 'جزئی',
    'PENDING': 'در انتظار'
  }
  
  return statusMap[status] || status
}

/**
 * Format order type
 */
export const formatOrderType = (type) => {
  const typeMap = {
    'MARKET': 'بازار',
    'LIMIT': 'محدود',
    'STOP': 'استاپ',
    'STOP_LIMIT': 'استاپ محدود'
  }
  
  return typeMap[type] || type
}

/**
 * Format trade side
 */
export const formatTradeSide = (side) => {
  return side === 'BUY' ? 'خرید' : 'فروش'
}

/**
 * Format market name
 */
export const formatMarket = (market) => {
  const marketMap = {
    'tsetmc': 'بورس تهران',
    'farabours': 'فرابورس',
    'crypto': 'ارز دیجیتال',
    'gold': 'طلا و سکه'
  }
  
  return marketMap[market] || market
}

/**
 * Format AI model type
 */
export const formatModelType = (type) => {
  const typeMap = {
    'transformer': 'Transformer مالی',
    'lstm': 'LSTM',
    'cnn': 'CNN',
    'ensemble': 'Ensemble',
    'rl': 'یادگیری تقویتی'
  }
  
  return typeMap[type] || type
}

/**
 * Format strategy type
 */
export const formatStrategyType = (type) => {
  const typeMap = {
    'technical': 'تکنیکال',
    'ai': 'هوش مصنوعی',
    'hybrid': 'هیبرید'
  }
  
  return typeMap[type] || type
}

/**
 * Format indicator name
 */
export const formatIndicator = (indicator) => {
  const indicatorMap = {
    'rsi': 'RSI',
    'macd': 'MACD',
    'sma': 'SMA',
    'ema': 'EMA',
    'bb_upper': 'بولینگر بالا',
    'bb_lower': 'بولینگر پایین',
    'stoch_k': 'استوکستیک K',
    'stoch_d': 'استوکستیک D',
    'atr': 'ATR'
  }
  
  return indicatorMap[indicator] || indicator
}

/**
 * Calculate and format profit/loss with color class
 */
export const formatProfitLoss = (value, includeSymbol = true) => {
  if (value === null || value === undefined) return { text: '—', class: '' }
  
  const symbol = includeSymbol ? (value >= 0 ? '+' : '') : ''
  const text = `${symbol}${formatCurrency(Math.abs(value))}`
  const className = value >= 0 ? 'positive' : value < 0 ? 'negative' : ''
  
  return { text, class: className }
}

/**
 * Format volume with appropriate units
 */
export const formatVolume = (volume) => {
  if (volume === null || volume === undefined) return '—'
  
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + 'B'
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + 'M'
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + 'K'
  } else {
    return volume.toFixed(2)
  }
}

/**
 * Format price with appropriate precision
 */
export const formatPrice = (price, symbol = '') => {
  if (price === null || price === undefined) return '—'
  
  // Determine precision based on price value
  let precision = 2
  if (price < 0.01) precision = 6
  else if (price < 1) precision = 4
  else if (price < 100) precision = 3
  else if (price < 1000) precision = 2
  else precision = 0
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(price)
  
  return symbol ? `${formatted} ${symbol}` : formatted
}

/**
 * Format change percentage with color class
 */
export const formatChangePercent = (change) => {
  if (change === null || change === undefined) return { text: '—', class: '' }
  
  const symbol = change >= 0 ? '+' : ''
  const text = `${symbol}${change.toFixed(2)}%`
  const className = change >= 0 ? 'positive' : 'negative'
  
  return { text, class: className }
}

/**
 * Format risk level
 */
export const formatRiskLevel = (level) => {
  const levelMap = {
    'low': 'کم',
    'medium': 'متوسط',
    'high': 'بالا',
    'very_high': 'خیلی بالا'
  }
  
  return levelMap[level] || level
}

/**
 * Format notification type
 */
export const formatNotificationType = (type) => {
  const typeMap = {
    'trade': 'معامله',
    'alert': 'هشدار',
    'system': 'سیستم',
    'info': 'اطلاعیه'
  }
  
  return typeMap[type] || type
}

export default {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatOrderStatus,
  formatOrderType,
  formatTradeSide,
  formatMarket,
  formatModelType,
  formatStrategyType,
  formatIndicator,
  formatProfitLoss,
  formatVolume,
  formatPrice,
  formatChangePercent,
  formatRiskLevel,
  formatNotificationType
}
