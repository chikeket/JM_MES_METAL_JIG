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
          <CFormLabel class="form-label">유형</CFormLabel>
          <div class="custom-select-wrapper">
            <div class="custom-select" @click="toggleTypeDropdown" ref="typeSelectRef">
              <span>{{ type || '선택하세요' }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                <path fill="#495057" d="M6 9L1 4h10z" />
              </svg>
            </div>
            <div v-if="showTypeDropdown" class="custom-dropdown">
              <div class="custom-option" @click="selectType('')">선택하세요</div>
              <div class="custom-option" @click="selectType('자재')">자재</div>
              <div class="custom-option" @click="selectType('완제품')">완제품</div>
              <div class="custom-option" @click="selectType('반제품')">반제품</div>
            </div>
          </div>
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">제품 ID</CFormLabel>
          <CFormInput v-model="form.prdt_id" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">옵션 ID</CFormLabel>
          <CFormInput v-model="form.prdt_opt_id" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">등록일자</CFormLabel>
          <CFormInput v-model="form.insp_dt" type="date" class="form-input-enhanced" />
        </CCol>
      </CRow>

      <CRow class="g-3 mt-2">
        <CCol :md="3">
          <CFormLabel class="form-label">검사자</CFormLabel>
          <CFormInput v-model="form.emp_nm" class="form-input-enhanced" />
        </CCol>
      </CRow>
    </div>

    <!-- 테이블 -->
    <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
      <div class="table-wrapper">
        <CTable bordered hover class="data-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style="width: 120px">검사코드</CTableHeaderCell>
              <CTableHeaderCell style="width: 100px">검사일자</CTableHeaderCell>
              <CTableHeaderCell style="width: 120px">제품ID</CTableHeaderCell>
              <CTableHeaderCell style="width: 150px">제품명</CTableHeaderCell>
              <CTableHeaderCell style="width: 90px">검사수량</CTableHeaderCell>
              <CTableHeaderCell style="width: 90px">합격수량</CTableHeaderCell>
              <CTableHeaderCell style="width: 90px">불량수량</CTableHeaderCell>
              <CTableHeaderCell style="width: 60px">단위</CTableHeaderCell>
              <CTableHeaderCell style="width: 100px">검사자</CTableHeaderCell>
              <CTableHeaderCell style="width: 150px">비고</CTableHeaderCell>
              <CTableHeaderCell style="width: 100px">검사항목</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(item, index) in tableData" :key="index" class="data-row">
              <CTableDataCell class="text-center">{{
                item.rsc_qlty_insp_id ?? item.end_prdt_qlty_insp_id ?? item.semi_prdt_qlty_insp_id
              }}</CTableDataCell>
              <CTableDataCell class="text-center">{{
                userDateUtils.dateFormat(item.insp_dt, 'yyyy-MM-dd')
              }}</CTableDataCell>
              <CTableDataCell>{{
                !item.prdt_id ? item.rsc_id : item.prdt_id + '-' + item.prdt_opt_id
              }}</CTableDataCell>
              <CTableDataCell>{{
                !item.prdt_nm ? item.rsc_nm : item.prdt_nm + '-' + item.opt_nm
              }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ Math.floor(item.insp_qy) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ Math.floor(item.pass_qy) }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.insp_qy - item.pass_qy }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.unit }}</CTableDataCell>
              <CTableDataCell>{{ item.emp_nm }}</CTableDataCell>
              <CTableDataCell>{{ item.rm }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <CButton color="secondary" size="sm" @click="detail(item)" class="btn-detail">
                  상세보기
                </CButton>
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
              <CTableDataCell colspan="11">&nbsp;</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </CContainer>

  <rscQltyInspModal
    ref="rscModalRef"
    :visible="isRscQltyInspModalVisible"
    :modaldata="modaldata.value"
    @close="closerRscQltyInspModal"
  />
  <endQltyInspModal
    ref="endModalRef"
    :visible="isEndQltyInspModalVisible"
    :modaldata="modaldata.value"
    @close="closerEndQltyInspModal"
  />
  <semiQltyInspModal
    ref="semiModalRef"
    :visible="isSemiQltyInspModalVisible"
    :modaldata="modaldata.value"
    @close="closerSemiQltyInspModal"
  />
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
  CFormSelect,
} from '@coreui/vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'
import rscQltyInspModal from '../modal/rscQltyBoardModal.vue'
import endQltyInspModal from '../modal/endPrdtQltyBoardModal.vue'
import semiQltyInspModal from '../modal/semiPrdtQltyBoardModal.vue'

const PAGE_ROWS = 10
const emptyRowCount = computed(() => Math.max(0, PAGE_ROWS - tableData.value.length))

// 드롭다운 상태
const showTypeDropdown = ref(false)
const typeSelectRef = ref(null)

const toggleTypeDropdown = () => {
  showTypeDropdown.value = !showTypeDropdown.value
}

const selectType = (value) => {
  type.value = value
  showTypeDropdown.value = false
}

const handleClickOutside = (event) => {
  if (typeSelectRef.value && !typeSelectRef.value.contains(event.target)) {
    showTypeDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

//자재품질이력검색모달
const isRscQltyInspModalVisible = ref(false)
const openRscQltyInspModal = () => {
  isRscQltyInspModalVisible.value = true
}
const closerRscQltyInspModal = () => {
  isRscQltyInspModalVisible.value = false
}
//완제품 품질이력검색모달
const isEndQltyInspModalVisible = ref(false)
const openEndQltyInspModal = () => {
  isEndQltyInspModalVisible.value = true
}
const closerEndQltyInspModal = () => {
  isEndQltyInspModalVisible.value = false
}
//반제품 품질이력검색모달
const isSemiQltyInspModalVisible = ref(false)
const openSemiQltyInspModal = () => {
  isSemiQltyInspModalVisible.value = true
}
const closerSemiQltyInspModal = () => {
  isSemiQltyInspModalVisible.value = false
}
const form = ref({
  emp_nm: '',
  insp_dt: '1970-01-01',
  prdt_id: '',
  prdt_opt_id: '',
})

const tableData = ref([])
const type = ref('')
const modaldata = ref({ detailData: [], searchParams: {} })
const rscModalRef = ref(null)
const endModalRef = ref(null)
const semiModalRef = ref(null)

const search = async () => {
  let params
  if (type.value == '자재') {
    params = {
      type: type.value,
      emp_nm: form.value.emp_nm || '',
      insp_dt: form.value.insp_dt || '1970-01-01',
      rsc_id: form.value.prdt_id || '',
    }
  } else {
    params = {
      type: type.value,
      emp_nm: form.value.emp_nm || '',
      insp_dt: form.value.insp_dt || '1970-01-01',
      prdt_id: form.value.prdt_id || '',
      prdt_opt_id: form.value.prdt_opt_id || '',
    }
  }
  console.log(params)
  let result = await axios.get('/api/qltyBoardListSearch', { params }).catch((err) => console.log(err))
  console.log(result.data)
  tableData.value = result.data
}

const handleReset = () => {
  type.value = ''
  form.value.emp_nm = ''
  form.value.insp_dt = '1970-01-01'
  form.value.prdt_id = ''
  form.value.prdt_opt_id = ''
  tableData.value = []
}

const detail = async (data) => {
  let result = null
  if (type.value == '자재') {
    const params = { rsc_qlty_insp_id: '' }
    params.rsc_qlty_insp_id = data.rsc_qlty_insp_id
    result = await axios.get('/api/rscQltyInspInferSelect', { params }).catch((err) => console.log(err))
    modaldata.value.detailData = result.data
    modaldata.value.searchParams = data
    console.log(modaldata.value)
    openRscQltyInspModal()
    rscModalRef.value?.selectOrdr(modaldata.value)
  } else if (type.value == '완제품') {
    const params = { end_prdt_qlty_insp_id: '' }
    params.end_prdt_qlty_insp_id = data.end_prdt_qlty_insp_id
    result = await axios
      .get('/api/endPrdtQltyInspInferSearch', { params })
      .catch((err) => console.log(err))
    modaldata.value.detailData = result.data
    modaldata.value.searchParams = data
    console.log(modaldata.value)
    openEndQltyInspModal()
    endModalRef.value?.selectOrdr(modaldata.value)
  } else {
    const params = { semi_prdt_qlty_insp_id: '' }
    params.semi_prdt_qlty_insp_id = data.semi_prdt_qlty_insp_id
    result = await axios
      .get('/api/semiPrdtQltyInspInferSearch', { params })
      .catch((err) => console.log(err))
    modaldata.value.detailData = result.data
    modaldata.value.searchParams = data
    console.log(modaldata.value)
    openSemiQltyInspModal()
    semiModalRef.value?.selectOrdr(modaldata.value)
  }
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
  max-height: calc(46px + 10 * 46px + 2px);
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

.btn-detail {
  font-size: 12px !important;
  padding: 0.35rem 0.8rem !important;
  min-width: 70px !important;
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

/* ============================================
   커스텀 셀렉트 박스
   ============================================ */
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #334155;
}

.custom-select:hover {
  border-color: #cbd5e1;
}

.custom-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.custom-select span {
  flex: 1;
}

.custom-select svg {
  flex-shrink: 0;
}

.custom-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: -1.5px;
}

.custom-option {
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #334155;
  font-size: 13px;
  border: none;
}

.custom-option:hover {
  background-color: #f1f5f9;
  color: #000000ff;
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

  .form-input-enhanced,
  .custom-select {
    font-size: 12px !important;
    height: 38px !important;
    padding: 0.55rem 0.75rem !important;
  }

  :deep(.btn) {
    font-size: 12px !important;
    padding: 0.5rem 1.1rem !important;
  }

  .btn-detail {
    font-size: 11px !important;
    padding: 0.3rem 0.7rem !important;
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
    max-height: calc(42px + 10 * 42px + 2px) !important;
  }
}
</style>