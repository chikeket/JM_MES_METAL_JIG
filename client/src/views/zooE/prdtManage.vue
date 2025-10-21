<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3 page-container">
    <div class="d-flex justify-content-end mb-2 gap-2 button-group">
      <CButton color="secondary" size="sm" @click="handleSearch" class="btn-search">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset" class="btn-reset">초기화</CButton>
    </div>
    
<!-- 검색 필터 영역 - 수정된 부분 -->
<div class="search-filter-box mb-4 fade-in-up" style="animation-delay: 0.1s">
  <CRow class="g-3 align-items-center">
    <CCol :md="4">
      <div class="search-row-container">
        <CFormLabel class="search-label-fixed">제품ID</CFormLabel>
        <CFormInput v-model="searchFilters.productId" size="sm" class="form-input-search" />
      </div>
    </CCol>
    <CCol :md="4">
      <div class="search-row-container">
        <CFormLabel class="search-label-fixed">제품명</CFormLabel>
        <CFormInput v-model="searchFilters.productName" size="sm" class="form-input-search" />
      </div>
    </CCol>
    <CCol :md="4">
      <div class="search-row-container">
        <CFormLabel class="search-label-fixed">제품상태</CFormLabel>
        <CFormInput v-model="searchFilters.productStatus" size="sm" class="form-input-search" />
      </div>
    </CCol>
  </CRow>
</div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2 fade-in-up" style="animation-delay: 0.2s">
      <!-- 좌측: 제품 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden pe-1">
        <div class="d-flex gap-2 justify-content-end mb-2">
          <CButton color="secondary" size="sm" @click="handleLeftNew" class="btn-action">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleLeftSave" class="btn-action">저장</CButton>
          <CButton color="danger" size="sm" @click="handleLeftDelete" class="btn-action">선택삭제</CButton>
        </div>
        
        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 40px">
                    <CFormCheck :checked="allLeftChecked" @change="toggleAllLeftCheck" />
                  </CTableHeaderCell>
                  <CTableHeaderCell style="width: 50px">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">제품ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">제품명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">규격</CTableHeaderCell>
                  <CTableHeaderCell style="width: 10%">단위</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">제품상태</CTableHeaderCell>
                  <CTableHeaderCell>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in leftDisplayData"
                  :key="index"
                  @click="selectLeftProduct(item, index)"
                  :class="{ 'selected-row': selectedLeftIndex === index }"
                  class="data-row"
                >
                  <CTableDataCell class="text-center">
                    <CFormCheck v-model="item.selected" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-end">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.prdt_id }}</CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.prdt_nm" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.spec" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <input v-model="item.unit" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.prdt_st" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.rmrk" class="cell-input" @click.stop />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in leftEmptyRows" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="8">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 옵션 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden ps-1">
        <div class="d-flex gap-2 justify-content-end mb-2">
          <CButton color="secondary" size="sm" @click="handleRightNew" class="btn-action">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleRightSave" class="btn-action">저장</CButton>
          <CButton color="danger" size="sm" @click="handleRightDelete" class="btn-action">선택삭제</CButton>
        </div>
        
        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 40px">
                    <CFormCheck :checked="allRightChecked" @change="toggleAllRightCheck" />
                  </CTableHeaderCell>
                  <CTableHeaderCell style="width: 50px">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">옵션ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 30%">옵션명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">사용여부</CTableHeaderCell>
                  <CTableHeaderCell>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in rightDisplayData"
                  :key="index"
                  @click="selectRightOption(item, index)"
                  :class="{ 'selected-row': selectedRightIndex === index }"
                  class="data-row"
                >
                  <CTableDataCell class="text-center">
                    <CFormCheck v-model="item.selected" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-end">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.opt_id }}</CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.opt_nm" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <select v-model="item.use_yn" class="cell-input" @click.stop>
                      <option :value="true">사용</option>
                      <option :value="false">미사용</option>
                    </select>
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.rm" class="cell-input" @click.stop />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in rightEmptyRows" :key="'empty-right-' + i" class="empty-row">
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

const searchFilters = reactive({
  productId: '',
  productName: '',
  productStatus: '',
})

const leftGridData = ref([])
const selectedLeftIndex = ref(null)
const selectedLeftProductId = ref(null)

const rightGridData = ref([])
const selectedRightIndex = ref(null)
const selectedRightOptionId = ref(null)

const leftDisplayData = computed(() => leftGridData.value)
const leftEmptyRows = computed(() => {
  const dataCount = leftGridData.value.length
  return dataCount < 10 ? Math.max(0, 10 - dataCount) : 0
})

const rightDisplayData = computed(() => rightGridData.value)
const rightEmptyRows = computed(() => {
  const dataCount = rightGridData.value.length
  return dataCount < 10 ? Math.max(0, 10 - dataCount) : 0
})

const allLeftChecked = computed(() => {
  return leftDisplayData.value.length > 0 && leftDisplayData.value.every((item) => item.selected)
})

const allRightChecked = computed(() => {
  return rightDisplayData.value.length > 0 && rightDisplayData.value.every((item) => item.selected)
})

const toggleAllLeftCheck = () => {
  const newValue = !allLeftChecked.value
  leftDisplayData.value.forEach((item) => {
    item.selected = newValue
  })
}

const toggleAllRightCheck = () => {
  const newValue = !allRightChecked.value
  rightDisplayData.value.forEach((item) => {
    item.selected = newValue
  })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  if (statusSelect.value && !statusSelect.value.contains(event.target)) {
    showStatusDropdown.value = false
  }
}

const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value
}

const selectStatus = (value) => {
  searchFilters.productStatus = value
  showStatusDropdown.value = false
}

const getStatusDisplayText = (value) => {
  if (value === 'K1') return 'K1'
  if (value === 'K2') return 'K2'
  if (value === 'K3') return 'K3'
  return '전체'
}

const selectLeftProduct = (item, index) => {
  selectedLeftIndex.value = index
  selectedLeftProductId.value = item.prdt_id
  console.log('좌측 제품 선택:', item.prdt_id)
  
  if (item.prdt_id) {
    loadRightOptions(item.prdt_id)
  }
}

const selectRightOption = (item, index) => {
  selectedRightIndex.value = index
  selectedRightOptionId.value = item.opt_id
  console.log('우측 옵션 선택:', item.opt_id)
}

const loadRightOptions = async (prdtId) => {
  try {
    console.log('📋 우측 옵션 조회:', prdtId)
    const response = await axios.get('/api/prdt_option_list', { params: { prdt_id: prdtId } })
    console.log('📡 API 응답:', response)
    const list = Array.isArray(response.data) ? response.data : response.data.data || []
    
    rightGridData.value = list.map((item) => ({ 
      ...item, 
      prdt_id: prdtId,
      use_yn: item.use_yn === 'ACT' || item.use_yn === 'Y' || item.use_yn === true,
      rm: item.rm || item.rmrk || '',
      selected: false 
    }))
    
    console.log('✅ 우측 옵션 조회 완료:', rightGridData.value.length, '건')
    
    selectedRightIndex.value = null
    selectedRightOptionId.value = null
  } catch (error) {
    console.error('❌ 우측 옵션 조회 오류:', error)
    rightGridData.value = []
  }
}

const handleSearch = async () => {
  try {
    const params = {
      prdt_id: searchFilters.productId || '',
      prdt_nm: searchFilters.productName || '',
      prdt_st: searchFilters.productStatus || '',
    }
    console.log('📋 조회 파라미터:', params)

    const response = await axios.get('/api/prdt_list_view', { params })
    const list = Array.isArray(response.data) ? response.data : response.data.data || []
    leftGridData.value = list.map((item) => ({ ...item, selected: false })).sort((a, b) => {
      const numA = parseInt(a.prdt_id.replace(/\D/g, '')) || 0
      const numB = parseInt(b.prdt_id.replace(/\D/g, '')) || 0
      return numA - numB
    })

    console.log('✅ 좌측 조회 완료:', leftGridData.value.length, '건')

    selectedLeftIndex.value = null
    selectedLeftProductId.value = null
    rightGridData.value = []
  } catch (error) {
    console.error('❌ 좌측 조회 오류:', error)
    leftGridData.value = []
  }
}

const handleReset = () => {
  searchFilters.productId = ''
  searchFilters.productName = ''
  searchFilters.productStatus = ''
  selectedLeftIndex.value = null
  selectedLeftProductId.value = null
  selectedRightIndex.value = null
  selectedRightOptionId.value = null
  leftGridData.value = []
  rightGridData.value = []
  console.log('🔄 초기화 완료')
}

const getNextLeftId = () => {
  console.log('현재 좌측 그리드 데이터:', leftGridData.value)
  
  if (leftGridData.value.length > 0) {
    const lastId = leftGridData.value[leftGridData.value.length - 1].prdt_id
    console.log('마지막 제품 ID:', lastId)
    const match = lastId.match(/^PR(\d+)$/)
    
    if (match) {
      const lastNumber = parseInt(match[1])
      const nextNumber = lastNumber + 1
      const newId = `PR${String(nextNumber).padStart(3, '0')}`
      console.log('생성된 새 제품 ID:', newId)
      return newId
    }
  }
  console.log('데이터 없음, PR001 반환')
  return 'PR001'
}

const getNextRightId = () => {
  console.log('현재 우측 그리드 데이터:', rightGridData.value)
  
  if (rightGridData.value.length > 0) {
    const lastId = rightGridData.value[rightGridData.value.length - 1].opt_id
    console.log('마지막 옵션 ID:', lastId)
    const match = lastId.match(/^OP(\d+)$/)
    
    if (match) {
      const lastNumber = parseInt(match[1])
      const nextNumber = lastNumber + 1
      const newId = `OP${String(nextNumber).padStart(3, '0')}`
      console.log('생성된 새 옵션 ID:', newId)
      return newId
    }
  }
  console.log('데이터 없음, OP001 반환')
  return 'OP001'
}

const handleLeftNew = async () => {
  const newProduct = {
    prdt_id: getNextLeftId(),
    rsc_clsf_id: 'RC001',
    prdt_nm: '',
    spec: '',
    unit: '',
    rmrk: '',
    selected: true,
    isNew: true
  }
  
  leftGridData.value.unshift(newProduct)
  selectedLeftIndex.value = 0
  selectedLeftProductId.value = newProduct.prdt_id
  console.log('➕ 좌측 신규 행 추가:', newProduct)
}

const handleLeftSave = async () => {
  const itemsToSave = leftGridData.value.filter(item => item.selected)
  
  if (itemsToSave.length === 0) {
    alert('저장할 데이터를 선택해주세요.')
    return
  }

  try {
    let savedCount = 0
    
    for (const item of itemsToSave) {
      if (!item.prdt_nm || item.prdt_nm.trim() === '') {
        alert('제품명을 입력해주세요.')
        return
      }

      const payload = {
        prdt_nm: item.prdt_nm,
        spec: item.spec || '',
        unit: item.unit || '',
        prdt_st: item.prdt_st || 'K1',
        rm: item.rmrk || '',
      }

      if (item.isNew) {
        console.log('➕ 좌측 신규 등록:', payload)
        await axios.post('/api/prdtInsert', payload)
      } else {
        payload.prdt_id = item.prdt_id
        payload.original_prdt_id = item.prdt_id
        console.log('✏️ 좌측 수정:', payload)
        await axios.post('/api/prdtUpdate', payload)
      }
      
      savedCount++
    }
    
    alert(`${savedCount}개 항목이 저장되었습니다.`)
    console.log('🔄 좌측 저장 완료, 재조회 시작')
    await handleSearch()
    console.log('✅ 좌측 재조회 완료, 현재 데이터:', leftGridData.value.length, '건')
    
  } catch (error) {
    console.error('❌ 좌측 저장 오류:', error)
    alert('저장 중 오류가 발생했습니다.')
  }
}

const handleLeftDelete = async () => {
  const selected = leftGridData.value.filter((item) => item.selected)
  
  if (selected.length === 0) {
    alert('삭제할 데이터를 선택해주세요.')
    return
  }
  
  if (!confirm(`${selected.length}개 항목을 삭제하시겠습니까?`)) return

  try {
    for (const item of selected) {
      if (!item.isNew && item.prdt_id) {
        console.log('🗑️ 좌측 삭제:', item.prdt_id)
        await axios.post('/api/prdtDelete', { prdt_id: item.prdt_id })
      }
    }
    
    alert('삭제되었습니다.')
    console.log('🔄 좌측 삭제 완료, 재조회 시작')
    await handleSearch()
    
    selectedLeftIndex.value = null
    selectedLeftProductId.value = null
    rightGridData.value = []
    
  } catch (error) {
    console.error('❌ 좌측 삭제 오류:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const handleRightNew = () => {
  if (!selectedLeftProductId.value) {
    alert('좌측에서 제품을 먼저 선택해주세요.')
    return
  }
  
  const newOption = {
    opt_id: getNextRightId(),
    prdt_id: selectedLeftProductId.value,
    opt_nm: '',
    use_yn: true,
    rm: '',
    selected: true,
    isNew: true
  }
  
  rightGridData.value.unshift(newOption)
  selectedRightIndex.value = 0
  selectedRightOptionId.value = newOption.opt_id
  console.log('➕ 우측 신규 행 추가 (제품ID:', selectedLeftProductId.value, ')')
}

const handleRightSave = async () => {
  if (!selectedLeftProductId.value) {
    alert('좌측에서 제품을 먼저 선택해주세요.')
    return
  }
  
  const itemsToSave = rightGridData.value.filter(item => item.selected)
  
  if (itemsToSave.length === 0) {
    alert('저장할 데이터를 선택해주세요.')
    return
  }

  try {
    let savedCount = 0
    
    for (const item of itemsToSave) {
      if (!item.opt_nm || !item.opt_nm.trim()) {
        alert('옵션명을 입력해주세요.')
        continue
      }

      const useYnValue = (item.use_yn === true || item.use_yn === 'ACT' || item.use_yn === 'Y') ? 'ACT' : 'INA'
      
      console.log('💾 use_yn 변환:', item.use_yn, '→', useYnValue)

      const payload = {
        prdt_id: selectedLeftProductId.value,
        opt_nm: item.opt_nm.trim(),
        use_yn: useYnValue,
        rm: item.rm || ''
      }
      
      if (item.isNew) {
        console.log('➕ 우측 신규 등록:', payload)
        await axios.post('/api/optionInsert', payload)
      } else {
        payload.opt_id = item.opt_id
        payload.original_opt_id = item.opt_id
        console.log('✏️ 우측 수정:', payload)
        await axios.post('/api/optionUpdate', payload)
      }
      
      savedCount++
    }
    
    if (savedCount > 0) {
      alert(`${savedCount}개 항목이 저장되었습니다.`)
      console.log('🔄 우측 저장 완료, 재조회 시작')
      await loadRightOptions(selectedLeftProductId.value)
    }
    
  } catch (error) {
    console.error('❌ 우측 저장 오류:', error.response?.data)
    
    const errorMsg = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message
    alert(`저장 중 오류: ${errorMsg}`)
    
    if (selectedLeftProductId.value) {
      await loadRightOptions(selectedLeftProductId.value)
    }
  }
}

const handleRightDelete = async () => {
  const selected = rightGridData.value.filter((item) => item.selected)
  
  if (selected.length === 0) {
    alert('삭제할 데이터를 선택해주세요.')
    return
  }
  
  if (!confirm(`${selected.length}개 항목을 삭제하시겠습니까?`)) return

  try {
    for (const item of selected) {
      if (!item.isNew && item.opt_id) {
        console.log('🗑️ 우측 삭제:', item.opt_id)
        await axios.post('/api/optionDelete', { 
          opt_id: item.opt_id,
          prdt_id: item.prdt_id || selectedLeftProductId.value
        })
      }
    }
    
    alert('삭제되었습니다.')
    console.log('🔄 우측 삭제 완료, 재조회 시작')
    
    if (selectedLeftProductId.value) {
      await loadRightOptions(selectedLeftProductId.value)
    }
    
    selectedRightIndex.value = null
    selectedRightOptionId.value = null
    
  } catch (error) {
    console.error('❌ 우측 삭제 오류:', error)
    
    const errorMsg = error.response?.data?.message || 
                     error.response?.data?.error || 
                     '삭제 중 오류가 발생했습니다.'
    alert(`삭제 실패: ${errorMsg}`)
    
    if (selectedLeftProductId.value) {
      await loadRightOptions(selectedLeftProductId.value)
    }
  }
}
</script>

<style scoped>
/* 페이지 컨테이너 */
.page-container {
  background: #f5f7fa;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

/* 검색 필터 박스 */
.search-filter-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.search-row-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-label-fixed {
  min-width: 80px;
  font-weight: 600;
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 0;
}

.form-input-search {
  flex: 1;
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
}

/* 그리드 박스 */
.grid-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

/* 테이블 래퍼 */
.table-wrapper {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #bcbcbc;
  border-radius: 8px;
  scrollbar-gutter: stable;
}

.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* 데이터 테이블 */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 12px;
  margin-bottom: 0;
}

.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table thead th {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: 34px;
}

.data-table thead th:first-child {
  border-top-left-radius: 4px;
}

.data-table thead th:last-child {
  border-top-right-radius: 4px;
}

.data-table tbody td {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: 34px;
  vertical-align: middle;
}

.data-table tbody td:last-child {
  border-right: none;
}

.data-table tbody tr {
  height: 34px;
  transition: all 0.2s ease;
  background: #fff;
  cursor: pointer;
}

.data-table tbody tr.data-row:hover td {
  background-color: rgba(33, 37, 41, 0.075) !important;
}

.data-table tbody tr.selected-row td {
  background-color: #e7f1ff !important;
}

.data-table tbody tr.empty-row {
  cursor: default;
}

.data-table tbody tr.empty-row:hover td {
  background: #fff !important;
}

/* 셀 내부 입력 필드 */
.cell-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.25rem 0.5rem;
  font-size: 12px;
  color: #2c3e50;
  outline: none;
}

.cell-input:focus {
  background: #f8f9fa;
  border-radius: 4px;
}

.cell-input:hover {
  background: #f8f9fa;
  border-radius: 4px;
}

/* 셀렉트 스타일 */
select.cell-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23495057' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 1.5rem;
}

/* 체크박스 스타일 */
:deep(.form-check-input) {
  cursor: pointer;
  width: 16px;
  height: 16px;
  border: 2px solid #dee2e6;
  border-radius: 3px;
}

:deep(.form-check-input:checked) {
  background-color: #0b5ed7;
  border-color: #0b5ed7;
}

/* 버튼 스타일 */
.btn-search,
.btn-reset,
.btn-action {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}

.btn-search:hover,
.btn-reset:hover,
.btn-action:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* Danger 버튼 - CoreUI 컬러 속성 오버라이드 */
:deep(.btn[color="danger"]),
.btn-action[color="danger"] {
  background: linear-gradient(135deg, #c53030 0%, #a82323 100%) !important;
}

:deep(.btn[color="danger"]:hover),
.btn-action[color="danger"]:hover {
  background: linear-gradient(135deg, #a82323 0%, #8b1a1a 100%) !important;
  box-shadow: 0 4px 12px rgba(197, 48, 48, 0.3) !important;
  transform: translateY(-2px);
}

/* 애니메이션 */
.fade-in-up {
  animation: fadeInUp 0.4s ease-out;
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

/* 텍스트 정렬 유틸리티 */
.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

/* 반응형 */
@media (max-width: 1600px) {
  .btn-search,
  .btn-reset,
  .btn-action {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}

@media (max-height: 900px) {
  .table-wrapper {
    max-height: 400px;
  }
}

@media (max-height: 780px) {
  .table-wrapper {
    max-height: 350px;
  }
}

@media (max-height: 700px) {
  .table-wrapper {
    max-height: 300px;
  }
}
</style>