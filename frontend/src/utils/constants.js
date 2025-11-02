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
    { id: 'bb_
