/**
 * Application constants and configuration
 */

/**
 * Trading constants
 */
export const TRADING_CONSTANTS = {
  // Order types
  ORDER_TYPES: {
    MARKET: 'MARKET',
    LIMIT: 'LIMIT',
    STOP: 'STOP',
    STOP_LIMIT: 'STOP_LIMIT'
  },
  
  // Order sides
  ORDER_SIDES: {
    BUY: 'BUY',
    SELL: 'SELL'
  },
  
  // Order statuses
  ORDER_STATUS: {
    OPEN: 'OPEN',
    FILLED: 'FILLED',
    CANCELLED: 'CANCELLED',
    REJECTED: 'REJECTED',
    PARTIAL: 'PARTIAL',
    PENDING: 'PENDING'
  },
  
  // Timeframes
  TIMEFRAMES: [
    '1m', '5m', '15m', '1h', '4h', '1d', '1w'
  ],
  
  // Default trading parameters
  DEFAULT_QUANTITY: 0.01,
  MIN_QUANTITY: 0.001,
  MAX_QUANTITY: 1000000,
  MIN_PRICE: 0.000001,
  MAX_PRICE: 1000000,
  
  // Risk management defaults
  DEFAULT_STOP_LOSS: 2,
  DEFAULT_TAKE_PROFIT: 5,
  DEFAULT_MAX_POSITION: 10,
  DEFAULT_MAX_DAILY_TRADES: 5
}

/**
 * Market constants
 */
export const MARKET_CONSTANTS = {
  // Supported markets
  MARKETS: {
    TSETMC: 'tsetmc',
    FARABOURS: 'farabours',
    CRYPTO: 'crypto',
    GOLD: 'gold'
  },
  
  // Market names in Persian
  MARKET_NAMES: {
    tsetmc: 'بورس تهران',
    farabours: 'فرابورس',
    crypto: 'ارز دیجیتال',
    gold: 'طلا و سکه'
  },
  
  // Market icons
  MARKET_ICONS: {
    tsetmc: '🏛️',
    farabours: '📊',
    crypto: '₿',
    gold: '🥇'
  },
  
  // Trading hours (in local time)
  TRADING_HOURS: {
    tsetmc: { open: '9:00', close: '12:30', days: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'] },
    farabours: { open: '9:00', close: '12:30', days: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'] },
    crypto: { open: '00:00', close: '23:59', days: ['همه روزه'] },
    gold: { open: '9:00', close: '17:00', days: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'] }
  }
}

/**
 * AI and strategy constants
 */
export const AI_CONSTANTS = {
  // Model types
  MODEL_TYPES: {
    TRANSFORMER: 'transformer',
    LSTM: 'lstm',
    CNN: 'cnn',
    ENSEMBLE: 'ensemble',
    RL: 'rl'
  },
  
  // Model type names
  MODEL_TYPE_NAMES: {
    transformer: 'Transformer مالی',
    lstm: 'LSTM',
    cnn: 'CNN',
    ensemble: 'Ensemble',
    rl: 'یادگیری تقویتی'
  },
  
  // Strategy types
  STRATEGY_TYPES: {
    TECHNICAL: 'technical',
    AI: 'ai',
    HYBRID: 'hybrid'
  },
  
  // Strategy type names
  STRATEGY_TYPE_NAMES: {
    technical: 'تکنیکال',
    ai: 'هوش مصنوعی',
    hybrid: 'هیبرید'
  },
  
  // Available indicators
  INDICATORS: [
    { id: 'rsi', name: 'RSI', description: 'شاخص قدرت نسبی' },
    { id: 'macd', name: 'MACD', description: 'میانگین متحرک همگرایی-واگرایی' },
    { id: 'sma', name: 'SMA', description: 'میانگین متحرک ساده' },
    { id: 'ema', name: 'EMA', description: 'میانگین متحرک نمایی' },
    { id: 'bb_upper', name: 'بولینگر بالا', description: 'باند بالایی بولینگر' },
    { id: 'bb_lower', name: 'بولینگر پایین', description: 'باند پایینی بولینگر' },
    { id: 'stoch_k', name: 'استوکستیک K', description: 'استوکستیک %K' },
    { id: 'stoch_d', name: 'استوکستیک D', description: 'استوکستیک %D' },
    { id: 'atr', name: 'ATR', description: 'محدوده واقعی متوسط' },
    { id: 'volume', name: 'حجم', description: 'حجم معاملات' }
  ],
  
  // Default AI training parameters
  DEFAULT_TRAINING_PARAMS: {
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    trainSplit: 80,
    validationSplit: 10,
    testSplit: 10
  }
}

/**
 * Risk management constants
 */
export const RISK_CONSTANTS = {
  // Risk levels
  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    VERY_HIGH: 'very_high'
  },
  
  // Risk level names
  RISK_LEVEL_NAMES: {
    low: 'کم',
    medium: 'متوسط',
    high: 'بالا',
    very_high: 'خیلی بالا'
  },
  
  // Risk level colors
  RISK_LEVEL_COLORS: {
    low: '#4caf50', // Green
    medium: '#ffa726', // Orange
    high: '#ff6b35', // Red-Orange
    very_high: '#f44336' // Red
  },
  
  // Maximum allowed values
  MAX_RISK_LIMITS: {
    STOP_LOSS: 50, // 50%
    TAKE_PROFIT: 1000, // 1000%
    MAX_POSITION: 100, // 100%
    MAX_DAILY_TRADES: 100,
    MAX_DRAWDOWN: 50 // 50%
  }
}

/**
 * Notification constants
 */
export const NOTIFICATION_CONSTANTS = {
  // Notification types
  TYPES: {
    TRADE: 'trade',
    ALERT: 'alert',
    SYSTEM: 'system',
    INFO: 'info'
  },
  
  // Notification type names
  TYPE_NAMES: {
    trade: 'معامله',
    alert: 'هشدار',
    system: 'سیستم',
    info: 'اطلاعیه'
  },
  
  // Notification type icons
  TYPE_ICONS: {
    trade: '💰',
    alert: '⚠️',
    system: '⚙️',
    info: 'ℹ️'
  },
  
  // Priority levels
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  }
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH_TOKEN: '/auth/refresh'
  },
  
  TRADING: {
    ORDERS: '/trading/orders',
    ACTIVE_ORDERS: '/trading/orders/active',
    POSITIONS: '/trading/positions',
    MARKET_DATA: '/trading/market-data',
    SYMBOLS: '/trading/symbols',
    START: '/trading/start',
    STOP: '/trading/stop'
  },
  
  STRATEGIES: {
    BASE: '/strategies',
    ACTIVE: '/strategies/active',
    BACKTEST: '/strategies/backtest',
    INDICATORS: '/strategies/indicators',
    TEMPLATES: '/strategies/templates',
    DEPLOY: '/strategies/{id}/deploy',
    STOP: '/strategies/{id}/stop'
  },
  
  PORTFOLIO: {
    BASE: '/portfolio',
    PERFORMANCE: '/portfolio/performance',
    TRANSACTIONS: '/portfolio/transactions',
    ALLOCATION: '/portfolio/allocation'
  },
  
  AI: {
    MODELS: '/ai/models',
    PREDICTIONS: '/ai/predictions',
    TRAINING_JOBS: '/ai/training-jobs',
    CONFIG: '/ai/config',
    TRAIN: '/ai/models/{id}/train',
    DEPLOY: '/ai/models/{id}/deploy',
    PREDICT: '/ai/models/{id}/predict'
  },
  
  CONFIG: {
    EXCHANGES: '/config/exchanges',
    TRADING: '/config/trading',
    RISK: '/config/risk',
    AI: '/config/ai',
    SYSTEM: '/config/system'
  },
  
  NOTIFICATIONS: {
    BASE: '/notifications',
    SETTINGS: '/notifications/settings',
    MARK_READ: '/notifications/{id}/read',
    MARK_ALL_READ: '/notifications/read-all'
  }
}

/**
 * WebSocket events
 */
export const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Market data events
  MARKET_DATA: 'market_data',
  ORDERBOOK_UPDATE: 'orderbook_update',
  TRADE_UPDATE: 'trade_update',
  
  // Trading events
  ORDER_UPDATE: 'order_update',
  POSITION_UPDATE: 'position_update',
  
  // Notification events
  NOTIFICATION: 'notification',
  
  // AI events
  AI_PREDICTION: 'ai_prediction',
  MODEL_UPDATE: 'model_update',
  
  // Subscription events
  SUBSCRIBE_ORDERBOOK: 'subscribe_orderbook',
  UNSUBSCRIBE_ORDERBOOK: 'unsubscribe_orderbook',
  SUBSCRIBE_ORDER: 'subscribe_order',
  UNSUBSCRIBE_ORDER: 'unsubscribe_order'
}

/**
 * Error codes and messages
 */
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  
  // Trading errors
  TRADING_INSUFFICIENT_FUNDS: 'TRADING_INSUFFICIENT_FUNDS',
  TRADING_INVALID_ORDER: 'TRADING_INVALID_ORDER',
  TRADING_ORDER_REJECTED: 'TRADING_ORDER_REJECTED',
  TRADING_MARKET_CLOSED: 'TRADING_MARKET_CLOSED',
  TRADING_EXCHANGE_ERROR: 'TRADING_EXCHANGE_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
  
  // System errors
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
}

/**
 * Color scheme
 */
export const COLORS = {
  // Primary colors
  PRIMARY: '#2c5aa0',
  PRIMARY_DARK: '#1e3a6b',
  PRIMARY_LIGHT: '#4a7bc8',
  
  // Secondary colors
  SECONDARY: '#00d4aa',
  SECONDARY_DARK: '#00a885',
  SECONDARY_LIGHT: '#33ffd4',
  
  // Accent colors
  ACCENT: '#ff6b35',
  ACCENT_DARK: '#cc552a',
  ACCENT_LIGHT: '#ff8c5a',
  
  // Status colors
  SUCCESS: '#4caf50',
  WARNING: '#ffa726',
  ERROR: '#f44336',
  INFO: '#2196f3',
  
  // Text colors
  TEXT_PRIMARY: '#f8fafc',
  TEXT_SECONDARY: '#cbd5e1',
  TEXT_MUTED: '#94a3b8',
  
  // Background colors
  BG_PRIMARY: '#0f172a',
  BG_SECONDARY: '#1e293b',
  BG_TERTIARY: '#334155',
  BG_CARD: '#1e293b',
  
  // Border colors
  BORDER: '#334155',
  BORDER_LIGHT: '#475569'
}

/**
 * Application settings
 */
export const APP_SETTINGS = {
  // App info
  NAME: 'پلتفرم معاملاتی رضایی',
  VERSION: '1.0.0',
  DESCRIPTION: 'پلتفرم پیشرفته معاملات الگوریتمی برای بازارهای ایران',
  
  // Features
  FEATURES: {
    AI_TRADING: true,
    MULTI_EXCHANGE: true,
    BACKTESTING: true,
    RISK_MANAGEMENT: true,
    REAL_TIME_DATA: true,
    MOBILE_APP: true
  },
  
  // Limits
  LIMITS: {
    MAX_STRATEGIES: 50,
    MAX_AI_MODELS: 20,
    MAX_ACTIVE_TRADES: 100,
    MAX_HISTORY_DAYS: 365,
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024 // 10MB
  },
  
  // Default settings
  DEFAULTS: {
    THEME: 'dark',
    LANGUAGE: 'fa',
    TIMEZONE: 'Asia/Tehran',
    CURRENCY: 'IRR',
    DECIMAL_PLACES: 2
  }
}

export default {
  TRADING_CONSTANTS,
  MARKET_CONSTANTS,
  AI_CONSTANTS,
  RISK_CONSTANTS,
  NOTIFICATION_CONSTANTS,
  API_ENDPOINTS,
  WEBSOCKET_EVENTS,
  ERROR_CODES,
  COLORS,
  APP_SETTINGS
}
