<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <div class="d-flex justify-content-end mb-3 gap-2">
      <CButton color="secondary" size="sm" @click="handleSearch" class="btn-search">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset" class="btn-reset">초기화</CButton>
    </div>
    
    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-3">
      <CRow class="g-3">
        <CCol :md="4">
          <CFormLabel class="form-label">항목코드</CFormLabel>
          <CFormInput
            v-model="searchFilters.itemCode"
            size="sm"
            placeholder="입력해주세요"
            class="form-input-enhanced"
          />
        </CCol>
        <CCol :md="4">
          <CFormLabel class="form-label">항목명</CFormLabel>
          <CFormInput
            v-model="searchFilters.itemName"
            size="sm"
            placeholder="입력해주세요"
            class="form-input-enhanced"
          />
        </CCol>
        <CCol :md="4">
          <CFormLabel class="form-label">타입</CFormLabel>
          <CFormInput
            v-model="searchFilters.type"
            size="sm"
            placeholder="입력해주세요"
            class="form-input-enhanced"
          />
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
                  <CTableHeaderCell style="width: 12%">항목코드</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">항목명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 12%">타입</CTableHeaderCell>
                  <CTableHeaderCell style="width: 10%">버전</CTableHeaderCell>
                  <CTableHeaderCell style="width: 10%">상태</CTableHeaderCell>
                  <CTableHeaderCell style="width: 12%">기준치</CTableHeaderCell>
                  <CTableHeaderCell style="width: 12%">규격</CTableHeaderCell>
                  <CTableHeaderCell style="width: 12%">단위</CTableHeaderCell>
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
                  <CTableDataCell class="text-end text-primary">{{ item.qlty_item_mng_id }}</CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.insp_item_nm" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.ty" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.ver" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <select v-model="item.st" class="cell-input" @click.stop>
                      <option value="ACT">사용</option>
                      <option value="INACT">미사용</option>
                    </select>
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.basi_val" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.spec" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.unit" class="cell-input" @click.stop />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="8">&nbsp;</CTableDataCell>
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
                  <CFormInput
                    v-if="field.type === 'text'"
                    v-model="formData[field.key]"
                    size="sm"
                    :placeholder="field.placeholder"
                    :disabled="field.key === 'itemCode'"
                    class="form-input-enhanced"
                  />
                  <CFormInput
                    v-else-if="field.type === 'number'"
                    v-model="formData[field.key]"
                    type="number"
                    size="sm"
                    :placeholder="field.placeholder"
                    class="form-input-enhanced"
                  />
                  <CFormInput
                    v-else-if="field.type === 'date'"
                    v-model="formData[field.key]"
                    type="date"
                    size="sm"
                    class="form-input-enhanced"
                  />
                  <CFormTextarea
                    v-else-if="field.type === 'textarea'"
                    v-model="formData[field.key]"
                    size="sm"
                    rows="2"
                    :placeholder="field.placeholder"
                    class="form-input-enhanced"
                    style="height: auto; width: 180px; max-width: 180px;"
                  />
                </div>
              </CCol>

              <!-- 우측 열: 상태 라디오 버튼 -->
              <CCol :md="5" class="d-flex flex-column justify-content-center">
                <div class="mb-4">
                  <CFormLabel class="form-label-radio">상태</CFormLabel>
                  <div class="radio-group-horizontal">
                    <CFormCheck
                      type="radio"
                      name="status"
                      label="사용"
                      value="ACT"
                      v-model="formData.status"
                      class="radio-item-inline"
                    />
                    <CFormCheck
                      type="radio"
                      name="status"
                      label="미사용"
                      value="INACT"
                      v-model="formData.status"
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
  itemCode: '',
  itemName: '',
  type: '',
})

const formData = reactive({
  itemCode: '',
  itemName: '',
  type: '',
  version: '',
  status: 'ACT',
  standard: '',
  spec: '',
  unit: '',
  errorMin: '',
  errorMax: '',
  regDate: '',
  remark: '',
})

const leftFormFields = [
  { key: 'itemCode', label: '항목코드', type: 'text', placeholder: 'QI001' },
  { key: 'itemName', label: '항목명', type: 'text', placeholder: '항목명을 입력해주세요' },
  { key: 'type', label: '타입', type: 'text', placeholder: '정량/정성' },
  { key: 'version', label: '버전', type: 'text', placeholder: 'v1.0' },
  { key: 'standard', label: '기준치', type: 'text', placeholder: '기준치' },
  { key: 'spec', label: '규격', type: 'text', placeholder: '규격' },
  { key: 'unit', label: '단위', type: 'text', placeholder: 'EA' },
  { key: 'errorMin', label: '오차범위(최소)', type: 'number', placeholder: '0' },
  { key: 'errorMax', label: '오차범위(최대)', type: 'number', placeholder: '0' },
  { key: 'regDate', label: '등록일', type: 'date', placeholder: '' },
  { key: 'remark', label: '비고', type: 'textarea', placeholder: '비고를 입력해주세요' },
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

const handleClickOutside = (event) => {
  // 필요시 드롭다운 처리용
}

const handleSearch = async () => {
  const params = {
    qlty_item_mng_id: searchFilters.itemCode || '',
    insp_item_nm: searchFilters.itemName || '',
    ty: searchFilters.type || '',
  }

  try {
    let result = await axios.get('/api/qlty_item_list_view', { params })
    gridData.value = (result.data || []).sort((a, b) => {
      const numA = parseInt(a.qlty_item_mng_id.replace(/\D/g, '')) || 0
      const numB = parseInt(b.qlty_item_mng_id.replace(/\D/g, '')) || 0
      return numA - numB
    })
    selectedRowIndex.value = null
  } catch (error) {
    console.error('조회 오류:', error)
    gridData.value = []
  }
}

const handleReset = () => {
  searchFilters.itemCode = ''
  searchFilters.itemName = ''
  searchFilters.type = ''
  selectedRowIndex.value = null
  gridData.value = []
}

const resetFormData = () => {
  Object.assign(formData, {
    itemCode: '',
    itemName: '',
    type: '',
    version: '',
    status: 'ACT',
    standard: '',
    spec: '',
    unit: '',
    errorMin: '',
    errorMax: '',
    regDate: '',
    remark: '',
  })
  originalId.value = ''
  selectedRowIndex.value = null
}

const getNextId = () => {
  console.log('현재 그리드 데이터:', gridData.value)
  console.log('그리드 데이터 개수:', gridData.value.length)
  
  if (gridData.value.length > 0) {
    const lastId = gridData.value[gridData.value.length - 1].qlty_item_mng_id
    console.log('마지막 ID:', lastId)
    const match = lastId.match(/^QI(\d+)$/)
    
    if (match) {
      const lastNumber = parseInt(match[1])
      const nextNumber = lastNumber + 1
      const newId = `QI${String(nextNumber).padStart(3, '0')}`
      console.log('생성된 새 ID:', newId)
      return newId
    }
  }
  console.log('데이터 없음, QI001 반환')
  return 'QI001'
}

const handleRowSelect = (item, index) => {
  formData.itemCode = item.qlty_item_mng_id
  formData.itemName = item.insp_item_nm
  formData.type = item.ty
  formData.version = item.ver
  formData.status = item.st
  formData.standard = item.basi_val
  formData.spec = item.spec
  formData.unit = item.unit
  formData.errorMin = item.eror_scope_min
  formData.errorMax = item.eror_scope_max
  formData.regDate = item.reg_dt
  formData.remark = item.rmrk || ''

  originalId.value = item.qlty_item_mng_id
  selectedRowIndex.value = index
}

const handleNew = () => {
  resetFormData()
  formData.itemCode = getNextId()
  formData.regDate = new Date().toISOString().split('T')[0]
}

const handleSave = async () => {
  if (!formData.itemName) {
    alert('항목명은 필수 입력 항목입니다.')
    return
  }

  try {
    const sendData = {
      insp_item_nm: formData.itemName,
      ty: formData.type || '',
      ver: formData.version || '',
      st: formData.status || 'ACT',
      basi_val: formData.standard || '',
      spec: formData.spec || '',
      unit: formData.unit || '',
      eror_scope_min: formData.errorMin || '',
      eror_scope_max: formData.errorMax || '',
      reg_dt: formData.regDate || new Date().toISOString().split('T')[0],
      rmrk: formData.remark || '',
    }

    let response
    if (originalId.value) {
      sendData.qlty_item_mng_id = formData.itemCode
      sendData.original_qlty_item_mng_id = originalId.value
      response = await axios.post('/api/qltyItemUpdate', sendData)
    } else {
      response = await axios.post('/api/qltyItemInsert', sendData)
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
  if (!formData.itemCode) {
    alert('삭제할 데이터를 선택해주세요.')
    return
  }

  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    const response = await axios.post('/api/qltyItemDelete', { qlty_item_mng_id: formData.itemCode })

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
</script>

<style scoped>
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

.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.25rem;
}

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

/* 셀 입력 필드 */
.cell-input {
  width: 100%;
  border: 1.5px solid #e2e8f0;
  background: transparent;
  padding: 0.4rem 0.6rem;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.cell-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background: #ffffff;
}

select.cell-input {
  cursor: pointer;
  background-color: #ffffff;
}

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

  .cell-input {
    font-size: 12px !important;
    padding: 0.35rem 0.5rem !important;
  }

  .grid-box,
  .form-box {
    height: calc(42px + 10 * 42px + 2px) !important;
  }
}
</style>