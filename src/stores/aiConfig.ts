import { defineStore } from 'pinia'
import { reactive } from 'vue'
import request from '@/utils/request'

export const useAiConfigStore = defineStore('aiConfig', () => {
  const config = reactive({
    baseUrl: localStorage.getItem('ai_base_url') || '',
    apiKey: localStorage.getItem('ai_api_key') || '',
    model: localStorage.getItem('ai_model') || '',
    connected: false
  })

  function save() {
    localStorage.setItem('ai_base_url', config.baseUrl)
    localStorage.setItem('ai_api_key', config.apiKey)
    localStorage.setItem('ai_model', config.model)
    localStorage.setItem('ai_config', JSON.stringify({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model
    }))
  }

  async function testConnection() {
    try {
      const res = await request.post('/ai/test-connection', {
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model
      })
      config.connected = res === true
      return config.connected
    } catch {
      config.connected = false
      return false
    }
  }

  function loadFromStorage() {
    config.baseUrl = localStorage.getItem('ai_base_url') || ''
    config.apiKey = localStorage.getItem('ai_api_key') || ''
    config.model = localStorage.getItem('ai_model') || ''
  }

  return { config, save, testConnection, loadFromStorage }
})
