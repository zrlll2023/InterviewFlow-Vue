<template>
  <div class="experience-page">
    <div class="page-header">
      <el-input
        v-model="searchQuery"
        placeholder="搜索公司/岗位/标签..."
        prefix-icon="Search"
        clearable
        style="width: 300px"
      />
      <el-button type="primary" @click="openEditor()">
        <el-icon><Plus /></el-icon>
        新增面经
      </el-button>
    </div>

    <div class="tag-filter">
      <el-tag
        v-for="tag in allTags"
        :key="tag"
        :type="selectedTag === tag ? 'primary' : 'info'"
        class="filter-tag"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>

    <div v-if="filteredExperiences.length === 0" class="empty-state">
      <el-empty description="面经库空空如也，添加第一条面经">
        <el-button type="primary" @click="openEditor()">新增面经</el-button>
      </el-empty>
    </div>

    <div v-else class="experience-list">
      <div
        v-for="exp in filteredExperiences"
        :key="exp.id"
        class="experience-card"
      >
        <div class="card-header">
          <h3>{{ exp.company }} · {{ exp.position }}</h3>
          <div class="tags">
            <el-tag v-for="tag in parseTags(exp.tags)" :key="tag" size="small">
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <p class="content">{{ exp.content }}</p>
        <div class="card-footer">
          <span class="date">创建于 {{ formatDate(exp.createdAt) }}</span>
          <div class="actions">
            <el-button type="primary" text @click="openEditor(exp)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" text @click="handleDelete(exp)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <ExperienceEditorDrawer
      v-model="showEditor"
      :experience="editingExperience"
      @saved="loadExperiences"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import type { Experience } from '@/types/models'
import ExperienceEditorDrawer from '@/components/ExperienceEditorDrawer.vue'

const experiences = ref<Experience[]>([])
const searchQuery = ref('')
const selectedTag = ref('')
const showEditor = ref(false)
const editingExperience = ref<Experience | null>(null)

const allTags = computed(() => {
  const tags = new Set<string>()
  experiences.value.forEach(exp => {
    parseTags(exp.tags).forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

const filteredExperiences = computed(() => {
  let result = experiences.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e =>
      e.company.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q)
    )
  }
  if (selectedTag.value) {
    result = result.filter(e => parseTags(e.tags).includes(selectedTag.value))
  }
  return result
})

function parseTags(tags: string): string[] {
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN')
}

function toggleTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
}

async function loadExperiences() {
  const res = await request.get('/experiences')
  experiences.value = res || []
}

function openEditor(exp?: Experience) {
  editingExperience.value = exp || null
  showEditor.value = true
}

async function handleDelete(exp: Experience) {
  try {
    await ElMessageBox.confirm('确定要删除这条面经吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/experiences/${exp.id}`)
    ElMessage.success('删除成功')
    loadExperiences()
  } catch {
    // cancelled
  }
}

onMounted(loadExperiences)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-tag {
  cursor: pointer;
}

.experience-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.experience-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.content {
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date {
  font-size: 13px;
  color: #94A3B8;
}

.actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
</style>
