<template>
  <div class="jd-match-page">
    <div v-if="showHistory" class="history-page">
      <div class="history-header">
        <h3>JD 匹配历史记录</h3>
        <el-button type="primary" text @click="showHistory = false">
          <el-icon><Back /></el-icon>
          返回分析
        </el-button>
      </div>

      <div v-if="historyList.length === 0" class="empty-state">
        <el-empty description="暂无匹配记录" />
      </div>

      <div v-else class="history-list">
        <div v-for="item in historyList" :key="item.id" class="history-card">
          <div class="card-header">
            <div class="title-row">
              <el-icon color="#2563EB"><Aim /></el-icon>
              <span class="title" @click="viewDetail(item.id)">{{ item.title }}</span>
              <el-tag :type="scoreTagType(item.matchScore)" size="small">{{ item.matchScore }}%</el-tag>
            </div>
            <div class="card-actions">
              <el-button type="primary" text size="small" @click="openEditDialog(item)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" text size="small" @click="confirmDelete(item.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="card-meta">
            <span v-if="item.resumeTitle">简历: {{ item.resumeTitle }}</span>
            <span v-if="item.jdUrl" class="jd-link">
              <el-link :href="item.jdUrl" target="_blank" type="primary" size="small">
                <el-icon><Link /></el-icon>
                查看 JD
              </el-link>
            </span>
            <span class="date">{{ formatDate(item.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="showResult" class="match-result">
      <div class="result-header">
        <h3>匹配分析结果</h3>
        <div class="header-actions">
          <el-button type="primary" text @click="showHistoryList">
            <el-icon><List /></el-icon>
            历史记录
          </el-button>
          <el-button type="primary" text @click="reset">
            <el-icon><RefreshRight /></el-icon>
            重新分析
          </el-button>
        </div>
      </div>

      <div class="score-card">
        <div class="score-title">综合匹配度</div>
        <div class="score-value" :style="{ color: scoreColor }">{{ result?.matchScore ?? 0 }}%</div>
        <el-progress :percentage="result?.matchScore || 0" :color="scoreColor" :stroke-width="12" :show-text="false" />
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

    <div v-else class="match-form">
      <div class="form-header">
        <h3>JD 智能匹配</h3>
        <el-button type="primary" text @click="showHistoryList">
          <el-icon><List /></el-icon>
          历史记录
        </el-button>
      </div>
      <div class="form-section">
        <h3>步骤 1: 选择简历</h3>
        <el-select v-model="form.resumeId" placeholder="请选择简历" style="width: 100%">
          <el-option v-for="resume in resumes" :key="resume.id" :label="resume.title" :value="resume.id" />
        </el-select>
      </div>

      <div class="form-section">
        <h3>步骤 2: 粘贴目标岗位 JD</h3>
        <el-input v-model="form.jdText" type="textarea" :rows="8" placeholder="请粘贴岗位描述，包括岗位职责和任职要求..." />
      </div>

      <div class="form-section">
        <h3>步骤 3: JD 在线链接 (可选)</h3>
        <el-input v-model="form.jdUrl" placeholder="如：https://www.zhipin.com/job_detail/xxx.html" />
      </div>

      <div class="form-actions">
        <el-button type="primary" size="large" :loading="analyzing" :disabled="!form.resumeId || !form.jdText.trim()" @click="startMatch">
          <el-icon><Aim /></el-icon>
          开始智能匹配分析
        </el-button>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑记录" width="450px">
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="editForm.title" placeholder="如：字节跳动-前端开发" />
        </el-form-item>
        <el-form-item label="JD 链接">
          <el-input v-model="editForm.jdUrl" placeholder="https://..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="匹配详情" width="700px">
      <div v-if="detailData" class="detail-content">
        <div class="detail-header">
          <h4>{{ detailData.title }}</h4>
          <div class="detail-meta">
            <span v-if="detailData.resumeTitle">简历: {{ detailData.resumeTitle }}</span>
            <el-link v-if="detailData.jdUrl" :href="detailData.jdUrl" target="_blank" type="primary">
              <el-icon><Link /></el-icon>
              查看 JD 原文
            </el-link>
          </div>
        </div>

        <div class="detail-score">
          <span>匹配度: </span>
          <span class="score-num" :style="{ color: scoreColorFromValue(detailData.matchScore) }">{{ detailData.matchScore }}%</span>
        </div>

        <div class="detail-section">
          <h5><el-icon color="#EF4444"><WarningFilled /></el-icon> 核心短板</h5>
          <ul>
            <li v-for="(item, i) in detailData.weaknesses" :key="i">{{ item }}</li>
          </ul>
        </div>

        <div class="detail-section">
          <h5><el-icon color="#10B981"><CircleCheckFilled /></el-icon> 核心优势</h5>
          <ul>
            <li v-for="(item, i) in detailData.strengths" :key="i">{{ item }}</li>
          </ul>
        </div>

        <div class="detail-section">
          <h5><el-icon color="#2563EB"><InfoFilled /></el-icon> 优化建议</h5>
          <ul>
            <li v-for="(item, i) in detailData.recommendations" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="showDeleteConfirm" title="确认删除" width="400px">
      <p>确定要删除这条匹配记录吗？</p>
      <template #footer>
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="executeDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Aim, RefreshRight, WarningFilled, CircleCheckFilled, InfoFilled, List, Back, Edit, Delete, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import type { Resume, JdMatchResult } from '@/types/models'

interface HistoryItem {
  id: number
  title: string
  resumeTitle?: string
  matchScore: number
  jdUrl?: string
  createdAt: string
}

interface DetailItem {
  id: number
  title: string
  resumeTitle?: string
  jdText: string
  jdUrl?: string
  matchScore: number
  weaknesses: string[]
  strengths: string[]
  recommendations: string[]
  createdAt: string
  updatedAt: string
}

const resumes = ref<Resume[]>([])
const form = ref({ resumeId: null as number | null, jdText: '', jdUrl: '' })
const analyzing = ref(false)
const showResult = ref(false)
const showHistory = ref(false)
const result = ref<JdMatchResult | null>(null)
const historyList = ref<HistoryItem[]>([])
const showEditDialog = ref(false)
const showDetailDialog = ref(false)
const showDeleteConfirm = ref(false)
const editForm = ref({ id: 0, title: '', jdUrl: '' })
const detailData = ref<DetailItem | null>(null)
const deleteId = ref<number | null>(null)

const scoreColor = computed(() => {
  const score = result.value?.matchScore || 0
  return scoreColorFromValue(score)
})

function scoreColorFromValue(score: number) {
  if (score >= 70) return '#10B981'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

function scoreTagType(score: number) {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'danger'
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

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
      jdText: form.value.jdText,
      jdUrl: form.value.jdUrl || undefined
    })
    result.value = res
    showResult.value = true
  } finally {
    analyzing.value = false
  }
}

function reset() {
  showResult.value = false
  showHistory.value = false
  result.value = null
}

async function showHistoryList() {
  showHistory.value = true
  await loadHistory()
}

async function loadHistory() {
  const res = await request.get('/jd/history')
  historyList.value = res || []
}

async function viewDetail(id: number) {
  const res = await request.get(`/jd/history/${id}`)
  detailData.value = res
  showDetailDialog.value = true
}

function openEditDialog(item: HistoryItem) {
  editForm.value = { id: item.id, title: item.title, jdUrl: item.jdUrl || '' }
  showEditDialog.value = true
}

async function saveEdit() {
  if (!editForm.value.title.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }
  try {
    await request.put(`/jd/history/${editForm.value.id}`, {
      title: editForm.value.title,
      jdUrl: editForm.value.jdUrl || undefined
    })
    ElMessage.success('保存成功')
    showEditDialog.value = false
    await loadHistory()
  } catch {
    // handled by interceptor
  }
}

function confirmDelete(id: number) {
  deleteId.value = id
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!deleteId.value) return
  try {
    await request.delete(`/jd/history/${deleteId.value}`)
    ElMessage.success('删除成功')
    showDeleteConfirm.value = false
    await loadHistory()
  } catch {
    // handled by interceptor
  }
}

onMounted(loadResumes)
</script>

<style scoped>
.jd-match-page {
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
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

.header-actions {
  display: flex;
  gap: 8px;
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

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.history-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-weight: 600;
  color: #1E293B;
  cursor: pointer;
}

.title:hover {
  color: #2563EB;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #94A3B8;
}

.jd-link {
  display: flex;
  align-items: center;
}

.date {
  margin-left: auto;
}

.empty-state {
  padding: 60px 0;
}

.detail-content h4 {
  font-size: 16px;
  margin-bottom: 8px;
}

.detail-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #64748B;
  margin-bottom: 16px;
}

.detail-score {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 20px;
}

.score-num {
  font-size: 24px;
  font-weight: 700;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section h5 {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.detail-section ul {
  list-style: none;
  padding: 0;
}

.detail-section li {
  padding: 6px 0;
  font-size: 13px;
  color: #475569;
  border-bottom: 1px solid #F1F5F9;
}

.detail-section li:last-child {
  border-bottom: none;
}
</style>
