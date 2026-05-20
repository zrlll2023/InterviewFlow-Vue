export type LogLevel = 'error' | 'warn' | 'info'

export interface LogEntry {
  id: string
  level: LogLevel
  message: string
  stack?: string
  source?: string
  timestamp: number
  meta?: Record<string, unknown>
}

let logIdCounter = 0

function generateId(): string {
  return `log_${Date.now()}_${++logIdCounter}`
}

const listeners: Array<(entry: LogEntry) => void> = []

function emit(entry: LogEntry) {
  listeners.forEach(fn => fn(entry))
}

export function onLog(fn: (entry: LogEntry) => void) {
  listeners.push(fn)
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx > -1) listeners.splice(idx, 1)
  }
}

export function logError(message: string, stack?: string, source?: string, meta?: Record<string, unknown>) {
  emit({
    id: generateId(),
    level: 'error',
    message,
    stack,
    source,
    timestamp: Date.now(),
    meta
  })
}

export function logWarn(message: string, source?: string, meta?: Record<string, unknown>) {
  emit({
    id: generateId(),
    level: 'warn',
    message,
    source,
    timestamp: Date.now(),
    meta
  })
}

export function logInfo(message: string, source?: string, meta?: Record<string, unknown>) {
  emit({
    id: generateId(),
    level: 'info',
    message,
    source,
    timestamp: Date.now(),
    meta
  })
}

export function captureWindowErrors() {
  const origConsoleError = console.error
  console.error = (...args: unknown[]) => {
    origConsoleError.apply(console, args)
    const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
    logError(msg, undefined, 'console.error')
  }

  window.addEventListener('error', (event: ErrorEvent) => {
    logError(
      event.message,
      event.error?.stack,
      `${event.filename}:${event.lineno}:${event.colno}`
    )
  })

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason
    const message = reason instanceof Error ? reason.message : String(reason)
    const stack = reason instanceof Error ? reason.stack : undefined
    logError(`Unhandled Promise Rejection: ${message}`, stack, 'unhandledrejection')
  })
}
