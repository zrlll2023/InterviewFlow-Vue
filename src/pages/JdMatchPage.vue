<template>
  <div class="jd-match-page">
    <div v-if="!showResult" class="match-form">
      <div class="form-section">
        <h3>步骤 1: 选择简历</h3>
        <el-select
          v-model="form.resumeId"
          placeholder="请选择简历"
          style="width: 100%"
        >
          <el-option
            v-for="resume in resumes"
            :key="resume.id"
            :label="resume.title"
            :value="resume.id"
          />
        </el-select>
      </div>

      <div class="form-section">
        <h3>步骤 2: 粘贴目标岗位 JD</h3>
        <el-input
          v-model="form.jdText"
          type="textarea"
          :rows="10"
          placeholder="请粘贴岗位描述，包括岗位职责和任职要求..."
        />
      </div>

      <div class="form-actions">
        <el-button
          type="primary"
          size="large"
          :loading="analyzing"
          :disabled="!form.resumeId || !form.jdText.trim()"
          @click="startMatch"
        >
          <el-icon><Aim /></el-icon>
          开始智能匹配分析
        </el-button>
      </div>
    </div>

    <div v-else class="match-result">
      <div class="result-header">
        <h3>匹配分析结果</h3>
        <el-button type="primary" text @click="reset">
          <el-icon><RefreshRight /></el-icon>
          重新分析
        </el-button>
      </div>

      <div class="score-card">
        <div class="score-title">综合匹配度</div>
        <div class="score-value" :style="{ color: scoreColor }">
          {{ result?.matchScore ?? 0 }}%
        </div>
        <el-progress
          :percentage="result?.matchScore || 0"
          :color="scoreColor"
          :stroke-width="12"
          :show-text="false"
        />
      </div>

      <div class="result-sections">
        <div class="section weakness">
          <h4><el-icon color="#EF4444"><WarningFilled /></el-icon> 核心技术栈缺失 (红牌警告)</h4>
          <ul>
            <li v-for="(item, i) in result?.weaknesses" :key="i">{{ item }}</li>
          </ul>
        </div>

        <div class="section strength">
          <h4><el-icon color="#10B981"><CircleCheckFilled /></el-icon> 加分项突出 (绿牌鼓励)</h4>
          <ul>
            <li v-for="(item, i) in result?.strengths" :key="i">{{ item }}</li>
          </ul>
        </div>

        <div class="section recommendation">
          <h4><el-icon color="#2563EB"><InfoFilled /></el-icon> 简历优化建议</h4>
          <ul>
            <li v-for="(item, i) in result?.recommendations" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Aim, RefreshRight, WarningFilled, CircleCheckFilled, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import type { Resume, JdMatchResult } from '@/types/models'

const resumes = ref<Resume[]>([])
const form = ref({ resumeId: null as number | null, jdText: '' })
const analyzing = ref(false)
const showResult = ref(false)
const result = ref<JdMatchResult | null>(null)

const scoreColor = computed(() => {
  const score = result.value?.matchScore || 0
  if (score >= 70) return '#10B981'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
})

async function loadResumes() {
  const res = await request.get('/resumes')
  resumes.value = res || []
}

async function startMatch() {
  if (!form.value.resumeId || !form.value.jdText.trim()) {
    ElMessage.warning('请选择简历并填写 JD')
    return
  }
  analyzing.value = true
  try {
    const res = await request.post('/jd/match', {
      resumeId: form.value.resumeId,
      jdText: form.value.jdText
    })
    result.value = res
    showResult.value = true
  } finally {
    analyzing.value = false
  }
}

function reset() {
  showResult.value = false
  result.value = null
}

onMounted(loadResumes)
</script>

<style scoped>
.jd-match-page {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.result-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.score-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.score-title {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 8px;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.result-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.section ul {
  list-style: none;
  padding: 0;
}

.section li {
  padding: 8px 0;
  font-size: 14px;
  color: #475569;
  border-bottom: 1px solid #F1F5F9;
}

.section li:last-child {
  border-bottom: none;
}
</style>
