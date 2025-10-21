<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">제품 조회</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-row-multiple">
            <div class="search-input-group">
              <label class="search-label">제품명</label>
              <input 
                type="text" 
                class="search-input" 
                v-model="searchPrdtNm" 
                placeholder="제품명 입력"
                @keyup.enter="searchProducts"
              />
            </div>

            <div class="search-input-group">
              <label class="search-label">제품옵션명</label>
              <input 
                type="text" 
                class="search-input" 
                v-model="searchOptNm" 
                placeholder="옵션명 입력"
                @keyup.enter="searchProducts"
              />
            </div>

            <div class="button-group">
              <button class="btn-search-modal" @click="searchProducts">조회</button>
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
                  <th style="width: 18%">제품 명</th>
                  <th style="width: 18%">제품 옵션 명</th>
                  <th style="width: 15%">규격</th>
                  <th style="width: 10%">단위</th>
                  <th style="width: 15%">생산 가능 여부</th>
                  <th style="width: 19%">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading" class="loading-state">
                  <td colspan="7" class="text-center">로딩중...</td>
                </tr>
                <tr v-else-if="errorMsg" class="error-state">
                  <td colspan="7" class="text-center">{{ errorMsg }}</td>
                </tr>
                <tr 
                  v-else
                  v-for="(row, idx) in productList" 
                  :key="row.prdt_id + '_' + (row.prdt_opt_id || 'no_opt') + '_' + idx"
                  @dblclick="selectProduct(row)"
                  class="data-row-modal"
                >
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td class="text-left">{{ row.prdt_nm }}</td>
                  <td class="text-left">{{ row.opt_nm || '-' }}</td>
                  <td class="text-left">{{ row.spec }}</td>
                  <td class="text-center">{{ row.unit }}</td>
                  <td class="text-center">{{ row.prdt_st_nm || row.prdt_st }}</td>
                  <td class="text-left">{{ row.rm || '-' }}</td>
                </tr>
                <tr v-if="!loading && !errorMsg && !productList.length" class="empty-state">
                  <td colspan="7">데이터가 없습니다.</td>
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

const searchPrdtNm = ref('')
const searchOptNm = ref('')
const productList = ref([])
const loading = ref(false)
const errorMsg = ref('')

const close = () => {
  emit('close')
}

const fetchAll = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const prdtNm = (searchPrdtNm.value || '').trim()
    const optNm = (searchOptNm.value || '').trim()
    const params = {
      prdt_id: '',
      prdt_nm: prdtNm,
      spec: '',
      opt_nm: optNm,
    }
    const { data } = await axios.get('/api/prdts', { params })
    productList.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('products fetch error', err)
    errorMsg.value = '조회 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const searchProducts = async () => {
  await fetchAll()
}

const reset = async () => {
  searchPrdtNm.value = ''
  searchOptNm.value = ''
  await fetchAll()
}

const selectProduct = (row) => {
  emit('select', row)
  close()
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      searchPrdtNm.value = ''
      searchOptNm.value = ''
      fetchAll()
    }
  },
)

onMounted(() => {
  if (props.visible && !productList.value.length) fetchAll()
})
</script>

<style scoped>
/* ============================================
   모달 헤더
   ============================================ */
:deep(.modal-header-custom) {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-bottom: none;
  padding: 1.25rem 1.5rem;
  border-radius: 12px 12px 0 0;
}

:deep(.modal-title-custom) {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif;
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
  min-width: 75px;
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
  width: 180px;
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
  table-layout: auto !important;
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
  font-style: italic !important;
}

:deep(.error-state td) {
  color: #dc3545 !important;
  font-style: normal !important;
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
  border-radius: 0 0 12px 12px;
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
  .search-input,
  .btn-search-modal,
  .btn-reset-modal {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .search-input,
  .btn-search-modal,
  .btn-reset-modal {
    height: 38px;
    padding: 0.55rem 0.75rem;
  }

  .search-input {
    width: 160px;
  }
}
</style>