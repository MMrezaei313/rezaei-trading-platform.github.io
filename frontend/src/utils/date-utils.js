/**
 * Date and time utilities for the trading platform
 */

import moment from 'moment'
import 'moment-jalaali'

/**
 * Convert Gregorian date to Jalali (Persian) date
 */
export const toJalali = (date, format = 'jYYYY/jMM/jDD') => {
  if (!date) return '—'
  return moment(date).format(format)
}

/**
 * Convert Jalali date to Gregorian date
 */
export const fromJalali = (jalaliDate, format = 'jYYYY/jMM/jDD') => {
  if (!jalaliDate) return null
  return moment(jalaliDate, format).toDate()
}

/**
 * Get current Jalali date
 */
export const currentJalali = (format = 'jYYYY/jMM/jDD') => {
  return moment().format(format)
}

/**
 * Format date for display based on user locale
 */
export const formatDateForDisplay = (date, locale = 'fa-IR') => {
  if (!date) return '—'
  
  if (locale === 'fa-IR') {
    return toJalali(date, 'jYYYY/jMM/jDD')
  } else {
    return new Date(date).toLocaleDateString('en-US')
  }
}

/**
 * Format time for display
 */
export const formatTimeForDisplay = (date, showSeconds = false) => {
  if (!date) return '—'
  
  const options = {
    hour: '2-digit',
    minute: '2-digit'
  }
  
  if (showSeconds) {
    options.second = '2-digit'
  }
  
  return new Date(date).toLocaleTimeString('fa-IR', options)
}

/**
 * Calculate time difference between two dates
 */
export const getTimeDifference = (startDate, endDate = new Date()) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  
  return {
    milliseconds: diffMs,
    seconds: Math.floor(diffMs / 1000),
    minutes: Math.floor(diffMs / (1000 * 60)),
    hours: Math.floor(diffMs / (1000 * 60 * 60)),
    days: Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }
}

/**
 * Check if a date is today
 */
export const isToday = (date) => {
  if (!date) return false
  
  const today = new Date()
  const checkDate = new Date(date)
  
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is in the current week
 */
export const isThisWeek = (date) => {
  if (!date) return false
  
  const today = new Date()
  const checkDate = new Date(date)
  
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek
}

/**
 * Check if a date is in the current month
 */
export const isThisMonth = (date) => {
  if (!date) return false
  
  const today = new Date()
  const checkDate = new Date(date)
  
  return (
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Get start and end of day
 */
export const getDayRange = (date = new Date()) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Get start and end of week
 */
export const getWeekRange = (date = new Date()) => {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Get start and end of month
 */
export const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Add time to a date
 */
export const addTime = (date, amount, unit = 'days') => {
  const newDate = new Date(date)
  
  switch (unit) {
    case 'milliseconds':
      newDate.setMilliseconds(newDate.getMilliseconds() + amount)
      break
    case 'seconds':
      newDate.setSeconds(newDate.getSeconds() + amount)
      break
    case 'minutes':
      newDate.setMinutes(newDate.getMinutes() + amount)
      break
    case 'hours':
      newDate.setHours(newDate.getHours() + amount)
      break
    case 'days':
      newDate.setDate(newDate.getDate() + amount)
      break
    case 'weeks':
      newDate.setDate(newDate.getDate() + (amount * 7))
      break
    case 'months':
      newDate.setMonth(newDate.getMonth() + amount)
      break
    case 'years':
      newDate.setFullYear(newDate.getFullYear() + amount)
      break
  }
  
  return newDate
}

/**
 * Subtract time from a date
 */
export const subtractTime = (date, amount, unit = 'days') => {
  return addTime(date, -amount, unit)
}

/**
 * Get readable time ago string
 */
export const getTimeAgo = (date) => {
  if (!date) return '—'
  
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSecs < 60) {
    return 'همین الان'
  } else if (diffMins < 60) {
    return `${diffMins} دقیقه قبل`
  } else if (diffHours < 24) {
    return `${diffHours} ساعت قبل`
  } else if (diffDays < 7) {
    return `${diffDays} روز قبل`
  } else if (diffWeeks < 4) {
    return `${diffWeeks} هفته قبل`
  } else if (diffMonths < 12) {
    return `${diffMonths} ماه قبل`
  } else {
    return `${diffYears} سال قبل`
  }
}

/**
 * Format duration in milliseconds to readable string
 */
export const formatDuration = (ms) => {
  if (ms < 1000) {
    return `${ms} میلی‌ثانیه`
  }
  
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} روز و ${hours % 24} ساعت`
  } else if (hours > 0) {
    return `${hours} ساعت و ${minutes % 60} دقیقه`
  } else if (minutes > 0) {
    return `${minutes} دقیقه و ${seconds % 60} ثانیه`
  } else {
    return `${seconds} ثانیه`
  }
}

/**
 * Check if market is open based on exchange schedule
 */
export const isMarketOpen = (exchange, date = new Date()) => {
  const currentTime = new Date(date)
  const currentHour = currentTime.getHours()
  const currentDay = currentTime.getDay() // 0 = Sunday, 6 = Saturday
  
  const marketHours = {
    tsetmc: {
      open: 9, // 9:00 AM
      close: 12.5, // 12:30 PM
      days: [0, 1, 2, 3, 4] // Sunday to Thursday
    },
    farabours: {
      open: 9,
      close: 12.5,
      days: [0, 1, 2, 3, 4]
    },
    crypto: {
      open: 0,
      close: 24,
      days: [0, 1, 2, 3, 4, 5, 6] // 24/7
    },
    gold: {
      open: 9,
      close: 17,
      days: [0, 1, 2, 3, 4, 5] // Sunday to Friday
    }
  }
  
  const schedule = marketHours[exchange]
  if (!schedule) return true // Default to open if no schedule found
  
  const isWithinHours = currentHour >= schedule.open && currentHour < schedule.close
  const isWithinDays = schedule.days.includes(currentDay)
  
  return isWithinHours && isWithinDays
}

/**
 * Get next market open time
 */
export const getNextMarketOpen = (exchange, date = new Date()) => {
  const currentTime = new Date(date)
  const schedule = marketHours[exchange]
  
  if (!schedule) return currentTime
  
  let nextOpen = new Date(currentTime)
  
  // If market is closed today, find next open day
  if (!schedule.days.includes(currentTime.getDay())) {
    let daysToAdd = 1
    while (!schedule.days.includes((currentTime.getDay() + daysToAdd) % 7)) {
      daysToAdd++
    }
    nextOpen.setDate(currentTime.getDate() + daysToAdd)
  }
  
  nextOpen.setHours(schedule.open, 0, 0, 0)
  
  return nextOpen
}

/**
 * Convert timeframe to milliseconds
 */
export const timeframeToMs = (timeframe) => {
  const timeframeMap = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000
  }
  
  return timeframeMap[timeframe] || 0
}

/**
 * Get candle time for a specific timeframe
 */
export const getCandleTime = (timestamp, timeframe) => {
  const timeMs = new Date(timestamp).getTime()
  const intervalMs = timeframeToMs(timeframe)
  
  // Align to candle start time
  return new Date(Math.floor(timeMs / intervalMs) * intervalMs)
}

export default {
  toJalali,
  fromJalali,
  currentJalali,
  formatDateForDisplay,
  formatTimeForDisplay,
  getTimeDifference,
  isToday,
  isThisWeek,
  isThisMonth,
  getDayRange,
  getWeekRange,
  getMonthRange,
  addTime,
  subtractTime,
  getTimeAgo,
  formatDuration,
  isMarketOpen,
  getNextMarketOpen,
  timeframeToMs,
  getCandleTime
}
