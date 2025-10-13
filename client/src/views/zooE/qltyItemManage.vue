<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 조회/초기화/저장/삭제 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="handleSearch">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset">초기화</CButton>
      <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
      <CButton color="danger" size="sm" @click="handleDelete">삭제</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-2">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">항목코드</CFormLabel>
          <CFormInput v-model="formData.itemCode" size="sm" placeholder="입력해주세요" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">항목명</CFormLabel>
          <CFormInput v-model="formData.itemName" size="sm" placeholder="입력해주세요" />
        </CCol>
        <CCol :md="2">
          <CFormLabel class="form-label">타입</CFormLabel>
          <CFormSelect v-model="formData.type" size="sm">
            <option value="">선택</option>
            <option value="정량">정량</option>
            <option value="미달">미달</option>
          </CFormSelect>
        </CCol>
        <CCol :md="2">
          <CFormLabel class="form-label">버전</CFormLabel>
          <CFormInput v-model="formData.version" size="sm" placeholder="예: 1.0" />
        </CCol>
        <CCol :md="2">
          <CFormLabel class="form-label">상태</CFormLabel>
          <CFormSelect v-model="formData.status" size="sm">
            <option value="active">사용</option>
            <option value="inactive">미사용</option>
          </CFormSelect>
        </CCol>
        <CCol :md="2">
          <CFormLabel class="form-label">기준치</CFormLabel>
          <CFormInput v-model="formData.standard" size="sm" placeholder="입력" />
        </CCol>
        <CCol :md="2">
          <CFormLabel class="form-label">오차범위</CFormLabel>
          <CFormInput v-model="formData.tolerance" size="sm" placeholder="입력" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">등록일</CFormLabel>
          <CFormInput type="date" v-model="formData.createdAt" size="sm" />
        </CCol>
      </CRow>
    </div>

    <!-- 신규/저장/삭제 버튼 -->
    <div class="d-flex justify-content-end gap-2 mb-2">
      <CButton color="secondary" size="sm" @click="handleNew">신규</CButton>
      <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
      <CButton color="danger" size="sm" @click="handleDelete">삭제</CButton>
    </div>

    <!-- 메인 컨텐츠 영역: 그리드 테이블 -->
    <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
      <div class="table-wrapper">
        <CTable bordered hover class="data-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style="width: 50px;">
                <CFormCheck 
                  :checked="isAllChecked" 
                  @change="handleToggleAll" 
                />
              </CTableHeaderCell>
              <CTableHeaderCell>품목코드</CTableHeaderCell>
              <CTableHeaderCell>품목명</CTableHeaderCell>
              <CTableHeaderCell>담당자명</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <!-- 데이터 행 -->
            <CTableRow v-for="(item, index) in displayedData" :key="index">
              <CTableDataCell class="text-center checkbox-cell">
                <CFormCheck v-model="item.checked" />
              </CTableDataCell>
              <CTableDataCell>{{ item.productCode }}</CTableDataCell>
              <CTableDataCell>{{ item.productName }}</CTableDataCell>
              <CTableDataCell>{{ item.manager }}</CTableDataCell>
            </CTableRow>
            <!-- 빈 행 채우기 (10행 고정) -->
            <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
              <CTableDataCell colspan="4">&nbsp;</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// ============================================
// 데이터 정의
// ============================================

// 상단 폼 데이터
const formData = reactive({
  itemCode: '',
  itemName: '',
  type: '',
  version: '',
  status: 'active',
  standard: '',
  tolerance: '',
  createdAt: ''
})

// 그리드 데이터
const gridData = ref([
  {
    checked: false,
    productCode: 'P001',
    productName: '품목 A',
    manager: '홍길동'
  },
  {
    checked: false,
    productCode: 'P002',
    productName: '품목 B',
    manager: '이몽룡'
  },
  {
    checked: false,
    productCode: 'P003',
    productName: '품목 C',
    manager: '성춘향'
  }
])

// ============================================
// Computed (계산된 속성)
// ============================================

// 화면에 표시할 데이터 (최대 10개)
const displayedData = computed(() => gridData.value.slice(0, 10))

// 빈 행 개수 (10행 고정을 위해)
const emptyRowCount = computed(() => Math.max(0, 10 - displayedData.value.length))

// 전체 선택 체크 상태
const isAllChecked = computed(() => {
  return displayedData.value.length > 0 && displayedData.value.every(item => item.checked)
})

// ============================================
// 메서드 (이벤트 핸들러)
// ============================================

// 조회 버튼 클릭
const handleSearch = () => {
  console.log('조회:', formData)
}

// 초기화 버튼 클릭
const handleReset = () => {
  Object.assign(formData, {
    itemCode: '',
    itemName: '',
    type: '',
    version: '',
    status: 'active',
    standard: '',
    tolerance: '',
    createdAt: ''
  })
  // 모든 체크 해제
  gridData.value.forEach(item => item.checked = false)
}

// 신규 버튼 클릭
const handleNew = () => {
  handleReset()
}

// 저장 버튼 클릭
const handleSave = () => {
  console.log('저장:', formData)
}

// 삭제 버튼 클릭 (체크된 항목 삭제)
const handleDelete = () => {
  gridData.value = gridData.value.filter(item => !item.checked)
}

// 전체 선택/해제 토글
const handleToggleAll = (event) => {
  const checked = event.target.checked
  displayedData.value.forEach(item => item.checked = checked)
}
</script>

<style scoped>
/* ============================================
   전역 스타일 - 2025 Modern Design
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

/* 전체 컨테이너 - 흰색 배경 */
:deep(.container-fluid) {
  background: #ffffff;
  padding: 1rem !important;
  height: 100vh;
  overflow: hidden;
}

/* 검색 필터 박스 - 얇은 회색 테두리 */
.search-filter-box {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background: #ffffff;
}

/* 그리드 박스 - 얇은 회색 테두리 */
.grid-box {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

/* ============================================
   버튼 스타일 - Modern & Clean
   ============================================ */
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

:deep(.btn-danger) {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: #fff !important;
}

:deep(.btn-danger:hover) {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

:deep(.btn:active) {
  transform: translateY(0);
}

/* ============================================
   폼 요소 스타일 - Clean & Modern
   ============================================ */
:deep(.form-label) {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  letter-spacing: -0.2px;
}

:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}

:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}

:deep(input[type="date"]) {
  font-size: 12px;
}

/* 검색 필터 영역 압축 */
:deep(.g-3) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
}

/* ============================================
   체크박스 스타일
   ============================================ */
:deep(.form-check-input) {
  cursor: pointer;
  width: 18px;
  height: 18px;
  border: 2px solid #6c757d;
}

:deep(.form-check-input:checked) {
  background-color: #6c757d;
  border-color: #6c757d;
}

.checkbox-cell {
  background-color: #f8f9fa;
}

/* ============================================
   테이블 스타일 - Modern & Clean
   ============================================ */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.data-table th) {
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  letter-spacing: -0.2px;
}

:deep(.data-table th:first-child) {
  border-top-left-radius: 10px;
}

:deep(.data-table th:last-child) {
  border-top-right-radius: 10px;
}

:deep(.data-table td) {
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
}

:deep(.data-table tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr:hover:not(.empty-row)) {
  background-color: #f8f9fa;
  transform: scale(1.005);
}

/* 빈 행 스타일 */
.empty-row td {
  height: 34px;
  background-color: #fafbfc;
}

/* ============================================
   스크롤바 스타일
   ============================================ */
.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 8px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #adb5bd;
  border-radius: 8px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #868e96;
}

/* 간격 조정 */
:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

:deep(.gap-2) {
  gap: 0.5rem !important;
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 1600px) {
  :deep(.form-label),
  :deep(.form-control),
  :deep(.form-select),
  :deep(.btn),
  :deep(th),
  :deep(td) {
    font-size: 11px !important;
  }
  
  :deep(.btn) {
    padding: 0.4rem 1rem;
  }
}
</style>