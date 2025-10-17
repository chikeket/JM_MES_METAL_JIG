<template>
  <CContainer fluid class="h-100 d-flex flex-column">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="button-group">
      <CButton color="secondary" @click="handleSearch">조회</CButton>
      <CButton color="secondary" @click="handleReset">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box">
      <CRow class="g-3">
        <CCol :md="4">
          <CFormLabel class="form-label">자재명</CFormLabel>
          <CFormInput v-model="searchFilters.materialName" placeholder="입력해주세요" />
        </CCol>
        <CCol :md="4">
          <CFormLabel class="form-label">자재분류타입</CFormLabel>
          <CFormSelect v-model="searchFilters.materialType">
            <option value="">선택해주세요</option>
            <option value="TYPE1">TYPE1</option>
            <option value="TYPE2">TYPE2</option>
            <option value="TYPE3">TYPE3</option>
          </CFormSelect>
        </CCol>
      </CRow>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-3">
      <!-- 좌측: 데이터 그리드 (10개 행 고정) -->
      <CCol :md="6" class="d-flex flex-column">
        <!-- 좌측 버튼 영역 (높이 통일용) -->
        <div class="button-group" style="height: 48px; margin-bottom: 1rem;"></div>

        <!-- 그리드 테이블 -->
        <div class="grid-box">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 100px">자재코드</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px">자재분류타입</CTableHeaderCell>
                  <CTableHeaderCell style="width: 140px">자재명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px">규격</CTableHeaderCell>
                  <CTableHeaderCell style="width: 80px">수량단위</CTableHeaderCell>
                  <CTableHeaderCell>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <!-- 데이터 행 -->
                <CTableRow
                  v-for="(item, index) in displayedData"
                  :key="index"
                  @click="handleRowSelect(item, index)"
                  :class="['data-row', { 'selected-row': selectedRowIndex === index }]"
                >
                  <CTableDataCell class="text-center">{{ item.rsc_id }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.rsc_clsf_id }}</CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.rsc_nm" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.spec" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <input v-model="item.unit" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.rmrk" class="cell-input" @click.stop />
                  </CTableDataCell>
                </CTableRow>

                <!-- 빈 행으로 10개 채우기 -->
                <CTableRow
                  v-for="i in emptyRowCount"
                  :key="'empty-' + i"
                  class="empty-row"
                >
                  <CTableDataCell colspan="6"></CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 (같은 높이) -->
      <CCol :md="6" class="d-flex flex-column">
        <!-- 우측 버튼 영역 -->
        <div class="button-group">
          <CButton color="secondary" @click="handleNew">신규</CButton>
          <CButton color="secondary" @click="handleSave">저장</CButton>
          <CButton color="danger" @click="handleDelete">삭제</CButton>
        </div>

        <div class="form-box">
          <div class="form-scroll-wrapper">
            <!-- 자재코드 -->
            <div class="form-row">
              <label class="form-label-inline">자재코드</label>
              <CFormInput
                v-model="formData.materialCode"
                placeholder="입력해주세요"
                disabled
              />
            </div>

            <!-- 자재분류타입 -->
            <div class="form-row">
              <label class="form-label-inline">자재분류타입</label>
              <CFormSelect v-model="formData.materialType">
                <option value="">선택해주세요</option>
                <option value="TYPE1">TYPE1</option>
                <option value="TYPE2">TYPE2</option>
                <option value="TYPE3">TYPE3</option>
              </CFormSelect>
            </div>

            <!-- 자재명 -->
            <div class="form-row">
              <label class="form-label-inline">자재명</label>
              <CFormInput
                v-model="formData.materialName"
                placeholder="입력해주세요"
              />
            </div>

            <!-- 규격 -->
            <div class="form-row">
              <label class="form-label-inline">규격</label>
              <CFormInput
                v-model="formData.spec"
                placeholder="입력해주세요"
              />
            </div>

            <!-- 수량단위 -->
            <div class="form-row">
              <label class="form-label-inline">수량단위</label>
              <CFormInput
                v-model="formData.unit"
                placeholder="입력해주세요"
              />
            </div>

            <!-- 비고 -->
            <div class="form-row">
              <label class="form-label-inline">비고</label>
              <CFormInput
                v-model="formData.remark"
                placeholder="입력해주세요"
              />
            </div>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 검색 필터
const searchFilters = reactive({
  materialName: '',
  materialType: '',
})

// 입력 폼 데이터
const formData = reactive({
  materialCode: '',
  materialType: '',
  materialName: '',
  spec: '',
  unit: '',
  remark: '',
})

// 그리드 데이터
const gridData = ref([])

// 선택된 행 인덱스
const selectedRowIndex = ref(null)
const selectedRscId = ref(null)
const originalCode = ref('')

// 표시할 데이터 (10개 행 기준)
const displayedData = computed(() => {
  return gridData.value.slice(0, 10)
})

// 빈 행 개수 계산
const emptyRowCount = computed(() => {
  const dataCount = displayedData.value.length
  return Math.max(0, 10 - dataCount)
})

// 행 선택 핸들러
const handleRowSelect = (item, index) => {
  selectedRowIndex.value = index
  selectedRscId.value = item.rsc_id
  
  formData.materialCode = item.rsc_id
  formData.materialType = item.rsc_clsf_id
  formData.materialName = item.rsc_nm
  formData.spec = item.spec
  formData.unit = item.unit
  formData.remark = item.rmrk
  
  originalCode.value = item.rsc_id
}

// 조회 핸들러
const handleSearch = async () => {
  try {
    gridData.value = Array.from({ length: 15 }, (_, i) => ({
      rsc_id: `MAT${String(i + 1).padStart(4, '0')}`,
      rsc_clsf_id: `TYPE${(i % 3) + 1}`,
      rsc_nm: `자재명${i + 1}`,
      spec: `규격${i + 1}`,
      unit: i % 2 === 0 ? 'EA' : 'KG',
      rmrk: `비고${i + 1}`,
    }))
    
    if (searchFilters.materialName) {
      gridData.value = gridData.value.filter(item => 
        item.rsc_nm.includes(searchFilters.materialName)
      )
    }
    if (searchFilters.materialType) {
      gridData.value = gridData.value.filter(item => 
        item.rsc_clsf_id.includes(searchFilters.materialType)
      )
    }
    
    selectedRowIndex.value = null
    selectedRscId.value = null
    console.log('조회 완료:', gridData.value.length, '건')
  } catch (error) {
    console.error('조회 실패:', error)
    alert('데이터 조회에 실패했습니다.')
    gridData.value = []
  }
}

// 초기화 핸들러
const handleReset = () => {
  searchFilters.materialName = ''
  searchFilters.materialType = ''
  gridData.value = []
  selectedRowIndex.value = null
}

// 신규 핸들러
const handleNew = () => {
  selectedRowIndex.value = null
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
}

// 저장 핸들러
const handleSave = async () => {
  try {
    if (!formData.materialCode) {
      alert('자재코드를 입력해주세요.')
      return
    }
    
    const saveData = {
      rsc_id: formData.materialCode,
      rsc_clsf_id: formData.materialType,
      rsc_nm: formData.materialName,
      spec: formData.spec,
      unit: formData.unit,
      rmrk: formData.remark,
    }
    
    const isNew = !selectedRscId.value
    
    if (isNew) {
      alert('등록되었습니다.')
    } else {
      alert('수정되었습니다.')
    }
    
    await handleSearch()
  } catch (error) {
    console.error('저장 실패:', error)
    alert('저장에 실패했습니다.')
  }
}

// 삭제 핸들러
const handleDelete = async () => {
  try {
    if (!selectedRscId.value) {
      alert('삭제할 항목을 선택해주세요.')
      return
    }
    
    if (!confirm('선택한 항목을 삭제하시겠습니까?')) {
      return
    }
    
    alert('삭제되었습니다.')
    await handleSearch()
    handleNew()
  } catch (error) {
    console.error('삭제 실패:', error)
    alert('삭제에 실패했습니다.')
  }
}

onMounted(() => {
  // 초기화
})
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

.form-scroll-wrapper {
  flex: 1;
  overflow-y: auto !important;
  overflow-x: hidden;
  padding: 1.5rem !important;
  max-height: calc(46px * 10);
}

.form-scroll-wrapper::-webkit-scrollbar {
  width: 14px;
  background: #ffffff;
}

.form-scroll-wrapper::-webkit-scrollbar-track {
  background: #ffffff;
}

.form-scroll-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #9ca3af 0%, #6b7280 100%);
  border-radius: 10px;
  border: 3px solid #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.form-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 100%);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

/* ============================================
   버튼 그룹
   ============================================ */
.button-group {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-bottom: 1rem;
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
   폼 요소
   ============================================ */
:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

.form-label-inline {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0;
  letter-spacing: -0.2px;
  min-width: 120px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  text-align: right;
  justify-content: flex-end;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.6rem;
  justify-content: flex-end;
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
  flex: 1;
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

/* ============================================
   테이블 래퍼 - 10개 행 표시
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
   셀 입력 필드
   ============================================ */
.cell-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 4px 6px;
  font-size: 13px;
  outline: none;
  font-family: inherit;
  color: #334155;
}

.cell-input:focus {
  background: #fef3c7;
  border: 1.5px solid #fbbf24;
  border-radius: 6px;
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
</style>