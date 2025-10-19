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
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 12px;
}
.search-bar {
  display: flex;
  align-items: center;
}
.flex-spacer {
  flex: 1;
}
.right-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #222;
  display: inline-block;
  min-width: 72px;
  text-align: right;
}

/* 표 스타일 - rcvordModalOne 준용 */
:deep(.table-responsive) {
  border-radius: 10px;
}
:deep(.table-responsive thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}
:deep(.table-responsive thead th) {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%) !important;
  color: #ffffff !important;
  text-align: center;
  padding: 0.6rem 0.5rem;
  border: none;
}
:deep(.table-responsive tbody td) {
  font-size: 14px;
  vertical-align: middle;
}
:deep(.table-responsive tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
}
:deep(.table-responsive tbody tr:hover) {
  background-color: #f8f9fa !important;
}
:deep(.table-responsive tbody tr:hover) td {
  background-color: #f8f9fa !important;
}

/* 모던 스크롤바 */
:deep(.table-responsive) {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
:deep(.table-responsive::-webkit-scrollbar) {
  width: 8px;
}
:deep(.table-responsive::-webkit-scrollbar-track) {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
:deep(.table-responsive::-webkit-scrollbar-thumb) {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
:deep(.table-responsive::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* CoreUI 버튼 톤 유지 */
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
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.25);
}
</style>
