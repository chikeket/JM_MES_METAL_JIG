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
        <CCol :md="4">
          <CFormLabel class="form-label">제품명</CFormLabel>
          <CFormInput v-model="searchFilters.productName" size="sm" placeholder="제품명 입력" />
        </CCol>
        <CCol :md="4">
          <CFormLabel class="form-label">옵션명</CFormLabel>
          <CFormInput v-model="searchFilters.optionName" size="sm" placeholder="옵션명 입력" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">상태</CFormLabel>
          <CFormSelect v-model="searchFilters.status" size="sm">
            <option value="">전체</option>
            <option value="P1">사용</option>
            <option value="P2">미사용</option>
          </CFormSelect>
        </CCol>
      </CRow>
    </div>

    <!-- 하단 좌우 그리드 -->
    <CRow class="flex-grow-1 overflow-hidden g-2">
      <!-- 좌측 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden gap-2">
        <!-- 좌측 그리드 버튼들 -->
        <div class="d-flex justify-content-end gap-2">
          <!-- <CButton color="secondary" size="sm" @click="handleLeftNew">신규</CButton> -->
          <CButton color="secondary" size="sm" @click="handleLeftProductSearch">제품 조회</CButton>
          <CButton color="secondary" size="sm" @click="handleLeftSave">저장</CButton>
          <CButton color="danger" size="sm" @click="handleLeftDelete">선택삭제</CButton>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 30px"
                    ><CFormCheck :checked="allLeftChecked" @change="toggleAllLeftCheck"
                  /></CTableHeaderCell>
                  <CTableHeaderCell style="width: 40px">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px">BOM ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px">제품명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px">옵션명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px">BOM 버전</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px">유효 시작일자</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px">유효 종료일자</CTableHeaderCell>
                  <CTableHeaderCell style="width: 80px">상태</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px">비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in leftDisplayData"
                  :key="index"
                  :class="{ 'selected-row': selectedLeftIndex === index }"
                  @click="selectLeftProduct(item, index)"
                >
                  <CTableDataCell class="text-center" style="width: 30px">
                    <CFormCheck v-model="item.selected" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-end" style="width: 40px">{{
                    index + 1
                  }}</CTableDataCell>
                  <CTableDataCell class="text-end text-primary" style="width: 120px">
                    <input v-model="item.bom_id" class="cell-input" readonly @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 120px">
                    <input v-model="item.prdt_nm" class="cell-input" readonly @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 120px">
                    <input v-model="item.opt_nm" class="cell-input" readonly @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 100px">
                    <input v-model="item.bom_ver" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 120px">
                    <input type="Date" v-model="item.valid_fr_dt" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 120px">
                    <input type="Date" v-model="item.valid_to_dt" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 80px">
                    <input v-model="item.st" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start">
                    <input v-model="item.rm" class="cell-input" @click.stop />
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

      <!-- 우측 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden gap-2">
        <!-- 우측 그리드 버튼들 -->
        <div class="d-flex justify-content-end gap-2">
          <!-- <CButton color="secondary" size="sm" @click="handleRightNew">신규</CButton> -->
          <CButton color="secondary" size="sm" @click="handleRightMaterialSearch">자재 조회</CButton>
    <!-- 제품/자재 조회 모달 (rcvord.vue 스타일) -->
    <rcvordModalTwo
      :visible="isProductModalVisible"
      @close="isProductModalVisible = false"
      @select="onProductSelect"
    />
    <rscModal
      :visible="isMaterialModalVisible"
      @close="isMaterialModalVisible = false"
      @select="onMaterialSelect"
    />
          <CButton color="secondary" size="sm" @click="handleRightSave">저장</CButton>
          <CButton color="danger" size="sm" @click="handleRightDelete">선택삭제</CButton>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 30px"
                    ><CFormCheck :checked="allRightChecked" @change="toggleAllRightCheck"
                  /></CTableHeaderCell>
                  <CTableHeaderCell style="width: 40px">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px">자재명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px">규격</CTableHeaderCell>
                  <CTableHeaderCell style="width: 80px">단위</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px">BOM 수량</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px">비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow 
                  v-for="(item, index) in rightDisplayData" 
                  :key="index"
                  :class="{ 'selected-row': selectedRightIndex === index }"
                  @click="selectRightOption(item, index)"
                >
                  <CTableDataCell class="text-center" style="width: 30px">
                    <CFormCheck v-model="item.selected" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-end" style="width: 40px">{{
                    index + 1
                  }}</CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 120px">
                    <input v-model="item.rsc_nm" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 100px">
                    <input v-model="item.spec_id" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 80px">
                    <input v-model="item.unit_id" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-end" style="width: 100px">
                    <input v-model="item.rec_qy" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-start" style="width: 100px">
                    <input v-model="item.rm" class="cell-input" @click.stop />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in rightEmptyRows" :key="'empty-right-' + i" class="empty-row">
                  <CTableDataCell colspan="5">&nbsp;</CTableDataCell>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import useDates from '@/utils/useDates.js'
import rcvordModalTwo from '@/views/modal/rcvordModalTwo.vue'
import rscModal from '@/views/modal/rscModal.vue'
// 모달 표시 상태 (rcvord.vue 스타일)
const isProductModalVisible = ref(false)
const isMaterialModalVisible = ref(false)
// 제품 조회 버튼 클릭 시 모달 오픈
const handleLeftProductSearch = () => {
  isProductModalVisible.value = true
}

// 자재 조회 버튼 클릭 시 모달 오픈
const handleRightMaterialSearch = () => {
  isMaterialModalVisible.value = true
}
// 제품 모달에서 더블클릭(선택) 시 좌측 그리드에 신규행 추가 및 값 입력
function onProductSelect(row) {
  if (!row) return
  const today = new Date().toISOString().slice(0, 10)
  const newBom = {
    // bom_id는 DB에서 생성
    prdt_id: row.prdt_id || '',
    prdt_nm: row.prdt_nm || '',
    prdt_opt_id: row.opt_id || '',
    opt_nm: row.opt_nm || '',
    bom_ver: 'v1',
    valid_fr_dt: today,
    valid_to_dt: '',
    st: '',
    rm: '',
    selected: false,
    isNew: true
  }
  leftGridData.value.unshift(newBom)
  selectedLeftIndex.value = 0
  selectedLeftBomId.value = null
  isProductModalVisible.value = false
}

// 자재 모달에서 더블클릭(선택) 시 우측 그리드에 신규행 추가 및 값 입력
function onMaterialSelect(row) {
  if (!row || !selectedLeftBomId.value) return
  const newDetail = {
    bom_deta_id: '',
    bom_id: selectedLeftBomId.value,
    rsc_id: row.rsc_id || '',
    rsc_nm: row.rsc_nm || '',
    spec_id: row.spec_id || '',
    unit_id: row.unit_id || '',
    rec_qy: row.rec_qy || '',
    rm: '',
    selected: false,
    isNew: true
  }
  rightGridData.value.unshift(newDetail)
  selectedRightIndex.value = 0
  selectedRightBomDetaId.value = null
  isMaterialModalVisible.value = false
}

const searchFilters = reactive({
  productName: '',
  optionName: '',
  status: '',
})


// 좌측 그리드 관련
const leftGridData = ref([])
const selectedLeftIndex = ref(null)
const selectedLeftBomId = ref(null)

// 우측 그리드 관련
const rightGridData = ref([])
const selectedRightIndex = ref(null)
const selectedRightBomDetaId = ref(null)

const leftDisplayData = computed(() => leftGridData.value.slice(0, 10))
const leftEmptyRows = computed(() => Math.max(0, 10 - leftDisplayData.value.length))

const rightDisplayData = computed(() => rightGridData.value.slice(0, 10))
const rightEmptyRows = computed(() => Math.max(0, 10 - rightDisplayData.value.length))

// 날짜값이 들어올 때 자동 변환 (yyyy-MM-dd)
watch(leftGridData, (arr) => {
  arr.forEach(item => {
    if (item && item.valid_fr_dt)
      item.valid_fr_dt = useDates.dateFormat(item.valid_fr_dt, 'yyyy-MM-dd')
    if (item && item.valid_to_dt)
      item.valid_to_dt = useDates.dateFormat(item.valid_to_dt, 'yyyy-MM-dd')
  })
}, { deep: true })

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
  handleSearch()
})

const selectLeftProduct = (item, index) => {
  selectedLeftIndex.value = index
  selectedLeftBomId.value = item.bom_id
  console.log('좌측 BOM 선택:', item.bom_id)
  // BOM ID가 있으면 우측 그리드에 디테일 로드
  if (item.bom_id) {
    loadRightDetails(item.bom_id)
  }
}

const selectRightOption = (item, index) => {
  selectedRightIndex.value = index
  selectedRightBomDetaId.value = item.bom_deta_id
  console.log('우측 BOM 디테일 선택:', item.bom_deta_id)
}

// 우측 BOM 디테일 로드 함수
const loadRightDetails = async (bomId) => {
  try {
    console.log('📋 우측 BOM 디테일 조회:', bomId)
    const response = await axios.get('/api/bom/detail', { params: { bom_id: bomId } })
    const list = Array.isArray(response.data) ? response.data : response.data.data || []
    rightGridData.value = list.map((item) => ({ ...item, selected: false }))
    console.log('✅ 우측 BOM 디테일 조회 완료:', rightGridData.value.length, '건')
    selectedRightIndex.value = null
    selectedRightBomDetaId.value = null
  } catch (error) {
    console.error('❌ 우측 BOM 디테일 조회 오류:', error)
    rightGridData.value = []
  }
}

// 상단 조회 - 좌측 그리드만 조회
const handleSearch = async () => {
  try {
    const params = {
      productName: searchFilters.productName || '',
      optionName: searchFilters.optionName || '',
      status: searchFilters.status || '',
    }
    console.log('📋 BOM 마스터 조회 파라미터:', params)
    const response = await axios.get('/api/bom/master', { params })
    const list = Array.isArray(response.data) ? response.data : response.data.data || []
    leftGridData.value = list.map((item) => ({ ...item, selected: false }))
    console.log('✅ 좌측 BOM 마스터 조회 완료:', leftGridData.value.length, '건')
    selectedLeftIndex.value = null
    selectedLeftBomId.value = null
    rightGridData.value = []
  } catch (error) {
    console.error('❌ 좌측 BOM 마스터 조회 오류:', error)
    leftGridData.value = []
    rightGridData.value = []
  }
}

// 상단 초기화
const handleReset = () => {
  searchFilters.productName = ''
  searchFilters.optionName = ''
  searchFilters.status = ''
  selectedLeftIndex.value = null
  selectedLeftBomId.value = null
  selectedRightIndex.value = null
  selectedRightBomDetaId.value = null
  leftGridData.value = []
  rightGridData.value = []
  console.log('🔄 초기화 완료')
}

// ============================================
// 좌측 그리드 핸들러
// ============================================

// 좌측 - 신규 등록
const handleLeftNew = async () => {
  const newBom = {
    bom_id: '',
    prdt_id: '',
    prdt_opt_id: '',
    bom_ver: '',
    valid_fr_dt: '',
    valid_to_dt: '',
    st: '',
    rm: '',
    selected: false,
    isNew: true
  }
  leftGridData.value.unshift(newBom)
  selectedLeftIndex.value = 0
  selectedLeftBomId.value = null
  console.log('➕ 좌측 BOM 신규 행 추가')
}

// 좌측 - 저장
const handleLeftSave = async () => {
  // bom_ver이 v2 등 새 버전이면 무조건 insert
  const itemsToSave = leftGridData.value.filter(item => item.isNew || item.selected || (item.bom_ver && item.bom_ver !== 'v1'))
  if (itemsToSave.length === 0) {
    alert('저장할 BOM 항목이 없습니다.')
    return
  }
  try {
    for (const item of itemsToSave) {
      if (!item.prdt_nm) {
        alert('제품명을 입력해주세요.')
        continue
      }
      // 제품명 → 제품ID 변환
      let prdt_id = item.prdt_id
      if (!prdt_id && item.prdt_nm) {
        const prdtRes = await axios.get('/api/product_id_by_name', { params: { prdt_nm: item.prdt_nm } })
        prdt_id = prdtRes.data?.prdt_id || ''
      }
      // 옵션명 → 옵션ID 변환
      let opt_id = item.opt_id
      if (!opt_id && item.opt_nm) {
        const optRes = await axios.get('/api/option_id_by_name', { params: { opt_nm: item.opt_nm } })
        opt_id = optRes.data?.opt_id || ''
      }
      // 오늘 날짜 (yyyy-MM-dd)
      const today = new Date().toISOString().slice(0, 10)
      const payload = {
        prdt_id,
        prdt_opt_id: opt_id,
        bom_ver: item.bom_ver || 'v1',
        valid_fr_dt: today,
        valid_to_dt: item.valid_to_dt || '',
        st: item.st || '',
        rm: item.rmrk || '',
      }
      // 무조건 insert만 수행 (update 제거)
      item.bom_id = ''
  console.log('➕ BOM 마스터 신규 등록 payload:', JSON.stringify(payload, null, 2))
  await axios.post('/api/bom/master', payload)
    }
    alert('저장 완료')
    await handleSearch()
  } catch (error) {
    console.error('❌ BOM 마스터 저장 오류:', error)
    alert('저장 중 오류가 발생했습니다.')
  }
}

// 좌측 - 선택 삭제
const handleLeftDelete = async () => {
  const selected = leftGridData.value.filter((item) => item.selected)
  if (selected.length === 0) {
    alert('삭제할 BOM 항목을 선택해주세요.')
    return
  }
  if (!confirm(`${selected.length}개 BOM 항목을 삭제하시겠습니까?`)) return
  try {
    for (const item of selected) {
      if (!item.isNew && item.bom_id) {
        await axios.delete(`/api/bom/master/${item.bom_id}`)
      }
    }
    leftGridData.value = leftGridData.value.filter(item => !item.selected)
    alert('삭제되었습니다.')
    selectedLeftIndex.value = null
    selectedLeftBomId.value = null
  } catch (error) {
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// ============================================
// 우측 그리드 핸들러
// ============================================

// 우측 - 신규
const handleRightNew = () => {
  if (!selectedLeftBomId.value) {
    alert('좌측에서 BOM을 먼저 선택해주세요.')
    return
  }
  const newDetail = {
    bom_deta_id: '',
    bom_id: selectedLeftBomId.value,
    rsc_id: '',
    rsc_nm: '',
    unit: '',
    bom_qty: '',
    rmrk: '',
    selected: false,
    isNew: true
  }
  rightGridData.value.unshift(newDetail)
  selectedRightIndex.value = 0
  selectedRightBomDetaId.value = null
  console.log('➕ 우측 BOM 디테일 신규 행 추가 (BOM ID:', selectedLeftBomId.value, ')')
}

// 우측 - 저장
const handleRightSave = async () => {
  if (!selectedLeftBomId.value) {
    alert('좌측에서 BOM을 먼저 선택해주세요.')
    return
  }
  const itemsToSave = rightGridData.value.filter(item => item.isNew || item.selected)
  if (itemsToSave.length === 0) {
    alert('저장할 BOM 디테일 항목이 없습니다.')
    return
  }
  try {
    for (const item of itemsToSave) {
      if (!item.rsc_nm) {
        alert('자재명을 입력해주세요.')
        continue
      }
      const payload = {
        bom_id: selectedLeftBomId.value,
        rsc_nm: item.rsc_nm,
        spec: item.spec || '',
        unit: item.unit || '',
        bom_qty: item.bom_qty || '',
        rmrk: item.rmrk || ''
      }
      if (item.isNew) {
        await axios.post('/api/bom/detail', payload)
      } else {
        payload.bom_deta_id = item.bom_deta_id
        await axios.put(`/api/bom/detail/${item.bom_deta_id}`, payload)
      }
    }
    alert('저장 완료')
    await loadRightDetails(selectedLeftBomId.value)
  } catch (error) {
    alert('저장 중 오류가 발생했습니다.')
  }
}

// 우측 - 선택 삭제 (중복 선언 제거, 하나만 유지)

// 우측 - 선택 삭제
const handleRightDelete = async () => {
  const selected = rightGridData.value.filter((item) => item.selected)
  if (selected.length === 0) {
    alert('삭제할 BOM 디테일 항목을 선택해주세요.')
    return
  }
  if (!confirm(`${selected.length}개 BOM 디테일 항목을 삭제하시겠습니까?`)) return
  try {
    for (const item of selected) {
      if (!item.isNew && item.bom_deta_id) {
        await axios.delete(`/api/bom/detail/${item.bom_deta_id}`)
      }
    }
    rightGridData.value = rightGridData.value.filter(item => !item.selected)
    alert('삭제되었습니다.')
    selectedRightIndex.value = null
    selectedRightBomDetaId.value = null
  } catch (error) {
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
}

.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.25rem;
}

.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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
}

:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}

:deep(.g-2) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.5rem;
}

.table-wrapper {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: calc(100vh - 300px);
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
}

.table-wrapper::-webkit-scrollbar-button:single-button:hover {
  background-color: #f3f4f6;
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
  font-size: 13px;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
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

:deep(.data-table tbody tr) {
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr:hover:not(.empty-row)) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.cell-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 13px;
  padding: 4px 6px;
  outline: none;
  font-family: inherit;
  color: #334155;
}

.cell-input:focus {
  background: #fef3c7;
  border: 1.5px solid #fbbf24;
  border-radius: 6px;
}

select.cell-input {
  cursor: pointer;
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

@media (max-width: 1600px) {
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
  
  :deep(th),
  :deep(td) {
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
  }
}
</style>