<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle>납품 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <!-- 검색 영역 -->
      <div class="search-bar mb-3">
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">납품 ID</label>
          <CFormInput v-model="searchOrderId" style="width: 200px" />
        </div>
        <div class="flex-spacer"></div>
        <div class="right-controls">
          <CButton color="secondary" @click="searchDeli">조회</CButton>
          <CButton color="secondary" @click="reset">초기화</CButton>
        </div>
      </div>

      <!-- 결과 테이블 -->
      <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
        <CTable bordered hover small>
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 50px">No</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 200px">납품 ID</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 200px"
                >납품 담당자</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 200px"
                >납품 등록 일자</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow
              v-for="(row, idx) in deliList"
              :key="row.deli_id"
              @dblclick="selectDeli(row)"
              style="cursor: pointer"
            >
              <CTableDataCell class="cell-no">{{ idx + 1 }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.deli_id }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.emp_nm }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ formatDate(row.deli_dt) }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.rm }}</CTableDataCell>
            </CTableRow>
            <CTableRow v-if="!deliList.length">
              <CTableDataCell colspan="9" class="text-center text-muted py-3">
                데이터가 없습니다.
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { defineProps, defineEmits, shallowRef, ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'select'])

// 상태
const searchOrderId = ref('')
let deliList = shallowRef([])

// 닫기
const close = () => {
  emit('close')
}

// 포맷 함수
const formatDate = (d) => {
  if (!d) return ''
  try {
    // d가 이미 'YYYY-MM-DD' 형태 문자열일 경우 그대로 반환
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const date = new Date(d)
    if (isNaN(date.getTime())) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

// 서버에서 목록 가져오기
const fetchAll = async () => {
  try {
    const params = {}
    const keyword = (searchOrderId.value || '').trim()
    if (keyword) params.deli_id = keyword
    const { data } = await axios.get('/api/delis', { params })
    deliList.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('delis fetch error', err)
  }
}

// 필터 적용 함수 제거 (서버에서 처리)

// 조회 버튼 - 서버에서 검색어 기반 조회
const searchDeli = async () => {
  await fetchAll()
}

// 초기화: 입력창 비우고 전체 재조회 + 전체 목록 표시
const reset = async () => {
  searchOrderId.value = ''
  await fetchAll()
}

// 행 선택 (더블클릭)
const selectDeli = (row) => {
  emit('select', row)
  close()
}

// 모달 표시될 때마다 목록 동기화 (처음 열릴 때만 fetch)
watch(
  () => props.visible,
  (v) => {
    if (v) {
      // 모달 열릴 때마다 검색조건 초기화 후 전체 재조회
      searchOrderId.value = ''
      fetchAll()
    }
  },
)

// 수동 초기 로드 (이미 열려 있는 상태로 mount될 가능성)
onMounted(() => {
  if (props.visible && !deliList.value.length) fetchAll()
})

// rcvordList 직접 사용 (서버가 필터 처리)
</script>

<style scoped>
.text-danger {
  color: #dc3545;
}
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 12px;
}
.search-bar {
  display: flex;
  align-items: center;
}
.flex-spacer {
  flex: 1;
}
.right-controls {
  display: flex;
  align-items: center;
  gap: 10px; /* 조회와 초기화 사이 간격 */
}
.search-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #222;
  display: inline-block;
  min-width: 56px;
  text-align: right;
}
.cell-no {
  text-align: center !important;
}
.cell-number {
  text-align: right !important;
}
.cell-left {
  text-align: left !important;
}
</style>
