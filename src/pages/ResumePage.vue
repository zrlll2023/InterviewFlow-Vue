<template>
  <div class="resume-page">
    <div class="page-header">
      <el-input
        v-model="searchQuery"
        placeholder="搜索简历..."
        prefix-icon="Search"
        clearable
        style="width: 300px"
      />
      <el-button type="primary" @click="openEditor()">
        <el-icon><Plus /></el-icon>
        新建简历
      </el-button>
    </div>

    <div v-if="filteredResumes.length === 0" class="empty-state">
      <el-empty description="还没有简历，创建第一份简历开始吧">
        <el-button type="primary" @click="openEditor()">创建第一份简历</el-button>
      </el-empty>
    </div>

    <div v-else class="resume-grid">
      <div
        v-for="resume in filteredResumes"
        :key="resume.id"
        class="resume-card"
      >
        <div class="card-header">
          <el-icon size="24" color="#2563EB"><Document /></el-icon>
          <h3>{{ resume.title }}</h3>
        </div>
        <p class="create-time">创建于 {{ formatDate(resume.createdAt) }}</p>
        <div class="card-actions">
          <el-button type="primary" text @click="openEditor(resume)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" text @click="handleDelete(resume)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
    </div>

    <ResumeEditorDrawer
      v-model="showEditor"
      :resume="editingResume"
      @saved="loadResumes"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, Document, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import type { Resume } from '@/types/models'
import ResumeEditorDrawer from '@/components/ResumeEditorDrawer.vue'

const resumes = ref<Resume[]>([])
const searchQuery = ref('')
const showEditor = ref(false)
const editingResume = ref<Resume | null>(null)

const filteredResumes = computed(() => {
  if (!searchQuery.value) return resumes.value
  return resumes.value.filter(r =>
    r.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN')
}

async function loadResumes() {
  const res = await request.get('/resumes')
  resumes.value = res || []
}

function openEditor(resume?: Resume) {
  editingResume.value = resume || null
  showEditor.value = true
}

async function handleDelete(resume: Resume) {
  try {
    await ElMessageBox.confirm('确定要删除这份简历吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/resumes/${resume.id}`)
    ElMessage.success('删除成功')
    loadResumes()
  } catch {
    // cancelled
  }
}

onMounted(loadResumes)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.resume-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}

.resume-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
}

.create-time {
  font-size: 13px;
  color: #94A3B8;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
</style>
