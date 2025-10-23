<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>자재 발주서 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="d-flex gap-2 mb-3">
        <select class="form-select" style="width: 160px" v-model="pickValue">
          <option value="rsc_ordr_nm">자재 발주서명</option>
          <option value="co_nm">업체명</option>
          <option value="emp_nm">담당자명</option>
        </select>
        <!-- 검색어 입력 너비 축소 -->
        <input
          class="form-control"
          type="text"
          v-model="searchKeyword"
          @keyup.enter="search"
          placeholder="검색어 입력"
          style="width: 250px"
        />
        <div style="width: 260px; display:flex; gap:6px; align-items:center">
          <input class="form-control" type="date" v-model="reg_dt_from" />
          <span style="width:18px; text-align:center">~</span>
          <input class="form-control" type="date" v-model="reg_dt_to" />
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
              <th>자재 발주서ID</th>
              <th>자재 발주서명</th>
              <th>업체명</th>
              <th>담당자명</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in list" :key="p.rsc_ordr_id || i" @dblclick="select(p)">
              <td>{{ p.rsc_ordr_id }}</td>
              <td>{{ p.rsc_ordr_nm }}</td>
              <td>{{ p.co_nm }}</td>
              <td>{{ p.emp_nm }}</td>
              <td>{{ p.reg_dt }}</td>
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

const pickValue = ref('rsc_ordr_nm')
const searchKeyword = ref('')
const reg_dt_from = ref('')
const reg_dt_to = ref('')
const list = shallowRef([])

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  console.log('[rscOrdrModal] 검색 조건 초기화')
  pickValue.value = 'rsc_ordr_nm'
  searchKeyword.value = ''
  reg_dt_from.value = ''
  reg_dt_to.value = ''
  list.value = []
}

const search = async () => {
  try {
    // 로그인 사용자 정보 가져오기
    const currentUser = auth.user
    if (!currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    const empId = currentUser.emp_id ?? currentUser.id
    if (!empId) {
      alert('사용자 정보를 찾을 수 없습니다.')
      return
    }

    // 서버가 소문자 키를 기대하므로 소문자 필드로 전송
    const params = {
      rsc_ordr_nm: null,
      co_nm: null,
      emp_nm: null,
      reg_dt_from: null,
      reg_dt_to: null,
      emp_id: empId, // 로그인 사용자 ID 추가
    }

    if (pickValue.value === 'rsc_ordr_nm') params.rsc_ordr_nm = searchKeyword.value
    else if (pickValue.value === 'co_nm') params.co_nm = searchKeyword.value
    else if (pickValue.value === 'emp_nm') params.emp_nm = searchKeyword.value
    if (reg_dt_from.value) params.reg_dt_from = reg_dt_from.value
    if (reg_dt_to.value) params.reg_dt_to = reg_dt_to.value

    console.log('[rscOrdrModal] request params:', params)
    const res = await axios.get('/api/rscOrdr', { params })
    const data = res?.data
    console.log('[rscOrdrModal] raw response:', data)

    // 방어 처리: 배열이면 그대로, 아니면 빈 배열
    list.value = Array.isArray(data)
      ? data.map((it) => ({
          rsc_ordr_id: it.rsc_ordr_id ?? it.RSC_ORDR_ID ?? '',
          co_id: it.co_id ?? it.CO_ID ?? '',
          rsc_ordr_nm: it.rsc_ordr_nm ?? it.RSC_ORDR_NM ?? '',
          rm: it.rm ?? it.RM ?? '', // 비고 필드 추가
          co_nm: it.co_nm ?? it.CO_NM ?? '',
          emp_nm: it.emp_nm ?? it.EMP_NM ?? '',
          reg_dt: it.reg_dt ? String(it.reg_dt).slice(0, 10) : '',
          deta_count: Number(it.deta_count ?? it.DETA_COUNT ?? 0),
        }))
      : []
  } catch (err) {
    console.error('[rscOrdrModal] rscOrdr search error', err)
    list.value = []
  }
}

const select = async (row) => {
  try {
    console.log('[rscOrdrModal] select row ->', row)
    const res = await axios.get('/api/rscOrdrDeta', { params: { rsc_ordr_id: row.rsc_ordr_id } })
    const detail = Array.isArray(res.data) ? res.data : []
    console.log('[rscOrdrModal] detail length ->', detail.length)
    emit('select', { master: row, detailList: detail })
    close()
  } catch (err) {
    console.error('[rscOrdrModal] select error:', err)
    emit('select', { master: row, detailList: [] })
    close()
  }
}
</script>
