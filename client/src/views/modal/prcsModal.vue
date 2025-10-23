<template>
  <CModal :visible="isPrcsModalOpen" @close="closeModal" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle>공정 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <!-- 검색 영역 -->
      <div class="search-bar mb-3">
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">공정 ID</label>
          <CFormInput v-model="searchTerm.prcs_id" style="width: 180px" @keyup.enter="prcsSearch" />
          <label class="search-label">공정 명</label>
          <CFormInput v-model="searchTerm.prcs_nm" style="width: 180px" @keyup.enter="prcsSearch" />
        </div>
        <div class="flex-spacer"></div>
        <div class="right-controls">
          <CButton color="secondary" @click="prcsReset">초기화</CButton>
          <CButton color="secondary" @click="prcsSearch">조회</CButton>
          <CButton color="secondary" @click="onSelectPrcs" :disabled="selectedPrcs.length === 0">
            선택 ({{ selectedPrcs.length }}건)
          </CButton>
        </div>
      </div>

      <!-- 결과 테이블 -->
      <div class="col-width-scope">
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
          <CTable bordered hover small>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell class="text-center" style="width: 50px">
                  <input
                    type="checkbox"
                    :checked="allChoice"
                    @change="toggleAll($event)"
                    class="form-check-input"
                  />
                </CTableHeaderCell>
                <CTableHeaderCell class="text-center">공정ID</CTableHeaderCell>
                <CTableHeaderCell class="text-center">공정 명</CTableHeaderCell>
                <CTableHeaderCell class="text-center">설비 그룹 명</CTableHeaderCell>
                <CTableHeaderCell class="text-center">금형 사용 유무</CTableHeaderCell>
                <CTableHeaderCell class="text-center">리드 타임</CTableHeaderCell>
                <CTableHeaderCell class="text-center">공정 상태</CTableHeaderCell>
                <CTableHeaderCell class="text-center">비고</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow
                v-for="prcs in prcsList"
                :key="prcs.prcs_id"
                class="cursor-pointer"
                :class="{
                  'table-active': selectedPrcs.some(
                    (s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm,
                  ),
                }"
                @click="handleRowClick(prcs)"
              >
                <CTableDataCell @click.stop>
                  <input
                    type="checkbox"
                    :checked="choiceCheck(prcs)"
                    @change="checkboxDeselect(prcs)"
                    class="form-check-input"
                  />
                </CTableDataCell>
                <CTableDataCell>{{ prcs.prcs_id }}</CTableDataCell>
                <CTableDataCell>{{ prcs.prcs_nm }}</CTableDataCell>
                <CTableDataCell>{{ prcs.eqm_grp_nm }}</CTableDataCell>
                <CTableDataCell>{{ prcs.mold_use_at_nm || prcs.mold_use_at }}</CTableDataCell>
                <CTableDataCell>{{ prcs.lead_tm }}</CTableDataCell>
                <CTableDataCell>{{ prcs.st_nm || prcs.st }}</CTableDataCell>
                <CTableDataCell>{{ prcs.rm }}</CTableDataCell>
              </CTableRow>
              <CTableRow v-if="!prcsList || prcsList.length === 0">
                <CTableDataCell colspan="8" class="text-center text-muted py-3">
                  검색 결과가 없습니다.
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </div>
      </div>
    </CModalBody>
    <!-- CModalFooter 제거: 선택/취소 버튼 삭제, 선택버튼은 검색바 오른쪽에 배치 -->
  </CModal>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

// Props 정의
const props = defineProps({
  isPrcsModalOpen: { type: Boolean, default: false },
})

// Emit 정의
const emit = defineEmits(['close', 'select'])

// 상태
const prcsList = ref([])
const selectedPrcs = ref([])
const selectedPrcsRow = ref(null)
const selectedPrcsRowNo = ref('')

// 검색 조건
const searchTerm = reactive({
  prcs_id: '',
  prcs_nm: '',
  searchKind: 'all',
})

// 계산된 속성
const allChoice = computed(() => {
  return (
    prcsList.value.length > 0 &&
    prcsList.value.every((prcs) =>
      selectedPrcs.value.some((s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm),
    )
  )
})

// 서버 조회
const prcsSearch = async () => {
  try {
    const params = { prcs_id: '', prcs_nm: '', eqm_grp_nm: '', lead_tm: '', mold_use_at: '' }
    if (searchTerm.searchKind === 'prcs_id')
      params.prcs_id = searchTerm.prcs_id || searchTerm.prcs_nm
    else if (searchTerm.searchKind === 'prcs_nm')
      params.prcs_nm = searchTerm.prcs_nm || searchTerm.prcs_id
    else {
      params.prcs_id = searchTerm.prcs_id
      params.prcs_nm = searchTerm.prcs_nm
    }

    const result = await axios.get('/api/prcs', { params })
    prcsList.value = result.data
  } catch (err) {
    console.error('공정 검색 오류:', err)
    alert('검색 중 오류가 발생했습니다.')
  }
}

// 초기화
const prcsReset = () => {
  searchTerm.prcs_id = ''
  searchTerm.prcs_nm = ''
  selectedPrcs.value = []
}

// 행 클릭 핸들러 (체크박스 토글)
const handleRowClick = (prcs) => {
  checkboxDeselect(prcs)
  selectSinglePrcs(prcs)
}

// 단일 선택
const selectSinglePrcs = (prcs) => {
  selectedPrcsRow.value = { ...prcs }
  selectedPrcsRowNo.value = prcs.prcs_id
  console.log('[prcsModal] 단일 공정 선택:', selectedPrcsRow.value)
}

// 체크박스 선택/해제
const checkboxDeselect = (prcs) => {
  const index = selectedPrcs.value.findIndex(
    (s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm,
  )
  if (index > -1) {
    selectedPrcs.value.splice(index, 1)
  } else {
    selectedPrcs.value.push({ ...prcs })
  }
}

// 전체 선택/해제
const toggleAll = (event) => {
  if (event.target.checked) selectedPrcs.value = prcsList.value.map((p) => ({ ...p }))
  else selectedPrcs.value = []
}

// 선택 여부 확인
const choiceCheck = (prcs) =>
  selectedPrcs.value.some((s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm)

// 선택 확인
const onSelectPrcs = () => {
  if (selectedPrcs.value.length === 0) {
    alert('공정을 선택해주세요.')
    return
  }
  emit('select', selectedPrcs.value)
  closeModal()
}

// 닫기
const closeModal = () => {
  prcsReset()
  prcsList.value = []
  selectedPrcs.value = []
  emit('close')
}

onMounted(() => {
  // 초기 로그
})
</script>

<style scoped>
/* 모달 헤더 커스텀 */
:deep(.modal-header-custom) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
}

:deep(.modal-header-custom .modal-title) {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

/* 모달 바디 */
:deep(.modal-body) {
  padding: 1.5rem;
  background: #f5f7fa;
}

/* 검색 바 */
.search-bar {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-label {
  min-width: 80px;
  font-weight: 600;
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 0;
}

.flex-spacer {
  flex: 1;
}

.right-controls {
  display: flex;
  gap: 0.5rem;
}

/* 폼 인풋 */
:deep(.form-control) {
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

:deep(.form-control:focus) {
  border-color: #6c757d;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.1);
}

/* 버튼 */
:deep(.btn) {
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
  height: 34px;
}

:deep(.btn:hover:not(:disabled)) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

:deep(.btn:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}

:deep(.btn-secondary:hover:not(:disabled)) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
}

/* 테이블 영역 */
.col-width-scope {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #bcbcbc;
  border-radius: 8px;
  scrollbar-gutter: stable;
}

.table-responsive::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* 테이블 */
:deep(.table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 12px;
  margin-bottom: 0;
}

:deep(.table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.table thead th) {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: 34px;
  white-space: nowrap;
}

:deep(.table thead th:first-child) {
  border-top-left-radius: 4px;
}

:deep(.table thead th:last-child) {
  border-top-right-radius: 4px;
}

:deep(.table tbody td) {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: 34px;
  vertical-align: middle;
  text-align: center;
}

:deep(.table tbody td:last-child) {
  border-right: none;
}

:deep(.table tbody tr) {
  height: 34px;
  transition: all 0.2s ease;
  background: #fff;
  cursor: pointer;
}

:deep(.table tbody tr:hover td) {
  background-color: rgba(33, 37, 41, 0.075) !important;
}

:deep(.table tbody tr.table-active td) {
  background-color: #e7f1ff !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* 체크박스 */
.form-check-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  border: 2px solid #6c757d;
  border-radius: 3px;
}

.form-check-input:checked {
  background-color: #6c757d;
  border-color: #6c757d;
}

/* 텍스트 정렬 */
.text-center {
  text-align: center !important;
}

.text-muted {
  color: #6c757d !important;
}

.py-3 {
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}

/* 유틸리티 클래스 */
.mb-3 {
  margin-bottom: 1rem !important;
}

.d-flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.align-items-center {
  align-items: center;
}

/* 반응형 */
@media (max-width: 1600px) {
  :deep(.btn) {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}

@media (max-height: 900px) {
  .table-responsive {
    max-height: 350px;
  }
}

@media (max-height: 780px) {
  .table-responsive {
    max-height: 300px;
  }
}

@media (max-height: 700px) {
  .table-responsive {
    max-height: 250px;
  }
}
</style>