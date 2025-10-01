<template>
  <CContainer fluid class="h-100 d-flex flex-column p-0 m-0">
    <CCard class="flex-grow-1 d-flex flex-column overflow-hidden m-0 h-100">
      <CCardBody class="p-2 d-flex flex-column overflow-hidden flex-grow-1">

        <!-- 상단 조회/초기화 버튼 -->
        <div class="d-flex justify-content-end mb-2 gap-2">
          <CButton color="secondary" size="sm" @click="handleSearch">조회</CButton>
          <CButton color="secondary" size="sm" @click="handleReset">초기화</CButton>
        </div>

        <!-- 검색 필터 영역 -->
        <CCard class="mb-2">
          <CCardBody>
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
          </CCardBody>
        </CCard>

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
            <CCard class="flex-grow-1 overflow-hidden d-flex flex-column">
              <CCardBody class="p-0 d-flex flex-column">
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
              </CCardBody>
            </CCard>
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
            <CCard class="flex-grow-1 d-flex flex-column overflow-hidden">
              <CCardBody class="p-3 flex-grow-1 overflow-auto">
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
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

      </CCardBody>
    </CCard>
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
   전역 스타일
   ============================================ */
:deep(*) {
  font-family: '맑은 고딕', 'Malgun Gothic', sans-serif;
  line-height: 1.4;
  box-sizing: border-box;
  color: #000;
}

/* ============================================
   버튼 스타일
   ============================================ */
:deep(.btn) {
  font-size: 11px;
  color: #fff !important;
  padding: 0.5rem 2rem;
}

/* 높이 맞추기용 투명 버튼 영역 */
.button-spacer {
  visibility: hidden;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ============================================
   폼 요소 스타일
   ============================================ */
:deep(.form-label) {
  font-size: 11px;
  font-weight: normal;
  color: #444;
  margin-bottom: 0;
}

:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
  font-weight: normal;
  padding: 0.25rem 0.5rem;
}

/* ============================================
   테이블 스타일
   ============================================ */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: collapse;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 1;
}

:deep(.data-table th) {
  font-size: 12px;
  font-weight: bold;
  background-color: #e9ecef;
  color: #212529;
  text-align: center;
}

:deep(.data-table td) {
  font-size: 11px;
  vertical-align: middle;
}

:deep(.data-table tbody tr) {
  cursor: pointer;
}

/* 선택된 행 스타일 */
:deep(.selected-row) {
  background-color: #d9edf7 !important;
}

/* 빈 행 스타일 */
.empty-row td {
  height: 32px;
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 768px) {
  :deep(.form-label),
  :deep(.form-control),
  :deep(.form-select),
  :deep(.btn),
  :deep(th),
  :deep(td) {
    font-size: 11px !important;
  }
}
</style>