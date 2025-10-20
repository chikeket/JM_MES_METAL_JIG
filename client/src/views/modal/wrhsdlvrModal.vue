<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>자재 발주서 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="d-flex gap-2 mb-3">
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">수불 명</label>
          <CFormInput v-model="searchOrderNm" style="width: 140px" />
        </div>
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">수불 유형</label>
          <CFormInput v-model="searchOrderType" style="width: 100px" placeholder="IN/OUT" />
        </div>
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">담당자 명</label>
          <CFormInput v-model="searchOrderEmp" style="width: 100px" />
        </div>
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">수불 일자</label>
          <CFormInput type="date" v-model="searchOrderDate" style="width: 120px" />
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-secondary" @click="search">검색</button>
          <button class="btn btn-secondary" @click="resetSearch">초기화</button>
        </div>
      </div>

      <div style="max-height: 480px; overflow: auto">
        <table class="table table-sm table-hover mb-0">
          <thead>
            <tr>
              <th>수불 ID</th>
              <th>수불 명</th>
              <th>수불 유형</th>
              <th>담당자명</th>
              <th>등록일</th>
              <th>품목 명</th>
              <th>옵션 명</th>
              <th>수량</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in list" :key="p.wrhsdlvr_mas_id || i" @dblclick="select(p)">
              <td>{{ p.wrhsdlvr_mas_id }}</td>
              <td>{{ p.rcvpay_nm }}</td>
              <td>{{ p.rcvpay_ty }}</td>
              <td>{{ p.emp_nm }}</td>
              <td>{{ p.rcvpay_dt }}</td>
              <td>{{ p.prdt_nm || '-' }}</td>
              <td>{{ p.opt_nm || '-' }}</td>
              <td>{{ p.all_rcvpay_qy ?? '-' }}</td>
            </tr>
            <tr v-if="list.length === 0">
              <td colspan="5" class="text-center text-muted">검색 결과 없음</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="close">닫기</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const auth = useAuthStore()

const searchOrderNm = ref('')
const searchOrderType = ref('')
const searchOrderEmp = ref('')
const searchOrderDate = ref('')
const list = shallowRef([])

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  console.log('[rscOrdrModal] 검색 조건 초기화')
  searchOrderNm.value = ''
  searchOrderType.value = ''
  searchOrderEmp.value = ''
  searchOrderDate.value = ''
  list.value = []
}

const search = async () => {
  try {
    // // 로그인 사용자 정보 가져오기
    // const currentUser = auth.user
    // if (!currentUser) {
    //   alert('로그인이 필요합니다.')
    //   return
    // }
    // const empId = currentUser.emp_id ?? currentUser.id
    // if (!empId) {
    //   alert('사용자 정보를 찾을 수 없습니다.')
    //   return
    // }
    const params = {
      rsc_ordr_nm: searchOrderNm.value || null,
      rcvpay_ty: searchOrderType.value || null,
      emp_nm: searchOrderEmp.value || null,
      reg_dt: searchOrderDate.value || null,
      emp_id: 'EMP005' ||empId || null,
    }
    const res = await axios.get('/api/wrhsdlvr/search', { params })
    const data = res?.data
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('[wrhsdlvrModal] search error', err)
    list.value = []
  }
}

const select = async (row) => {
  try {
    const res = await axios.get(`/api/wrhsdlvr/${row.wrhsdlvr_mas_id}`)
    const { master, details } = res.data || {}
    emit('select', { master, details })
    close()
  } catch (err) {
    console.error('[wrhsdlvrModal] select error:', err)
    emit('select', { master: row, details: mappedDetails })
    close()
  }
}
</script>
