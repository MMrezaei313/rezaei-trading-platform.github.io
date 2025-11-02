/**
 * Validation utilities for the trading platform
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  }
}

/**
 * Validate trading symbol format
 */
export const validateSymbol = (symbol) => {
  const symbolRegex = /^[A-Z0-9]+-[A-Z0-9]+$/
  return symbolRegex.test(symbol)
}

/**
 * Validate order quantity
 */
export const validateQuantity = (quantity, minQuantity = 0.001, maxQuantity = 1000000) => {
  if (isNaN(quantity) || quantity === null || quantity === undefined) {
    return { isValid: false, message: 'مقدار باید عددی باشد' }
  }

  if (quantity <= 0) {
    return { isValid: false, message: 'مقدار باید بزرگتر از صفر باشد' }
  }

  if (quantity < minQuantity) {
    return { isValid: false, message: `حداقل مقدار ${minQuantity} است` }
  }

  if (quantity > maxQuantity) {
    return { isValid: false, message: `حداکثر مقدار ${maxQuantity} است` }
  }

  return { isValid: true, message: '' }
}

/**
 * Validate order price
 */
export const validatePrice = (price, minPrice = 0.000001, maxPrice = 1000000) => {
  if (isNaN(price) || price === null || price === undefined) {
    return { isValid: false, message: 'قیمت باید عددی باشد' }
  }

  if (price <= 0) {
    return { isValid: false, message: 'قیمت باید بزرگتر از صفر باشد' }
  }

  if (price < minPrice) {
    return { isValid: false, message: `حداقل قیمت ${minPrice} است` }
  }

  if (price > maxPrice) {
    return { isValid: false, message: `حداکثر قیمت ${maxPrice} است` }
  }

  return { isValid: true, message: '' }
}

/**
 * Validate stop loss percentage
 */
export const validateStopLoss = (stopLoss) => {
  if (isNaN(stopLoss) || stopLoss === null || stopLoss === undefined) {
    return { isValid: false, message: 'حد ضرر باید عددی باشد' }
  }

  if (stopLoss < 0 || stopLoss > 100) {
    return { isValid: false, message: 'حد ضرر باید بین 0 تا 100 درصد باشد' }
  }

  return { isValid: true, message: '' }
}

/**
 * Validate take profit percentage
 */
export const validateTakeProfit = (takeProfit) => {
  if (isNaN(takeProfit) || takeProfit === null || takeProfit === undefined) {
    return { isValid: false, message: 'حد سود باید عددی باشد' }
  }

  if (takeProfit < 0 || takeProfit > 1000) {
    return { isValid: false, message: 'حد سود باید بین 0 تا 1000 درصد باشد' }
  }

  return { isValid: true, message: '' }
}

/**
 * Validate strategy name
 */
export const validateStrategyName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'نام استراتژی الزامی است' }
  }

  if (name.length < 3) {
    return { isValid: false, message: 'نام استراتژی باید حداقل 3 کاراکتر باشد' }
  }

  if (name.length > 50) {
    return { isValid: false, message: 'نام استراتژی نمی‌تواند بیشتر از 50 کاراکتر باشد' }
  }

  return { isValid: true, message: '' }
}

/**
 * Validate AI model configuration
 */
export const validateModelConfig = (config) => {
  const errors = {}

  if (!config.name || config.name.trim().length === 0) {
    errors.name = 'نام مدل الزامی است'
  }

  if (!config.symbols || config.symbols.length === 0) {
    errors.symbols = 'حداقل یک نماد باید انتخاب شود'
  }

  if (!config.epochs || config.epochs < 1 || config.epochs > 1000) {
    errors.epochs = 'تعداد دوره‌ها باید بین 1 تا 1000 باشد'
  }

  if (!config.batchSize || config.batchSize < 1 || config.batchSize > 1024) {
    errors.batchSize = 'اندازه دسته باید بین 1 تا 1024 باشد'
  }

  if (!config.learningRate || config.learningRate < 0.0001 || config.learningRate > 0.1) {
    errors.learningRate = 'نرخ یادگیری باید بین 0.0001 تا 0.1 باشد'
  }

  if (!config.trainSplit || config.trainSplit < 50 || config.trainSplit > 90) {
    errors.trainSplit = 'درصد داده‌های آموزشی باید بین 50 تا 90 باشد'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate risk management parameters
 */
export const validateRiskParameters = (params) => {
  const errors = {}

  if (params.maxPosition && (params.maxPosition < 1 || params.maxPosition > 100)) {
    errors.maxPosition = 'حداکثر موقعیت باید بین 1 تا 100 درصد باشد'
  }

  if (params.maxDailyTrades && (params.maxDailyTrades < 1 || params.maxDailyTrades > 100)) {
    errors.maxDailyTrades = 'حداکثر معاملات روزانه باید بین 1 تا 100 باشد'
  }

  if (params.maxDrawdown && (params.maxDrawdown < 1 || params.maxDrawdown > 50)) {
    errors.maxDrawdown = 'حداکثر drawdown باید بین 1 تا 50 درصد باشد'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate timeframe
 */
export const validateTimeframe = (timeframe) => {
  const validTimeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']
  return validTimeframes.includes(timeframe)
}

/**
 * Validate order conditions
 */
export const validateOrderConditions = (conditions) => {
  if (!conditions || conditions.length === 0) {
    return { isValid: false, message: 'حداقل یک شرط باید تعریف شود' }
  }

  for (const condition of conditions) {
    if (!condition.indicator) {
      return { isValid: false, message: 'همه شرایط باید اندیکاتور داشته باشند' }
    }

    if (condition.value === undefined || condition.value === null || condition.value === '') {
      return { isValid: false, message: 'همه شرایط باید مقدار داشته باشند' }
    }
  }

  return { isValid: true, message: '' }
}

/**
 * Validate API key format
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey || apiKey.trim().length === 0) {
    return { isValid: false, message: 'کلید API الزامی است' }
  }

  if (apiKey.length < 20) {
    return { isValid: false, message: 'کلید API معتبر نیست' }
  }

  return { isValid: true, message: '' }
}

/**
 * Validate exchange configuration
 */
export const validateExchangeConfig = (config) => {
  const errors = {}

  if (!config.apiKey) {
    errors.apiKey = 'کلید API الزامی است'
  }

  if (!config.secretKey) {
    errors.secretKey = 'Secret Key الزامی است'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Generic number validation
 */
export const validateNumber = (value, min = -Infinity, max = Infinity, fieldName = 'مقدار') => {
  if (isNaN(value) || value === null || value === undefined) {
    return { isValid: false, message: `${fieldName} باید عددی باشد` }
  }

  if (value < min) {
    return { isValid: false, message: `${fieldName} نمی‌تواند کمتر از ${min} باشد` }
  }

  if (value > max) {
    return { isValid: false, message: `${fieldName} نمی‌تواند بیشتر از ${max} باشد` }
  }

  return { isValid: true, message: '' }
}

export default {
  validateEmail,
  validatePassword,
  validateSymbol,
  validateQuantity,
  validatePrice,
  validateStopLoss,
  validateTakeProfit,
  validateStrategyName,
  validateModelConfig,
  validateRiskParameters,
  validateTimeframe,
  validateOrderConditions,
  validateApiKey,
  validateExchangeConfig,
  validateNumber
}
