import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<{ username: string } | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const res = await request.post('/auth/login', { username, password })
    token.value = res.token
    user.value = { username: res.username }
    localStorage.setItem('token', res.token)
    return res
  }

  async function register(username: string, password: string, email?: string) {
    return request.post('/auth/register', { username, password, email })
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isLoggedIn, login, register, logout }
})
