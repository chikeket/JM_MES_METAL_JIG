<script setup>
import { onMounted, ref } from 'vue'
import AppBreadcrumb from '@/components/AppBreadcrumb.vue'
import { useSidebarStore } from '@/stores/sidebar.js'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

const headerClassNames = ref('mb-2 p-0')
const sidebar = useSidebarStore()
const auth = useAuthStore()
const router = (() => {
  try {
    return useRouter()
  } catch {
    return null
  }
})()

function goLogin() {
  if (router) router.push('/login')
  else window.location.href = '/login'
}

async function onLogout() {
  await auth.logout()
  goLogin()
}

onMounted(() => {
  document.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 0) {
      headerClassNames.value = 'mb-4 p-0 shadow-sm'
    } else {
      headerClassNames.value = 'mb-4 p-0'
    }
  })
  auth.fetchSession()
})
</script>

<template>
  <CHeader position="sticky" :class="headerClassNames">
    <CContainer class="border-bottom px-4" fluid>
      <CHeaderToggler @click="sidebar.toggleVisible()" style="margin-inline-start: -14px">
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>
      <!-- <CHeaderNav class="d-none d-md-flex">
        <CNavItem>
          <CNavLink href="/dashboard"> Dashboard </CNavLink>
        </CNavItem>
      </CHeaderNav> -->
      <CHeaderNav class="ms-auto align-items-center gap-2 auth-area">
        <template v-if="auth.user">
          <span class="emp-name">{{ auth.user.emp_nm }}</span>
          <CButton color="secondary" size="sm" @click="onLogout">로그아웃</CButton>
        </template>
        <template v-else>
          <CButton color="secondary" size="sm" @click="goLogin" :disabled="auth.loading"
            >로그인</CButton
          >
        </template>
      </CHeaderNav>
    </CContainer>
    <CContainer class="px-4" fluid>
      <AppBreadcrumb />
    </CContainer>
  </CHeader>
</template>
