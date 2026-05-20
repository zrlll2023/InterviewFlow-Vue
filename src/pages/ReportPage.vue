<template>
  <div class="report-page">
    <div class="page-header">
      <el-input
        v-model="searchQuery"
        placeholder="搜索面试记录..."
        prefix-icon="Search"
        clearable
        style="width: 300px"
      />
    </div>

    <div v-if="filteredReports.length === 0" class="empty-state">
      <el-empty description="还没有面试记录，开始一场模拟面试吧">
        <el-button type="primary" @click="$router.push('/interview')">去面试</el-button>
      </el-empty>
    </div>

    <div v-else class="report-list">
      <div
        v-for="report in filteredReports"
        :key="report.sessionId"
        class="report-card"
        @click="viewDetail(report.sessionId)"
      >
        <div class="card-header">
          <div class="title">
            <el-icon color="#2563EB"><Aim /></el-icon>
            <span>{{ report.targetPosition }}</span>
            <el-tag :type="difficultyType(report.difficulty)" size="small">
              {{ difficultyLabel(report.difficulty) }}
            </el-tag>
          </div>
        </div>

        <div class="score-bar">
          <div class="score-label">综合得分: {{ report.scoreTotal }}分</div>
          <el-progress
            :percentage="report.scoreTotal"
            :color="scoreColor(report.scoreTotal)"
            :stroke-width="8"
            :show-text="false"
          />
        </div>

        <div class="card-footer">
          <span class="meta">
            面试日期: {{ formatDate(report.createdAt) }} · 答题数量: {{ report.questionCount }} 题
          </span>
          <el-button type="primary" text>
            查看详情
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Aim, ArrowRight } from '@element-plus/icons-vue'
import request from '@/utils/request'
import type { ReportSummaryVO } from '@/types/api'

const router = useRouter()
const reports = ref<ReportSummaryVO[]>([])
const searchQuery = ref('')

const filteredReports = computed(() => {
  if (!searchQuery.value) return reports.value
  const q = searchQuery.value.toLowerCase()
  return reports.value.filter(r =>
    r.targetPosition.toLowerCase().includes(q)
  )
})

function difficultyType(difficulty: string) {
  switch (difficulty) {
    case 'SMALL': return 'info'
    case 'MEDIUM': return 'primary'
    case 'LARGE': return 'warning'
    default: return ''
  }
}

function difficultyLabel(difficulty: string) {
  switch (difficulty) {
    case 'SMALL': return '小厂'
    case 'MEDIUM': return '中厂'
    case 'LARGE': return '大厂'
    default: return difficulty
  }
}

function scoreColor(score: number) {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN')
}

function viewDetail(sessionId: number) {
  router.push(`/reports/${sessionId}`)
}

async function loadReports() {
  const res = await request.get('/interviews/reports')
  reports.value = res || []
}

onMounted(loadReports)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header .title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 16px;
}

.score-bar {
  margin-bottom: 16px;
}

.score-label {
  font-size: 14px;
  color: #475569;
  margin-bottom: 8px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta {
  font-size: 13px;
  color: #94A3B8;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
</style>
