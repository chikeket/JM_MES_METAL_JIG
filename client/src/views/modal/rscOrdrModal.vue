<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>자재 발주서 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="d-flex gap-2 mb-3">
        <select class="form-select" style="width:160px" v-model="pickValue">
          <option value="rsc_ordr_nm">발주명</option>
          <option value="co_nm">업체명</option>
          <option value="emp_nm">담당자명</option>
        </select>
        <input class="form-control" type="text" v-model="searchKeyword" @keyup.enter="search" placeholder="검색어 입력" />
        <input class="form-control" type="date" v-model="reg_dt" style="width:160px" />
        <button class="btn btn-secondary" @click="search">검색</button>
      </div>

      <div style="max-height:480px; overflow:auto">
        <table class="table table-sm table-hover mb-0">
          <thead>
            <tr><th>발주ID</th><th>발주명</th><th>업체</th><th>담당자</th><th>등록일</th></tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in list" :key="p.rsc_ordr_id || i" @dblclick="select(p)">
              <td>{{ p.rsc_ordr_id }}</td>
              <td>{{ p.rsc_ordr_nm }}</td>
              <td>{{ p.co_nm }}</td>
              <td>{{ p.emp_nm }}</td>
              <td>{{ p.reg_dt }}</td>
            </tr>
            <tr v-if="list.length === 0"><td colspan="5" class="text-center text-muted">검색결과 없음</td></tr>
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

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close','select'])

const pickValue = ref('rsc_ordr_nm')
const searchKeyword = ref('')
const reg_dt = ref('')
const list = shallowRef([])

const close = () => {
  pickValue.value = 'rsc_ordr_nm'
  searchKeyword.value = ''
  reg_dt.value = ''
  list.value = []
  emit('close')
}

const search = async () => {
  try {
    // 서버가 소문자 키를 기대하므로 소문자 필드로 전송
    const params = { rsc_ordr_nm: null, co_nm: null, emp_nm: null, reg_dt: null }
    if (pickValue.value === 'rsc_ordr_nm') params.rsc_ordr_nm = searchKeyword.value
    else if (pickValue.value === 'co_nm') params.co_nm = searchKeyword.value
    else if (pickValue.value === 'emp_nm') params.emp_nm = searchKeyword.value
    if (reg_dt.value) params.reg_dt = reg_dt.value

    console.log('[rscOrdrModal] request params:', params)
    const res = await axios.get('/api/rscOrdr', { params }) // app.js에 '/api'로 마운트했다면 '/api/' 사용
    const data = res?.data
    console.log('[rscOrdrModal] raw response:', data)
    // 방어 처리: 배열이면 그대로, 아니면 빈 배열
    list.value = Array.isArray(data) ? data.map(it => ({
      rsc_ordr_id: it.rsc_ordr_id ?? it.RSC_ORDR_ID ?? '',
      rsc_ordr_nm: it.rsc_ordr_nm ?? it.RSC_ORDR_NM ?? '',
      co_nm: it.co_nm ?? it.CO_NM ?? '',
      emp_nm: it.emp_nm ?? it.EMP_NM ?? '',
      reg_dt: it.reg_dt ? String(it.reg_dt).slice(0,10) : ''
    })) : []
  } catch (err) {
    console.error('[rscOrdrModal] rscOrdr search error', err)
    list.value = []
  }
}

const select = async (row) => {
  try {
    const res = await axios.get('/api/rscOrdrDeta', { params: { rsc_ordr_id: row.rsc_ordr_id } }).catch(()=>null)
    const detail = res?.data ?? []
    emit('select', { master: row, detailList: detail })
    close()
  } catch (err) {
    console.error(err)
  }
}
</script>
