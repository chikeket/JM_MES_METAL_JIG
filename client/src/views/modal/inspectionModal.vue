<template>
  <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header-custom">
        <h5 class="modal-title-custom">공정검색</h5>
        <button type="button" class="btn-close-custom" @click="closeModal"></button>
      </div>

      <div class="modal-body-custom">
        <!-- 검색 조건 영역 -->
        <div class="search-section">
          <div class="search-grid">
            <div class="search-item">
              <label class="search-item-label">입고서 종류</label>
              <select v-model="searchCondition.insp_type" class="search-select">
                <option value="">전체</option>
                <option value="materialQuality">자재 품질 검사</option>
                <option value="semiQuality">반제품 품질 검사</option>
                <option value="finishedQuality">완제품 품질 검사</option>
              </select>
            </div>
            <div class="search-item">
              <label class="search-item-label">품목코드</label>
              <input
                v-model="searchCondition.item_code"
                type="text"
                class="search-input"
                placeholder="품목코드 입력"
                @keyup.enter="onSearch"
              />
            </div>
            <div class="search-item">
              <label class="search-item-label">품목명</label>
              <input
                v-model="searchCondition.item_name"
                type="text"
                class="search-input"
                placeholder="품목명 입력"
                @keyup.enter="onSearch"
              />
            </div>
            <div class="search-item search-buttons">
              <button type="button" class="btn-search-modal" @click="onSearch">조회</button>
              <button type="button" class="btn-reset-modal" @click="onReset">초기화</button>
            </div>
          </div>
        </div>

        <!-- 검사서 목록 테이블 -->
        <div class="table-section">
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 5%">
                    <input
                      type="checkbox"
                      :checked="allSelected"
                      @change="toggleAll($event)"
                      class="form-check-input"
                    />
                  </th>
                  <th style="width: 8%">검사서 코드</th>
                  <th style="width: 7%">품목 코드</th>
                  <th style="width: 12%">품목 명</th>
                  <th style="width: 7%">옵션 코드</th>
                  <th style="width: 12%">옵션 명</th>
                  <th style="width: 7%">총 수량</th>
                  <th style="width: 7%">합격 수량</th>
                  <th style="width: 7%">불합격 수량</th>
                  <th style="width: 7%">검사 상태</th>
                  <th style="width: 8%">검사 일자</th>
                  <th style="width: 8%">검사자</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in inspectionList"
                  :key="item.insp_no"
                  @click="handleRowClick(item)"
                  class="data-row-modal"
                  :class="{ 'row-selected': isSelected(item) }"
                >
                  <td @click.stop class="text-center">
                    <input
                      type="checkbox"
                      :checked="isSelected(item)"
                      @change="toggleSelection(item)"
                      class="form-check-input"
                    />
                  </td>
                  <td class="text-center">{{ item.insp_no }}</td>
                  <td class="text-center">{{ item.item_code }}</td>
                  <td class="text-left">{{ item.item_name }}</td>
                  <td class="text-center">{{ item.opt_code || '-' }}</td>
                  <td class="text-left">{{ item.opt_name || '-' }}</td>
                  <td class="text-right">{{ Number(item.insp_qty || 0).toLocaleString() }}</td>
                  <td class="text-right">{{ Number(item.pass_qty || 0).toLocaleString() }}</td>
                  <td class="text-right">{{ Number(item.fail_qty || 0).toLocaleString() }}</td>
                  <td class="text-center">
                    <span
                      :class="{
                        'badge bg-success': item.insp_status === '완료',
                        'badge bg-warning': item.insp_status === '대기',
                        'badge bg-secondary': !item.insp_status,
                      }"
                    >
                      {{ item.insp_status || '미정' }}
                    </span>
                  </td>
                  <td class="text-center">{{ item.insp_date ? formatDate(item.insp_date) : '' }}</td>
                  <td class="text-center">{{ item.insp_emp_name }}</td>
                </tr>
                <tr v-if="!inspectionList || inspectionList.length === 0" class="empty-state">
                  <td colspan="12">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-footer-custom">
        <button
          type="button"
          class="btn-modal-action"
          @click="onSelect"
          :disabled="selectedItems.length === 0"
        >
          선택 ({{ selectedItems.length }}건)
        </button>
        <button type="button" class="btn-modal-close" @click="closeModal">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'select'])

const inspectionList = ref([])
const selectedItems = ref([])
const selectedInspection = ref(null)
const selectedInspectionNo = ref('')

const searchCondition = reactive({
  item_code: '',
  item_name: '',
  insp_type: 'finishedQuality',
})

const allSelected = computed(() => {
  return (
    inspectionList.value.length > 0 &&
    inspectionList.value.every((item) =>
      selectedItems.value.some(
        (s) =>
          s.insp_no === item.insp_no &&
          s.item_code === item.item_code &&
          s.opt_code === item.opt_code,
      ),
    )
  )
})

const onSearch = async () => {
  try {
    const params = {
      item_code: searchCondition.item_code?.trim() || '',
      item_name: searchCondition.item_name?.trim() || '',
      insp_status: '완료',
    }

    console.log('[inspectionModal] 전송 파라미터:', params)
    console.log('[inspectionModal] 검사서 종류:', searchCondition.insp_type)

    let apiUrl = '/warehouse/inspections/list'

    params.insp_type = searchCondition.insp_type

    switch (searchCondition.insp_type) {
      case 'materialQuality':
        apiUrl = '/warehouse/rscQltyInsp/list'
        break

      case 'semiQuality':
        apiUrl = '/warehouse/semiPrdtQltyInsp/list'
        break

      case 'finishedQuality':
        apiUrl = '/warehouse/endPrdtQltyInsp/list'
        break

      default:
        apiUrl = '/warehouse/endPrdtQltyInsp/list'
        break
    }

    console.log('[inspectionModal] 호출 API:', apiUrl)

    const response = await axios.get(`/api${apiUrl}`, { params })

    console.log('[inspectionModal] API 응답:', response)
    console.log('[inspectionModal] 응답 데이터:', response.data)
    console.log('[inspectionModal] 응답 건수:', response.data?.length)

    if (response.data?.length > 100) {
      console.warn('[inspectionModal] 조회 결과가 100건을 초과합니다!')
    }

    inspectionList.value = response.data || []
    resetSelection()
  } catch (error) {
    console.error('[inspectionModal] 검사서 조회 실패:', error)
    console.error('[inspectionModal] 에러 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    alert(`검사서 목록 조회 중 오류가 발생했습니다: ${error.message}`)
    inspectionList.value = []
  }
}

const onReset = () => {
  searchCondition.item_code = ''
  searchCondition.item_name = ''
  searchCondition.insp_type = 'finishedQuality'
  resetSelection()
}

const handleRowClick = (item) => {
  toggleSelection(item)
  selectSingleInspection(item)
}

const selectSingleInspection = (item) => {
  selectedInspection.value = { ...item }
  selectedInspectionNo.value = item.insp_no
  console.log('[inspectionModal] 단일 검사서 선택:', selectedInspection.value)
}

const toggleSelection = (item) => {
  const index = selectedItems.value.findIndex(
    (s) =>
      s.insp_no === item.insp_no && s.item_code === item.item_code && s.opt_code === item.opt_code,
  )
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push({ ...item, insp_type: searchCondition.insp_type })
  }
  console.log('[inspectionModal] 선택된 검사서들:', selectedItems.value)
}

const toggleAll = (event) => {
  if (event.target.checked) {
    selectedItems.value = inspectionList.value.map((item) => ({
      ...item,
      insp_type: searchCondition.insp_type,
    }))
  } else {
    selectedItems.value = []
  }
}

const isSelected = (item) => {
  return selectedItems.value.some(
    (s) =>
      s.insp_no === item.insp_no && s.item_code === item.item_code && s.opt_code === item.opt_code,
  )
}

const resetSelection = () => {
  selectedItems.value = []
  selectedInspection.value = null
  selectedInspectionNo.value = ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  } catch (error) {
    return dateStr
  }
}

const onSelect = () => {
  if (selectedItems.value.length === 0) {
    alert('검사서를 선택해주세요.')
    return
  }

  console.log('[inspectionModal] 최종 선택된 검사서들:', selectedItems.value)
  emit('select', selectedItems.value)
  closeModal()
}

const closeModal = () => {
  onReset()
  inspectionList.value = []
  selectedItems.value = []
  emit('close')
}

onMounted(() => {
  console.log('[inspectionModal] 컴포넌트 마운트됨')
})
</script>

<style scoped>
/* ============================================
   모달 백드롭
   ============================================ */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1400px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

/* ============================================
   모달 헤더
   ============================================ */
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.modal-title-custom {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif;
}

.btn-close-custom {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  filter: brightness(0) invert(1);
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.btn-close-custom:hover {
  opacity: 1;
}

.btn-close-custom:before {
  content: '×';
}

/* ============================================
   모달 바디
   ============================================ */
.modal-body-custom {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
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

.search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: flex-end;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-item-label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: "Pretendard", sans-serif;
}

.search-select,
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
}

.search-select:focus,
.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.search-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-search-modal,
.btn-reset-modal {
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
  flex: 1;
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

.btn-search-modal:active,
.btn-reset-modal:active {
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-wrapper-modal {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
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
  font-size: 12px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal thead) {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}

:deep(.data-table-modal thead tr th) {
  font-size: 12px !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
  color: #ffffff !important;
  text-align: center !important;
  vertical-align: middle !important;
  padding: 0.75rem 0.5rem !important;
  border: none !important;
  letter-spacing: -0.2px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal tbody tr td) {
  font-size: 12px !important;
  font-weight: 400 !important;
  vertical-align: middle !important;
  padding: 0.65rem 0.5rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  height: 42px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.text-center) {
  text-align: center !important;
}

:deep(.text-left) {
  text-align: left !important;
}

:deep(.text-right) {
  text-align: right !important;
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

:deep(.empty-state td) {
  text-align: center !important;
  color: #94a3b8 !important;
  font-style: italic !important;
  padding: 3rem 0.5rem !important;
  background-color: #f8fafc !important;
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

:deep(.badge) {
  font-size: 11px;
  padding: 0.35rem 0.65rem;
  font-weight: 600;
}

/* ============================================
   모달 푸터
   ============================================ */
.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
}

.btn-modal-action,
.btn-modal-close {
  font-size: 13px;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
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

.btn-modal-close {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff;
}

.btn-modal-close:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

.btn-modal-action:active,
.btn-modal-close:active {
  transform: scale(0.98);
}
</style>