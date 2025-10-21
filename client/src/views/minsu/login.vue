<template>
  <div class="login-wrapper">
    <form class="login-form" @submit.prevent="onLogin">
      <h2>로그인</h2>
      <fieldset>
        <div class="form-row">
          <label for="username">아이디</label>
          <input
            v-model="username"
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            required
          />
        </div>
        <div class="form-row">
          <label for="password">비밀번호</label>
          <input
            v-model="password"
            type="password"
            id="password"
            name="password"
            autocomplete="current-password"
            required
          />
        </div>
        <div class="actions">
          <button type="submit" class="btn btn-xs btn-outline-secondary" :disabled="loading">
            {{ loading ? '처리중...' : '로그인' }}
          </button>
        </div>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const auth = useAuthStore()
const router = useRouter()

async function onLogin() {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    alert('아이디와 비밀번호를 입력하세요.')
    return
  }
  loading.value = true
  try {
    const { data } = await axios.post('/api/login', { id: username.value, pw: password.value })
    if (data?.ok) {
      auth.setUser(data.user)
      console.log('로그인 성공:', data.user)
      alert(`${data.user.emp_nm}님 환영합니다.`)
      router.push('/rcvord')
    } else {
      alert('로그인 실패')
    }
  } catch (err) {
    console.error('login error', err)
    const resp = err?.response
    if (resp?.status === 401) {
      alert(resp?.data?.message || '인증 실패')
    } else {
      alert(resp?.data?.message || '로그인 실패')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 0 0 0 20px;
}
.login-form fieldset {
  width: 420px;
  background: #f1f1f1;
  padding: 32px 46px 26px;
  border: 1px solid #cfcfcf;
  border-radius: 8px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}
.form-row label {
  width: 90px;
  text-align: left;
  font-size: 16px;
  color: #222;
}
.form-row input {
  flex: 1;
  padding: 6px 8px;
  font-size: 14px;
  border: 1px solid #9a9a9a;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  border-radius: 4px;
}
.form-row input:focus {
  border-color: #333;
}
.actions {
  text-align: right;
  margin-top: 6px;
}

.btn {
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid transparent;
  background: #6e7b85;
  color: #fff;
  font-weight: 500;
  transition: background 0.15s;
  height: 32px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  padding: 0 14px;
  font-size: 13px;
}
.btn-xs {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
}
.btn-outline-secondary {
  background: #6e7b85;
  color: #fff;
  border-color: #5d6871;
}
.btn-outline-secondary:hover {
  background: #5d6871;
}
</style>
