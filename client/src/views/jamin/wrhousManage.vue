<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3 page-container">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2 button-group">
      <CButton color="secondary" size="sm" @click="searchWrhous" class="btn-search">조회</CButton>
      <CButton color="secondary" size="sm" @click="resetSearch" class="btn-reset">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4 fade-in-up" style="animation-delay: 0.1s">
      <CRow class="g-3 align-items-center">
        <CCol :md="3">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">창고 ID</CFormLabel>
            <CFormInput v-model="searchForm.wrhous_id" size="sm" class="form-input-search" />
          </div>
        </CCol>
        <CCol :md="3">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">창고명</CFormLabel>
            <CFormInput v-model="searchForm.wrhous_nm" size="sm" class="form-input-search" />
          </div>
        </CCol>
        <CCol :md="3">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">품목 유형</CFormLabel>
            <div class="custom-select-wrapper">
              <div class="custom-select" @click="toggleItemTypeDropdown" ref="itemTypeSelect">
                <span>{{ getItemTypeDisplayText(searchForm.item_ty) }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                  <path fill="#495057" d="M6 9L1 4h10z" />
                </svg>
              </div>
              <div v-if="showItemTypeDropdown" class="custom-dropdown">
                <div class="custom-option" @click="selectItemType('')">전체</div>
                <div class="custom-option" @click="selectItemType('E1')">자재</div>
                <div class="custom-option" @click="selectItemType('E2')">반제품</div>
                <div class="custom-option" @click="selectItemType('E3')">완제품</div>
              </div>
            </div>
          </div>
        </CCol>
        <CCol :md="3">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">상태</CFormLabel>
            <div class="custom-select-wrapper">
              <div class="custom-select" @click="toggleStatusDropdown" ref="statusSelect">
                <span>{{ getStatusDisplayText(searchForm.st) }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                  <path fill="#495057" d="M6 9L1 4h10z" />
                </svg>
              </div>
              <div v-if="showStatusDropdown" class="custom-dropdown">
                <div class="custom-option" @click="selectStatus('')">전체</div>
                <div class="custom-option" @click="selectStatus('M1')">활성</div>
                <div class="custom-option" @click="selectStatus('M2')">비활성</div>
              </div>
            </div>
          </div>
        </CCol>
      </CRow>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2 fade-in-up" style="animation-delay: 0.2s">
      <!-- 좌측: 데이터 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden pe-1">
        <div class="d-flex gap-2 mb-2">
          <CButton color="secondary" size="sm" class="btn-hidden" style="visibility: hidden">숨김</CButton>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 10%">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 18%">창고 ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 22%">창고명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 18%">품목 유형</CTableHeaderCell>
                  <CTableHeaderCell style="width: 12%">상태</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in displayedData"
                  :key="item.wrhous_id"
                  @click="selectWrhous(item, index)"
                  :class="{ 'selected-row': selectedRowIndex === index }"
                  class="data-row"
                >
                  <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.wrhous_id }}</CTableDataCell>
                  <CTableDataCell>{{ item.wrhous_nm }}</CTableDataCell>
                  <CTableDataCell>{{ getItemTypeLabel(item.item_ty) }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <span :class="['status-badge', item.st === 'M1' ? 'status-active' : 'status-inactive']">
                      {{ item.st === 'M1' ? '활성' : '비활성' }}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>{{ item.rm || '' }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="6">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden ps-1">
        <div class="d-flex gap-2 justify-content-end mb-2">
          <CButton color="secondary" size="sm" @click="resetForm" class="btn-action">신규</CButton>
          <CButton color="secondary" size="sm" @click="saveWrhous" class="btn-action">저장</CButton>
          <CButton color="danger" size="sm" @click="deleteWrhous" :disabled="!selectedWrhous" class="btn-action">삭제</CButton>
        </div>
        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="p-3 flex-grow-1" style="overflow: visible !important; padding-top: 2rem !important">
            <CRow class="g-2" style="width: 100%; margin-top: 0">
              <CCol :md="12">
                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">창고 ID</CFormLabel>
                  <CFormInput 
                    v-model="formData.wrhous_id" 
                    size="sm" 
                    disabled 
                    class="form-input-compact" 
                    placeholder="자동 생성"
                  />
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">창고명</CFormLabel>
                  <CFormInput 
                    v-model="formData.wrhous_nm" 
                    size="sm" 
                    class="form-input-compact" 
                  />
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">품목 유형</CFormLabel>
                  <div class="custom-select-wrapper" style="width: 230px;">
                    <div class="custom-select custom-select-form" @click="toggleFormItemTypeDropdown" ref="formItemTypeSelect">
                      <span>{{ getItemTypeDisplayText(formData.item_ty) || '선택하세요' }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                        <path fill="#495057" d="M6 9L1 4h10z" />
                      </svg>
                    </div>
                    <div v-if="showFormItemTypeDropdown" class="custom-dropdown">
                      <div class="custom-option" @click="selectFormItemType('')">선택하세요</div>
                      <div class="custom-option" @click="selectFormItemType('E1')">자재</div>
                      <div class="custom-option" @click="selectFormItemType('E2')">반제품</div>
                      <div class="custom-option" @click="selectFormItemType('E3')">완제품</div>
                    </div>
                  </div>
                </div>

                <div class="form-row-horizontal mb-3" style="align-items: flex-start">
                  <CFormLabel class="form-label-inline" style="padding-top: 0.5rem; min-width: 80px">상태</CFormLabel>
                  <div class="radio-group-horizontal">
                    <CFormCheck 
                      type="radio" 
                      name="status" 
                      label="활성" 
                      value="M1" 
                      v-model="formData.st" 
                      class="radio-item-inline" 
                    />
                    <CFormCheck 
                      type="radio" 
                      name="status" 
                      label="비활성" 
                      value="M2" 
                      v-model="formData.st" 
                      class="radio-item-inline" 
                    />
                  </div>
                </div>

                <div class="form-row-horizontal mb-3" style="align-items: flex-start">
                  <CFormLabel class="form-label-inline" style="padding-top: 0.5rem; min-width: 80px">비고</CFormLabel>
                  <CFormTextarea 
                    v-model="formData.rm" 
                    rows="6" 
                    class="form-textarea-compact"
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
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import axios from 'axios'

const searchForm = reactive({
  wrhous_id: '',
  wrhous_nm: '',
  item_ty: '',
  st: ''
})

const showItemTypeDropdown = ref(false)
const showStatusDropdown = ref(false)
const showFormItemTypeDropdown = ref(false)
const itemTypeSelect = ref(null)
const statusSelect = ref(null)
const formItemTypeSelect = ref(null)

const wrhousData = ref([])
const selectedWrhous = ref(null)
const selectedRowIndex = ref(null)

const formData = reactive({
  wrhous_id: '',
  wrhous_nm: '',
  item_ty: '',
  st: 'M1',
  rm: ''
})

const isEditMode = ref(false)

const displayedData = computed(() => {
  return wrhousData.value.slice(0, 10)
})

const emptyRowCount = computed(() => {
  const dataCount = displayedData.value.length
  return dataCount < 10 ? 10 - dataCount : 0
})

const toggleItemTypeDropdown = () => {
  showItemTypeDropdown.value = !showItemTypeDropdown.value
  showStatusDropdown.value = false
  showFormItemTypeDropdown.value = false
}

const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value
  showItemTypeDropdown.value = false
  showFormItemTypeDropdown.value = false
}

const toggleFormItemTypeDropdown = () => {
  showFormItemTypeDropdown.value = !showFormItemTypeDropdown.value
  showItemTypeDropdown.value = false
  showStatusDropdown.value = false
}

const selectItemType = (value) => {
  searchForm.item_ty = value
  showItemTypeDropdown.value = false
}

const selectStatus = (value) => {
  searchForm.st = value
  showStatusDropdown.value = false
}

const selectFormItemType = (value) => {
  formData.item_ty = value
  showFormItemTypeDropdown.value = false
}

const getItemTypeDisplayText = (value) => {
  if (value === 'E1') return '자재'
  if (value === 'E2') return '반제품'
  if (value === 'E3') return '완제품'
  return '전체'
}

const getStatusDisplayText = (value) => {
  if (value === 'M1') return '활성'
  if (value === 'M2') return '비활성'
  return '전체'
}

const handleClickOutside = (event) => {
  if (itemTypeSelect.value && !itemTypeSelect.value.contains(event.target)) {
    showItemTypeDropdown.value = false
  }
  if (statusSelect.value && !statusSelect.value.contains(event.target)) {
    showStatusDropdown.value = false
  }
  if (formItemTypeSelect.value && !formItemTypeSelect.value.contains(event.target)) {
    showFormItemTypeDropdown.value = false
  }
}

const searchWrhous = async () => {
  try {
    console.log('[wrhousManage] 조회 조건:', searchForm)
    const response = await axios.get('/api/wrhousManage', {
      params: searchForm
    })
    wrhousData.value = response.data
    selectedRowIndex.value = null
    console.log('[wrhousManage] 조회 결과:', response.data)
  } catch (error) {
    console.error('[wrhousManage] 조회 에러:', error)
    alert('창고 목록 조회 중 오류가 발생했습니다.')
  }
}

const resetSearch = () => {
  searchForm.wrhous_id = ''
  searchForm.wrhous_nm = ''
  searchForm.item_ty = ''
  searchForm.st = ''
  selectedRowIndex.value = null
  wrhousData.value = []
  resetForm()
}

const selectWrhous = (item, index) => {
  selectedWrhous.value = item
  selectedRowIndex.value = index
  isEditMode.value = true
  
  formData.wrhous_id = item.wrhous_id
  formData.wrhous_nm = item.wrhous_nm
  formData.item_ty = item.item_ty || ''
  formData.st = item.st
  formData.rm = item.rm || ''
}

const resetForm = () => {
  selectedWrhous.value = null
  selectedRowIndex.value = null
  isEditMode.value = false
  
  formData.wrhous_id = ''
  formData.wrhous_nm = ''
  formData.item_ty = ''
  formData.st = 'M1'
  formData.rm = ''
}

const saveWrhous = async () => {
  try {
    if (!formData.wrhous_nm.trim()) {
      alert('창고명을 입력해주세요.')
      return
    }

    console.log('[wrhousManage] 저장 데이터:', formData)
    
    const response = await axios.post('/api/wrhousManage', formData)
    
    if (response.data.success) {
      alert(isEditMode.value ? '창고 정보가 수정되었습니다.' : '새 창고가 등록되었습니다.')
      await searchWrhous()
      resetForm()
    }
  } catch (error) {
    console.error('[wrhousManage] 저장 에러:', error)
    alert('창고 저장 중 오류가 발생했습니다.')
  }
}

const deleteWrhous = async () => {
  if (!selectedWrhous.value) {
    alert('삭제할 창고를 선택해주세요.')
    return
  }

  if (!confirm(`창고 '${selectedWrhous.value.wrhous_nm}'를 삭제하시겠습니까?`)) {
    return
  }

  try {
    console.log('[wrhousManage] 삭제 ID:', selectedWrhous.value.wrhous_id)
    
    const response = await axios.delete(`/api/wrhousManage/${selectedWrhous.value.wrhous_id}`)
    
    if (response.data.success) {
      alert('창고가 삭제되었습니다.')
      await searchWrhous()
      resetForm()
    }
  } catch (error) {
    console.error('[wrhousManage] 삭제 에러:', error)
    alert('창고 삭제 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const getItemTypeLabel = (itemType) => {
  const itemTypeMap = {
    'E1': '자재',
    'E2': '반제품', 
    'E3': '완제품'
  }
  return itemTypeMap[itemType] || itemType || ''
}
</script>

<style scoped>
.page-container {
  animation: pageLoad 0.5s ease-out;
}

@keyframes pageLoad {
  from { opacity: 0; }
  to { opacity: 1; }
}

.button-group {
  animation: fadeInDown 0.4s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
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

.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 100;
}

.grid-box, .form-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-height: calc(46px + 10 * 46px + 2px);
}

.form-box {
  display: flex;
  flex-direction: column;
  z-index: 1;
  overflow: visible !important;
}

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

:deep(.btn:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.form-row-horizontal {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: flex-start;
  margin-bottom: 1.1rem;
}

.form-label-inline {
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0;
  letter-spacing: -0.2px;
  min-width: 80px;
  white-space: nowrap;
  text-align: right;
}

.form-input-compact {
  font-size: 11px;
  font-weight: 400;
  padding: 0.3rem 0.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 28px;
  width: 230px;
  max-width: 230px;
}

.form-input-compact:focus {
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  background-color: #ffffff;
  outline: none;
}

.form-input-compact:disabled {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.form-textarea-compact {
  font-size: 11px;
  font-weight: 400;
  padding: 0.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  width: 230px;
  max-width: 230px;
  resize: vertical;
}

.form-textarea-compact:focus {
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  background-color: #ffffff;
  outline: none;
}

.radio-group-horizontal {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-direction: row;
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

.custom-select-wrapper {
  position: relative;
  width: 100%;
  z-index: 50;
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

.custom-select-form {
  font-size: 11px;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  height: 28px;
  width: 230px;
}

.custom-select:hover {
  border-color: #94a3b8;
}

.custom-select span {
  flex: 1;
}

.custom-select svg {
  flex-shrink: 0;
}

.custom-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
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
  padding: 0.75rem 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #334155;
  font-size: 13px;
  border-radius: 8px;
  margin: 6px 8px;
}

.custom-option:first-child {
  margin-top: 8px;
}

.custom-option:last-child {
  margin-bottom: 8px;
}

.custom-option:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #1e293b;
  transform: translateX(2px);
}

.table-wrapper {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  scrollbar-gutter: stable;
}

.table-wrapper::-webkit-scrollbar {
  width: 16px;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.table-wrapper::-webkit-scrollbar-track {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 6px 0;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.05);
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  border-radius: 12px;
  border: 3px solid #f1f5f9;
  box-shadow: 
    0 3px 10px rgba(71, 85, 105, 0.25),
    inset 0 1px 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-color: #e2e8f0;
  box-shadow: 
    0 5px 15px rgba(71, 85, 105, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scaleX(1.15);
}

.table-wrapper::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  border-width: 2px;
  box-shadow: 
    0 2px 8px rgba(30, 41, 59, 0.5),
    inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

.table-wrapper::-webkit-scrollbar-button {
  display: none;
}

.table-wrapper {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
}

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
  background: #e5e7eb !important;
  font-weight: 600;
  box-shadow: inset 4px 0 0 0 #6b7280, 0 4px 12px rgba(107, 114, 128, 0.3) !important;
}

:deep(.selected-row td) {
  border-bottom: 1px solid #d1d5db !important;
  color: #1f2937 !important;
}

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.1px;
}

.status-active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
}

.status-inactive {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: #ffffff;
}

:deep(.form-check-input:checked) {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
}

:deep(.form-check-input:checked:hover) {
  background-color: #b91c1c !important;
  border-color: #b91c1c !important;
}

:deep(.form-check-input:focus) {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.25) !important;
}

.search-row-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.search-label-fixed {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0;
  letter-spacing: -0.2px;
  min-width: 70px;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}

.search-row-container .custom-select-wrapper,
.search-row-container .form-input-search {
  flex: 1;
  min-width: 0;
}

.form-input-search {
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

.form-input-search:focus {
  border-color: #6b7280;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  background-color: #ffffff;
  outline: none;
}
</style>