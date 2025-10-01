<template>
  <CContainer fluid class="h-100 d-flex flex-column p-0 m-0">
    <CCard class="flex-grow-1 d-flex flex-column overflow-hidden m-0 h-100">
      <CCardBody class="p-2 d-flex flex-column overflow-hidden flex-grow-1">

        <!-- 상단 조회/초기화/저장/삭제 버튼 -->
        <div class="d-flex justify-content-end mb-2 gap-2">
          <CButton color="secondary" size="sm" @click="handleSearch">조회</CButton>
          <CButton color="secondary" size="sm" @click="handleReset">초기화</CButton>
          <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
          <CButton color="danger" size="sm" @click="handleDelete">삭제</CButton>
        </div>

        <!-- 검색 필터 영역 -->
        <CCard class="mb-2">
          <CCardBody>
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
          </CCardBody>
        </CCard>

        <!-- 신규/저장/삭제 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="handleNew">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
          <CButton color="danger" size="sm" @click="handleDelete">삭제</CButton>
        </div>

        <!-- 메인 컨텐츠 영역: 그리드 테이블 -->
        <CCard class="flex-grow-1 overflow-hidden d-flex flex-column">
          <CCardBody class="p-0 d-flex flex-column">
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
          </CCardBody>
        </CCard>

      </CCardBody>
    </CCard>
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

/* ============================================
   폼 요소 스타일
   ============================================ */
:deep(.form-label) {
  font-size: 11px;
  font-weight: normal;
  color: #444;
  margin-bottom: 4px;
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
   체크박스 스타일
   ============================================ */
:deep(.form-check-input) {
  cursor: pointer;
}

.checkbox-cell {
  background-color: #f8f9fa;
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
  min-height: 320px;
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