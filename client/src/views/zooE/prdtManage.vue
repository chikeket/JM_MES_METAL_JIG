<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end gap-2 mb-2">
      <CButton color="secondary" size="sm" @click="handleSearch">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset">초기화</CButton>
    </div>

    <!-- 상단폼 -->
    <div class="search-filter-box mb-2">
      <CRow class="g-2 align-items-end">
        <CCol :md="3">
          <CFormLabel class="form-label">제품ID</CFormLabel>
          <CFormInput v-model="searchFilters.productId" size="sm" placeholder="제품ID 입력"/>
        </CCol>
        <CCol :md="4">
          <CFormLabel class="form-label">제품명</CFormLabel>
          <CFormInput v-model="searchFilters.productName" size="sm" placeholder="제품명 입력"/>
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">제품상태</CFormLabel>
          <CFormSelect v-model="searchFilters.productStatus" size="sm">
            <option value="">전체</option>
            <option value="생산가능">생산가능</option>
            <option value="생산불가">생산불가</option>
          </CFormSelect>
        </CCol>
      </CRow>
    </div>

    <!-- 신규/저장 버튼 -->
    <div class="d-flex justify-content-end gap-2 mb-2">
      <CButton color="secondary" size="sm" @click="handleNew">신규</CButton>
      <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
    </div>

    <!-- 하단 좌우 그리드 -->
    <CRow class="flex-grow-1 overflow-hidden g-2">
      <!-- 좌측 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden gap-2">
        <div class="d-flex justify-content-end">
          <CButton color="danger" size="sm" @click="handleLeftDelete">선택삭제</CButton>
        </div>
        
        <div class="grid-box flex-grow-1 overflow-hidden">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width:30px;"><CFormCheck :checked="allChecked" @change="toggleAllCheck" /></CTableHeaderCell>
                  <CTableHeaderCell style="width:40px;">No</CTableHeaderCell>
                  <CTableHeaderCell style="width:80px;">제품ID</CTableHeaderCell>
                  <CTableHeaderCell style="width:120px;">제품명</CTableHeaderCell>
                  <CTableHeaderCell style="width:80px;">규격</CTableHeaderCell>
                  <CTableHeaderCell style="width:60px;">단위</CTableHeaderCell>
                  <CTableHeaderCell style="width:100px;">제품상태</CTableHeaderCell>
                  <CTableHeaderCell style="width:100px">비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="(item,index) in leftDisplayData" :key="index"
                  :class="{'selected-row': selectedProductId === item.prdt_id}"
                  @click="selectProduct(item)">
                  <CTableDataCell class="text-center" style="width:30px;">
                    <CFormCheck v-model="item.selected" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-end" style="width:40px;">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-end text-primary" style="width:80px;">{{ item.prdt_id }}</CTableDataCell>
                  <CTableDataCell class="text-start" style="width:120px;">
                    <input v-model="item.prdt_nm" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width:80px;">
                    <input v-model="item.spec" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width:60px;">
                    <input v-model="item.unit" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width:100px;">
                    <input v-model="item.prdt_st" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start">
                    <input v-model="item.rmrk" class="cell-input" @click.stop />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in leftEmptyRows" :key="'empty-'+i" class="empty-row">
                  <CTableDataCell colspan="8">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden gap-2">
        <div class="d-flex justify-content-end">
          <CButton color="danger" size="sm" @click="handleRightDelete">선택삭제</CButton>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width:30px;"><CFormCheck :checked="allRightChecked" @change="toggleAllRightCheck" /></CTableHeaderCell>
                  <CTableHeaderCell style="width:40px;">No</CTableHeaderCell>
                  <CTableHeaderCell style="width:80px;">옵션ID</CTableHeaderCell>
                  <CTableHeaderCell>옵션명</CTableHeaderCell>
                  <CTableHeaderCell>사용여부</CTableHeaderCell>
                  <CTableHeaderCell>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="(item, index) in rightDisplayData" :key="index">
                  <CTableDataCell class="text-center" style="width:30px;">
                    <CFormCheck v-model="item.selected" />
                  </CTableDataCell>
                  <CTableDataCell class="text-end" style="width:40px;">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-start" style="width:80px;">{{ item.opt_id }}</CTableDataCell>
                  <CTableDataCell class="text-start">{{ item.opt_nm }}</CTableDataCell>
                  <CTableDataCell class="text-start">{{ item.use_yn ? '사용' : '미사용' }}</CTableDataCell>
                  <CTableDataCell class="text-start">{{ item.rmrk }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in rightEmptyRows" :key="'empty-right-'+i" class="empty-row">
                  <CTableDataCell colspan="6">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

const searchFilters = reactive({
  productId: '',
  productName: '',
  productStatus: ''
})

const leftGridData = ref([])
const rightGridData = ref([])
const selectedProductId = ref(null)

const leftDisplayData = computed(() => leftGridData.value.slice(0, 10))
const leftEmptyRows = computed(() => Math.max(0, 10 - leftDisplayData.value.length))

const rightDisplayData = computed(() => {
  if (!selectedProductId.value) return []
  return rightGridData.value.filter(item => item.prdt_id === selectedProductId.value).slice(0, 10)
})
const rightEmptyRows = computed(() => Math.max(0, 10 - rightDisplayData.value.length))

// 전체 선택 체크박스
const allChecked = computed(() => {
  return leftDisplayData.value.length > 0 && leftDisplayData.value.every(item => item.selected)
})

const allRightChecked = computed(() => {
  return rightDisplayData.value.length > 0 && rightDisplayData.value.every(item => item.selected)
})

const toggleAllCheck = () => {
  const newValue = !allChecked.value
  leftDisplayData.value.forEach(item => {
    item.selected = newValue
  })
}

const toggleAllRightCheck = () => {
  const newValue = !allRightChecked.value
  rightDisplayData.value.forEach(item => {
    item.selected = newValue
  })
}

onMounted(() => {
  handleSearch()
})

const selectProduct = (item) => {
  selectedProductId.value = item.prdt_id
  loadOptions(item.prdt_id)
}

// 조회
const handleSearch = async () => {
  try {
    const params = {
      prdt_id: searchFilters.productId || '',
      prdt_nm: searchFilters.productName || '',
      prdt_st: searchFilters.productStatus || ''
    }
    console.log('📋 조회 파라미터:', params)
    
    const response = await axios.get('/api/prdt_list_view', { params })
    const list = Array.isArray(response.data) ? response.data : response.data.data || []
    leftGridData.value = list.map(item => ({ ...item, selected: false }))
    
    console.log('✅ 조회 완료:', leftGridData.value.length, '건')

    selectedProductId.value = null
    rightGridData.value = []
  } catch (error) {
    console.error('❌ 조회 오류:', error)
    leftGridData.value = []
  }
}

// 옵션 조회
const loadOptions = async (prdtId) => {
  try {
    console.log('📋 옵션 조회:', prdtId)
    const result = await axios.get('/api/prdt_option_list', { params: { prdt_id: prdtId } })
    rightGridData.value = result.data.map(item => ({ ...item, selected: false, prdt_id: prdtId }))
    console.log('✅ 옵션 조회 완료:', rightGridData.value.length, '건')
  } catch (error) {
    console.error('❌ 옵션 조회 오류:', error)
    rightGridData.value = []
  }
}

// 초기화
const handleReset = () => {
  searchFilters.productId = ''
  searchFilters.productName = ''
  searchFilters.productStatus = ''
  selectedProductId.value = null
  leftGridData.value = []
  rightGridData.value = []
  console.log('🔄 초기화 완료')
}

// 신규 등록
const handleNew = async () => {
  if (!searchFilters.productName) {
    alert('제품명을 입력해주세요.')
    return
  }
  
  try {
    const payload = {
      prdt_nm: searchFilters.productName,
      spec: '',
      unit: '',
      prdt_st: searchFilters.productStatus || 'K1',
      rmrk: ''
    }
    
    console.log('➕ 신규 등록:', payload)
    const res = await axios.post('/api/prdtInsert', payload)
    alert('등록 완료')
    
    // 등록 후 재조회
    await handleSearch()
  } catch (error) {
    console.error('❌ 등록 오류:', error)
    alert('등록 중 오류가 발생했습니다.')
  }
}

// 저장 (수정)
const handleSave = async () => {
  const selected = leftGridData.value.find(p => p.prdt_id === selectedProductId.value)
  
  if (!selected) {
    alert('수정할 제품을 선택해주세요.')
    return
  }

  try {
    const payload = {
      prdt_id: selected.prdt_id,
      prdt_nm: selected.prdt_nm,
      spec: selected.spec,
      unit: selected.unit,
      prdt_st: selected.prdt_st,
      rmrk: selected.rmrk,
      original_prdt_id: selected.prdt_id
    }
    
    console.log('✏️ 수정 저장:', payload)
    const res = await axios.post('/api/prdtUpdate', payload)
    alert('수정 완료')
    
    // 수정 후 재조회
    await handleSearch()
  } catch (error) {
    console.error('❌ 수정 오류:', error)
    alert('수정 중 오류가 발생했습니다.')
  }
}

// 좌측 선택 삭제
const handleLeftDelete = async () => {
  const selected = leftGridData.value.filter(item => item.selected)
  if (selected.length === 0) {
    alert('삭제할 항목을 선택해주세요.')
    return
  }
  if (!confirm(`${selected.length}개 항목을 삭제하시겠습니까?`)) return

  try {
    for (const item of selected) {
      console.log('🗑️ 삭제:', item.prdt_id)
      await axios.post('/api/prdtDelete', { prdt_id: item.prdt_id })
    }
    alert('삭제되었습니다.')
    await handleSearch()
  } catch (error) {
    console.error('❌ 삭제 오류:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 우측 선택 삭제 (화면에서만 제거)
const handleRightDelete = () => {
  const toDelete = rightDisplayData.value.filter(item => item.selected)
  if (toDelete.length === 0) {
    alert('삭제할 항목을 선택해주세요.')
    return
  }
  
  rightGridData.value = rightGridData.value.filter(item => !item.selected)
  console.log('🗑️ 우측 항목 삭제:', toDelete.length, '건')
}
</script>

<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

:deep(.container-fluid) {
  background: #ffffff;
  padding: 1rem !important;
  height: 100vh;
  overflow: hidden;
}

.search-filter-box {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background: #ffffff;
}

.grid-box {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

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

:deep(.form-label) {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
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

.table-wrapper {
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
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
}

:deep(.data-table th:first-child) {
  border-top-left-radius: 10px;
}

:deep(.data-table th:last-child) {
  border-top-right-radius: 10px;
}

:deep(.data-table td) {
  font-size: 12px;
  vertical-align: middle;
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
}

:deep(.data-table tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
  cursor: pointer;
}

:deep(.data-table tbody tr:hover:not(.empty-row)) {
  background-color: #f8f9fa;
}

/* 셀 입력 스타일 */
.cell-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 12px;
  padding: 2px 4px;
  outline: none;
  font-family: inherit;
}

.cell-input:focus {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
}

:deep(.selected-row) {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%) !important;
  font-weight: 600;
  box-shadow: inset 0 0 0 2px #6c757d;
}

.empty-row td {
  height: 34px;
  background-color: #fafbfc;
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
  color: #0d6efd !important;
}
</style>