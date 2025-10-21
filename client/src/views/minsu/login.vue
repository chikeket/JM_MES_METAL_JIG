<template>
  <div class="login-wrapper">
    <div class="login-container">
      <form class="login-form" @submit.prevent="onLogin">
        <div class="login-header">
          <h2>로그인</h2>
          <p class="login-subtitle">MES 시스템에 오신 것을 환영합니다</p>
        </div>
        
        <fieldset>
          <div class="form-row">
            <label for="username">아이디</label>
            <input
              v-model="username"
              type="text"
              id="username"
              name="username"
              autocomplete="username"
              placeholder="아이디를 입력하세요"
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
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          
          <div class="actions">
            <button 
              type="submit" 
              class="btn btn-login" 
              :disabled="loading"
            >
              {{ loading ? '처리중...' : '로그인' }}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
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
      router.push('/dashboard')
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
* {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  box-sizing: border-box;
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 460px;
}

.login-form {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  color: #ffffff;
}

.login-header h2 {
  margin: 0 0 0.5rem;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.login-subtitle {
  margin: 0;
  font-size: 14px;
  color: #cbd5e1;
  font-weight: 400;
  letter-spacing: -0.2px;
}

.login-form fieldset {
  border: none;
  padding: 2.5rem 2rem 2rem;
  margin: 0;
}

.form-row {
  margin-bottom: 1.5rem;
}

.form-row:last-of-type {
  margin-bottom: 2rem;
}

.form-row label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

.form-row input {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 14px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  border-radius: 10px;
  transition: all 0.2s ease;
  color: #334155;
  font-weight: 400;
}

.form-row input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.form-row input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
}

.form-row input:hover:not(:focus) {
  border-color: #cbd5e1;
}

.actions {
  margin-top: 2rem;
}

.btn {
  width: 100%;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.15);
}

.btn-login {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #ffffff;
}

.btn-login:hover:not(:disabled) {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 6px 20px rgba(71, 85, 105, 0.3);
  transform: translateY(-2px);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(71, 85, 105, 0.2);
}

.btn-login:disabled {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

/* 반응형 */
@media (max-width: 768px) {
  .login-wrapper {
    padding: 1rem;
  }
  
  .login-container {
    max-width: 100%;
  }
  
  .login-header {
    padding: 2rem 1.5rem 1.5rem;
  }
  
  .login-header h2 {
    font-size: 24px;
  }
  
  .login-form fieldset {
    padding: 2rem 1.5rem 1.5rem;
  }
}

/* 애니메이션 */
.login-form {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>