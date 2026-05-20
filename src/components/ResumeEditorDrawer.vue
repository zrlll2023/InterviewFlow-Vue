<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑简历' : '新建简历'"
    size="600px"
  >
    <div class="editor-form">
      <el-form label-position="top">
        <el-form-item label="简历名称">
          <el-input v-model="form.title" placeholder="如：Java研发-大四版" maxlength="100" />
        </el-form-item>

        <el-form-item>
          <el-upload
            class="pdf-uploader"
            drag
            action="/api/resumes/parse-pdf"
            :headers="uploadHeaders"
            accept=".pdf"
            :on-success="handlePdfSuccess"
            :on-error="handlePdfError"
            :before-upload="beforeUpload"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              点击或拖拽 PDF 文件到此处
              <div class="upload-tip">支持 .pdf 格式，最大 10MB</div>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="简历内容 (支持 Markdown)">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="编辑" name="edit">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="16"
                placeholder="# 个人信息\n- 姓名：张三\n..."
              />
            </el-tab-pane>
            <el-tab-pane label="预览" name="preview">
              <div class="markdown-preview" v-html="renderedContent" />
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
      </el-form>

      <div class="footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存简历</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { renderMarkdown } from '@/utils/markdown'
import request from '@/utils/request'
import type { Resume } from '@/types/models'

const props = defineProps<{
  modelValue: boolean
  resume: Resume | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const visible = ref(props.modelValue)
const activeTab = ref('edit')
const saving = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.resume) {
    form.value = {
      title: props.resume.title,
      content: props.resume.content
    }
  } else if (val) {
    form.value = { title: '', content: '' }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.resume)

const form = ref({
  title: '',
  content: ''
})

const renderedContent = computed(() => {
  return renderMarkdown(form.value.content)
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

function beforeUpload(file: File) {
  const isPdf = file.type === 'application/pdf'
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isPdf) {
    ElMessage.error('请上传 PDF 文件')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

function handlePdfSuccess(res: any) {
  if (res.code === 200) {
    form.value.title = res.data.title || form.value.title
    form.value.content = res.data.content
    ElMessage.success('PDF 解析成功')
  } else {
    ElMessage.error(res.message || '解析失败')
  }
}

function handlePdfError() {
  ElMessage.error('上传失败')
}

async function save() {
  if (!form.value.title.trim()) {
    ElMessage.warning('请填写简历名称')
    return
  }
  saving.value = true
  try {
    if (isEdit.value && props.resume) {
      await request.put(`/resumes/${props.resume.id}`, form.value)
    } else {
      await request.post('/resumes', form.value)
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

.pdf-uploader {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
}

.markdown-preview {
  padding: 16px;
  background: #F8FAFC;
  border-radius: 8px;
  min-height: 300px;
}

.footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
