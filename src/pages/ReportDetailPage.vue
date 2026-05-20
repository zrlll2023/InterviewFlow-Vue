<template>
  <div class="report-detail-page">
    <div class="page-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <div v-if="report" class="report-content">
      <!-- 总评分卡片 -->
      <div class="score-overview">
        <div class="main-score">
          <div class="score-label">综合得分</div>
          <div class="score-value" :style="{ color: scoreColor(report.scoreTotal) }">
            {{ report.scoreTotal }}
          </div>
          <div class="score-unit">分</div>
        </div>
        <div class="sub-scores">
          <div class="sub-score">
            <div class="sub-label">技术专业度</div>
            <div class="sub-value">{{ report.scoreTechnical }}</div>
          </div>
          <div class="sub-score">
            <div class="sub-label">逻辑表达</div>
            <div class="sub-value">{{ report.scoreLogic }}</div>
          </div>
        </div>
        <div class="score-badge" :style="{ background: scoreColor(report.scoreTotal) + '20', color: scoreColor(report.scoreTotal) }">
          {{ scoreLabel(report.scoreTotal) }}
        </div>
      </div>

      <!-- 逐题复盘 -->
      <div class="feedback-section">
        <h3>面试问答逐题复盘</h3>
        <div class="feedback-list">
          <div
            v-for="item in report.detailedFeedback"
            :key="item.round"
            class="feedback-item"
          >
            <div class="round-header">第 {{ item.round }} 题</div>
            <div class="question">
              <el-icon color="#2563EB"><QuestionFilled /></el-icon>
              <span>{{ item.question }}</span>
            </div>
            <div class="answer">
              <div class="answer-label">你的回答:</div>
              <div class="answer-content">{{ item.userAnswer }}</div>
            </div>
            <div class="critique">
              <div class="critique-label">
                <el-icon color="#10B981"><CircleCheckFilled /></el-icon>
                评估点评:
              </div>
              <div class="critique-content">{{ item.critique }}</div>
            </div>
            <div class="recommendation">
              <div class="rec-label">
                <el-icon color="#F59E0B"><InfoFilled /></el-icon>
                推荐回答:
              </div>
              <div class="rec-content">{{ item.recommendedAnswer }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优势与不足 -->
      <div class="summary-section">
        <div class="summary-card advantage">
          <h4><el-icon color="#10B981"><Trophy /></el-icon> 核心优势</h4>
          <p>{{ report.advantage }}</p>
        </div>
        <div class="summary-card disadvantage">
          <h4><el-icon color="#EF4444"><WarningFilled /></el-icon> 核心盲点与不足</h4>
          <p>{{ report.disadvantage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft, QuestionFilled, CircleCheckFilled, InfoFilled, Trophy, WarningFilled
} from '@element-plus/icons-vue'
import request from '@/utils/request'
import type { InterviewReport } from '@/types/models'

const route = useRoute()
const report = ref<InterviewReport | null>(null)

function scoreColor(score: number) {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function scoreLabel(score: number) {
  if (score >= 80) return '优秀表现'
  if (score >= 60) return '良好'
  return '需加强'
}

async function loadReport() {
  const sessionId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  if (!sessionId) return
  const res = await request.get(`/interviews/report/${sessionId}`)
  report.value = res
}

onMounted(loadReport)
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.score-overview {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 48px;
  margin-bottom: 24px;
}

.main-score {
  text-align: center;
}

.score-label {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 4px;
}

.score-value {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
}

.score-unit {
  font-size: 14px;
  color: #64748B;
}

.sub-scores {
  display: flex;
  gap: 32px;
  flex: 1;
}

.sub-score {
  text-align: center;
}

.sub-label {
  font-size: 13px;
  color: #64748B;
  margin-bottom: 4px;
}

.sub-value {
  font-size: 28px;
  font-weight: 600;
  color: #1E293B;
}

.score-badge {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.feedback-section {
  margin-bottom: 24px;
}

.feedback-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 16px;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-item {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.round-header {
  font-size: 14px;
  font-weight: 600;
  color: #2563EB;
  margin-bottom: 12px;
}

.question {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F1F5F9;
}

.answer, .critique, .recommendation {
  margin-bottom: 12px;
}

.answer-label, .critique-label, .rec-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  margin-bottom: 6px;
}

.answer-content, .critique-content, .rec-content {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  padding-left: 20px;
}

.summary-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summary-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.summary-card h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.summary-card p {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}
</style>
