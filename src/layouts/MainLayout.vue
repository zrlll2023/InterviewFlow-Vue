<template>
  <div class="main-layout">
    <Sidebar />
    <div class="main-content">
      <Topbar />
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  padding: 24px;
  background-color: #F8FAFC;
}
</style>
