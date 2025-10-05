<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle>수주 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <!-- 검색 영역 -->
      <div class="search-bar mb-3">
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">수주 ID</label>
          <CFormInput v-model="searchOrderId" style="width: 200px" />
        </div>
        <div class="flex-spacer"></div>
        <div class="right-controls">
          <CButton color="secondary" @click="searchRcvord">조회</CButton>
          <CButton color="secondary" @click="reset">초기화</CButton>
        </div>
      </div>

      <!-- 결과 테이블 -->
      <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
        <CTable bordered hover small>
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 50px">No</CTableHeaderCell>
              <CTableHeaderCell class="text-center">수주ID</CTableHeaderCell>
              <CTableHeaderCell class="text-center">납품업체명</CTableHeaderCell>
              <CTableHeaderCell class="text-center">수주담당자</CTableHeaderCell>
              <CTableHeaderCell class="text-center">총요청수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center">수주등록일자</CTableHeaderCell>
              <CTableHeaderCell class="text-center">납품예정일자</CTableHeaderCell>
              <CTableHeaderCell class="text-center">수주상태</CTableHeaderCell>
              <CTableHeaderCell class="text-center">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell colspan="9" class="text-center py-3">로딩중...</CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="errorMsg">
              <CTableDataCell colspan="9" class="text-center text-danger py-3">{{
                errorMsg
              }}</CTableDataCell>
            </CTableRow>
            <CTableRow
              v-else
              v-for="(row, idx) in filteredList"
              :key="row.rcvord_id ?? idx"
              @dblclick="selectRcvord(row)"
              style="cursor: pointer"
            >
              <CTableDataCell class="text-center">{{ idx + 1 }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.rcvord_id }}</CTableDataCell>
              <CTableDataCell>{{ row.co_nm }}</CTableDataCell>
              <CTableDataCell>{{ row.emp_nm ?? row.emp_id }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ formatNumber(row.total_qty) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ formatDate(row.reg_dt) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ formatDate(row.due_date) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.status ?? row.st ?? '' }}</CTableDataCell>
              <CTableDataCell>{{ row.rm }}</CTableDataCell>
            </CTableRow>
            <CTableRow v-if="!loading && !errorMsg && !filteredList.length">
              <CTableDataCell colspan="9" class="text-center text-muted py-3">
                데이터가 없습니다.
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </CModalBody>
    <!-- 별도 하단 닫기 버튼 제거: 기본 모달 X 버튼만 사용 -->
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
let rcvordList = shallowRef([]) // 전체 목록
let filteredList = shallowRef([]) // 검색 결과
const loading = ref(false)
const errorMsg = ref('')

// 닫기
const close = () => {
  emit('close')
  // 닫힐 때 검색 값 유지 여부 선택 가능. 지금은 유지.
}

// 포맷 함수
const formatNumber = (n) => (n == null ? '' : Number(n).toLocaleString())
const formatDate = (d) => {
  if (!d) return ''
  try {
    const date = new Date(d)
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
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await axios.get('/api/rcvords')
    rcvordList.value = Array.isArray(data) ? data : []
    applyFilter()
  } catch (err) {
    console.error('rcvords fetch error', err)
    errorMsg.value = '조회 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// 필터 적용
const applyFilter = () => {
  const keyword = (searchOrderId.value || '').trim().toLowerCase()
  if (!keyword) {
    filteredList.value = rcvordList.value
    return
  }
  filteredList.value = rcvordList.value.filter((row) => {
    const id = String(row.rcvord_id || '').toLowerCase()
    return id.includes(keyword)
  })
}

// 조회 버튼 (필터만 적용 또는 서버 재호출 선택 가능) 여기선 재호출 없이 필터
const searchRcvord = async () => {
  // 이미 목록을 가지고 있다고 가정하고 필터만 적용
  applyFilter()
}

// 초기화: 입력창 비우고 전체 재조회 + 전체 목록 표시
const reset = async () => {
  searchOrderId.value = ''
  await fetchAll() // 서버에서 새로 전체 목록 가져와 filteredList 갱신
}

// 행 선택 (더블클릭)
const selectRcvord = (row) => {
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
  if (props.visible && !rcvordList.value.length) fetchAll()
})

// filteredList 를 템플릿에서 직접 사용
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
</style>
