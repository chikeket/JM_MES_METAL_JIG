<template>
  <CModal :visible="isPrcsModalOpen" @close="closeModal" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">공정 조회</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-row-multiple">
            <div class="search-input-group">
              <label class="search-label">공정 ID</label>
              <input 
                v-model="searchTerm.prcs_id" 
                type="text" 
                class="search-input"
                @keyup.enter="prcsSearch"
              />
            </div>

            <div class="search-input-group">
              <label class="search-label">공정 명</label>
              <input 
                v-model="searchTerm.prcs_nm" 
                type="text" 
                class="search-input"
                @keyup.enter="prcsSearch"
              />
            </div>

            <div class="button-group">
              <button class="btn-reset-modal" @click="prcsReset">초기화</button>
              <button class="btn-search-modal" @click="prcsSearch">조회</button>
              <button 
                class="btn-modal-action" 
                @click="onSelectPrcs" 
                :disabled="selectedPrcs.length === 0"
              >
                선택 ({{ selectedPrcs.length }}건)
              </button>
            </div>
          </div>
        </div>

        <!-- 결과 테이블 -->
        <div class="table-section">
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 5%">
                    <input
                      type="checkbox"
                      :checked="allChoice"
                      @change="toggleAll($event)"
                      class="form-check-input"
                    />
                  </th>
                  <th style="width: 10%">공정ID</th>
                  <th style="width: 15%">공정 명</th>
                  <th style="width: 18%">설비 그룹 명</th>
                  <th style="width: 12%">금형 사용 유무</th>
                  <th style="width: 10%">리드 타임</th>
                  <th style="width: 10%">공정 상태</th>
                  <th style="width: 20%">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="prcs in prcsList"
                  :key="prcs.prcs_id"
                  @click="handleRowClick(prcs)"
                  class="data-row-modal"
                  :class="{
                    'row-selected': selectedPrcs.some(
                      (s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm,
                    ),
                  }"
                >
                  <td @click.stop class="text-center">
                    <input
                      type="checkbox"
                      :checked="choiceCheck(prcs)"
                      @change="checkboxDeselect(prcs)"
                      class="form-check-input"
                    />
                  </td>
                  <td class="text-center">{{ prcs.prcs_id }}</td>
                  <td class="text-left">{{ prcs.prcs_nm }}</td>
                  <td class="text-left">{{ prcs.eqm_grp_nm }}</td>
                  <td class="text-center">{{ prcs.mold_use_at_nm || prcs.mold_use_at }}</td>
                  <td class="text-center">{{ prcs.lead_tm }}</td>
                  <td class="text-center">{{ prcs.st_nm || prcs.st }}</td>
                  <td class="text-left">{{ prcs.rm }}</td>
                </tr>
                <tr v-if="!prcsList || prcsList.length === 0" class="empty-state">
                  <td colspan="8">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  isPrcsModalOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'select'])

const prcsList = ref([])
const selectedPrcs = ref([])
const selectedPrcsRow = ref(null)
const selectedPrcsRowNo = ref('')

const searchTerm = reactive({
  prcs_id: '',
  prcs_nm: '',
  searchKind: 'all',
})

const allChoice = computed(() => {
  return (
    prcsList.value.length > 0 &&
    prcsList.value.every((prcs) =>
      selectedPrcs.value.some((s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm),
    )
  )
})

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
    prcsList.value = []
  }
}

const prcsReset = () => {
  searchTerm.prcs_id = ''
  searchTerm.prcs_nm = ''
  selectedPrcs.value = []
}

const handleRowClick = (prcs) => {
  checkboxDeselect(prcs)
  selectSinglePrcs(prcs)
}

const selectSinglePrcs = (prcs) => {
  selectedPrcsRow.value = { ...prcs }
  selectedPrcsRowNo.value = prcs.prcs_id
  console.log('[prcsModal] 단일 공정 선택:', selectedPrcsRow.value)
}

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

const toggleAll = (event) => {
  if (event.target.checked) selectedPrcs.value = prcsList.value.map((p) => ({ ...p }))
  else selectedPrcs.value = []
}

const choiceCheck = (prcs) =>
  selectedPrcs.value.some((s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm)

const onSelectPrcs = () => {
  if (selectedPrcs.value.length === 0) {
    alert('공정을 선택해주세요.')
    return
  }
  emit('select', selectedPrcs.value)
  closeModal()
}

const closeModal = () => {
  prcsReset()
  prcsList.value = []
  selectedPrcs.value = []
  emit('close')
}

onMounted(() => {
  console.log('[prcsModal] 컴포넌트 마운트됨')
})
</script>

<style scoped>
/* ============================================
   모달 헤더
   ============================================ */
.modal-header-custom {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-bottom: none;
  padding: 1.25rem 1.5rem;
  border-radius: 12px 12px 0 0;
}

.modal-title-custom {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0;
}

:deep(.btn-close) {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

:deep(.btn-close:hover) {
  opacity: 1;
}

/* ============================================
   모달 바디
   ============================================ */
:deep(.modal-body-custom) {
  padding: 0;
  background: #f8fafc;
}

.modal-content-wrapper {
  padding: 1.5rem;
}

/* ============================================
   검색 영역
   ============================================ */
.search-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-row-multiple {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  min-width: 70px;
  margin-bottom: 0;
  font-family: "Pretendard", sans-serif;
  white-space: nowrap;
}

.search-input {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  font-family: "Pretendard", sans-serif;
  width: 150px;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: auto;
}

.btn-search-modal,
.btn-reset-modal,
.btn-modal-action {
  font-size: 13px;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  height: 42px;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
}

.btn-search-modal {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff;
}

.btn-search-modal:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

.btn-reset-modal {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: #fff;
}

.btn-reset-modal:hover {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  box-shadow: 0 4px 8px rgba(100, 116, 139, 0.3);
  transform: translateY(-1px);
}

.btn-modal-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
}

.btn-modal-action:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.btn-modal-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-search-modal:active,
.btn-reset-modal:active,
.btn-modal-action:active {
  transform: scale(0.98);
}

/* ============================================
   테이블 영역
   ============================================ */
.table-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table-wrapper-modal {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-wrapper-modal::-webkit-scrollbar {
  width: 14px;
  background: #ffffff;
}

.table-wrapper-modal::-webkit-scrollbar-track {
  background: #ffffff;
}

.table-wrapper-modal::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #9ca3af 0%, #6b7280 100%);
  border-radius: 10px;
  border: 3px solid #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.table-wrapper-modal::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 100%);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

:deep(.data-table-modal) {
  width: 100% !important;
  margin-bottom: 0 !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-size: 13px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal thead) {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}

:deep(.data-table-modal thead tr th) {
  font-size: 13px !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
  color: #ffffff !important;
  text-align: center !important;
  vertical-align: middle !important;
  padding: 0.85rem 0.75rem !important;
  border: none !important;
  letter-spacing: -0.2px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal tbody tr td) {
  font-size: 13px !important;
  font-weight: 400 !important;
  vertical-align: middle !important;
  padding: 0.75rem 0.75rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  height: 46px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.text-center) {
  text-align: center !important;
}

:deep(.text-left) {
  text-align: left !important;
}

:deep(.data-row-modal) {
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  background-color: #ffffff !important;
}

:deep(.data-row-modal:hover) {
  background-color: #f8fafc !important;
  box-shadow: inset 0 0 0 1px #e2e8f0 !important;
}

:deep(.data-row-modal.row-selected) {
  background-color: #eff6ff !important;
  box-shadow: inset 0 0 0 1px #bfdbfe !important;
}

:deep(.data-row-modal:hover td),
:deep(.data-row-modal.row-selected td) {
  background-color: inherit !important;
}

:deep(.empty-state td) {
  text-align: center !important;
  color: #94a3b8 !important;
  font-style: italic !important;
  padding: 3rem 0.75rem !important;
  background-color: #f8fafc !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.form-check-input) {
  width: 18px;
  height: 18px;
  border: 1.5px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.form-check-input:checked) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 1600px) {
  .search-label,
  .search-input,
  .btn-search-modal,
  .btn-reset-modal,
  .btn-modal-action {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .search-input,
  .btn-search-modal,
  .btn-reset-modal,
  .btn-modal-action {
    height: 38px;
    padding: 0.55rem 0.75rem;
  }

  .search-input {
    width: 130px;
  }
}
</style>