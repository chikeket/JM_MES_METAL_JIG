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
    <CCol :md="3">
      <CFormLabel class="form-label">업체유형</CFormLabel>
      <div class="custom-select-wrapper">
        <div class="custom-select" @click="toggleTypeDropdown" ref="typeSelect">
          <span>{{ getTypeDisplayText(searchFilters.type) }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
            <path fill="#6c757d" d="M6 9L1 4h10z"/>
          </svg>
        </div>
        <div v-if="showTypeDropdown" class="custom-dropdown">
          <div class="custom-option" @click="selectType('')">전체</div>
          <div class="custom-option" @click="selectType('VENDOR')">공급업체</div>
          <div class="custom-option" @click="selectType('CUSTOMER')">고객사</div>
        </div>
      </div>
    </CCol>
    <CCol :md="4">
      <CFormLabel class="form-label">업체명</CFormLabel>
      <CFormInput v-model="searchFilters.name" size="sm" placeholder="입력해주세요" />
    </CCol>
    <CCol :md="3">
      <CFormLabel class="form-label">상태</CFormLabel>
      <div class="custom-select-wrapper">
        <div class="custom-select" @click="toggleStatusDropdown" ref="statusSelect">
          <span>{{ getStatusDisplayText(searchFilters.status) }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
            <path fill="#6c757d" d="M6 9L1 4h10z"/>
          </svg>
        </div>
        <div v-if="showStatusDropdown" class="custom-dropdown">
          <div class="custom-option" @click="selectStatus('')">전체</div>
          <div class="custom-option" @click="selectStatus('ACT')">활성</div>
          <div class="custom-option" @click="selectStatus('INA')">비활성</div>
        </div>
      </div>
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
                      <CTableHeaderCell style="width: 15%;">업체 ID</CTableHeaderCell>
                      <CTableHeaderCell style="width: 15%;">업체유형</CTableHeaderCell>
                      <CTableHeaderCell style="width: 30%;">업체명</CTableHeaderCell>
                      <CTableHeaderCell style="width: 15%;">대표자명</CTableHeaderCell>
                      <CTableHeaderCell style="width: 15%;">담당자명</CTableHeaderCell>
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

            <!-- 입력 폼 -->
            <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
              <div class="p-3 flex-grow-1 overflow-auto">
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
                      :placeholder="getPlaceholder(field.key)"
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
              </div>
            </div>
          </CCol>
        </CRow>

  </CContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

const searchFilters = reactive({
  type: '',
  name: '',
  status: ''
})

const showTypeDropdown = ref(false)
const showStatusDropdown = ref(false)
const typeSelect = ref(null)
const statusSelect = ref(null)

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

const getPlaceholder = (key) => {
  switch (key) {
    case 'id': return 'C001'
    case 'businessNo': return '114-86-65214'
    case 'name': return '스타쉽엔터테인먼트'
    case 'ceo': return '이진성'
    case 'email': return 'cs@starship-square.com'
    case 'ceoPhone': return '02-592-4000'
    case 'regDate': return '2025-10-11'
    case 'managerName': return '장원영'
    case 'managerPhone': return '010-0000-0000'
    default: return '입력해주세요'
  }
}

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
const gridData = ref([])
const selectedRowIndex = ref(null)
const originalId = ref('')

// 표시할 데이터 (최대 10행)
const displayedData = computed(() => {
  return gridData.value.slice(0, 10)
})

// 빈 행 개수 계산
const emptyRowCount = computed(() => {
  const dataCount = displayedData.value.length
  return dataCount < 10 ? 10 - dataCount : 0
})

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  handleSearch()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// ============================================
// 메서드
// ============================================

// 커스텀 셀렉트 관련
const toggleTypeDropdown = () => {
  showTypeDropdown.value = !showTypeDropdown.value
  showStatusDropdown.value = false
}

const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value
  showTypeDropdown.value = false
}

const selectType = (value) => {
  searchFilters.type = value
  showTypeDropdown.value = false
}

const selectStatus = (value) => {
  searchFilters.status = value
  showStatusDropdown.value = false
}

const getTypeDisplayText = (value) => {
  if (value === 'VENDOR') return '공급업체'
  if (value === 'CUSTOMER') return '고객사'
  return '전체'
}

const getStatusDisplayText = (value) => {
  if (value === 'ACT') return '활성'
  if (value === 'INA') return '비활성'
  return '전체'
}

const handleClickOutside = (event) => {
  if (typeSelect.value && !typeSelect.value.contains(event.target)) {
    showTypeDropdown.value = false
  }
  if (statusSelect.value && !statusSelect.value.contains(event.target)) {
    showStatusDropdown.value = false
  }
}

// 검색
const handleSearch = async () => {
  const params = {
    type: searchFilters.type || '',
    name: searchFilters.name || '',
    status: searchFilters.status || '',
  }
  console.log('검색 파라미터:', params)
  
  try {
    let result = await axios.get('/api/co_list_view', { params })
    console.log('조회 결과:', result.data)
    gridData.value = result.data
    selectedRowIndex.value = null
  } catch (error) {
    console.error('조회 오류:', error)
    gridData.value = []
  }
}

// 초기화
const handleReset = () => {
  searchFilters.type = ''
  searchFilters.name = ''
  searchFilters.status = ''
  selectedRowIndex.value = null
  gridData.value = []
}

// 폼 초기화
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

// 행 선택
const handleRowSelect = (item, index) => {
  formData.id = item.id
  formData.businessNo = item.businessNo
  formData.name = item.name
  formData.ceo = item.ceo
  formData.ceoPhone = item.ceoPhone
  formData.type = item.type === 'CUSTOMER' ? 'customer' : 'supplier'
  formData.status = item.status === 'ACT' ? 'active' : 'inactive'
  
  originalId.value = item.id
  selectedRowIndex.value = index
}
// 신규
const handleNew = () => {
  resetFormData()
}

// 저장
const handleSave = async () => {
  console.log('=== 저장 시작 ===')
  
  if (!formData.name || !formData.ceo) {
    alert('업체명과 대표자명은 필수 입력 항목입니다.')
    return
  }

  try {
    const sendData = {
      co_id: formData.id,
      bizr_reg_no: formData.businessNo,
      co_nm: formData.name,
      rpstr_nm: formData.ceo,
      rpstr_tel: formData.ceoPhone,
      co_ty_id: formData.type === 'customer' ? 'CUSTOMER' : 'VENDOR',
      st: formData.status === 'active' ? 'ACT' : 'INA'
    }

    console.log('전송 데이터:', sendData)

    let response
    if (originalId.value) {
      // 수정: 기존 ID를 별도로 전송
      sendData.original_co_id = originalId.value
      response = await axios.post('/api/coUpdate', sendData)
    } else {
      // 신규
      response = await axios.post('/api/coInsert', sendData)
    }

    console.log('서버 응답:', response.data)

    if (response.data.isSuccessed) {
      alert(response.data.message)
      await handleSearch()
      resetFormData()
    } else {
      alert(response.data.message)
    }

  } catch (error) {
    console.error('저장 오류:', error)
    alert('저장 중 오류가 발생했습니다.')
  }
}
// 삭제
const handleDelete = async () => {
  if (!formData.id) {
    alert('삭제할 데이터를 선택해주세요.')
    return
  }

  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    const response = await axios.post('/api/coDelete', { co_id: formData.id })
    
    if (response.data.isSuccessed) {
      alert(response.data.message)
      await handleSearch()
      resetFormData()
    }
  } catch (error) {
    console.error('삭제 오류:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 라벨 반환
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

:deep(input[type="date"]) {
  font-size: 12px;
}

/* 검색 필터 영역 압축 */
:deep(.g-3) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
}

/* ============================================
   커스텀 셀렉트박스 스타일
   ============================================ */
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  height: 34px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.custom-select:hover {
  border-color: #dee2e6;
  background-color: #ffffff;
}

.custom-select svg {
  margin-left: 8px;
  flex-shrink: 0;
}

.custom-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-option {
  padding: 0.5rem 0.75rem;
  font-size: 12px;
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-option:hover {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
}

.custom-option:active {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #ffffff;
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
  width: 80px !important;
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
  user-select: none;
  cursor: default;
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
   모던 스크롤바 스타일 (Smooth & Elegant)
   ============================================ */
.table-wrapper,
:deep(.overflow-auto) {
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

/* 스크롤바 너비 - 10px → 14px로 변경 */
.table-wrapper::-webkit-scrollbar,
:deep(.overflow-auto)::-webkit-scrollbar {
  width: 14px;
}

/* 스크롤바 트랙 (배경) - 더 진한 회색 */
.table-wrapper::-webkit-scrollbar-track,
:deep(.overflow-auto)::-webkit-scrollbar-track {
  background: #e9ecef;
  border-radius: 10px;
  margin: 4px 0;
}

/* 스크롤바 썸 (움직이는 부분) - 더 진하고 굵게 */
.table-wrapper::-webkit-scrollbar-thumb,
:deep(.overflow-auto)::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #6c757d 0%, #495057 100%);
  border-radius: 10px;
  border: 3px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 스크롤바 호버 - 더욱 진하게 */
.table-wrapper::-webkit-scrollbar-thumb:hover,
:deep(.overflow-auto)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #495057 0%, #343a40 100%);
  border-color: #dee2e6;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

/* Firefox 대응 */
.table-wrapper,
:deep(.overflow-auto) {
  scrollbar-width: auto;
  scrollbar-color: #6c757d #e9ecef;
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