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
import { ref, reactive, computed, onMounted } from 'vue'

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

// 그리드 데이터 (localStorage 연동)
const gridData = ref([])

onMounted(() => {
  const savedData = localStorage.getItem('gridData')
  if (savedData) {
    gridData.value = JSON.parse(savedData)
  } else {
    // 기본 샘플 데이터
    gridData.value = [
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
    ]
  }
})

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
  
  // localStorage 확인용 로그
  console.log('현재 localStorage 데이터:', localStorage.getItem('gridData'))
}

// 선택된 원본 ID를 추적하기 위한 변수
const originalId = ref('')

// 그리드 행 선택
const handleRowSelect = (item, index) => {
  // 독립적인 복사본 생성하여 formData에 할당
  Object.assign(formData, { ...item })
  // 원본 ID 저장
  originalId.value = item.id
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
  originalId.value = ''
  selectedRowIndex.value = null
}

// 신규 버튼 클릭
const handleNew = () => {
  resetFormData()
}

// 저장 버튼 클릭
const handleSave = () => {
  // 필수 입력값 검증
  if (!formData.name || !formData.ceo) {
    alert('업체명과 대표자명은 필수 입력 항목입니다.')
    return
  }

  // ID가 변경되었는지 확인
  const isIdChanged = originalId.value && originalId.value !== formData.id

  // 변경된 ID가 이미 존재하는지 확인
  if (isIdChanged) {
    const isDuplicate = gridData.value.some(item => item.id === formData.id)
    if (isDuplicate) {
      alert(`업체 ID "${formData.id}"는 이미 존재합니다. 다른 ID를 입력해주세요.`)
      return
    }
  }

  // 원본 ID로 기존 데이터 찾기
  const existingIndex = gridData.value.findIndex(item => item.id === originalId.value)
  
  if (existingIndex >= 0) {
    // 기존 데이터 수정
    if (isIdChanged) {
      // ID가 변경된 경우: 기존 데이터 삭제하고 새 데이터 추가
      gridData.value.splice(existingIndex, 1)
      gridData.value.push({ ...formData })
      alert('업체 ID가 변경되어 저장되었습니다.')
    } else {
      // ID가 변경되지 않은 경우: 그 자리에서 수정
      gridData.value[existingIndex] = { ...formData }
      alert('수정되었습니다.')
    }
  } else {
    // 신규 데이터 추가
    if (!formData.id) {
      // ID가 없으면 자동 생성
      const maxId = gridData.value.reduce((max, item) => {
        const num = parseInt(item.id.replace(/\D/g, ''))
        return num > max ? num : max
      }, 0)
      formData.id = 'C' + String(maxId + 1).padStart(3, '0')
    } else {
      // ID가 입력된 경우 중복 체크
      const isDuplicate = gridData.value.some(item => item.id === formData.id)
      if (isDuplicate) {
        alert(`업체 ID "${formData.id}"는 이미 존재합니다. 다른 ID를 입력해주세요.`)
        return
      }
    }
    gridData.value.push({ ...formData })
    alert('저장되었습니다.')
  }

  // localStorage에 항상 저장
  localStorage.setItem('gridData', JSON.stringify(gridData.value))
  resetFormData()
}

// 삭제 버튼 클릭
const handleDelete = () => {
  if (!formData.id) {
    alert('삭제할 데이터를 선택해주세요.')
    return
  }

  if (!confirm('정말 삭제하시겠습니까?')) {
    return
  }

  const existingIndex = gridData.value.findIndex(item => item.id === formData.id)
  
  if (existingIndex >= 0) {
    gridData.value.splice(existingIndex, 1)
    alert('삭제되었습니다.')
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
   전역 스타일 - 2025 Modern Design
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

/* 전체 컨테이너 높이 조정 */
:deep(.container-fluid) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 0.75rem !important;
  height: 100vh;
  overflow: hidden;
}

:deep(.card) {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #ffffff;
  transition: all 0.3s ease;
  height: 100%;
}

:deep(.card:hover) {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

:deep(.card-body) {
  padding: 1rem;
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

:deep(input[type="date"]) {
  font-size: 12px;
}

/* 검색 필터 영역 압축 */
:deep(.g-3) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
}

/* ============================================
   라디오 버튼 스타일 - Modern
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
  width: 18px !important;
  height: 18px !important;
  margin: 0 6px 0 0 !important;
  flex-shrink: 0 !important;
  cursor: pointer;
  border: 2px solid #6c757d;
}

:deep(.radio-item .form-check-input:checked) {
  background-color: #6c757d;
  border-color: #6c757d;
}

:deep(.radio-item .form-check-label) {
  font-size: 12px !important;
  font-weight: 500 !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 18px !important;
  white-space: nowrap !important;
  cursor: pointer;
  color: #2c3e50;
}

/* 폼 행 간격 줄이기 */
:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

/* ============================================
   테이블 스타일 - Modern & Clean
   ============================================ */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  border-radius: 10px;
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
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr:hover) {
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

/* 우측 폼 영역 높이 조정 */
:deep(.overflow-auto) {
  max-height: calc(100vh - 280px);
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