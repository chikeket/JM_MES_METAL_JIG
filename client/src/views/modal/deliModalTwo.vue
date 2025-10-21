<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">수주 조회</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-row-container">
            <div class="search-input-group">
              <label class="search-label">수주 ID</label>
              <input 
                v-model="searchRcvordId" 
                type="text" 
                class="search-input-compact"
                @keyup.enter="search"
              />
            </div>

            <div class="button-group">
              <button class="btn-search-modal" @click="search">조회</button>
              <button class="btn-reset-modal" @click="reset">초기화</button>
            </div>
          </div>
        </div>

        <!-- 결과 테이블 -->
        <div class="table-section">
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 12%">수주 ID</th>
                  <th style="width: 15%">납품 업체 명</th>
                  <th style="width: 12%">수주 담당자</th>
                  <th style="width: 13%">수주 등록 일자</th>
                  <th style="width: 11%">수주 상태</th>
                  <th style="width: 32%">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading" class="loading-state">
                  <td colspan="7" class="text-center">로딩중...</td>
                </tr>
                <tr v-else-if="errorMsg" class="error-state">
                  <td colspan="7" class="text-center">{{ errorMsg }}</td>
                </tr>
                <tr v-else-if="rcvordList.length === 0" class="empty-state">
                  <td colspan="7">수주 ID를 입력하고 조회 버튼을 클릭하세요</td>
                </tr>
                <tr
                  v-else
                  v-for="(row, idx) in rcvordList"
                  :key="row.rcvord_id"
                  @dblclick="select(row)"
                  class="data-row-modal"
                >
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td class="text-left">{{ row.rcvord_id }}</td>
                  <td class="text-left">{{ row.co_nm }}</td>
                  <td class="text-left">{{ row.emp_nm }}</td>
                  <td class="text-center">{{ formatDate(row.reg_dt) }}</td>
                  <td class="text-center">{{ row.status || '진행 중' }}</td>
                  <td class="text-left">{{ row.rm }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CModalBody>
    <CModalFooter class="modal-footer-custom">
      <button class="btn-modal-close" @click="close">닫기</button>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'select'])

const searchRcvordId = ref('')
const rcvordList = ref([])
const loading = ref(false)
const errorMsg = ref('')

const close = () => {
  emit('close')
}

const formatDate = (d) => {
  if (!d) return ''
  try {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const date = new Date(d)
    if (isNaN(date.getTime())) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

const fetchAll = async () => {
  const keyword = (searchRcvordId.value || '').trim()
  loading.value = true
  errorMsg.value = ''
  try {
    // 키워드가 있을 때만 params에 추가
    const params = keyword ? { rcvord_id: keyword } : {}
    const { data } = await axios.get('/api/rcvords', { params })
    rcvordList.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('rcvords fetch error', err)
    errorMsg.value = '조회 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const search = async () => {
  await fetchAll()
}

const reset = () => {
  // ✅ 검색어 및 리스트 초기화
  searchRcvordId.value = ''
  rcvordList.value = []
  errorMsg.value = ''
}

const select = (row) => {
  emit('select', row)
  close()
}

// ✅ 모달이 열릴 때 자동 조회하지 않도록 변경
watch(
  () => props.visible,
  (v) => {
    if (v) {
      searchRcvordId.value = ''
      rcvordList.value = []
      errorMsg.value = ''
    }
  }
)
</script>


<style scoped>
/* ============================================
   모달 헤더
   ============================================ */
.modal-header-custom {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-bottom: none;
  padding: 1.25rem 1.5rem;
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

.search-row-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.search-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.search-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  min-width: 75px;
  margin-bottom: 0;
  font-family: "Pretendard", sans-serif;
  white-space: nowrap;
}

.search-input-compact {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  font-family: "Pretendard", sans-serif;
  flex: 1;
  max-width: 300px;
}

.search-input-compact:focus {
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

:deep(.data-row-modal:hover td) {
  background-color: #f8fafc !important;
}

:deep(.loading-state td),
:deep(.error-state td) {
  text-align: center !important;
  padding: 2.5rem 0.75rem !important;
  color: #64748b !important;
}

:deep(.error-state td) {
  color: #dc3545 !important;
}

:deep(.empty-state td) {
  text-align: center !important;
  color: #94a3b8 !important;
  font-style: italic !important;
  padding: 3rem 0.75rem !important;
  background-color: #f8fafc !important;
  font-family: "Pretendard", sans-serif !important;
}

/* ============================================
   모달 푸터
   ============================================ */
:deep(.modal-footer-custom) {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
}

.btn-modal-close {
  font-size: 13px;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
}

.btn-modal-close:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

.btn-modal-close:active {
  transform: scale(0.98);
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 1600px) {
  .search-label,
  .search-input-compact,
  .btn-search-modal,
  .btn-reset-modal {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .search-input-compact,
  .btn-search-modal,
  .btn-reset-modal {
    height: 38px;
    padding: 0.55rem 0.75rem;
  }

  .search-input-compact {
    max-width: 250px;
  }
}
</style>