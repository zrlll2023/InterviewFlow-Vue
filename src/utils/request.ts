import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 120000
})

request.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('ai_api_key')
  const baseUrl = localStorage.getItem('ai_base_url')
  const model = localStorage.getItem('ai_model')

  if (apiKey) config.headers['X-AI-Key'] = apiKey
  if (baseUrl) config.headers['X-AI-Base-Url'] = baseUrl
  if (model) config.headers['X-AI-Model'] = model

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
