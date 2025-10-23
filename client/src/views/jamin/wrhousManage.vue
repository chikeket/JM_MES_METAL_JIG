<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="searchWrhous">조회</CButton>
      <CButton color="secondary" size="sm" @click="resetSearch">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-2">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">창고 ID</CFormLabel>
          <CFormInput v-model="searchForm.wrhous_id" size="sm" placeholder="창고 ID를 입력하세요" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">창고명</CFormLabel>
          <CFormInput v-model="searchForm.wrhous_nm" size="sm" placeholder="창고명을 입력하세요" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">품목 유형</CFormLabel>
          <CFormSelect v-model="searchForm.item_ty" size="sm">
            <option value="">전체</option>
            <option value="E1">자재</option>
            <option value="E2">반제품</option>
            <option value="E3">완제품</option>
          </CFormSelect>
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">상태</CFormLabel>
          <CFormSelect v-model="searchForm.st" size="sm">
            <option value="">전체</option>
            <option value="M1">활성</option>
            <option value="M2">비활성</option>
          </CFormSelect>
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
                  <CTableHeaderCell scope="col" class="text-center" style="width: 60px">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">창고 ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">창고명</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">품목 유형</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center" style="width: 100px">상태</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <!-- 데이터 행 -->
                <CTableRow 
                  v-for="(item, index) in displayedData" 
                  :key="item.wrhous_id"
                  @click="selectWrhous(item, index)"
                  :class="{ 'selected-row': selectedRowIndex === index }"
                >
                  <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.wrhous_id }}</CTableDataCell>
                  <CTableDataCell>{{ item.wrhous_nm }}</CTableDataCell>
                  <CTableDataCell>{{ getItemTypeLabel(item.item_ty) }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <CBadge :color="item.st === 'M1' ? 'success' : 'secondary'">
                      {{ item.st === 'M1' ? '활성' : '비활성' }}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{{ item.rm || '' }}</CTableDataCell>
                </CTableRow>
                <!-- 빈 행 채우기 (10행 고정) -->
                <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="6">&nbsp;</CTableDataCell>
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
          <CButton color="secondary" size="sm" @click="resetForm">신규</CButton>
          <CButton color="secondary" size="sm" @click="saveWrhous">저장</CButton>
          <CButton color="danger" size="sm" @click="deleteWrhous" :disabled="!selectedWrhous">삭제</CButton>
        </div>

        <!-- 입력 폼 -->
        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="p-3 flex-grow-1 overflow-auto">
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">창고 ID</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput 
                  v-model="formData.wrhous_id" 
                  size="sm"
                  placeholder="자동 생성됩니다"
                  readonly
                />
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">창고명</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput 
                  v-model="formData.wrhous_nm" 
                  size="sm"
                  placeholder="자재창고"
                />
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">품목 유형</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormSelect v-model="formData.item_ty" size="sm">
                  <option value="">선택하세요</option>
                  <option value="E1">자재</option>
                  <option value="E2">반제품</option>
                  <option value="E3">완제품</option>
                </CFormSelect>
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">상태</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <div class="radio-group">
                  <CFormCheck 
                    class="radio-item"
                    type="radio" 
                    id="status-active"
                    name="status"
                    value="M1"
                    v-model="formData.st"
                    label="활성상태"
                  />
                  <CFormCheck 
                    class="radio-item"
                    type="radio" 
                    id="status-inactive"
                    name="status"
                    value="M2"
                    v-model="formData.st"
                    label="비활성상태"
                  />
                </div>
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">비고</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormTextarea 
                  v-model="formData.rm" 
                  rows="6" 
                  placeholder="비고사항을 입력하세요"
                  size="sm"
                />
              </CCol>
            </CRow>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'

// 조회 조건 폼
const searchForm = reactive({
  wrhous_id: '',
  wrhous_nm: '',
  item_ty: '',
  st: ''
})

// 창고 데이터 목록
const wrhousData = ref([])

// 선택된 창고
const selectedWrhous = ref(null)
const selectedRowIndex = ref(null)

// 입력 폼 데이터
const formData = reactive({
  wrhous_id: '',
  wrhous_nm: '',
  item_ty: '',
  st: 'M1',
  rm: ''
})

// 편집 모드 여부
const isEditMode = ref(false)

// 표시할 데이터 (최대 10행)
const displayedData = computed(() => {
  return wrhousData.value.slice(0, 10)
})

// 빈 행 개수 계산
const emptyRowCount = computed(() => {
  const dataCount = displayedData.value.length
  return dataCount < 10 ? 10 - dataCount : 0
})

// 창고 목록 조회
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

// 조회 조건 초기화
const resetSearch = () => {
  searchForm.wrhous_id = ''
  searchForm.wrhous_nm = ''
  searchForm.item_ty = ''
  searchForm.st = ''
  selectedRowIndex.value = null
  wrhousData.value = []
  
  // 우측 입력 폼도 함께 초기화
  resetForm()
}

// 창고 선택
const selectWrhous = (item, index) => {
  selectedWrhous.value = item
  selectedRowIndex.value = index
  isEditMode.value = true
  
  // 폼에 선택된 데이터 설정
  formData.wrhous_id = item.wrhous_id
  formData.wrhous_nm = item.wrhous_nm
  formData.item_ty = item.item_ty || ''
  formData.st = item.st
  formData.rm = item.rm || ''
}

// 폼 초기화 (신규 모드)
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

// 창고 저장 (신규/수정)
const saveWrhous = async () => {
  try {
    // 입력값 검증 (ID는 자동 생성되므로 제외)
    if (!formData.wrhous_nm.trim()) {
      alert('창고명을 입력해주세요.')
      return
    }

    console.log('[wrhousManage] 저장 데이터:', formData)
    
    const response = await axios.post('/api/wrhousManage', formData)
    
    if (response.data.success) {
      alert(isEditMode.value ? '창고 정보가 수정되었습니다.' : '새 창고가 등록되었습니다.')
      await searchWrhous() // 목록 재조회
      resetForm() // 폼 초기화
    }
  } catch (error) {
    console.error('[wrhousManage] 저장 에러:', error)
    alert('창고 저장 중 오류가 발생했습니다.')
  }
}

// 창고 삭제
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
      await searchWrhous() // 목록 재조회
      resetForm() // 폼 초기화
    }
  } catch (error) {
    console.error('[wrhousManage] 삭제 에러:', error)
    alert('창고 삭제 중 오류가 발생했습니다.')
  }
}

// 컴포넌트 마운트시에는 자동 조회하지 않음
onMounted(() => {
  // 자동 조회 제거 - 사용자가 조회 버튼을 눌러야 조회됨
})

// 품목 유형 라벨 변환 함수
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
/* ============================================
   기본 설정
   ============================================ */
:deep(*) {
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

/* ============================================
   검색 필터 박스
   ============================================ */
.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* ============================================
   그리드 박스와 폼 박스 - 고정 높이 (10개 행)
   ============================================ */
.grid-box,
.form-box {
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
   버튼 스페이서 (좌측 그리드용)
   ============================================ */
.button-spacer {
  opacity: 0;
  pointer-events: none;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* ============================================
   폼 요소 스타일
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
}

:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}

:deep(.form-control:disabled),
:deep(.form-control:read-only) {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

:deep(.form-control::placeholder) {
  color: #cbd5e1;
}

/* ============================================
   라디오 버튼
   ============================================ */
.radio-group {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

:deep(.radio-item) {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

:deep(.form-check-input) {
  cursor: pointer;
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

:deep(.form-check-label) {
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  font-weight: 500;
  margin-left: 0.3rem;
}

/* ============================================
   테이블 래퍼와 스크롤바
   ============================================ */
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

/* Firefox용 */
.table-wrapper {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
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

/* ============================================
   배지 스타일
   ============================================ */
:deep(.badge) {
  font-size: 11px;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
}

/* ============================================
   간격 조정
   ============================================ */
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

/* ============================================
   반응형 디자인
   ============================================ */
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
    max-height: calc(42px + 10 * 42px + 2px) !important;
  }
}
</style>

<style scoped>
/* ============================================
   컨테이너 / 박스 - CompanyManage 스타일 준용
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
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
.form-box {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

/* 투명 버튼 영역 (높이 맞추기용) */
.button-spacer {
  visibility: hidden;
  height: 38px;
}

/* ============================================
   버튼 - CompanyManage 스타일 준용
   ============================================ */
.btn,
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
:deep(.btn-danger:hover:not(:disabled)) {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}
:deep(.btn:active) {
  transform: translateY(0);
}
:deep(.btn:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 버튼 간격 */
.gap-2 {
  gap: 0.5rem;
}

/* ============================================
   폼 요소 - CompanyManage 스타일 준용
   ============================================ */
.form-label,
:deep(.form-label) {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}
:deep(.form-control),
:deep(input.form-control),
:deep(select.form-control),
:deep(textarea.form-control),
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
:deep(textarea.form-control) {
  height: auto;
  min-height: 80px;
  resize: vertical;
}
:deep(.form-control:focus),
:deep(input.form-control:focus),
:deep(select.form-control:focus),
:deep(textarea.form-control:focus),
:deep(.form-select:focus) {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}
:deep(.form-control:read-only) {
  background-color: #e9ecef;
  cursor: not-allowed;
}

/* 라디오 버튼 그룹 */
.radio-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.radio-item {
  margin-bottom: 0;
}
:deep(.form-check-input) {
  cursor: pointer;
}
:deep(.form-check-label) {
  font-size: 12px;
  font-weight: 400;
  color: #2c3e50;
  cursor: pointer;
}

/* 검색 필터 영역 압축 - CompanyManage와 동일 */
:deep(.g-3) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
}

/* ============================================
   테이블 - CompanyManage 스타일 준용
   ============================================ */
.table-wrapper {
  --row-h: 35px;
  --head-h: 44px;
  flex: 1 1 auto;
  border-radius: 10px;
  height: calc(var(--head-h) + (10 * var(--row-h)));
  max-height: calc(var(--head-h) + (10 * var(--row-h)));
  overflow-y: auto;
  overflow-x: hidden;
}
.data-table,
:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  table-layout: fixed;
  width: 100%;
}
:deep(.data-table thead),
:deep(.table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}
:deep(.data-table th),
:deep(.table thead th) {
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
:deep(.data-table th:first-child),
:deep(.table thead th:first-child) {
  border-top-left-radius: 10px;
}
:deep(.data-table th:last-child),
:deep(.table thead th:last-child) {
  border-top-right-radius: 10px;
}
:deep(.data-table td),
:deep(.table tbody td) {
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  color: #2c3e50;
  height: var(--row-h);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #ffffff;
}
:deep(.data-table td:last-child),
:deep(.table tbody td:last-child) {
  border-right: none;
}
:deep(.data-table tbody tr),
:deep(.table tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
  cursor: pointer;
}

/* hover 효과 */
:deep(.data-table),
:deep(.table) {
  --row-hover-bg: var(
    --cui-table-hover-bg,
    var(
      --bs-table-hover-bg,
      rgba(var(--cui-emphasis-color-rgb, var(--bs-emphasis-color-rgb, 33, 37, 41)), 0.075)
    )
  );
}

:deep(.data-table tbody tr:hover:not(.empty-row)),
:deep(.table tbody tr:hover:not(.empty-row)) {
  background-color: var(--row-hover-bg) !important;
}
:deep(.data-table tbody tr:hover:not(.empty-row) td),
:deep(.table tbody tr:hover:not(.empty-row) td) {
  background-color: var(--row-hover-bg) !important;
}

/* 선택된 행 스타일 */
:deep(.table tbody tr.selected-row) {
  background-color: rgba(108, 117, 125, 0.15) !important;
}
:deep(.table tbody tr.selected-row td) {
  background-color: rgba(108, 117, 125, 0.15) !important;
  font-weight: 600;
}

/* 빈 행 스타일 */
.empty-row,
:deep(.empty-row) {
  cursor: default !important;
}
.empty-row td,
:deep(.empty-row td) {
  height: var(--row-h);
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
}

/* 배지 스타일 */
:deep(.badge) {
  font-size: 11px;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
}

/* ============================================
   모던 스크롤바 - CompanyManage 스타일 준용
   ============================================ */
.table-wrapper,
.form-box > div {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
.table-wrapper::-webkit-scrollbar,
.form-box > div::-webkit-scrollbar {
  width: 6px;
}
.table-wrapper::-webkit-scrollbar-track,
.form-box > div::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
.table-wrapper::-webkit-scrollbar-thumb,
.form-box > div::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(2px);
  transition: all 0.2s ease;
}
.table-wrapper::-webkit-scrollbar-thumb:hover,
.form-box > div::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
.table-wrapper,
.form-box > div {
  scrollbar-width: thin;
  scrollbar-color: #9ea2a8 rgba(240, 240, 240, 0.6);
}

/* ============================================
   반응형 축소 시 폰트 크기 조정
   ============================================ */
@media (max-width: 1600px) {
  .form-label,
  :deep(.form-label),
  :deep(.form-control),
  :deep(input.form-control),
  :deep(select.form-control),
  :deep(textarea.form-control),
  :deep(.form-select),
  :deep(.form-check-label),
  :deep(.btn),
  :deep(.table th),
  :deep(.table td) {
    font-size: 11px !important;
  }
  :deep(.btn) {
    padding: 0.4rem 1rem;
  }
}
</style>