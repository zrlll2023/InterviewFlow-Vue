<template>
  <div class="interview-page">
    <!-- 准备状态 -->
    <div v-if="!isInterviewing" class="prepare-state">
      <div class="prepare-header">
        <el-icon size="48" color="#2563EB"><ChatDotRound /></el-icon>
        <h2>开启一场模拟面试</h2>
        <p>选择配置，开始你的面试实战演练</p>
      </div>

      <div class="prepare-form">
        <div class="form-item">
          <label>① 选择简历 <span class="required">*</span></label>
          <el-select v-model="form.resumeId" placeholder="请选择简历" style="width: 100%">
            <el-option
              v-for="resume in resumes"
              :key="resume.id"
              :label="resume.title"
              :value="resume.id"
            />
          </el-select>
        </div>

        <div class="form-item">
          <label>② 目标岗位名称 <span class="required">*</span></label>
          <el-select v-model="form.targetPosition" placeholder="请选择目标岗位" style="width: 100%">
            <el-option label="Java后端开发" value="Java后端开发" />
            <el-option label="前端开发" value="前端开发" />
            <el-option label="全栈开发" value="全栈开发" />
            <el-option label="Python开发" value="Python开发" />
            <el-option label="Go开发" value="Go开发" />
            <el-option label="C++开发" value="C++开发" />
            <el-option label="算法工程师" value="算法工程师" />
            <el-option label="测试开发" value="测试开发" />
            <el-option label="运维工程师" value="运维工程师" />
            <el-option label="大数据开发" value="大数据开发" />
            <el-option label="其他" value="其他" />
          </el-select>
        </div>

        <div class="form-item">
          <label>③ 岗位 JD (可选)</label>
          <el-input
            v-model="form.jdText"
            type="textarea"
            :rows="4"
            placeholder="粘贴岗位描述，AI将结合JD针对性提问..."
          />
        </div>

        <div class="form-item">
          <label>④ 关联面经 (可选)</label>
          <el-checkbox-group v-model="form.experienceIds">
            <el-checkbox
              v-for="exp in experiences"
              :key="exp.id"
              :label="exp.id"
            >
              {{ exp.company }}-{{ exp.position }}
            </el-checkbox>
          </el-checkbox-group>
          <p class="tip">不关联面经时，AI 将基于您的简历和 JD 自行出题</p>
        </div>

        <div class="form-item">
          <label>⑤ 面试难度 <span class="required">*</span></label>
          <div class="difficulty-cards">
            <div
              v-for="item in difficulties"
              :key="item.value"
              :class="['diff-card', { active: form.difficulty === item.value }]"
              @click="form.difficulty = item.value"
            >
              <div class="diff-icon">{{ item.icon }}</div>
              <div class="diff-name">{{ item.label }}</div>
              <div class="diff-desc">{{ item.desc }}</div>
              <el-icon v-if="form.difficulty === item.value" class="check-icon"><Check /></el-icon>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <el-button
            type="primary"
            size="large"
            :loading="starting"
            :disabled="!canStart"
            @click="startInterview"
          >
            <el-icon><VideoPlay /></el-icon>
            开始模拟面试
          </el-button>
        </div>
      </div>
    </div>

    <!-- 面试中状态 -->
    <div v-else class="chat-state">
      <div class="chat-header">
        <div class="interview-info">
          <span>岗位: {{ form.targetPosition }}</span>
          <el-tag :type="difficultyTagType">{{ difficultyLabel }}</el-tag>
          <span>第 {{ currentRound }}/{{ maxRounds }} 题</span>
        </div>
        <el-button type="danger" text @click="confirmFinish">
          <el-icon><CircleCloseFilled /></el-icon>
          结束面试
        </el-button>
      </div>

      <div ref="chatContainer" class="chat-messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role === 'interviewer' ? 'interviewer' : 'candidate']"
        >
          <div class="avatar">
            {{ msg.role === 'interviewer' ? '🤖' : '👤' }}
          </div>
          <div class="bubble" v-html="renderMarkdown(msg.content)" />
        </div>
        <div v-if="waiting" class="message interviewer">
          <div class="avatar">🤖</div>
          <div class="bubble loading">
            <span class="dot" /><span class="dot" /><span class="dot" />
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="answer"
          type="textarea"
          :rows="3"
          placeholder="输入你的回答..."
          :disabled="waiting || finished"
          @keydown.enter.prevent="submitAnswer"
        />
        <el-button
          type="primary"
          :disabled="!answer.trim() || waiting || finished"
          @click="submitAnswer"
        >
          <el-icon><Promotion /></el-icon>
          提交回答
        </el-button>
      </div>
    </div>

    <!-- 结束确认对话框 -->
    <el-dialog
      v-model="showFinishConfirm"
      title="确认结束面试"
      width="400px"
    >
      <p>提前结束面试将立即生成复盘报告。确定要结束吗？</p>
      <template #footer>
        <el-button @click="showFinishConfirm = false">取消</el-button>
        <el-button type="danger" @click="finishInterview">确认结束</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChatDotRound, Check, VideoPlay, CircleCloseFilled, Promotion
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { renderMarkdown } from '@/utils/markdown'
import type { Resume, Experience, InterviewMessage } from '@/types/models'

const router = useRouter()

const resumes = ref<Resume[]>([])
const experiences = ref<Experience[]>([])

const form = ref({
  resumeId: null as number | null,
  targetPosition: '',
  jdText: '',
  experienceIds: [] as number[],
  difficulty: 'MEDIUM' as 'SMALL' | 'MEDIUM' | 'LARGE'
})

const difficulties = [
  { value: 'SMALL' as const, label: '小厂', icon: '🟢', desc: '亲和务实，偏重基础' },
  { value: 'MEDIUM' as const, label: '中厂', icon: '🔵', desc: '专业深度，注重原理' },
  { value: 'LARGE' as const, label: '大厂', icon: '🟣', desc: '严厉剖析，底层架构' }
]

const isInterviewing = ref(false)
const starting = ref(false)
const waiting = ref(false)
const finished = ref(false)
const sessionId = ref<number | null>(null)
const messages = ref<InterviewMessage[]>([])
const answer = ref('')
const currentRound = ref(1)
const maxRounds = ref(8)
const showFinishConfirm = ref(false)
const chatContainer = ref<HTMLElement>()

const canStart = computed(() =>
  form.value.resumeId && form.value.targetPosition.trim()
)

const difficultyLabel = computed(() =>
  difficulties.find(d => d.value === form.value.difficulty)?.label || ''
)

const difficultyTagType = computed(() => {
  switch (form.value.difficulty) {
    case 'SMALL': return 'info'
    case 'MEDIUM': return 'primary'
    case 'LARGE': return 'warning'
    default: return ''
  }
})

async function loadData() {
  const [rRes, eRes] = await Promise.all([
    request.get('/resumes'),
    request.get('/experiences')
  ])
  resumes.value = rRes || []
  experiences.value = eRes || []
}

async function startInterview() {
  if (!canStart.value) return
  starting.value = true
  try {
    const res = await request.post('/interviews/start', {
      resumeId: form.value.resumeId,
      targetPosition: form.value.targetPosition,
      jdText: form.value.jdText || undefined,
      experienceIds: form.value.experienceIds.length > 0 ? form.value.experienceIds : undefined,
      difficulty: form.value.difficulty
    })
    sessionId.value = res.sessionId
    messages.value.push({
      id: 0,
      role: 'interviewer',
      content: res.firstQuestion,
      sequence: 1
    })
    isInterviewing.value = true
  } finally {
    starting.value = false
  }
}

async function submitAnswer() {
  if (!answer.value.trim() || !sessionId.value || waiting.value) return

  const userAnswer = answer.value.trim()
  messages.value.push({
    id: 0,
    role: 'candidate',
    content: userAnswer,
    sequence: currentRound.value
  })
  answer.value = ''
  waiting.value = true
  await scrollToBottom()

  try {
    const res = await request.post('/interviews/chat', {
      sessionId: sessionId.value,
      candidateAnswer: userAnswer
    })

    if (res.isFinished || currentRound.value >= maxRounds.value) {
      finished.value = true
      messages.value.push({
        id: 0,
        role: 'interviewer',
        content: '面试已结束，正在生成复盘报告...',
        sequence: currentRound.value + 1
      })
      setTimeout(() => {
        router.push(`/reports/${sessionId.value}`)
      }, 2000)
    } else {
      currentRound.value++
      messages.value.push({
        id: 0,
        role: 'interviewer',
        content: res.nextQuestion,
        sequence: currentRound.value
      })
    }
  } finally {
    waiting.value = false
    await scrollToBottom()
  }
}

function confirmFinish() {
  showFinishConfirm.value = true
}

async function finishInterview() {
  if (!sessionId.value) return
  showFinishConfirm.value = false
  try {
    await request.post('/interviews/finish', { sessionId: sessionId.value })
    router.push(`/reports/${sessionId.value}`)
  } catch {
    // handled by interceptor
  }
}

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

onMounted(loadData)
</script>

<style scoped>
.prepare-state {
  max-width: 600px;
  margin: 0 auto;
}

.prepare-header {
  text-align: center;
  margin-bottom: 32px;
}

.prepare-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin-top: 12px;
}

.prepare-header p {
  color: #64748B;
  margin-top: 4px;
}

.prepare-form {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 8px;
}

.required {
  color: #EF4444;
}

.tip {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
}

.difficulty-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.diff-card {
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.diff-card:hover {
  border-color: #2563EB;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.diff-card.active {
  border-color: #2563EB;
  background: #EFF6FF;
}

.diff-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.diff-name {
  font-weight: 600;
  color: #1E293B;
}

.diff-desc {
  font-size: 12px;
  color: #64748B;
  margin-top: 4px;
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #2563EB;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 面试中状态 */
.chat-state {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.interview-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #475569;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message.interviewer {
  align-self: flex-start;
}

.message.candidate {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.message.interviewer .bubble {
  background: #F1F5F9;
  border-radius: 12px 12px 12px 4px;
  color: #1E293B;
}

.message.candidate .bubble {
  background: #2563EB;
  border-radius: 12px 12px 4px 12px;
  color: #FFFFFF;
}

.bubble.loading {
  display: flex;
  gap: 4px;
  align-items: center;
  min-width: 60px;
  min-height: 40px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94A3B8;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
}

.chat-input .el-textarea {
  flex: 1;
}
</style>
