import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 120000
})

request.interceptors.request.use((config) => {
  let aiConfig: Record<string, string> = {}
  try {
    const stored = localStorage.getItem('ai_config')
    if (stored) aiConfig = JSON.parse(stored)
  } catch {
    aiConfig = {}
  }
  if (aiConfig.apiKey) config.headers['X-AI-Key'] = aiConfig.apiKey
  if (aiConfig.baseUrl) config.headers['X-AI-Base-Url'] = aiConfig.baseUrl
  if (aiConfig.model) config.headers['X-AI-Model'] = aiConfig.model

  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

request.interceptors.response.use(
  (res) => {
    if (res.data.code !== 200) {
      ElMessage.error(res.data.message || '请求失败')
      return Promise.reject(res.data)
    }
    return res.data.data
  },
  (err) => {
    ElMessage.error(err.response?.data?.message || '网络错误')
    return Promise.reject(err)
  }
)

export default request
