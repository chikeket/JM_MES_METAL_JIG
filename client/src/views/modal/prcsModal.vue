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
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

.vars-scope {
  --radius-sm: 4px;
  --radius-md: 6px;
  --color-btn-gray: #6e7b85;
  --color-btn-gray-hover: #5d6871;
  --color-btn-danger: #c53030;
  --color-btn-danger-hover: #a82323;
  --color-btn-text: #fff;
  --row-h: 34px;
  --thead-h: 34px;
  --row-vpad: 6px;
  --cell-inner-h: calc(var(--row-h) - (var(--row-vpad) * 2));
}

/* ========== 버튼 스타일 ========== */
:deep(.btn),
:deep(.btn-secondary),
:deep(.btn-danger) {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: #ffffff !important;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #ffffff !important;
}

:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  color: #ffffff !important;
}

:deep(.btn-danger) {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: #ffffff !important;
}

:deep(.btn-danger:hover) {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  color: #ffffff !important;
}

/* ========== Input & Form 스타일 ========== */
:deep(.form-control),
:deep(.form-select),
:deep(input[type='text']),
:deep(input[type='date']),
:deep(input[type='number']),
:deep(textarea) {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

:deep(.form-control:focus),
:deep(.form-select:focus),
:deep(input:focus),
:deep(textarea:focus) {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}

:deep(.form-control[disabled]),
:deep(.form-control[readonly]),
:deep(input[disabled]),
:deep(input[readonly]) {
  background: #e9e9e9;
  color: #222;
}

:deep(.form-label) {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
  color: #2c3e50;
  letter-spacing: -0.2px;
}

:deep(.input-group-text) {
  font-weight: 600;
  font-size: 12px;
  color: #2c3e50;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
}

:deep(textarea) {
  min-height: 78px;
  resize: vertical;
}

/* ========== 테이블 스타일 ========== */
:deep(.table) {
  font-size: 12px;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  border: 1px solid #bcbcbc;
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.table thead th) {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  font-weight: 700;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  height: var(--thead-h);
}

:deep(.table thead th:first-child) {
  border-top-left-radius: var(--radius-sm);
}

:deep(.table thead th:last-child) {
  border-top-right-radius: var(--radius-sm);
}

:deep(.table tbody td) {
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  padding-top: var(--row-vpad);
  padding-bottom: var(--row-vpad);
  vertical-align: middle;
  overflow: hidden;
  background: #ffffff;
  height: var(--row-h);
}

:deep(.table tbody td:last-child) {
  border-right: none;
}

:deep(.table tbody tr) {
  height: var(--row-h);
  transition: all 0.2s ease;
  background-color: #ffffff;
}

:deep(.table tbody tr:hover:not(.table-secondary)) {
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
}

:deep(.table tbody tr:hover:not(.table-secondary) td) {
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
}

/* 빈 행 스타일 */
:deep(.table-secondary) {
  background: #fafbfc !important;
}

:deep(.table-secondary td) {
  background: #fafbfc !important;
}

/* ========== 테이블 내부 input 스타일 ========== */
:deep(.table input),
:deep(.table select),
:deep(.table textarea) {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  background: transparent;
  padding: 2px 4px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  height: var(--cell-inner-h);
  min-height: 0;
}

:deep(.table input[readonly]),
:deep(.table input[disabled]) {
  background: #e9e9e9;
}

:deep(.table input:focus),
:deep(.table select:focus),
:deep(.table textarea:focus) {
  outline: none;
  border-color: #5b9dd9;
  background: #fff;
}

:deep(.table input.form-control) {
  height: var(--cell-inner-h) !important;
  padding-top: 2px;
  padding-bottom: 2px;
}

/* ========== 텍스트 정렬 ========== */
:deep(.text-center) {
  text-align: center;
}

:deep(.text-end) {
  text-align: right;
}

:deep(.text-start) {
  text-align: left;
}

/* ========== 간격 조정 (일관된 여백) ========== */
:deep(.container-fluid) {
  padding: 16px;
}

:deep(.mb-3) {
  margin-bottom: 16px !important;
}

:deep(.gap-2) {
  gap: 8px !important;
}

:deep(.gap-3) {
  gap: 16px !important;
}

:deep(.g-3) {
  --bs-gutter-x: 16px;
  --bs-gutter-y: 16px;
}

/* 상단/하단 버튼 영역 일관된 간격 */
:deep(.d-flex.justify-content-end) {
  padding: 0 16px;
  margin-bottom: 16px;
}

/* Input Group 간격 */
:deep(.input-group) {
  margin-bottom: 0;
}

:deep(.row) {
  margin-left: 0;
  margin-right: 0;
}

:deep(.col),
:deep([class*='col-']) {
  padding-left: 8px;
  padding-right: 8px;
}

/* ========== 아이콘 호버 효과 ========== */
:deep(.icon) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.icon:hover) {
  opacity: 0.7;
  transform: scale(1.1);
}

/* ========== 스크롤바 스타일 ========== */
:deep(*::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(*::-webkit-scrollbar-track) {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}

:deep(*::-webkit-scrollbar-thumb) {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* ========== 반응형 ========== */
@media (max-width: 1600px) {
  :deep(.btn) {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}

@media (max-width: 768px) {
  :deep(.table) {
    font-size: 11px;
  }
  
  :deep(.table thead th),
  :deep(.table tbody td) {
    padding: 0.4rem 0.3rem;
  }
}
</style>