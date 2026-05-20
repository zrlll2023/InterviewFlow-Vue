<template>
  <aside class="sidebar">
    <div class="logo">
      <el-icon size="24" color="#2563EB"><Aim /></el-icon>
      <span class="logo-text">面流 InterviewFlow</span>
    </div>

    <nav class="nav-menu">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        :class="['nav-item', { active: $route.path === item.path || $route.path.startsWith(item.path + '/') }]"
      >
        <el-icon size="18"><component :is="item.icon" /></el-icon>
        <span>{{ item.name }}</span>
        <el-badge v-if="item.path === '/logs' && logStore.errorCount > 0" :value="logStore.errorCount" :max="99" class="nav-badge" />
      </router-link>
    </nav>

    <div class="ai-status">
      <div class="status-indicator">
        <span :class="['dot', aiConfigStore.config.connected ? 'connected' : 'disconnected']" />
        <span class="status-text">
          {{ aiConfigStore.config.connected ? 'AI 已连接' : 'AI 未连接' }}
        </span>
      </div>
      <div v-if="aiConfigStore.config.connected" class="model-name">
        {{ aiConfigStore.config.model || '默认模型' }}
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Document, Collection, Aim, ChatDotRound, DataLine, Notebook } from '@element-plus/icons-vue'
import { useAiConfigStore } from '@/stores/aiConfig'
import { useLogStore } from '@/stores/log'

const $route = useRoute()
const aiConfigStore = useAiConfigStore()
const logStore = useLogStore()

const menuItems = [
  { path: '/resumes', name: '简历管理', icon: Document },
  { path: '/experiences', name: '面经知识库', icon: Collection },
  { path: '/jd-match', name: 'JD 智能匹配', icon: Aim },
  { path: '/interview', name: 'AI 模拟面试', icon: ChatDotRound },
  { path: '/reports', name: '面试复盘', icon: DataLine },
  { path: '/logs', name: '运行日志', icon: Notebook }
]
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #FFFFFF;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 1px solid #E2E8F0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
}

.nav-menu {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  color: #64748B;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
}

.nav-item:hover {
  background: #F8FAFC;
  color: #1E293B;
}

.nav-item.active {
  background: #EFF6FF;
  color: #2563EB;
  position: relative;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #2563EB;
  border-radius: 0 2px 2px 0;
}

.nav-badge {
  margin-left: auto;
}

.ai-status {
  padding: 16px;
  border-top: 1px solid #E2E8F0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.connected {
  background: #10B981;
}

.dot.disconnected {
  background: #EF4444;
}

.status-text {
  font-size: 13px;
  color: #64748B;
}

.model-name {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
  padding-left: 16px;
}
</style>
