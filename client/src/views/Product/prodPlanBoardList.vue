<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="search" class="btn-action">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset" class="btn-action">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">계획서ID</CFormLabel>
          <CFormInput v-model="form.prod_plan_id" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">계획서제목</CFormLabel>
          <CFormInput v-model="form.prod_plan_nm" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">생산시작예정</CFormLabel>
          <CFormInput v-model="form.prod_expc_fr_dt" type="date" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">생산종료예정</CFormLabel>
          <CFormInput v-model="form.prod_expc_to_dt" type="date" class="form-input-enhanced" />
        </CCol>
      </CRow>

      <CRow class="g-3 mt-2">
        <CCol :md="3">
          <CFormLabel class="form-label">제품ID</CFormLabel>
          <CFormInput v-model="form.prdt_id" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">제품명</CFormLabel>
          <CFormInput v-model="form.prdt_nm" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">옵션명</CFormLabel>
          <CFormInput v-model="form.prdt_opt_nm" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">등록일자</CFormLabel>
          <CFormInput v-model="form.reg_dt" type="date" class="form-input-enhanced" />
        </CCol>
      </CRow>
    </div>

    <!-- 테이블 -->
    <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
      <div class="table-wrapper">
        <CTable bordered hover class="data-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style="width: 100px">계획서ID</CTableHeaderCell>
              <CTableHeaderCell style="width: 150px">계획서 제목</CTableHeaderCell>
              <CTableHeaderCell style="width: 150px">계획서 비고</CTableHeaderCell>
              <CTableHeaderCell style="width: 120px">제품명</CTableHeaderCell>
              <CTableHeaderCell style="width: 120px">옵션명</CTableHeaderCell>
              <CTableHeaderCell style="width: 80px">수량</CTableHeaderCell>
              <CTableHeaderCell style="width: 60px">단위</CTableHeaderCell>
              <CTableHeaderCell style="width: 80px">우선순위</CTableHeaderCell>
              <CTableHeaderCell style="width: 100px">등록일자</CTableHeaderCell>
              <CTableHeaderCell style="width: 110px">생산 시작일자</CTableHeaderCell>
              <CTableHeaderCell style="width: 110px">생산 종료일자</CTableHeaderCell>
              <CTableHeaderCell style="width: 150px">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(item, index) in tableData" :key="index" class="data-row">
              <CTableDataCell class="text-center">{{ item.prod_plan_id }}</CTableDataCell>
              <CTableDataCell>{{ item.prod_plan_nm }}</CTableDataCell>
              <CTableDataCell>{{ item.rm }}</CTableDataCell>
              <CTableDataCell>{{ item.prdt_nm }}</CTableDataCell>
              <CTableDataCell>{{ item.opt_nm }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.plan_qy }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.unit }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.priort }}</CTableDataCell>
              <CTableDataCell class="text-center">{{
                userDateUtils.dateFormat(item.reg_dt, 'yyyy-MM-dd')
              }}</CTableDataCell>
              <CTableDataCell class="text-center">{{
                userDateUtils.dateFormat(item.prod_expc_fr_dt, 'yyyy-MM-dd')
              }}</CTableDataCell>
              <CTableDataCell class="text-center">{{
                userDateUtils.dateFormat(item.prod_expc_to_dt, 'yyyy-MM-dd')
              }}</CTableDataCell>
              <CTableDataCell>{{ item.rm_deta }}</CTableDataCell>
            </CTableRow>
            <CTableRow v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
              <CTableDataCell colspan="12">&nbsp;</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </CContainer>
</template>

<script setup>
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CContainer,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/vue'
import { ref, computed } from 'vue'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'

const PAGE_ROWS = 9
const emptyRowCount = computed(() => Math.max(0, PAGE_ROWS - tableData.value.length))

const form = ref({
  prod_plan_id: '',
  prod_plan_nm: '',
  prod_expc_fr_dt: '',
  prod_expc_to_dt: '',
  prdt_id: '',
  prdt_nm: '',
  prdt_opt_nm: '',
  reg_dt: userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd'),
})

const tableData = ref([])

const search = async () => {
  const params = {
    prod_plan_id: form.value.prod_plan_id || '',
    prod_plan_nm: form.value.prod_plan_nm || '',
    prod_expc_fr_dt: form.value.prod_expc_fr_dt || '1970-01-01',
    prod_expc_to_dt: form.value.prod_expc_to_dt || '2125-01-01',
    prdt_id: form.value.prdt_id || '',
    prdt_nm: form.value.prdt_nm || '',
    opt_nm: form.value.opt_nm || '',
    reg_dt: form.value.reg_dt,
  }
  console.log(params)
  let result = await axios
    .get('/api/prodDrctBoardListSearch', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  tableData.value = result.data
}

const handleReset = () => {
  form.value.prod_plan_id = ''
  form.value.prod_plan_nm = ''
  form.value.prod_expc_fr_dt = ''
  form.value.prod_expc_to_dt = ''
  form.value.prdt_id = ''
  form.value.prdt_nm = ''
  form.value.prdt_opt_nm = ''
  form.value.reg_dt = userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd')
  tableData.value = []
}
</script>

<style scoped>
/* ============================================
   기본 설정 및 컨테이너
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

:deep(.container-fluid) {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  padding: 1.5rem !important;
  min-height: 100vh;
  overflow: auto;
  width: 100%;
}

/* ============================================
   검색 필터 박스
   ============================================ */
.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
}

/* ============================================
   그리드 박스 - 고정 높이 (10개 행)
   ============================================ */
.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-height: calc(46px + 9 * 46px + 2px);
}

/* ============================================
   버튼 스타일
   ============================================ */
:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff !important;
}

:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

:deep(.btn:active) {
  transform: scale(0.98);
}

/* ============================================
   폼 요소
   ============================================ */
:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

.form-input-enhanced {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
}

.form-input-enhanced:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}

.form-input-enhanced::placeholder {
  display: none;
}

:deep(.g-3) {
  --bs-gutter-y: 0.75rem;
  --bs-gutter-x: 1rem;
}

:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

:deep(.mb-4) {
  margin-bottom: 1rem !important;
}

:deep(.mt-2) {
  margin-top: 0.5rem !important;
}

/* ============================================
   테이블 래퍼
   ============================================ */
.table-wrapper {
  overflow-y: scroll;
  overflow-x: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  scrollbar-gutter: stable;
}

/* 스크롤바 전체 너비 */
.table-wrapper::-webkit-scrollbar {
  width: 16px;
  height: 16px;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

/* 스크롤바 트랙 (배경) */
.table-wrapper::-webkit-scrollbar-track {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 6px 0;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.05);
}

/* 스크롤바 썸 (손잡이) */
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  border-radius: 12px;
  border: 3px solid #f1f5f9;
  box-shadow: 0 3px 10px rgba(71, 85, 105, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 호버 시 */
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-color: #e2e8f0;
  box-shadow: 0 5px 15px rgba(71, 85, 105, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scaleX(1.15);
}

/* 활성화(드래그) 시 */
.table-wrapper::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  border-width: 2px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.5), inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

/* 스크롤바 버튼 제거 */
.table-wrapper::-webkit-scrollbar-button {
  display: none;
}

/* Firefox용 */
.table-wrapper {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
}

/* ============================================
   데이터 테이블
   ============================================ */
:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  font-size: 13px;
  width: max-content;
  min-width: 100%;
  display: table;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
  display: table-header-group;
}

:deep(.data-table tbody) {
  display: table-row-group;
}

:deep(.data-table th) {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.85rem 0.75rem;
  border: none;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

:deep(.data-table th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.data-table th:last-child) {
  border-top-right-radius: 12px;
}

:deep(.data-table td) {
  font-size: 13px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  height: 46px;
  white-space: nowrap;
}

:deep(.data-table tbody tr.data-row) {
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr.data-row:hover) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* ============================================
   텍스트 정렬
   ============================================ */
:deep(.text-end) {
  text-align: right;
}

:deep(.text-start) {
  text-align: left;
}

:deep(.text-center) {
  text-align: center;
}

/* ============================================
   반응형 디자인
   ============================================ */
@media (max-width: 1600px) {
  :deep(.form-label) {
    font-size: 12px !important;
  }

  .form-input-enhanced {
    font-size: 12px !important;
    height: 38px !important;
    padding: 0.55rem 0.75rem !important;
  }

  :deep(.btn) {
    font-size: 12px !important;
    padding: 0.5rem 1.1rem !important;
  }

  :deep(.data-table th),
  :deep(.data-table td) {
    font-size: 12px !important;
  }

  :deep(.data-table td) {
    height: 42px !important;
  }

  .empty-row td {
    height: 42px !important;
  }

  .grid-box {
    max-height: calc(42px + 9 * 42px + 2px) !important;
  }
}
</style>