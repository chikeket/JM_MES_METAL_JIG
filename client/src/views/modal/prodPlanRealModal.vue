<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">생산계획조회</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-row-single">
            <label class="search-label">생산계획명</label>
            <input 
              type="text" 
              class="search-input-compact" 
              v-model="prod_plan_nm" 
              placeholder="생산계획명을 입력하세요"
            />

            <div class="date-select-wrapper-compact">
              <select class="date-select" v-model="pickValue">
                <option value="singleDate">생산계획등록일</option>
                <option value="prod_expc_dt">생산계획일정조회</option>
              </select>
            </div>

            <!-- 단일 날짜 -->
            <template v-if="pickValue == 'singleDate'">
              <input type="date" class="date-input" v-model="reg_dt" />
            </template>

            <!-- 기간 선택 -->
            <template v-else-if="pickValue == 'prod_expc_dt'">
              <input type="date" class="date-input" v-model="prod_expc_fr_dt" />
              <span class="date-separator">~</span>
              <input type="date" class="date-input" v-model="prod_expc_to_dt" />
            </template>

            <button class="btn-search-modal" @click="prdtSearch()">검색</button>
          </div>
        </div>

        <!-- 결과 테이블 -->
        <div class="table-section">
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 35%">생산계획명</th>
                  <th style="width: 20%">생산계획시작일</th>
                  <th style="width: 20%">생산계획종료일</th>
                  <th style="width: 25%">등록일</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(prdts, i) in prdtList" 
                  :key="i" 
                  @dblclick="selectProduct(prdts)"
                  class="data-row-modal"
                >
                  <td>{{ prdts.prod_plan_nm }}</td>
                  <td>{{ userDateUtils.dateFormat(prdts.prod_expc_fr_dt, 'yyyy-MM-dd') }}</td>
                  <td>{{ userDateUtils.dateFormat(prdts.prod_expc_to_dt, 'yyyy-MM-dd') }}</td>
                  <td>{{ userDateUtils.dateFormat(prdts.reg_dt, 'yyyy-MM-dd') }}</td>
                </tr>
                <tr v-if="prdtList.length === 0" class="empty-state">
                  <td colspan="4">조회된 생산계획이 없습니다.</td>
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
  prod_plan_nm.value = ''
  reg_dt.value = ''
  prod_expc_fr_dt.value = ''
  prod_expc_to_dt.value = ''
  emit('close')
}

const pickValue = ref('singleDate')
const prod_plan_nm = ref('')
const reg_dt = ref('')
const prod_expc_fr_dt = ref('')
const prod_expc_to_dt = ref('')

let prdtList = shallowRef([])

const prdtSearch = async () => {
  const params = { prod_plan_nm: '', reg_dt: '', prod_expc_fr_dt: '', prod_expc_to_dt: '' }

  params.prod_plan_nm = prod_plan_nm.value
  if (pickValue.value == 'singleDate') {
    if (!reg_dt.value) {
      params.reg_dt = '1970-01-01'
    } else {
      params.reg_dt = reg_dt.value
    }
    params.prod_expc_fr_dt = '1970-01-01'
    params.prod_expc_to_dt = '2125-01-01'
  } else {
    params.reg_dt = '1970-01-01'
    if (prod_expc_fr_dt.value != null && !prod_expc_to_dt.value) {
      params.prod_expc_fr_dt = prod_expc_fr_dt.value
      params.prod_expc_to_dt = '2125-01-01'
    } else if (!prod_expc_fr_dt.value && prod_expc_to_dt.value != null) {
      params.prod_expc_fr_dt = '1970-01-01'
      params.prod_expc_to_dt = prod_expc_to_dt.value
    } else {
      params.prod_expc_fr_dt = prod_expc_fr_dt.value
      params.prod_expc_to_dt = prod_expc_to_dt.value
    }
  }
  console.log(params)
  let result = await axios
    .get('/api/prodPlanRealMasterSearch', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async (prdts) => {
  console.log(prdts)
  const params = { prod_plan_id: '' }
  params.prod_plan_id = prdts.prod_plan_id
  let result = await axios
    .get('/api/prodPlanRealDetaSearch', { params })
    .catch((err) => console.log(err))
  emit('select', {
    detailData: result.data,
    searchParams: {
      emp_id: prdts.emp_id,
      prod_expc_fr_dt: userDateUtils.dateFormat(prdts.prod_expc_fr_dt, 'yyyy-MM-dd'),
      prod_expc_to_dt: userDateUtils.dateFormat(prdts.prod_expc_to_dt, 'yyyy-MM-dd'),
      prod_plan_id: prdts.prod_plan_id,
      prod_plan_nm: prdts.prod_plan_nm,
      rcvord_id: prdts.rcvord_id,
      reg_dt: userDateUtils.dateFormat(prdts.reg_dt, 'yyyy-MM-dd'),
      rm: prdts.rm,
    },
  })
  close()
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

.search-row-single {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  min-width: 100px;
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
  width: 250px;
  flex-shrink: 0;
}

.search-input-compact:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.date-select-wrapper-compact {
  min-width: 180px;
  flex-shrink: 0;
}

.date-select {
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

.date-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
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
  width: 150px;
  font-family: "Pretendard", sans-serif;
  flex-shrink: 0;
}

.date-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.date-separator {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  padding: 0 0.5rem;
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
  border-bottom: none !important;
  border-top: none !important;
  letter-spacing: -0.2px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal thead tr th:first-child) {
  border-top-left-radius: 12px !important;
}

:deep(.data-table-modal thead tr th:last-child) {
  border-top-right-radius: 12px !important;
}

:deep(.data-table-modal tbody tr td) {
  font-size: 13px !important;
  font-weight: 400 !important;
  vertical-align: middle !important;
  padding: 0.75rem 0.75rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
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
  .search-input-compact,
  .date-select,
  .date-input,
  .btn-search-modal {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .search-input-compact,
  .date-select,
  .date-input,
  .btn-search-modal {
    height: 38px;
    padding: 0.55rem 0.75rem;
  }

  .search-input-compact {
    width: 220px;
  }

  .date-input {
    width: 140px;
  }
}
</style>