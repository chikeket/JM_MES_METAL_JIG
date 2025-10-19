<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="searchEqm">조회</CButton>
      <CButton color="secondary" size="sm" @click="resetSearch">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-2">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">설비그룹명</CFormLabel>
          <CFormInput v-model="searchForm.eqm_grp_nm" size="sm" placeholder="창고 ID를 입력하세요" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">설비명</CFormLabel>
          <CFormInput v-model="searchForm.eqm_nm" size="sm" placeholder="창고명을 입력하세요" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">제조회사
          </CFormLabel>
          <CFormSelect v-model="searchForm.make_co" size="sm">
            <option value="">전체</option>
            <option value="E1">프레스월드</option>
            <option value="E2">사출코</option>
            <option value="E3">라인메이커</option>
            <option value="E4">비전텍</option>
            <option value="E5">예담</option>
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
                  <CTableHeaderCell scope="col" class="text-center">설비명</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">제조모델</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">제조일자</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">설치일자</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center" style="width: 100px">상태</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <!-- 데이터 행 -->
                <CTableRow 
                  v-for="(item, index) in displayedData" 
                  :key="item.eqm_nm"
                  @click="selectEqm(item, index)"
                  :class="{ 'selected-row': selectedRowIndex === index }"
                >
                  <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.rqm_nm }}</CTableDataCell>
                  <CTableDataCell>{{ item.make_model }}</CTableDataCell>
                  <CTableDataCell>{{ getEqmMakeCoLabel(item.make_co) }}</CTableDataCell>
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
          <CButton color="secondary" size="sm" @click="saveEqm">저장</CButton>
          <CButton color="danger" size="sm" @click="deleteEqm" :disabled="!selectedEqm">삭제</CButton>
        </div>

        <!-- 입력 폼 -->
        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="p-3 flex-grow-1 overflow-auto">
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">설비그룹</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput 
                  v-model="formData.eqm_grp_nm" 
                  size="sm"
                  placeholder="자동 생성됩니다"
                  readonly
                />
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">설비명</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput 
                  v-model="formData.eqm_nm" 
                  size="sm"
                />
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">제조사</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormSelect v-model="formData.make_co" size="sm">
                  <option value="">선택하세요</option>
                  <option value="E1">프레스월드</option>
                  <option value="E2">사출코</option>
                  <option value="E3">라인메이커</option>
                  <option value="E3">비전텍</option>
                  <option value="E3">예담</option>
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
  eqm_grp_nm: '',
  eqm_nm: '',
  make_co: '',
  st: ''
})

// 설비 데이터 목록
const eqmData = ref([])

// 선택된 설비
const selectedEqm = ref(null)
const selectedRowIndex = ref(null)

// 입력 폼 데이터
const formData = reactive({
  eqm_grp_nm: '',
  eqm_nm: '',
  make_co: '',
  st: 'M1',
  rm: ''
})

// 편집 모드 여부
const isEditMode = ref(false)

// 표시할 데이터 (최대 10행)
const displayedData = computed(() => {
  return eqmData.value.slice(0, 10)
})

// 빈 행 개수 계산
const emptyRowCount = computed(() => {
  const dataCount = displayedData.value.length
  return dataCount < 10 ? 10 - dataCount : 0
})

// 설비 목록 조회
const searchEqm = async () => {
  try {
    console.log('[eqm] 조회 조건:', searchForm)
    const response = await axios.get('/api/eqm', {
      params: searchForm
    })
    eqmData.value = response.data   // ✅ 수정 완료
    selectedRowIndex.value = null
    console.log('[eqm] 조회 결과:', response.data)
  } catch (error) {
    console.error('[eqm] 조회 에러:', error)
    alert('설비 목록 조회 중 오류가 발생했습니다.')
  }
}

// 조회 조건 초기화
const resetSearch = () => {
  searchForm.eqm_grp_nm = ''
  searchForm.eqm_nm = ''
  searchForm.make_co = ''
  searchForm.st = ''
  selectedRowIndex.value = null
  eqmData.value = []
  
  // 우측 입력 폼도 함께 초기화
  resetForm()
}

// 창고 선택
const selectEqm = (item, index) => {
  selectedEqm.value = item
  selectedRowIndex.value = index
  isEditMode.value = true
  
  // 폼에 선택된 데이터 설정
  formData.eqm_grp_nm = item.eqm_grp_nm
  formData.eqm_nm = item.eqm_nm
  formData.make_co = item.make_co || ''
  formData.st = item.st
  formData.rm = item.rm || ''
}

// 폼 초기화 (신규 모드)
const resetForm = () => {
  selectedEqm.value = null
  selectedRowIndex.value = null
  isEditMode.value = false
  
  formData.eqm_grp_nm = ''
  formData.eqm_nm = ''
  formData.make_co = ''
  formData.st = 'M1'
  formData.rm = ''
}

// 창고 저장 (신규/수정)
const saveEqm = async () => {
  try {
    // 입력값 검증 (ID는 자동 생성되므로 제외)
    if (!formData.eqm_grp_nm.trim()) {
      alert('창고명을 입력해주세요.')
      return
    }

    console.log('[eqm] 저장 데이터:', formData)
    
    const response = await axios.post('/api/eqm', formData)
    
    if (response.data.success) {
      alert(isEditMode.value ? '창고 정보가 수정되었습니다.' : '새 창고가 등록되었습니다.')
      await searchEqm() // 목록 재조회
      resetForm() // 폼 초기화
    }
  } catch (error) {
    console.error('[wrhousManage] 저장 에러:', error)
    alert('창고 저장 중 오류가 발생했습니다.')
  }
}

// 창고 삭제
const deleteEqm = async () => {
  if (!selectedEqm.value) {
    alert('삭제할 창고를 선택해주세요.')
    return
  }

  if (!confirm(`창고 '${selectedEqm.value.eqm_grp_nm}'를 삭제하시겠습니까?`)) {
    return
  }

  try {
    console.log('[eqm] 삭제 ID:', selectedEqm.value.eqm_grp_nm)
    
    const response = await axios.delete(`/api/eqm/${selectedEqm.value.eqm_grp_nm}`)
    
    if (response.data.success) {
      alert('설비가 삭제되었습니다.')
      await searchEqm() // 목록 재조회
      resetForm() // 폼 초기화
    }
  } catch (error) {
    console.error('[eqm] 삭제 에러:', error)
    alert('창고 삭제 중 오류가 발생했습니다.')
  }
}

// 컴포넌트 마운트시에는 자동 조회하지 않음
onMounted(() => {
  // 자동 조회 제거 - 사용자가 조회 버튼을 눌러야 조회됨
})

// 품목 유형 라벨 변환 함수
const getEqmMakeCoLabel = (makeCoType) => {
  const itemTypeMap = {
    'E1': '프레스월드',
    'E2': '사출코', 
    'E3': '라인메이커',
    'E4': '비전텍',
    'E5': '예담'
  }
  return makeCoType[makeCoType] || makeCoType || ''
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

/* 검색 필터 영역 압축 */
:deep(.g-3) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
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
   모던 스크롤바 스타일 (Glass / Minimal)
   ============================================ */
.table-wrapper,
:deep(.overflow-auto) {
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

/* 모던 스크롤바 스타일 (Glass / Minimal) */
.table-wrapper::-webkit-scrollbar,
:deep(.overflow-auto)::-webkit-scrollbar {
  width: 8px;
}

.table-wrapper::-webkit-scrollbar-track,
:deep(.overflow-auto)::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}

.table-wrapper::-webkit-scrollbar-thumb,
:deep(.overflow-auto)::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(2px);
  transition: all 0.2s ease;
}

.table-wrapper::-webkit-scrollbar-thumb:hover,
:deep(.overflow-auto)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* Firefox 대응 */
.table-wrapper,
:deep(.overflow-auto) {
  scrollbar-width: thin;
  scrollbar-color: #9ea2a8 rgba(240, 240, 240, 0.6);
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

