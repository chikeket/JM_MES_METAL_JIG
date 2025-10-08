import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
  }),
  actions: {
    async fetchSession() {
      this.loading = true
      try {
        const { data } = await axios.get('/api/session')
        this.user = data?.ok ? data.user : null
      } catch {
        this.user = null
      } finally {
        this.loading = false
      }
    },
    setUser(u) {
      this.user = u
    },
    async logout() {
      try {
        await axios.post('/api/logout')
      } catch {}
      this.user = null
    },
  },
})
