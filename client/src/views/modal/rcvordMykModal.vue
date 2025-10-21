<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">제품 검색</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-row-multiple">
            <div class="search-select-wrapper">
              <select class="search-select" v-model="pickValue">
                <option value="rcvord_id">코드</option>
                <option value="co_nm">납품업체</option>
                <option value="emp_nm">수주담당자</option>
              </select>
            </div>

            <input
              type="text"
              class="search-input"
              placeholder="검색어 입력"
              v-model="searchKeyword"
              @keyup.enter="prdtSearch()"
            />

            <label class="search-label-inline">수주 일자</label>
            <input 
              type="date" 
              class="date-input" 
              v-model="reg_dt" 
            />

            <button class="btn-search-modal" @click="prdtSearch()">검색</button>
          </div>
        </div>

        <!-- 결과 테이블 -->
        <div class="table-section">
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 20%">코드</th>
                  <th style="width: 30%">납품업체</th>
                  <th style="width: 25%">수주담당자</th>
                  <th style="width: 25%">등록일자</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(prdts, i) in prdtList" 
                  :key="i" 
                  @dblclick="selectProduct(prdts)"
                  class="data-row-modal"
                >
                  <td>{{ prdts.rcvord_id }}</td>
                  <td>{{ prdts.co_nm }}</td>
                  <td>{{ prdts.emp_nm }}</td>
                  <td>{{ userDateUtils.dateFormat(prdts.reg_dt, 'yyyy-MM-dd') }}</td>
                </tr>
                <tr v-if="prdtList.length === 0" class="empty-state">
                  <td colspan="4">검색 결과가 없습니다. 조건을 변경해주세요.</td>
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
import { ref, defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'
import userDateUtils from '@/utils/useDates.js'

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])

const close = () => {
  prdtList.value = []
  pickValue.value = 'co_nm'
  searchKeyword.value = ''
  reg_dt.value = ''
  emit('close')
}

const pickValue = ref('co_nm')
const searchKeyword = ref('')
const reg_dt = ref('')
let prdtList = shallowRef([])

const prdtSearch = async () => {
  const params = { rcvord_id: '', co_nm: '', emp_nm: '', reg_dt: '' }

  if (pickValue.value === 'rcvord_id') {
    params.rcvord_id = searchKeyword.value
  } else if (pickValue.value === 'co_nm') {
    params.co_nm = searchKeyword.value
  } else {
    params.emp_nm = searchKeyword.value
  }
  params.reg_dt = !reg_dt.value ? '1970-01-01' : reg_dt.value

  try {
    const result = await axios.get('/api/prodPlanRcvordMasterSearch', { params })
    console.log(result.data)
    prdtList.value = result.data || []
  } catch (err) {
    console.error('검색 오류:', err)
    prdtList.value = []
  }
}

const selectProduct = async (prdts) => {
  const params = { rcvord_id: prdts.rcvord_id }
  try {
    const result = await axios.get('/api/prodPlanRcvordDetaSearch', { params })
    console.log(result.data)
    emit('select', {
      detailData: result.data,
      searchParams: prdts,
    })
    close()
  } catch (err) {
    console.error('상세 조회 오류:', err)
  }
}
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

.search-select-wrapper {
  min-width: 130px;
  flex-shrink: 0;
}

.search-select {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
  font-family: "Pretendard", sans-serif;
  cursor: pointer;
}

.search-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
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
  flex: 1;
  min-width: 180px;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.search-label-inline {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0;
  font-family: "Pretendard", sans-serif;
  white-space: nowrap;
}

.date-input {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  font-family: "Pretendard", sans-serif;
  min-width: 140px;
  flex-shrink: 0;
}

.date-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.btn-search-modal {
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
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
  flex-shrink: 0;
}

.btn-search-modal:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

.btn-search-modal:active {
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
  text-align: center !important;
  font-family: "Pretendard", sans-serif !important;
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
  .search-select,
  .search-input,
  .date-input,
  .search-label-inline,
  .btn-search-modal {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .search-select,
  .search-input,
  .date-input,
  .btn-search-modal {
    height: 38px;
    padding: 0.55rem 0.75rem;
  }

  .search-select-wrapper {
    min-width: 110px;
  }
}
</style>