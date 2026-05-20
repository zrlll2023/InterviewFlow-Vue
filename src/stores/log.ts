import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { onLog, type LogEntry, type LogLevel } from '@/utils/logger'

export const useLogStore = defineStore('log', () => {
  const logs = ref<LogEntry[]>([])
  const filterLevel = ref<LogLevel | 'all'>('all')
  const searchQuery = ref('')

  const MAX_LOGS = 500

  const filteredLogs = computed(() => {
    let result = logs.value
    if (filterLevel.value !== 'all') {
      result = result.filter(l => l.level === filterLevel.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(l =>
        l.message.toLowerCase().includes(q) ||
        (l.source && l.source.toLowerCase().includes(q))
      )
    }
    return result
  })

  const errorCount = computed(() => logs.value.filter(l => l.level === 'error').length)
  const warnCount = computed(() => logs.value.filter(l => l.level === 'warn').length)
  const infoCount = computed(() => logs.value.filter(l => l.level === 'info').length)

  function addLog(entry: LogEntry) {
    logs.value.unshift(entry)
    if (logs.value.length > MAX_LOGS) {
      logs.value = logs.value.slice(0, MAX_LOGS)
    }
  }

  function clearLogs() {
    logs.value = []
  }

  onLog(addLog)

  return {
    logs,
    filterLevel,
    searchQuery,
    filteredLogs,
    errorCount,
    warnCount,
    infoCount,
    addLog,
    clearLogs
  }
})
