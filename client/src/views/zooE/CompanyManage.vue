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
              <CCol :md="3">
                <CFormLabel class="form-label">업체유형</CFormLabel>
                <CFormSelect v-model="searchFilters.type" size="sm">
                  <option value="">전체</option>
                  <option value="customer">고객사</option>
                  <option value="supplier">공급업체</option>
                </CFormSelect>
              </CCol>
              <CCol :md="4">
                <CFormLabel class="form-label">업체명</CFormLabel>
                <CFormInput v-model="searchFilters.name" size="sm" placeholder="입력해주세요" />
              </CCol>
              <CCol :md="3">
                <CFormLabel class="form-label">상태</CFormLabel>
                <CFormSelect v-model="searchFilters.status" size="sm">
                  <option value="">전체</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </CFormSelect>
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
                        <CTableHeaderCell>업체 ID</CTableHeaderCell>
                        <CTableHeaderCell>업체유형</CTableHeaderCell>
                        <CTableHeaderCell>업체명</CTableHeaderCell>
                        <CTableHeaderCell>대표자명</CTableHeaderCell>
                        <CTableHeaderCell>담당자명</CTableHeaderCell>
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
                        <CTableDataCell class="text-end">{{ item.id }}</CTableDataCell>
                        <CTableDataCell>{{ getTypeLabel(item.type) }}</CTableDataCell>
                        <CTableDataCell>{{ item.name }}</CTableDataCell>
                        <CTableDataCell>{{ item.ceo }}</CTableDataCell>
                        <CTableDataCell>{{ item.managerName }}</CTableDataCell>
                      </CTableRow>
                      <!-- 빈 행 채우기 (10행 고정) -->
                      <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                        <CTableDataCell colspan="5">&nbsp;</CTableDataCell>
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

            <!-- 입력 폼 -->
            <CCard class="flex-grow-1 d-flex flex-column overflow-hidden">
              <CCardBody class="p-3 flex-grow-1 overflow-auto">
                <CRow class="mb-2" v-for="field in formFields" :key="field.key">
                  <CCol :md="3" class="text-end pe-2">
                    <CFormLabel class="form-label pt-1">{{ field.label }}</CFormLabel>
                  </CCol>
                  <CCol :md="8" class="ps-3">
                    <!-- 일반 텍스트 입력 -->
                    <CFormInput
                      v-if="field.type === 'text'"
                      v-model="formData[field.key]"
                      size="sm"
                      placeholder="입력해주세요"
                    />
                    <!-- 날짜 입력 -->
                    <CFormInput
                      v-else-if="field.type === 'date'"
                      v-model="formData[field.key]"
                      type="date"
                      size="sm"
                    />
                    <!-- 라디오 버튼 -->
                    <div v-else-if="field.type === 'radio'" class="radio-group">
                      <CFormCheck
                        v-for="option in field.options"
                        :key="option.value"
                        type="radio"
                        :name="field.key"
                        :label="option.label"
                        :value="option.value"
                        v-model="formData[field.key]"
                        inline
                        class="radio-item"
                      />
                    </div>
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
  type: '',
  name: '',
  status: ''
})

// 입력 폼 데이터
const formData = reactive({
  id: '',
  businessNo: '',
  name: '',
  ceo: '',
  email: '',
  ceoPhone: '',
  regDate: '',
  managerName: '',
  managerPhone: '',
  type: 'customer',
  status: 'active'
})

// 폼 필드 정의 (순서 및 타입)
const formFields = [
  { key: 'id', label: '업체 ID', type: 'text' },
  { key: 'businessNo', label: '사업자 등록번호', type: 'text' },
  { key: 'name', label: '업체명', type: 'text' },
  { key: 'ceo', label: '대표자명', type: 'text' },
  { key: 'email', label: '대표 이메일', type: 'text' },
  { key: 'ceoPhone', label: '대표 연락처', type: 'text' },
  { key: 'regDate', label: '등록일자', type: 'date' },
  { key: 'managerName', label: '담당자명', type: 'text' },
  { key: 'managerPhone', label: '담당자 연락처', type: 'text' },
  {
    key: 'type',
    label: '업체유형',
    type: 'radio',
    options: [
      { label: '고객사', value: 'customer' },
      { label: '공급업체', value: 'supplier' }
    ]
  },
  {
    key: 'status',
    label: '상태',
    type: 'radio',
    options: [
      { label: '활성', value: 'active' },
      { label: '비활성', value: 'inactive' }
    ]
  }
]

// 그리드 데이터
const gridData = ref([
  {
    id: 'C001',
    businessNo: '123-45-67890',
    name: '삼성전자',
    ceo: '홍길동',
    email: 'hong@test.com',
    ceoPhone: '010-1111-1111',
    regDate: '2025-09-30',
    managerName: '김부장',
    managerPhone: '010-1234-5678',
    type: 'customer',
    status: 'active'
  },
  {
    id: 'C002',
    businessNo: '987-65-43210',
    name: 'LG전자',
    ceo: '김철수',
    email: 'kim@test.com',
    ceoPhone: '010-2222-2222',
    regDate: '2025-09-30',
    managerName: '박대리',
    managerPhone: '010-2345-6789',
    type: 'supplier',
    status: 'inactive'
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
    const matchType = !searchFilters.type || item.type === searchFilters.type
    const matchName = !searchFilters.name || item.name.includes(searchFilters.name)
    const matchStatus = !searchFilters.status || item.status === searchFilters.status
    return matchType && matchName && matchStatus
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
  searchFilters.type = ''
  searchFilters.name = ''
  searchFilters.status = ''
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
    id: '',
    businessNo: '',
    name: '',
    ceo: '',
    email: '',
    ceoPhone: '',
    regDate: '',
    managerName: '',
    managerPhone: '',
    type: 'customer',
    status: 'active'
  })
  selectedRowIndex.value = null
}

// 신규 버튼 클릭
const handleNew = () => {
  resetFormData()
}

// 저장 버튼 클릭
const handleSave = () => {
  const existingIndex = gridData.value.findIndex(item => item.id === formData.id)
  
  if (existingIndex >= 0) {
    // 기존 데이터 업데이트
    gridData.value[existingIndex] = { ...formData }
  } else {
    // 신규 데이터 추가
    const newId = 'C' + String(gridData.value.length + 1).padStart(3, '0')
    gridData.value.push({ ...formData, id: newId })
  }
  
  resetFormData()
}

// 삭제 버튼 클릭
const handleDelete = () => {
  const existingIndex = gridData.value.findIndex(item => item.id === formData.id)
  
  if (existingIndex >= 0) {
    gridData.value.splice(existingIndex, 1)
  }
  
  resetFormData()
}

// 업체유형 라벨 반환
const getTypeLabel = (type) => {
  return type === 'customer' ? '고객사' : '공급업체'
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

:deep(input[type="date"]) {
  font-size: 12px;
}

/* ============================================
   라디오 버튼 스타일
   ============================================ */
.radio-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

:deep(.radio-item) {
  display: flex !important;
  align-items: center !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
}

:deep(.radio-item .form-check-input) {
  width: 16px !important;
  height: 16px !important;
  margin: 0 6px 0 0 !important;
  flex-shrink: 0 !important;
  cursor: pointer;
}

:deep(.radio-item .form-check-label) {
  font-size: 11px !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 16px !important;
  white-space: nowrap !important;
  cursor: pointer;
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