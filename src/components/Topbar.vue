<template>
  <header class="topbar">
    <h2 class="page-title">{{ pageTitle }}</h2>
    <div class="actions">
      <el-button type="primary" text @click="showSettings = true">
        <el-icon><Setting /></el-icon>
        设置
      </el-button>
    </div>

    <SettingsDrawer v-model="showSettings" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Setting } from '@element-plus/icons-vue'
import SettingsDrawer from './SettingsDrawer.vue'

const $route = useRoute()
const showSettings = ref(false)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/resumes': '简历管理',
    '/experiences': '面经知识库',
    '/jd-match': 'JD 智能匹配',
    '/interview': 'AI 模拟面试',
    '/reports': '面试复盘',
    '/logs': '运行日志',
  }
  if (titles[$route.path]) return titles[$route.path]
  if ($route.path.startsWith('/reports/')) return '面试复盘详情'
  return '面流'
})
</script>

<style scoped>
.topbar {
  height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #F8FAFC;
}

.username {
  font-size: 14px;
  color: #1E293B;
}
</style>
