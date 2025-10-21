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
/* 페이지 진입 애니메이션 */
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

.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-height: calc(46px + 10 * 46px + 2px);
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
  border-color: #6b7280 !important;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12) !important;
  background-color: #ffffff !important;
  outline: none !important;
}

:deep(.form-control) {
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

:deep(.form-control:focus) {
  border-color: #6b7280 !important;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12) !important;
  background-color: #ffffff !important;
  outline: none !important;
}

.custom-select-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
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
  padding: 0.4rem 0.5rem;
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

.cell-input {
  width: 100%;
  border: 1.5px solid #e2e8f0;
  background: transparent;
  padding: 0.35rem 0.5rem;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s ease;
  height: 30px;
  box-sizing: border-box;
}

.cell-input:focus {
  outline: none;
  border-color: #6b7280 !important;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12) !important;
  background: #ffffff !important;
}

select.cell-input {
  cursor: pointer;
  background-color: #ffffff;
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

:deep(.form-check-input) {
  cursor: pointer;
  border: 1.5px solid #d1d5db;
}

:deep(.form-check-input:checked) {
  background-color: #6b7280 !important;
  border-color: #6b7280 !important;
}

:deep(.form-check-input:checked:hover) {
  background-color: #4b5563 !important;
  border-color: #4b5563 !important;
}

:deep(.form-check-input:focus) {
  border-color: #6b7280 !important;
  box-shadow: 0 0 0 0.25rem rgba(107, 114, 128, 0.25) !important;
}

@media (max-width: 1600px) {
  .search-label-fixed {
    font-size: 12px !important;
  }

  .form-input-search {
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
    padding: 0.3rem 0.45rem !important;
    height: 28px !important;
  }

  .grid-box {
    max-height: calc(42px + 10 * 42px + 2px) !important;
  }
}
</style>