<template>
  <el-drawer
    v-model="visible"
    title="AI 服务配置"
    size="450px"
    :with-header="true"
    @close="handleClose"
  >
    <div class="settings-form">
      <el-form label-position="top">
        <el-form-item label="AI 服务提供商">
          <el-select v-model="form.provider" placeholder="请选择 AI 服务商" style="width: 100%" @change="onProviderChange">
            <el-option label="DeepSeek（推荐）" value="deepseek" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="通义千问（阿里云）" value="dashscope" />
            <el-option label="智谱 AI" value="zhipu" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="API Base URL">
          <el-input
            v-model="form.baseUrl"
            placeholder="https://api.deepseek.com/v1"
            :disabled="form.provider !== 'custom'"
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
          <el-select
            v-if="!showCustomModel"
            v-model="form.model"
            placeholder="请选择模型"
            style="width: 100%"
            filterable
            allow-create
          >
            <el-option
              v-for="model in availableModels"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
          <el-input
            v-else
            v-model="form.model"
            placeholder="如：deepseek-chat"
          />
          <div class="model-tip">
            <el-checkbox v-model="showCustomModel">自定义模型名称</el-checkbox>
          </div>
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
            :description="testResult ? 'AI 服务配置正确，可以正常使用' : '请检查 API Key、Base URL 或模型名称是否正确'"
            :type="testResult ? 'success' : 'error'"
            :closable="false"
            show-icon
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
import { ref, watch, computed } from 'vue'
import { Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAiConfigStore } from '@/stores/aiConfig'

const PROVIDER_CONFIGS: Record<string, { baseUrl: string; models: { label: string; value: string }[] }> = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { label: 'DeepSeek V4 Flash（推荐）', value: 'deepseek-v4-flash' },
      { label: 'DeepSeek V4 Pro', value: 'deepseek-v4-pro' },
      { label: 'DeepSeek Chat (已弃用)', value: 'deepseek-chat' },
      { label: 'DeepSeek Reasoner (已弃用)', value: 'deepseek-reasoner' }
    ]
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { label: 'GPT-4o（推荐）', value: 'gpt-4o' },
      { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
      { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
    ]
  },
  dashscope: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { label: '通义千问 Max（推荐）', value: 'qwen-max' },
      { label: '通义千问 Plus', value: 'qwen-plus' },
      { label: '通义千问 Turbo', value: 'qwen-turbo' }
    ]
  },
  zhipu: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { label: 'GLM-4（推荐）', value: 'glm-4' },
      { label: 'GLM-4 Flash', value: 'glm-4-flash' },
      { label: 'GLM-4 Air', value: 'glm-4-air' }
    ]
  }
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = ref(props.modelValue)
const aiConfigStore = useAiConfigStore()

const form = ref({
  provider: 'deepseek',
  baseUrl: '',
  apiKey: '',
  model: ''
})

const showCustomModel = ref(false)
const testing = ref(false)
const testResult = ref<boolean | null>(null)

const availableModels = computed(() => {
  const config = PROVIDER_CONFIGS[form.value.provider]
  return config ? config.models : []
})

function onProviderChange(provider: string) {
  const config = PROVIDER_CONFIGS[provider]
  if (config) {
    form.value.baseUrl = config.baseUrl
    form.value.model = config.models[0]?.value || ''
  }
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    aiConfigStore.loadFromStorage()
    form.value = {
      provider: detectProvider(aiConfigStore.config.baseUrl),
      baseUrl: aiConfigStore.config.baseUrl,
      apiKey: aiConfigStore.config.apiKey,
      model: aiConfigStore.config.model
    }
    showCustomModel.value = !availableModels.value.some(m => m.value === form.value.model)
  }
})

function detectProvider(baseUrl: string): string {
  if (!baseUrl) return 'deepseek'
  if (baseUrl.includes('deepseek')) return 'deepseek'
  if (baseUrl.includes('openai')) return 'openai'
  if (baseUrl.includes('aliyuncs') || baseUrl.includes('dashscope')) return 'dashscope'
  if (baseUrl.includes('bigmodel') || baseUrl.includes('zhipu')) return 'zhipu'
  return 'custom'
}

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function testConnection() {
  if (!form.value.apiKey) {
    ElMessage.warning('请填写 API Key')
    return
  }
  if (!form.value.baseUrl) {
    ElMessage.warning('请填写 Base URL')
    return
  }
  if (!form.value.model) {
    ElMessage.warning('请选择或填写模型名称')
    return
  }

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
  if (!form.value.apiKey) {
    ElMessage.warning('请填写 API Key')
    return
  }
  if (!form.value.baseUrl) {
    ElMessage.warning('请填写 Base URL')
    return
  }
  if (!form.value.model) {
    ElMessage.warning('请选择或填写模型名称')
    return
  }

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

.model-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #94A3B8;
}

.footer {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}
</style>
