<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑面经' : '新增面经'"
    size="600px"
  >
    <div class="editor-form">
      <el-form label-position="top">
        <el-form-item label="公司名称">
          <el-input v-model="form.company" placeholder="如：字节跳动" />
        </el-form-item>

        <el-form-item label="岗位方向">
          <el-input v-model="form.position" placeholder="如：Java后端开发" />
        </el-form-item>

        <el-form-item label="标签 (逗号分隔)">
          <el-input v-model="form.tags" placeholder="Java, Redis, 高并发" />
        </el-form-item>

        <el-form-item label="面经内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="12"
            placeholder="记录面试考题、回答要点..."
          />
        </el-form-item>
      </el-form>

      <div class="footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存面经</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import type { Experience } from '@/types/models'

const props = defineProps<{
  modelValue: boolean
  experience: Experience | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const visible = ref(props.modelValue)
const saving = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.experience) {
    form.value = {
      company: props.experience.company,
      position: props.experience.position,
      tags: props.experience.tags,
      content: props.experience.content
    }
  } else if (val) {
    form.value = { company: '', position: '', tags: '', content: '' }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.experience)

const form = ref({
  company: '',
  position: '',
  tags: '',
  content: ''
})

async function save() {
  if (!form.value.company.trim() || !form.value.position.trim() || !form.value.content.trim()) {
    ElMessage.warning('请填写必填项')
    return
  }
  saving.value = true
  try {
    if (isEdit.value && props.experience) {
      await request.put(`/experiences/${props.experience.id}`, form.value)
    } else {
      await request.post('/experiences', form.value)
    }
    ElMessage.success('保存成功')
    visible.value = false
    emit('saved')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.editor-form {
  padding: 8px 0;
}

.footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
