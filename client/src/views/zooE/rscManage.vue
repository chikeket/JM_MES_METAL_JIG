<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="handleSearch">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-2">
      <CRow class="g-3">
        <CCol :md="4">
          <CFormLabel class="form-label">자재명</CFormLabel>
          <CFormInput v-model="searchFilters.materialName" size="sm" placeholder="입력해주세요" />
        </CCol>
        <CCol :md="4">
          <CFormLabel class="form-label">자재분류타입</CFormLabel>
          <CFormInput v-model="searchFilters.materialType" size="sm" placeholder="입력해주세요" />
        </CCol>
      </CRow>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2">
      
      <!-- 좌측: 데이터 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden">
        <!-- 높이 맞추기용 투명 버튼 영역 -->
        <div class="button-spacer mb-2">
          <CButton color="secondary" size="sm">신규</CButton>
          <CButton color="secondary" size="sm">저장</CButton>
          <CButton color="danger" size="sm">삭제</CButton>
        </div>
        
        <!-- 그리드 테이블 -->
        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>자재코드</CTableHeaderCell>
                  <CTableHeaderCell>자재분류타입</CTableHeaderCell>
                  <CTableHeaderCell>자재명</CTableHeaderCell>
                  <CTableHeaderCell>규격</CTableHeaderCell>
                  <CTableHeaderCell>수량단위</CTableHeaderCell>
                  <CTableHeaderCell>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <!-- 데이터 행 -->
                <CTableRow
                  v-for="(item, index) in displayedData"
                  :key="index"
                  @click="handleRowSelect(item, index)"
                  :class="{ 'selected-row': selectedRowIndex === index }"
                >
                  <CTableDataCell class="text-end">{{ item.materialCode }}</CTableDataCell>
                  <CTableDataCell>{{ item.materialType }}</CTableDataCell>
                  <CTableDataCell>{{ item.materialName }}</CTableDataCell>
                  <CTableDataCell>{{ item.spec }}</CTableDataCell>
                  <CTableDataCell>{{ item.unit }}</CTableDataCell>
                  <CTableDataCell>{{ item.remark }}</CTableDataCell>
                </CTableRow>
                <!-- 빈 행 채우기 (10행 고정) -->
                <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="6">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden">
        <!-- 신규/저장/삭제 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="handleNew">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
          <CButton color="danger" size="sm" @click="handleDelete">삭제</CButton>
        </div>

        <!-- 입력 폼 (2열 구조) -->
        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="p-3 flex-grow-1 overflow-auto">
            <CRow>
              <!-- 좌측 열 -->
              <CCol :md="6">
                <CRow class="mb-2" v-for="field in leftFields" :key="field.key">
                  <CCol :md="4" class="text-end pe-2">
                    <CFormLabel class="form-label pt-1">{{ field.label }}</CFormLabel>
                  </CCol>
                  <CCol :md="8" class="ps-2">
                    <CFormInput
                      v-model="formData[field.key]"
                      size="sm"
                      placeholder="입력해주세요"
                    />
                  </CCol>
                </CRow>
              </CCol>

              <!-- 우측 열 -->
              <CCol :md="6">
                <CRow class="mb-2" v-for="field in rightFields" :key="field.key">
                  <CCol :md="4" class="text-end pe-2">
                    <CFormLabel class="form-label pt-1">{{ field.label }}</CFormLabel>
                  </CCol>
                  <CCol :md="8" class="ps-2">
                    <CFormInput
                      v-model="formData[field.key]"
                      size="sm"
                      placeholder="입력해주세요"
                    />
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </div>
        </div>
      </CCol>
    </CRow>

  </CContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// ============================================
// 데이터 정의
// ============================================

// 검색 필터
const searchFilters = reactive({
  materialName: '',
  materialType: ''
})

// 입력 폼 데이터
const formData = reactive({
  materialCode: '',
  materialType: '',
  materialName: '',
  spec: '',
  unit: '',
  remark: ''
})

// 폼 필드 정의 (좌측)
const leftFields = [
  { key: 'materialCode', label: '자재코드' },
  { key: 'materialType', label: '자재분류타입' },
  { key: 'materialName', label: '자재명' }
]

// 폼 필드 정의 (우측)
const rightFields = [
  { key: 'spec', label: '규격' },
  { key: 'unit', label: '수량단위' },
  { key: 'remark', label: '비고' }
]

// 그리드 데이터
const gridData = ref([
  {
    materialCode: 'M001',
    materialType: '원자재',
    materialName: '철판',
    spec: '200x200',
    unit: 'EA',
    remark: '테스트용'
  },
  {
    materialCode: 'M002',
    materialType: '부자재',
    materialName: '볼트',
    spec: 'M8x20',
    unit: 'EA',
    remark: ''
  }
])

// 선택된 행 인덱스
const selectedRowIndex = ref(null)

// ============================================
// Computed (계산된 속성)
// ============================================

// 필터링된 데이터
const filteredData = computed(() => {
  return gridData.value.filter(item => {
    const matchName = !searchFilters.materialName || item.materialName.includes(searchFilters.materialName)
    const matchType = !searchFilters.materialType || item.materialType.includes(searchFilters.materialType)
    return matchName && matchType
  })
})

// 화면에 표시할 데이터 (최대 10개)
const displayedData = computed(() => filteredData.value.slice(0, 10))

// 빈 행 개수 (10행 고정을 위해)
const emptyRowCount = computed(() => Math.max(0, 10 - displayedData.value.length))

// ============================================
// 메서드 (이벤트 핸들러)
// ============================================

// 조회 버튼 클릭
const handleSearch = () => {
  selectedRowIndex.value = null
}

// 초기화 버튼 클릭
const handleReset = () => {
  searchFilters.materialName = ''
  searchFilters.materialType = ''
  selectedRowIndex.value = null
}

// 그리드 행 선택
const handleRowSelect = (item, index) => {
  Object.assign(formData, item)
  selectedRowIndex.value = index
}

// 폼 데이터 초기화
const resetFormData = () => {
  Object.assign(formData, {
    materialCode: '',
    materialType: '',
    materialName: '',
    spec: '',
    unit: '',
    remark: ''
  })
  selectedRowIndex.value = null
}

// 신규 버튼 클릭
const handleNew = () => {
  resetFormData()
}

// 저장 버튼 클릭
const handleSave = () => {
  const existingIndex = gridData.value.findIndex(item => item.materialCode === formData.materialCode)
  
  if (existingIndex >= 0) {
    // 기존 데이터 업데이트
    gridData.value[existingIndex] = { ...formData }
  } else {
    // 신규 데이터 추가
    const newCode = 'M' + String(gridData.value.length + 1).padStart(3, '0')
    gridData.value.push({ ...formData, materialCode: newCode })
  }
  
  resetFormData()
}

// 삭제 버튼 클릭
const handleDelete = () => {
  const existingIndex = gridData.value.findIndex(item => item.materialCode === formData.materialCode)
  
  if (existingIndex >= 0) {
    gridData.value.splice(existingIndex, 1)
  }
  
  resetFormData()
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

/* 폼 박스 - 얇은 회색 테두리 */
.form-box {
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

/* 높이 맞추기용 투명 버튼 영역 */
.button-spacer {
  visibility: hidden;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  height: 38px;
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

/* 검색 필터 영역 압축 */
:deep(.g-3) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
}

/* ============================================
   테이블 스타일 - Modern & Clean
   ============================================ */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 350px);
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
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr:hover:not(.empty-row)) {
  background-color: #f8f9fa;
  transform: scale(1.005);
}

/* 선택된 행 스타일 - 모던 그레이 테마 */
:deep(.selected-row) {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%) !important;
  font-weight: 600;
  box-shadow: inset 0 0 0 2px #6c757d;
}

:deep(.selected-row td) {
  border-bottom: 2px solid #495057;
  color: #212529;
}

/* 빈 행 스타일 */
.empty-row td {
  height: 34px;
  background-color: #fafbfc;
}

/* ============================================
   스크롤바 스타일
   ============================================ */
.table-wrapper::-webkit-scrollbar,
:deep(.overflow-auto)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track,
:deep(.overflow-auto)::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 8px;
}

.table-wrapper::-webkit-scrollbar-thumb,
:deep(.overflow-auto)::-webkit-scrollbar-thumb {
  background: #adb5bd;
  border-radius: 8px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover,
:deep(.overflow-auto)::-webkit-scrollbar-thumb:hover {
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