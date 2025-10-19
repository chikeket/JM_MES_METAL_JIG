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
          <CFormLabel class="form-label">설비 그룹 명</CFormLabel>
          <CFormInput
            v-model="searchForm.eqm_grp_nm"
            size="sm"
            placeholder="설비그룹명을 입력하세요"
          />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">설비 명</CFormLabel>
          <CFormInput v-model="searchForm.eqm_nm" size="sm" placeholder="설비명을 입력하세요" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">제조 회사</CFormLabel>
          <CFormSelect v-model="searchForm.make_co" size="sm">
            <option value="">전체</option>
            <option v-for="co in makeCompanies" :key="co" :value="co">
              {{ getEqmMakeCoLabel(co) }}
            </option>
          </CFormSelect>
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">상태</CFormLabel>
          <CFormSelect v-model="searchForm.st" size="sm">
            <option value="">전체</option>
            <option v-for="s in statuses" :key="s.st" :value="s.st">{{ s.st_nm }}</option>
          </CFormSelect>
        </CCol>
      </CRow>
      <!-- Removed the incorrectly inserted CRow block for 점검 주기 -->
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2 main-content-row">
      <!-- 좌측: 데이터 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden left-pane">
        <div class="button-spacer mb-2">
          <CButton color="secondary" size="sm">신규</CButton>
          <CButton color="secondary" size="sm">저장</CButton>
          <CButton color="danger" size="sm">삭제</CButton>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper" :style="tableWrapperStyle">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col" class="text-center" style="width: 60px"
                    >No</CTableHeaderCell
                  >
                  <CTableHeaderCell scope="col" class="text-center">설비 명</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">제조 모델</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">제조 일자</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center">설치 일자</CTableHeaderCell>
                  <CTableHeaderCell scope="col" class="text-center" style="width: 100px"
                    >상태</CTableHeaderCell
                  >
                  <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in displayedData"
                  :key="item.eqm_id"
                  @click="selectEqm(item, index)"
                  :class="{ 'selected-row': selectedRowIndex === index }"
                >
                  <CTableDataCell class="text-center">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.eqm_nm }}</CTableDataCell>
                  <CTableDataCell>{{ item.make_model }}</CTableDataCell>
                  <CTableDataCell>{{ formatDate(item.make_dt) }}</CTableDataCell>
                  <CTableDataCell>{{ formatDate(item.setp_dt) }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{
                    item.st_nm || item.st || ''
                  }}</CTableDataCell>
                  <CTableDataCell>{{ item.rm || '' }}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden right-pane">
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="resetForm">신규</CButton>
          <CButton color="secondary" size="sm" @click="saveEqm">저장</CButton>
          <CButton color="danger" size="sm" @click="deleteEqm" :disabled="!selectedEqm"
            >삭제</CButton
          >
        </div>

        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="p-3 flex-grow-1 overflow-auto">
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">설비 그룹 명</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput
                  v-model="formData.eqm_grp_nm"
                  size="sm"
                  placeholder="그룹명을 입력 또는 선택"
                />
              </CCol>
            </CRow>

            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">설비 명</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput v-model="formData.eqm_nm" size="sm" />
              </CCol>
            </CRow>

            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">제조 모델</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput
                  v-model="formData.make_model"
                  size="sm"
                  placeholder="제조 모델을 입력하세요"
                />
              </CCol>
            </CRow>

            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">제조사</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput
                  v-model="formData.make_co"
                  size="sm"
                  placeholder="제조사를 입력하세요"
                />
              </CCol>
            </CRow>

            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">제조 일자</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput type="date" v-model="formData.make_dt" size="sm" />
              </CCol>
            </CRow>

            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">설치 일자</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput type="date" v-model="formData.setp_dt" size="sm" />
              </CCol>
            </CRow>

            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">설비 상태</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <div class="radio-group">
                  <CFormCheck
                    class="radio-item"
                    type="radio"
                    id="status-active"
                    name="status"
                    :value="'M2'"
                    v-model="formData.st"
                    label="가동"
                  />
                  <CFormCheck
                    class="radio-item"
                    type="radio"
                    id="status-inactive"
                    name="status"
                    :value="'M1'"
                    v-model="formData.st"
                    label="비가동"
                  />
                </div>
              </CCol>
            </CRow>

            <CRow class="mb-2"> </CRow>

            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">점검 주기</CFormLabel>
              </CCol>
              <CCol :md="8" class="ps-3">
                <CFormInput
                  type="text"
                  v-model="formData.chck_cycle"
                  size="sm"
                  placeholder="일 수"
                />
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
  st: '',
})

// 설비 데이터 목록
const eqmData = ref([])
const makeCompanies = ref([])
const statuses = ref([])

// 선택된 설비
const selectedEqm = ref(null)
const selectedRowIndex = ref(null)

// 입력 폼 데이터
const formData = reactive({
  eqm_grp_nm: '',
  eqm_nm: '',
  make_model: '',
  make_co: '',
  make_dt: '',
  setp_dt: '',
  chck_cycle: '',
  st: 'M2',
  rm: '',
})

// 편집 모드 여부
const isEditMode = ref(false)

// 표시할 데이터 (전체)
const displayedData = computed(() => {
  return eqmData.value
})

// 빈 행 패딩 제거 (스크롤을 위해 전체 데이터만 렌더)
const emptyRowCount = computed(() => 0)

// ==============================
// 그리드 표시 행수/높이 설정
// 사용자가 조절 가능한 설정 값들입니다.
// ==============================
// 최대 표시 줄 수 (필요 시 변경)
const MAX_GRID_ROWS = ref(12)
// 데이터 행 높이(px) - 테마/패딩에 따라 34~40 사이, 필요 시 조정
const GRID_ROW_HEIGHT = ref(36)
// 헤더 높이(px) - th padding 기준 대략 40~48, 필요 시 조정
const GRID_HEADER_HEIGHT = ref(44)

// 테이블 래퍼 스타일: 최대 높이를 계산해 초과 시 세로 스크롤
const tableWrapperStyle = computed(() => {
  const rows = Math.max(1, Math.min(MAX_GRID_ROWS.value, displayedData.value.length || 0))
  const maxH = GRID_HEADER_HEIGHT.value + GRID_ROW_HEIGHT.value * rows
  return { height: 'auto', maxHeight: `${maxH}px` }
})

// 설비 목록 조회
const searchEqm = async () => {
  try {
    const { data } = await axios.get('/api/eqm', { params: searchForm })
    eqmData.value = Array.isArray(data) ? data : []
    selectedRowIndex.value = null
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

// 설비 선택
const selectEqm = (item, index) => {
  selectedEqm.value = item
  selectedRowIndex.value = index
  isEditMode.value = true

  // 폼에 선택된 데이터 설정
  formData.eqm_grp_nm = item.eqm_grp_nm || ''
  formData.eqm_nm = item.eqm_nm
  formData.make_co = item.make_co || ''
  formData.st = mapStatusCode(item.st, item.st_nm)
  formData.make_model = item.make_model || ''
  formData.make_dt = toDateInput(item.make_dt)
  formData.setp_dt = toDateInput(item.setp_dt)
  formData.chck_cycle = item.chck_cycle ?? ''
  formData.rm = item.rm || ''
}

// 폼 초기화 (신규 모드)
const resetForm = () => {
  selectedEqm.value = null
  selectedRowIndex.value = null
  isEditMode.value = false

  formData.eqm_grp_nm = ''
  formData.eqm_nm = ''
  formData.make_model = ''
  formData.make_co = ''
  formData.make_dt = ''
  formData.setp_dt = ''
  formData.chck_cycle = ''
  formData.st = 'M2'
  formData.rm = ''
}

// 설비 저장 (신규/수정)
const saveEqm = async () => {
  try {
    // 간단 검증
    if (!formData.eqm_nm || !String(formData.eqm_nm).trim()) {
      alert('설비명을 입력해주세요.')
      return
    }

    // 저장 payload 구성
    const payload = {
      // eqm_grp_id는 현재 UI에서 선택 기능이 없어 전송하지 않음(업데이트 시 null 덮어쓰기 방지)
      eqm_grp_nm: formData.eqm_grp_nm || null,
      eqm_nm: String(formData.eqm_nm).trim(),
      make_co: formData.make_co || null,
      make_model: formData.make_model || null,
      make_dt: formData.make_dt || null,
      setp_dt: formData.setp_dt || null,
      chck_cycle: formData.chck_cycle || null,
      st: mapStatusForPersist(formData.st),
      rm: formData.rm || null,
    }

    let res
    if (selectedEqm.value && selectedEqm.value.eqm_id) {
      // UPDATE
      res = await axios.put(`/api/eqm/${selectedEqm.value.eqm_id}`, payload)
    } else {
      // INSERT
      res = await axios.post('/api/eqm', payload)
    }

    if (res?.data?.success === false) {
      throw new Error(res.data.message || '저장 실패')
    }

    alert('저장되었습니다.')
    await searchEqm()
    resetForm()
  } catch (error) {
    console.error('[eqm] 저장 에러:', error)
    alert(error?.response?.data?.message || error.message || '설비 저장 중 오류가 발생했습니다.')
  }
}

// 설비 삭제
const deleteEqm = async () => {
  try {
    if (!selectedEqm.value || !selectedEqm.value.eqm_id) return
    const ok = confirm('선택한 설비를 삭제하시겠습니까?')
    if (!ok) return
    const res = await axios.delete(`/api/eqm/${selectedEqm.value.eqm_id}`)
    if (res?.data?.success === false) {
      throw new Error(res.data.message || '삭제 실패')
    }
    alert('삭제되었습니다.')
    await searchEqm()
    resetForm()
  } catch (error) {
    console.error('[eqm] 삭제 에러:', error)
    alert(error?.response?.data?.message || error.message || '설비 삭제 중 오류가 발생했습니다.')
  }
}

// 컴포넌트 마운트시에는 자동 조회하지 않음
onMounted(async () => {
  try {
    const [coRes, stRes] = await Promise.all([
      axios.get('/api/eqm/make-companies'),
      axios.get('/api/eqm/statuses'),
    ])
    makeCompanies.value = Array.isArray(coRes.data) ? coRes.data : []
    statuses.value = Array.isArray(stRes.data) ? stRes.data : []
  } catch (e) {
    console.warn('[eqm] 드롭다운 초기화 실패', e)
  }
})

// 품목 유형 라벨 변환 함수
const getEqmMakeCoLabel = (code) => {
  const map = { E1: '프레스월드', E2: '사출코', E3: '라인메이커', E4: '비전텍', E5: '예담' }
  return map[code] || code || ''
}

const formatDate = (val) => {
  if (!val) return ''
  try {
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) return String(val)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  } catch {
    return String(val)
  }
}

const toDateInput = (val) => {
  if (!val) return ''
  // ISO 또는 Date 가능한 값 처리
  const d = new Date(val)
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  // 'YYYYMMDD' 같은 문자열 처리
  const s = String(val)
  if (s.length === 8 && /^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
  }
  return ''
}

// 상태 코드 매핑 (행 클릭 시 폼 표시용)
// DB 코드: Q1(가동), Q2(비가동) 또는 과거 코드 M2(가동), M1(비가동)
// 폼 라디오는 M2(가동)/M1(비가동)으로 유지
const mapStatusCode = (st, st_nm) => {
  const code = String(st || '').trim()
  if (code === 'Q1') return 'M2'
  if (code === 'Q2') return 'M1'
  if (code === 'M1' || code === 'M2') return code
  const name = String(st_nm || '').trim()
  if (name.includes('비가동')) return 'M1'
  if (name.includes('가동')) return 'M2'
  return 'M2' // 기본은 가동
}

// 저장용 매핑 (폼 라디오 → DB 코드)
// 폼: M2(가동)→DB: Q1, 폼: M1(비가동)→DB: Q2
const mapStatusForPersist = (formCode) => {
  const c = String(formCode || '').trim()
  if (c === 'M2') return 'Q1'
  if (c === 'M1') return 'Q2'
  // 이미 Q1/Q2가 들어왔을 가능성도 고려
  if (c === 'Q1' || c === 'Q2') return c
  return 'Q1'
}
</script>

<style scoped>
/* ============================================
   전역 스타일 - 2025 Modern Design
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
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
  /* 세로 스크롤 컨테이너가 정상 축소되도록 */
  min-height: 0;
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
  height: 100%;
  overflow-y: auto; /* 상하 스크롤 */
  overflow-x: hidden; /* 좌우 스크롤 제거 */
  border-radius: 10px;
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  table-layout: fixed; /* 가로 폭 고정으로 가로 스크롤 방지 */
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
  overflow: hidden; /* 긴 텍스트 말줄임 */
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.data-table tbody tr) {
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr:hover) {
  background-color: #f8f9fa;
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

/* 좌측 컬럼이 스크롤 컨테이너를 만들 수 있도록 */
.left-pane {
  min-height: 0;
}

/* 메인 컨텐츠 행과 우측 패널도 자식 스크롤 허용 */
.main-content-row {
  min-height: 0;
}

.right-pane {
  min-height: 0;
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
