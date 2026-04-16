/**
 * Logger utility for development debugging
 * Set LOG_LEVEL env var to control output:
 * - 'debug': all logs
 * - 'warn': warnings and errors only
 * - 'error': errors only
 * - 'none': no logs (production)
 */

type LogLevel = 'debug' | 'warn' | 'error' | 'none'

const LOG_LEVEL: LogLevel = (process.env.NODE_ENV === 'production' ? 'error' : 'debug') as LogLevel

const shouldLog = (level: LogLevel): boolean => {
  const levels: Record<LogLevel, number> = {
    debug: 0,
    warn: 1,
    error: 2,
    none: 3
  }
  return levels[level] >= levels[LOG_LEVEL]
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log('[DEBUG]', ...args)
    }
  },
  
  info: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.info('[INFO]', ...args)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  },
  
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', ...args)
    }
  },
  
  group: (label: string) => {
    if (shouldLog('debug')) {
      console.group(label)
    }
  },
  
  groupEnd: () => {
    if (shouldLog('debug')) {
      console.groupEnd()
    }
  },
  
  time: (label: string) => {
    if (shouldLog('debug')) {
      console.time(label)
    }
  },
  
  timeEnd: (label: string) => {
    if (shouldLog('debug')) {
      console.timeEnd(label)
    }
  }
}

export default logger