<template>
  <el-drawer
    v-model="visible"
    title="AI 服务配置"
    size="400px"
    :with-header="true"
    @close="handleClose"
  >
    <div class="settings-form">
      <el-form label-position="top">
        <el-form-item label="API Base URL">
          <el-input
            v-model="form.baseUrl"
            placeholder="https://api.deepseek.com/v1"
          />
        </el-form-item>

        <el-form-item label="API Key">
          <el-input
            v-model="form.apiKey"
            type="password"
            placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
            show-password
          />
        </el-form-item>

        <el-form-item label="模型名称">
          <el-input
            v-model="form.model"
            placeholder="deepseek-chat"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="testing"
            @click="testConnection"
          >
            <el-icon><Connection /></el-icon>
            连接测试
          </el-button>
        </el-form-item>

        <el-form-item v-if="testResult !== null">
          <el-alert
            :title="testResult ? '连接成功' : '连接失败'"
            :type="testResult ? 'success' : 'error'"
            :closable="false"
          />
        </el-form-item>
      </el-form>

      <div class="footer">
        <el-button type="primary" size="large" @click="saveConfig">
          保存配置
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAiConfigStore } from '@/stores/aiConfig'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = ref(props.modelValue)
const aiConfigStore = useAiConfigStore()

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    aiConfigStore.loadFromStorage()
    form.value = {
      baseUrl: aiConfigStore.config.baseUrl,
      apiKey: aiConfigStore.config.apiKey,
      model: aiConfigStore.config.model
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const form = ref({
  baseUrl: '',
  apiKey: '',
  model: ''
})

const testing = ref(false)
const testResult = ref<boolean | null>(null)

async function testConnection() {
  testing.value = true
  testResult.value = null
  aiConfigStore.config.baseUrl = form.value.baseUrl
  aiConfigStore.config.apiKey = form.value.apiKey
  aiConfigStore.config.model = form.value.model
  try {
    const ok = await aiConfigStore.testConnection()
    testResult.value = ok
  } finally {
    testing.value = false
  }
}

function saveConfig() {
  aiConfigStore.config.baseUrl = form.value.baseUrl
  aiConfigStore.config.apiKey = form.value.apiKey
  aiConfigStore.config.model = form.value.model
  aiConfigStore.save()
  ElMessage.success('配置已保存')
  visible.value = false
}

function handleClose() {
  testResult.value = null
}
</script>

<style scoped>
.settings-form {
  padding: 8px 0;
}

.footer {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}
</style>
