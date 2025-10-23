<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="searchWrhousZone">조회</CButton>
      <CButton color="secondary" size="sm" @click="resetSearch">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-2">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">창고 ID</CFormLabel>
          <CFormInput v-model="searchForm.wrhous_id" size="sm" placeholder="창고 ID" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">창고 이름</CFormLabel>
          <CFormInput v-model="searchForm.wrhous_nm" size="sm" placeholder="창고 이름" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">로케이션 ID</CFormLabel>
          <CFormInput v-model="searchForm.zone_id" size="sm" placeholder="로케이션 ID" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">로케이션 이름</CFormLabel>
          <CFormInput v-model="searchForm.zone_nm" size="sm" placeholder="로케이션 이름" />
        </CCol>
      </CRow>
      <CRow class="g-3 mt-1">
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
        <CCol :md="6">
          <!-- 빈 공간 -->
        </CCol>
      </CRow>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2">
      <!-- 좌측: 데이터 그리드 -->
      <CCol :md="7" class="d-flex flex-column overflow-hidden">
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
                  <CTableHeaderCell scope="col" class="text-center" style="width: 40px">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">창고 ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">창고 이름</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">로케이션 ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">로케이션 이름</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">품목 유형</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center" style="width: 80px">상태</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <!-- 데이터 행 -->
                <CTableRow 
                  v-for="(item, index) in displayedData" 
                  :key="`${item.wrhous_id}-${item.zone_id || 'no-zone'}`"
                  @click="selectZone(item, index)"
                  :class="{ 'selected-row': selectedRowIndex === index }"
                >
                  <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.wrhous_id }}</CTableDataCell>
                  <CTableDataCell>{{ item.wrhous_nm }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    {{ item.zone_id || '-' }}
                  </CTableDataCell>
                  <CTableDataCell>
                    <span :class="{ 'text-muted': !item.zone_id }">
                      {{ item.zone_id ? item.zone_nm : '로케이션 없음' }}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>
                    {{ getItemTypeLabel(getWarehouseItemType(item)) || '-' }}
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <template v-if="getWarehouseStatus(item)
                                      && getWarehouseStatus(item) !== ''">
                      <CBadge :color="getWarehouseStatus(item) === 'M1' ? 'success' : 'secondary'">
                        {{ getWarehouseStatus(item) === 'M1' ? '활성' : '비활성' }}
                      </CBadge>
                    </template>
                    <span v-else class="text-muted">-</span>
                  </CTableDataCell>
                  <CTableDataCell>{{ item.rm || '' }}</CTableDataCell>
                </CTableRow>
                <!-- 빈 행 채우기 (10행 고정) -->
                <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="8">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 -->
      <CCol :md="5" class="d-flex flex-column overflow-hidden">
        <!-- 신규/저장/삭제 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="resetForm">신규</CButton>
          <CButton color="secondary" size="sm" @click="saveZone">저장</CButton>
          <CButton color="danger" size="sm" @click="deleteZone" :disabled="!selectedZone">삭제</CButton>
        </div>

        <!-- 입력 폼 -->
        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="p-3 flex-grow-1 overflow-auto">
            <CRow class="mb-2">
              <CCol :md="4" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">창고 ID</CFormLabel>
              </CCol>
              <CCol :md="7" class="ps-3">
                <CFormInput 
                  v-model="formData.wrhous_id"
                  size="sm"
                  placeholder="창고 ID를 입력하세요"
                  readonly
                />
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="4" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">창고 이름</CFormLabel>
              </CCol>
              <CCol :md="7" class="ps-3">
                <CFormInput 
                  v-model="formData.wrhous_nm" 
                  size="sm"
                  placeholder="창고 이름"
                  readonly
                />
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="4" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">로케이션 ID</CFormLabel>
              </CCol>
              <CCol :md="7" class="ps-3">
                <CFormInput 
                  v-model="formData.zone_id" 
                  size="sm"
                  placeholder="자동 생성됩니다"
                  readonly
                />
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="4" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">로케이션 이름</CFormLabel>
              </CCol>
              <CCol :md="7" class="ps-3">
                <CFormInput 
                  v-model="formData.zone_nm" 
                  size="sm"
                  placeholder="자재창고 A구역 01번"
                />
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="4" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">품목 유형</CFormLabel>
              </CCol>
              <CCol :md="7" class="ps-3">
                <!-- 사용자가 변경하지 못하도록 읽기전용으로 표시 -->
                <CFormInput
                  :value="getItemTypeLabel(formData.item_ty) || '-'"
                  readonly
                  size="sm"
                />
                <!-- 내부적으로 값은 formData.item_ty에 보관되어 전송 시 사용됨 -->
              </CCol>
            </CRow>
            
            <CRow class="mb-2">
              <CCol :md="4" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">상태</CFormLabel>
              </CCol>
              <CCol :md="7" class="ps-3">
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
              <CCol :md="4" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">비고</CFormLabel>
              </CCol>
              <CCol :md="7" class="ps-3">
                <CFormTextarea 
                  v-model="formData.rm" 
                  rows="4" 
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
  zone_id: '',
  wrhous_id: '',
  item_ty: '',
  zone_nm: '',
  st: '',
  wrhous_nm: ''
})

// 로케이션 데이터 목록
const zoneData = ref([])

// 창고 옵션 목록
const wrhousOptions = ref([])

// 선택된 로케이션
const selectedZone = ref(null)
const selectedRowIndex = ref(null)

// 입력 폼 데이터
const formData = reactive({
  zone_id: '',
  wrhous_id: '',
  wrhous_nm: '',
  item_ty: '',
  zone_nm: '',
  st: 'M1',
  rm: ''
})

// 편집 모드 여부
const isEditMode = ref(false)

// 선택된 창고명 (표시용)
const selectedWrhousNm = computed(() => {
  const wrhous = wrhousOptions.value.find(w => w.wrhous_id === formData.wrhous_id)
  return wrhous ? wrhous.wrhous_nm : ''
})

// 창고의 기본 품목유형을 반환 (존재하지 않으면 빈 문자열)
const getWarehouseItemType = (item) => {
  if (!item) return ''
  const wh = wrhousOptions.value.find(w => w.wrhous_id === item.wrhous_id)
  // 창고 객체에 item_ty 필드가 있을 수도 있고, 없으면 zone의 item_ty 사용
  return (wh && (wh.item_ty || wh.item_type)) || item.item_ty || ''
}

// 창고의 기본 상태 반환
const getWarehouseStatus = (item) => {
  if (!item) return ''
  const wh = wrhousOptions.value.find(w => w.wrhous_id === item.wrhous_id)
  return (wh && (wh.st || wh.status)) || item.st || ''
}

// 표시할 데이터 (최대 10행)
const displayedData = computed(() => {
  return zoneData.value.slice(0, 30)
})

// 빈 행 개수 계산
const emptyRowCount = computed(() => {
  const dataCount = displayedData.value.length
  return dataCount < 30 ? 30 - dataCount : 0
})

// 창고 목록 조회 (로케이션 등록용)
const loadWrhousOptions = async () => {
  try {
    const response = await axios.get('/api/wrhousForZone')
    wrhousOptions.value = response.data
    console.log('[wrhousZoneManage] 창고 옵션 로드:', response.data)
  } catch (error) {
    console.error('[wrhousZoneManage] 창고 옵션 로드 에러:', error)
  }
}

// 로케이션 목록 조회
const searchWrhousZone = async () => {
  try {
    console.log('[wrhousZoneManage] 조회 조건:', searchForm)
    const response = await axios.get('/api/wrhousZoneManage', {
      params: searchForm
    })
    zoneData.value = response.data
    selectedRowIndex.value = null
    console.log('[wrhousZoneManage] 조회 결과:', response.data)
  } catch (error) {
    console.error('[wrhousZoneManage] 조회 에러:', error)
    alert('로케이션 목록 조회 중 오류가 발생했습니다.')
  }
}

// 조회 조건 초기화
const resetSearch = () => {
  searchForm.zone_id = ''
  searchForm.wrhous_id = ''
  searchForm.item_ty = ''
  searchForm.zone_nm = ''
  searchForm.st = ''
  searchForm.wrhous_nm = ''
  selectedRowIndex.value = null
  zoneData.value = []
  
  // 우측 입력 폼 완전 초기화 (창고 정보도 포함)
  selectedZone.value = null
  isEditMode.value = false
  formData.zone_id = ''
  formData.wrhous_id = ''
  formData.wrhous_nm = ''
  formData.item_ty = ''
  formData.zone_nm = ''
  formData.st = 'M1'
  formData.rm = ''
}

// 로케이션 선택
const selectZone = (item, index) => {
  selectedZone.value = item
  selectedRowIndex.value = index
  
  // 로케이션이 있는 경우는 편집 모드, 없는 경우는 신규 모드
    if (item.zone_id && item.zone_id.trim() !== '') {
    isEditMode.value = true
    
    // 폼에 선택된 데이터 설정 (편집 모드)
    formData.zone_id = item.zone_id
    formData.wrhous_id = item.wrhous_id
    formData.wrhous_nm = item.wrhous_nm
  // 창고의 품목유형/상태가 우선
  formData.item_ty = getWarehouseItemType(item) || item.item_ty || ''
    formData.zone_nm = item.zone_nm === '로케이션 없음' ? '' : item.zone_nm
  formData.st = getWarehouseStatus(item) || item.st || 'M1'
    formData.rm = item.rm || ''
  } else {
    // 로케이션이 없는 창고 선택시 신규 모드로 창고 정보만 설정
    isEditMode.value = false
    
    formData.zone_id = ''
    formData.wrhous_id = item.wrhous_id
    formData.wrhous_nm = item.wrhous_nm
  // 신규 모드일 때도 창고의 기본 품목유형을 셋팅
  formData.item_ty = getWarehouseItemType(item) || ''
    formData.zone_nm = ''
  formData.st = getWarehouseStatus(item) || 'M1'
    formData.rm = ''
  }
}

// 폼 초기화 (신규 모드)
const resetForm = () => {
  selectedZone.value = null
  selectedRowIndex.value = null
  isEditMode.value = false
  
  // 창고 정보를 유지하면서 나머지만 초기화
  const currentWrhousId = formData.wrhous_id
  const currentWrhousNm = formData.wrhous_nm
  
  formData.zone_id = ''
  formData.item_ty = ''
  formData.zone_nm = ''
  formData.st = 'M1'
  formData.rm = ''
  
  // 창고 정보가 있으면 유지, 없으면 빈 값
  if (currentWrhousId && currentWrhousNm) {
    formData.wrhous_id = currentWrhousId
    formData.wrhous_nm = currentWrhousNm
  } else {
    formData.wrhous_id = ''
    formData.wrhous_nm = ''
  }
}

// 창고 선택시 창고명 자동 입력
const onWrhousSelect = () => {
  const selectedWrhous = wrhousOptions.value.find(w => w.wrhous_id === formData.wrhous_id)
  if (selectedWrhous) {
    formData.wrhous_nm = selectedWrhous.wrhous_nm
  } else {
    formData.wrhous_nm = ''
  }
}

// 품목 유형 라벨 변환 함수
const getItemTypeLabel = (itemType) => {
  const itemTypeMap = {
    'E1': '자재',
    'E2': '반제품', 
    'E3': '완제품'
  }
  return itemTypeMap[itemType] || itemType || ''
}

// 로케이션 저장 (신규/수정)
const saveZone = async () => {
  try {
    // 입력값 검증 (로케이션 ID는 자동 생성되므로 제외)
    if (!formData.wrhous_id.trim()) {
      alert('창고를 선택해주세요.')
      return
    }
    if (!formData.zone_nm.trim()) {
      alert('로케이션 이름을 입력해주세요.')
      return
    }

    console.log('[wrhousZoneManage] 저장 데이터:', formData)
    
    const response = await axios.post('/api/wrhousZoneManage', formData)
    
    if (response.data.success) {
      alert(isEditMode.value ? '로케이션 정보가 수정되었습니다.' : '새 로케이션이 등록되었습니다.')
      await searchWrhousZone() // 목록 재조회
      resetForm() // 폼 초기화
    }
  } catch (error) {
    console.error('[wrhousZoneManage] 저장 에러:', error)
    alert('로케이션 저장 중 오류가 발생했습니다.')
  }
}

// 로케이션 삭제
const deleteZone = async () => {
  if (!selectedZone.value) {
    alert('삭제할 로케이션을 선택해주세요.')
    return
  }

  if (!confirm(`로케이션 '${selectedZone.value.zone_nm}'를 삭제하시겠습니까?`)) {
    return
  }

  try {
    console.log('[wrhousZoneManage] 삭제 ID:', selectedZone.value.zone_id)
    
    const response = await axios.delete(`/api/wrhousZoneManage/${selectedZone.value.zone_id}`)
    
    if (response.data.success) {
      alert('로케이션이 삭제되었습니다.')
      await searchWrhousZone() // 목록 재조회
      resetForm() // 폼 초기화
    }
  } catch (error) {
    console.error('[wrhousZoneManage] 삭제 에러:', error)
    alert('로케이션 삭제 중 오류가 발생했습니다.')
  }
}

// 컴포넌트 마운트시 창고 옵션만 로드 (자동 조회 제거)
onMounted(async () => {
  await loadWrhousOptions() // 창고 옵션 먼저 로드
  // 자동 조회 제거 - 사용자가 조회 버튼을 눌러야 조회됨
})
</script>

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

/* match Eqm.vue radio appearance: muted gray */
:deep(.radio-item .form-check-input) {
  width: 18px !important;
  height: 18px !important;
  margin: 0 6px 0 0 !important;
  flex-shrink: 0 !important;
  cursor: pointer;
  border: 2px solid #6c757d;
}

:deep(.radio-item .form-check-input:checked) {
  background-color: #6c757d !important;
  border-color: #6c757d !important;
}

:deep(.radio-item .form-check-input:focus) {
  border-color: #6c757d !important;
  box-shadow: 0 0 0 0.15rem rgba(108, 117, 125, 0.15) !important;
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