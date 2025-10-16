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
      <div class="col-width-scope">
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
          <CTable bordered hover small>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell class="text-center" style="width: 50px">No</CTableHeaderCell>
                <CTableHeaderCell class="text-center">수주 ID</CTableHeaderCell>
                <CTableHeaderCell class="text-center">납품 업체 명</CTableHeaderCell>
                <CTableHeaderCell class="text-center">수주 담당자</CTableHeaderCell>
                <CTableHeaderCell class="text-center">총 요청 수량</CTableHeaderCell>
                <CTableHeaderCell class="text-center">수주 등록 일자</CTableHeaderCell>
                <CTableHeaderCell class="text-center">수주 상태</CTableHeaderCell>
                <CTableHeaderCell class="text-center">비고</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow
                v-for="(row, idx) in rcvordList"
                :key="row.rcvord_id"
                @dblclick="selectRcvord(row)"
                style="cursor: pointer"
              >
                <CTableDataCell class="cell-no">{{ idx + 1 }}</CTableDataCell>
                <CTableDataCell class="cell-left">{{ row.rcvord_id }}</CTableDataCell>
                <CTableDataCell class="cell-left">{{ row.co_nm }}</CTableDataCell>
                <CTableDataCell class="cell-left">{{ row.emp_nm }}</CTableDataCell>
                <CTableDataCell class="cell-number">{{
                  formatNumber(row.total_qty)
                }}</CTableDataCell>
                <CTableDataCell class="cell-left">{{ formatDate(row.reg_dt) }}</CTableDataCell>
                <CTableDataCell class="cell-left">{{ row.status }}</CTableDataCell>
                <CTableDataCell class="cell-left">{{ row.rm }}</CTableDataCell>
              </CTableRow>
              <CTableRow v-if="!rcvordList.length">
                <CTableDataCell colspan="8" class="text-center text-muted py-3">
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
import { defineProps, defineEmits, shallowRef, ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'select'])

// 상태
const searchOrderId = ref('')
let rcvordList = shallowRef([])

// 닫기
const close = () => {
  emit('close')
}

// 포맷 함수
const formatNumber = (n) => (n == null ? '' : Number(n).toLocaleString())
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
    if (keyword) params.rcvord_id = keyword

    const { data } = await axios.get('/api/rcvords', { params })
    rcvordList.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('rcvords fetch error', err)
  }
}

// 필터 적용 함수 제거 (서버에서 처리)

// 조회 버튼 - 서버에서 검색어 기반 조회
const searchRcvord = async () => {
  await fetchAll()
}

// 초기화: 입력창 비우고 전체 재조회 + 전체 목록 표시
const reset = async () => {
  searchOrderId.value = ''
  await fetchAll()
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

// rcvordList 직접 사용 (서버가 필터 처리)
</script>

<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
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

/* 컬럼 너비 조절 설정: 필요 시 아래 변수만 수정하면 됩니다. */
.col-width-scope {
  /* 조절 가능한 CSS 변수들 */
  --col-no: 30px;
  --col-id: 120px;
  --col-co: 160px; /* 납품 업체 명 */
  --col-owner: 95px; /* 수주 담당자 */
  --col-total: 100px; /* 총 요청 수량 */
  --col-date: 110px; /* 수주 등록 일자 */
  --col-status: 80px; /* 수주 상태 */
  --col-remark: 180px; /* 비고 */
}

/* CoreUI가 table-layout: fixed인 경우를 대비해 auto로 전환 */
.col-width-scope ::v-deep table {
  table-layout: auto !important;
  width: 100%;
}

/* 각 컬럼 너비 적용 (thead/tbody 동시 적용) */
.col-width-scope ::v-deep thead th:nth-child(1),
.col-width-scope ::v-deep tbody td:nth-child(1) {
  width: var(--col-no);
  min-width: var(--col-no);
}
.col-width-scope ::v-deep thead th:nth-child(2),
.col-width-scope ::v-deep tbody td:nth-child(2) {
  width: var(--col-id);
  min-width: var(--col-id);
}
.col-width-scope ::v-deep thead th:nth-child(3),
.col-width-scope ::v-deep tbody td:nth-child(3) {
  width: var(--col-co);
  min-width: var(--col-co);
}
.col-width-scope ::v-deep thead th:nth-child(4),
.col-width-scope ::v-deep tbody td:nth-child(4) {
  width: var(--col-owner);
  min-width: var(--col-owner);
}
.col-width-scope ::v-deep thead th:nth-child(5),
.col-width-scope ::v-deep tbody td:nth-child(5) {
  width: var(--col-total);
  min-width: var(--col-total);
}
.col-width-scope ::v-deep thead th:nth-child(6),
.col-width-scope ::v-deep tbody td:nth-child(6) {
  width: var(--col-date);
  min-width: var(--col-date);
}
.col-width-scope ::v-deep thead th:nth-child(7),
.col-width-scope ::v-deep tbody td:nth-child(7) {
  width: var(--col-status);
  min-width: var(--col-status);
}
.col-width-scope ::v-deep thead th:nth-child(8),
.col-width-scope ::v-deep tbody td:nth-child(8) {
  width: var(--col-remark);
  min-width: var(--col-remark);
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
