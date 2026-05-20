<template>
  <div class="log-page">
    <div class="page-header">
      <div class="header-left">
        <el-input
          v-model="logStore.searchQuery"
          placeholder="搜索日志内容..."
          prefix-icon="Search"
          clearable
          style="width: 300px"
        />
        <el-radio-group v-model="logStore.filterLevel" size="default">
          <el-radio-button value="all">
            全部 ({{ logStore.logs.length }})
          </el-radio-button>
          <el-radio-button value="error">
            错误 ({{ logStore.errorCount }})
          </el-radio-button>
          <el-radio-button value="warn">
            警告 ({{ logStore.warnCount }})
          </el-radio-button>
          <el-radio-button value="info">
            信息 ({{ logStore.infoCount }})
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="header-right">
        <el-button @click="exportLogs">
          <el-icon><Download /></el-icon>
          导出日志
        </el-button>
        <el-button type="danger" plain @click="confirmClear">
          <el-icon><Delete /></el-icon>
          清空日志
        </el-button>
      </div>
    </div>

    <div v-if="logStore.filteredLogs.length === 0" class="empty-state">
      <el-empty description="暂无日志记录">
        <p class="empty-tip">前端错误和警告会自动记录到这里</p>
      </el-empty>
    </div>

    <div v-else class="log-list">
      <div
        v-for="entry in logStore.filteredLogs"
        :key="entry.id"
        :class="['log-entry', `level-${entry.level}`]"
        @click="toggleExpand(entry.id)"
      >
        <div class="entry-header">
          <span :class="['level-badge', entry.level]">
            {{ levelLabel(entry.level) }}
          </span>
          <span class="entry-time">{{ formatTime(entry.timestamp) }}</span>
          <span v-if="entry.source" class="entry-source">{{ entry.source }}</span>
          <span class="entry-message">{{ entry.message }}</span>
          <el-icon v-if="entry.stack" class="expand-icon">
            <component :is="expandedIds.has(entry.id) ? ArrowUp : ArrowDown" />
          </el-icon>
        </div>
        <div v-if="entry.stack && expandedIds.has(entry.id)" class="entry-stack">
          <pre>{{ entry.stack }}</pre>
        </div>
        <div v-if="entry.meta && expandedIds.has(entry.id)" class="entry-meta">
          <pre>{{ JSON.stringify(entry.meta, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useLogStore } from '@/stores/log'
import type { LogLevel } from '@/utils/logger'

const logStore = useLogStore()
const expandedIds = ref(new Set<string>())

function levelLabel(level: LogLevel): string {
  switch (level) {
    case 'error': return 'ERROR'
    case 'warn': return 'WARN'
    case 'info': return 'INFO'
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

async function confirmClear() {
  try {
    await ElMessageBox.confirm('确定要清空所有日志吗？此操作不可恢复。', '确认清空', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
    logStore.clearLogs()
    ElMessage.success('日志已清空')
  } catch {
    // cancelled
  }
}

function exportLogs() {
  const data = logStore.filteredLogs.map(e => ({
    time: formatTime(e.timestamp),
    level: e.level,
    source: e.source || '',
    message: e.message,
    stack: e.stack || '',
    meta: e.meta || {}
  }))
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `interviewflow-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('日志已导出')
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
}

.empty-tip {
  font-size: 13px;
  color: #94A3B8;
  margin-top: 8px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #1E293B;
  border-radius: 12px;
  padding: 8px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.log-entry {
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.log-entry:hover {
  background: rgba(255, 255, 255, 0.05);
}

.log-entry.level-error {
  border-left: 3px solid #EF4444;
}

.log-entry.level-warn {
  border-left: 3px solid #F59E0B;
}

.log-entry.level-info {
  border-left: 3px solid #3B82F6;
}

.entry-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #CBD5E1;
}

.level-badge {
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.level-badge.error {
  background: rgba(239, 68, 68, 0.2);
  color: #FCA5A5;
}

.level-badge.warn {
  background: rgba(245, 158, 11, 0.2);
  color: #FCD34D;
}

.level-badge.info {
  background: rgba(59, 130, 246, 0.2);
  color: #93C5FD;
}

.entry-time {
  color: #64748B;
  font-size: 12px;
  flex-shrink: 0;
}

.entry-source {
  color: #94A3B8;
  font-size: 12px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.entry-message {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #E2E8F0;
}

.expand-icon {
  color: #64748B;
  flex-shrink: 0;
}

.entry-stack,
.entry-meta {
  margin-top: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow-x: auto;
}

.entry-stack pre,
.entry-meta pre {
  font-size: 12px;
  color: #94A3B8;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  line-height: 1.5;
}
</style>
