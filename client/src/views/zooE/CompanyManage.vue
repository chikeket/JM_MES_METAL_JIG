<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <div class="d-flex justify-content-end mb-3 gap-2">
      <CButton color="secondary" size="sm" @click="handleSearch" class="btn-search">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset" class="btn-reset">초기화</CButton>
    </div>
    
    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-3">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">업체유형</CFormLabel>
          <div class="custom-select-wrapper">
            <div class="custom-select" @click="toggleTypeDropdown" ref="typeSelect">
              <span>{{ getTypeDisplayText(searchFilters.type) }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                <path fill="#495057" d="M6 9L1 4h10z" />
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
          <CFormInput
            v-model="searchFilters.name"
            size="sm"
            class="form-input-enhanced"
          />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">상태</CFormLabel>
          <div class="custom-select-wrapper">
            <div class="custom-select" @click="toggleStatusDropdown" ref="statusSelect">
              <span>{{ getStatusDisplayText(searchFilters.status) }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                <path fill="#495057" d="M6 9L1 4h10z" />
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
      <CCol :md="7" class="d-flex flex-column overflow-hidden pe-1">
        <!-- 히든 버튼 (우측 버튼과 높이 맞추기) -->
        <div class="d-flex gap-2 mb-2" style="min-height: 50px; align-items: center; padding: 0.8rem 0;">
          <CButton color="secondary" size="sm" class="btn-hidden" style="visibility: hidden;">숨김</CButton>
        </div>
        
        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 12%">업체 ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">업체유형</CTableHeaderCell>
                  <CTableHeaderCell style="width: 35%">업체명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 18%">대표자명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">담당자명</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in displayedData"
                  :key="index"
                  @click="handleRowSelect(item, index)"
                  :class="{ 'selected-row': selectedRowIndex === index }"
                  class="data-row"
                >
                  <CTableDataCell class="text-center">{{ item.id }}</CTableDataCell>
                  <CTableDataCell>{{ getTypeLabel(item.type) }}</CTableDataCell>
                  <CTableDataCell>{{ item.name }}</CTableDataCell>
                  <CTableDataCell>{{ item.ceo }}</CTableDataCell>
                  <CTableDataCell>{{ item.managerName }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="5">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 -->
      <CCol :md="5" class="d-flex flex-column overflow-hidden ps-1">
        <!-- 버튼 그룹 -->
        <div class="d-flex gap-2 justify-content-end mb-2" style="min-height: 50px; align-items: center; padding: 0.8rem 0;">
          <CButton color="secondary" size="sm" @click="handleNew" class="btn-action">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleSave" class="btn-action">저장</CButton>
          <CButton color="danger" size="sm" @click="handleDelete" class="btn-action">삭제</CButton>
        </div>
        
        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="p-3 flex-grow-1 overflow-auto">
            <CRow class="g-3">
              <!-- 좌측 열: 입력 필드들 -->
              <CCol :md="7">
                <div v-for="field in leftFormFields" :key="field.key" class="form-row-horizontal mb-2">
                  <CFormLabel class="form-label-inline">{{ field.label }}</CFormLabel>
                  <!-- 일반 텍스트 입력 -->
                  <CFormInput
                    v-if="field.type === 'text'"
                    v-model="formData[field.key]"
                    size="sm"
                    :placeholder="getPlaceholder(field.key)"
                    :disabled="field.key === 'id'"
                    class="form-input-enhanced"
                  />
                  <!-- 날짜 입력 -->
                  <CFormInput
                    v-else-if="field.type === 'date'"
                    v-model="formData[field.key]"
                    type="date"
                    size="sm"
                    class="form-input-enhanced"
                  />
                </div>
              </CCol>

              <!-- 우측 열: 라디오 버튼들 -->
              <CCol :md="5" class="d-flex flex-column justify-content-center">
                <div v-for="field in rightFormFields" :key="field.key" class="mb-4">
                  <CFormLabel class="form-label-radio">{{ field.label }}</CFormLabel>
                  <div class="radio-group-horizontal">
                    <CFormCheck
                      v-for="option in field.options"
                      :key="option.value"
                      type="radio"
                      :name="field.key"
                      :label="option.label"
                      :value="option.value"
                      v-model="formData[field.key]"
                      class="radio-item-inline"
                    />
                  </div>
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
  status: '',
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
  status: 'active',
})

const getPlaceholder = (key) => {
  switch (key) {
    case 'id':
      return 'CO001'
    case 'businessNo':
      return '114-86-65214'
    case 'name':
      return '업체명을 입력해주세요'
    case 'ceo':
      return '대표자명을 입력해주세요'
    case 'email':
      return 'example@company.com'
    case 'ceoPhone':
      return '02-0000-0000'
    case 'regDate':
      return '2025-10-11'
    case 'managerName':
      return '담당자명을 입력해주세요'
    case 'managerPhone':
      return '010-0000-0000'
    default:
      return '입력해주세요'
  }
}

const leftFormFields = [
  { key: 'id', label: '업체 ID', type: 'text' },
  { key: 'businessNo', label: '사업자 등록번호', type: 'text' },
  { key: 'name', label: '업체명', type: 'text' },
  { key: 'ceo', label: '대표자명', type: 'text' },
  { key: 'email', label: '대표 이메일', type: 'text' },
  { key: 'ceoPhone', label: '대표 연락처', type: 'text' },
  { key: 'regDate', label: '등록일자', type: 'date' },
  { key: 'managerName', label: '담당자명', type: 'text' },
  { key: 'managerPhone', label: '담당자 연락처', type: 'text' },
]

const rightFormFields = [
  {
    key: 'type',
    label: '업체유형',
    type: 'radio',
    options: [
      { label: '고객사', value: 'customer' },
      { label: '공급업체', value: 'supplier' },
    ],
  },
  {
    key: 'status',
    label: '상태',
    type: 'radio',
    options: [
      { label: '활성', value: 'active' },
      { label: '비활성', value: 'inactive' },
    ],
  },
]

const gridData = ref([])
const selectedRowIndex = ref(null)
const originalId = ref('')

const displayedData = computed(() => {
  return gridData.value.slice(0, 10)
})

const emptyRowCount = computed(() => {
  const dataCount = displayedData.value.length
  return dataCount < 10 ? 10 - dataCount : 0
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

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

const handleSearch = async () => {
  const params = {
    type: searchFilters.type || '',
    name: searchFilters.name || '',
    status: searchFilters.status || '',
  }

  try {
    let result = await axios.get('/api/co_list_view', { params })
    gridData.value = (result.data || []).sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, '')) || 0
      const numB = parseInt(b.id.replace(/\D/g, '')) || 0
      return numA - numB
    })
    selectedRowIndex.value = null
  } catch (error) {
    console.error('조회 오류:', error)
    gridData.value = []
  }
}

const handleReset = () => {
  searchFilters.type = ''
  searchFilters.name = ''
  searchFilters.status = ''
  selectedRowIndex.value = null
  gridData.value = []
}

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
    status: 'active',
  })
  originalId.value = ''
  selectedRowIndex.value = null
}

const getNextId = () => {
  console.log('현재 그리드 데이터:', gridData.value)
  console.log('그리드 데이터 개수:', gridData.value.length)
  
  if (gridData.value.length > 0) {
    const lastId = gridData.value[gridData.value.length - 1].id
    console.log('마지막 ID:', lastId)
    const match = lastId.match(/^CO(\d+)$/)
    
    if (match) {
      const lastNumber = parseInt(match[1])
      const nextNumber = lastNumber + 1
      const newId = `CO${String(nextNumber).padStart(3, '0')}`
      console.log('생성된 새 ID:', newId)
      return newId
    }
  }
  console.log('데이터 없음, CO001 반환')
  return 'CO001'
}

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

const handleNew = () => {
  resetFormData()
  formData.id = getNextId()
}

const handleSave = async () => {
  if (!formData.name || !formData.ceo) {
    alert('업체명과 대표자명은 필수 입력 항목입니다.')
    return
  }

  try {
    const sendData = {
      bizr_reg_no: formData.businessNo,
      co_nm: formData.name,
      rpstr_nm: formData.ceo,
      rpstr_tel: formData.ceoPhone,
      co_ty_id: formData.type === 'customer' ? 'CUSTOMER' : 'VENDOR',
      st: formData.status === 'active' ? 'ACT' : 'INA',
    }

    let response
    if (originalId.value) {
      // 수정 시에만 co_id 포함
      sendData.co_id = formData.id
      sendData.original_co_id = originalId.value
      response = await axios.post('/api/coUpdate', sendData)
    } else {
      // 신규 등록 시에는 co_id를 보내지 않음 (서버에서 자동 생성)
      response = await axios.post('/api/coInsert', sendData)
    }

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

const getTypeLabel = (type) => {
  return type === 'CUSTOMER' ? '고객사' : '공급업체'
}
</script>

<style scoped>
/* ============================================
   기본 설정 및 컨테이너
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

:deep(.container-fluid) {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  padding: 1.5rem !important;
  height: 100vh;
  overflow: hidden;
  width: 100%;
}

/* ============================================
   검색 필터 박스
   ============================================ */
.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.25rem;
}

/* ============================================
   그리드 박스와 폼 박스 - 고정 높이 (10개 행)
   ============================================ */
.grid-box, .form-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  height: calc(46px + 10 * 46px + 2px);
}

.form-box {
  display: flex;
  flex-direction: column;
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

:deep(.btn-danger) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff !important;
}

:deep(.btn-danger:hover) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
  transform: translateY(-1px);
}

:deep(.btn:active) {
  transform: scale(0.98);
}

/* ============================================
   폼 요소 - 가로 배치 스타일
   ============================================ */
.form-row-horizontal {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.form-label-inline {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0;
  letter-spacing: -0.2px;
  min-width: 110px;
  white-space: nowrap;
  text-align: right;
}

.form-label-radio {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
  display: block;
}

.form-input-enhanced {
  font-size: 13px;
  font-weight: 400;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 38px;
  width: 180px;
  max-width: 180px;
}

.form-input-enhanced:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: #ffffff;
  outline: none;
}

.form-input-enhanced:disabled {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

/* ============================================
   라디오 버튼 - 가로 배치
   ============================================ */
.radio-group-horizontal {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.radio-item-inline {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

:deep(.radio-item-inline .form-check-input) {
  margin-right: 0.4rem;
  cursor: pointer;
}

:deep(.radio-item-inline .form-check-label) {
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 0;
}

/* ============================================
   기존 폼 요소 (검색 필터용)
   ============================================ */
:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

:deep(.form-control),
:deep(.form-select) {
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

:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}

:deep(.form-control:disabled) {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

:deep(.g-3) {
  --bs-gutter-y: 0.75rem;
  --bs-gutter-x: 1rem;
}

:deep(.g-2) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.5rem;
}

:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

:deep(.mb-3) {
  margin-bottom: 1rem !important;
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
}

.custom-option {
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #334155;
  font-size: 13px;
}

.custom-option:hover {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.custom-option:first-child {
  border-top: none;
}

/* ============================================
   테이블 래퍼
   ============================================ */
.table-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.table-wrapper::-webkit-scrollbar {
  width: 14px;
  background: #ffffff;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #ffffff;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #9ca3af 0%, #6b7280 100%);
  border-radius: 10px;
  border: 3px solid #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 100%);
  border-color: #ffffff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.table-wrapper::-webkit-scrollbar-button:single-button {
  display: block;
  height: 20px;
  background-color: #ffffff;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
}

.table-wrapper::-webkit-scrollbar-button:single-button:vertical:decrement {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 4L2 8h8z'/%3E%3C/svg%3E");
  margin-top: 46px;
}

.table-wrapper::-webkit-scrollbar-button:single-button:vertical:increment {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  margin-bottom: 46px;
}

.table-wrapper::-webkit-scrollbar-button:single-button:hover {
  background-color: #f3f4f6;
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
  width: 100%;
  display: table;
  table-layout: fixed;
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

:deep(.selected-row) {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
  font-weight: 600;
  box-shadow: inset 0 0 0 2px #3b82f6;
}

:deep(.selected-row td) {
  border-bottom: 1px solid #93c5fd;
  color: #1e40af;
}

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* ============================================
   간격 조정
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

:deep(.text-primary) {
  color: #3b82f6 !important;
}

/* ============================================
   반응형 디자인
   ============================================ */
@media (max-width: 1600px) {
  .form-label-inline,
  .form-label-radio {
    font-size: 12px !important;
  }

  .form-input-enhanced {
    font-size: 12px !important;
    height: 36px !important;
    padding: 0.5rem 0.65rem !important;
    width: 160px !important;
    max-width: 160px !important;
  }

  :deep(.radio-item-inline .form-check-label) {
    font-size: 12px !important;
  }

  :deep(.form-label) {
    font-size: 12px !important;
  }

  :deep(.form-control),
  :deep(.form-select) {
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

  .grid-box,
  .form-box {
    height: calc(42px + 10 * 42px + 2px) !important;
  }
}
</style>