<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle>수주 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="vars">
        <!-- 검색 영역 -->
        <div class="search-bar mb-3">
          <div class="left-controls d-flex gap-2 align-items-center">
            <label class="search-label">수주 ID</label>
            <CFormInput v-model="searchRcvordId" style="width: 200px" />
          </div>
          <div class="flex-spacer"></div>
          <div class="right-controls">
            <CButton color="secondary" @click="search">조회</CButton>
            <CButton color="secondary" @click="reset">초기화</CButton>
          </div>
        </div>

        <!-- 결과 테이블 -->
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
          <CTable bordered hover small>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell class="text-center col-no">No</CTableHeaderCell>
                <CTableHeaderCell class="text-center col-id">수주 ID</CTableHeaderCell>
                <CTableHeaderCell class="text-center col-co">납품 업체 명</CTableHeaderCell>
                <CTableHeaderCell class="text-center col-emp">수주 담당자</CTableHeaderCell>
                <CTableHeaderCell class="text-center col-date">수주 등록 일자</CTableHeaderCell>
                <CTableHeaderCell class="text-center col-status">수주 상태</CTableHeaderCell>
                <CTableHeaderCell class="text-center col-rm">비고</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow v-if="loading">
                <CTableDataCell colspan="7" class="text-center py-3">로딩중...</CTableDataCell>
              </CTableRow>
              <CTableRow v-else-if="errorMsg">
                <CTableDataCell colspan="7" class="text-center text-danger py-3">{{
                  errorMsg
                }}</CTableDataCell>
              </CTableRow>
              <CTableRow
                v-else
                v-for="(row, idx) in rcvordList"
                :key="row.rcvord_id"
                @dblclick="select(row)"
                style="cursor: pointer"
              >
                <CTableDataCell class="cell-no col-no">{{ idx + 1 }}</CTableDataCell>
                <CTableDataCell class="cell-left col-id">{{ row.rcvord_id }}</CTableDataCell>
                <CTableDataCell class="cell-left col-co">{{ row.co_nm }}</CTableDataCell>
                <CTableDataCell class="cell-left col-emp">{{ row.emp_nm }}</CTableDataCell>
                <CTableDataCell class="cell-left col-date">{{
                  formatDate(row.reg_dt)
                }}</CTableDataCell>
                <CTableDataCell class="cell-left col-status">{{
                  row.status || '진행 중'
                }}</CTableDataCell>
                <CTableDataCell class="cell-left col-rm">{{ row.rm }}</CTableDataCell>
              </CTableRow>
              <CTableRow v-if="!loading && !errorMsg && !rcvordList.length">
                <CTableDataCell colspan="7" class="text-center text-muted py-3">
                  데이터가 없습니다.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'select'])

// 상태
const searchRcvordId = ref('')
const rcvordList = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 닫기
const close = () => {
  emit('close')
}

const formatNumber = (val) => {
  const n = Number(val || 0)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString()
}
const formatDate = (d) => {
  if (!d) return ''
  try {
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

// 서버에서 rcvord 목록 가져오기 (검색어 없으면 전체)
const fetchAll = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const keyword = (searchRcvordId.value || '').trim()
    const params = { rcvord_id: keyword }
    const { data } = await axios.get('/api/rcvords', { params })
    rcvordList.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('rcvords fetch error', err)
    errorMsg.value = '조회 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// 조회 버튼
const search = async () => {
  await fetchAll()
}

// 초기화: 검색어 비우고 전체 재조회
const reset = async () => {
  searchRcvordId.value = ''
  await fetchAll()
}

// 행 선택 (더블클릭)
const select = (row) => {
  emit('select', row)
  close()
}

// 모달 표시될 때마다 검색조건 초기화 + 전체조회
watch(
  () => props.visible,
  (v) => {
    if (v) {
      searchRcvordId.value = ''
      fetchAll()
    }
  },
)

// 수동 초기 로드 (이미 열려 있는 상태로 mount될 가능성)
onMounted(() => {
  if (props.visible && !rcvordList.value.length) fetchAll()
})
</script>

<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}
.vars {
  --w-no: 40px;
  --w-id: 140px;
  --w-co: 130px;
  --w-emp: 80px;
  --w-date: 110px;
  --w-status: 90px;
  --w-rm: 260px;
}

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
  gap: 10px;
}
.search-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #222;
  display: inline-block;
  min-width: 70px;
  text-align: right;
}
/* 테이블 자동 레이아웃 */
::v-deep table {
  table-layout: auto !important;
  width: 100%;
}
.col-no {
  width: var(--w-no);
  min-width: var(--w-no);
}
.col-id {
  width: var(--w-id);
  min-width: var(--w-id);
}
.col-co {
  width: var(--w-co);
  min-width: var(--w-co);
}
.col-emp {
  width: var(--w-emp);
  min-width: var(--w-emp);
}
.col-date {
  width: var(--w-date);
  min-width: var(--w-date);
}
.col-status {
  width: var(--w-status);
  min-width: var(--w-status);
}
.col-rm {
  width: var(--w-rm);
  min-width: var(--w-rm);
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

/* CompanyManage 스타일 적용 */
:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}
:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.25);
}

/* 테이블 헤더/바디 스타일 (CompanyManage 준용) */
:deep(.table-responsive) {
  border-radius: 10px;
}
:deep(.table-responsive thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}
:deep(.table-responsive thead th) {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%) !important;
  color: #ffffff !important;
  text-align: center;
  padding: 0.6rem 0.5rem;
  border: none;
}
:deep(.table-responsive tbody td) {
  font-size: 14px;
  vertical-align: middle;
}

/* Row hover - match prdtManage look */
:deep(.table-responsive tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
}
:deep(.table-responsive tbody tr:hover) {
  background-color: #f8f9fa !important;
}
/* Ensure cell background also changes to the same tone */
:deep(.table-responsive tbody tr:hover) td {
  background-color: #f8f9fa !important;
}

/* 모던 스크롤바 (CompanyManage 준용) */
:deep(.table-responsive) {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
:deep(.table-responsive::-webkit-scrollbar) {
  width: 8px;
}
:deep(.table-responsive::-webkit-scrollbar-track) {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
:deep(.table-responsive::-webkit-scrollbar-thumb) {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
:deep(.table-responsive::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
</style>
