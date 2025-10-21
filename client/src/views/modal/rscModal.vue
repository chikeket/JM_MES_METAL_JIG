<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">자재 검색</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-row-single">
            <div class="search-select-wrapper">
              <select class="search-select" v-model="pickValue">
                <option value="rsc_id">자재 코드</option>
                <option value="rsc_clsf_id">자재 분류</option>
                <option value="rsc_nm">자재 명</option>
                <option value="spec">규격</option>
                <option value="unit">단위</option>
              </select>
            </div>

            <input 
              type="text" 
              class="search-input-wide" 
              v-model="searchKeyword" 
              @keyup.enter="rscSearch" 
              placeholder="검색어를 입력하세요"
            />

            <div class="button-group">
              <button class="btn-search-modal" @click="rscSearch">검색</button>
              <button class="btn-reset-modal" @click="resetSearch">초기화</button>
            </div>
          </div>
        </div>

        <!-- 결과 테이블 -->
        <div class="table-section">
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 20%">자재 코드</th>
                  <th style="width: 15%">분류</th>
                  <th style="width: 30%">명</th>
                  <th style="width: 20%">규격</th>
                  <th style="width: 15%">단위</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(r, i) in rscList" 
                  :key="r.rsc_id || i" 
                  @dblclick="selectRsc(r)"
                  class="data-row-modal"
                >
                  <td>{{ r.rsc_id }}</td>
                  <td>{{ r.rsc_clsf_id || r.rsc_ty }}</td>
                  <td>{{ r.rsc_nm }}</td>
                  <td>{{ r.spec }}</td>
                  <td>{{ r.rsc_unit || r.unit }}</td>
                </tr>
                <tr v-if="rscList.length === 0" class="empty-state">
                  <td colspan="5">검색 결과가 없습니다. 조건을 변경해주세요.</td>
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

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const pickValue = ref('rsc_nm')
const searchKeyword = ref('')
const rscList = shallowRef([])

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  console.log('[rscModal] 검색 조건 초기화')
  pickValue.value = 'rsc_nm'
  searchKeyword.value = ''
  rscList.value = []
}

const rscSearch = async () => {
  try {
    const params = { rsc_id:'', rsc_clsf_id:'', rsc_nm:'', spec:'', unit:'' }
    
    if (pickValue.value === 'rsc_id') params.rsc_id = searchKeyword.value || ''
    else if (pickValue.value === 'rsc_clsf_id') params.rsc_clsf_id = searchKeyword.value || ''
    else if (pickValue.value === 'rsc_nm') params.rsc_nm = searchKeyword.value || ''
    else if (pickValue.value === 'spec') params.spec = searchKeyword.value || ''
    else if (pickValue.value === 'unit') params.unit = searchKeyword.value || ''
    
    console.log('[rscModal] request params:', params)
    const res = await axios.get('/api/rscs', { params }).catch(err => { throw err })
    const data = res?.data
    console.log('[rscModal] raw response:', data)
    if (Array.isArray(data)) {
      rscList.value = data
    } else {
      console.warn('[rscModal] unexpected response, expected array. set empty list.')
      rscList.value = []
    }
  } catch (err) {
    console.error('[rscModal] rscSearch error', err)
    rscList.value = []
  }
}

const selectRsc = (r) => {
  const item = {
    rsc_id: r?.rsc_id ?? r?.RSC_ID ?? r?.rscId ?? '',
    rsc_clsf_id: r?.rsc_clsf_id ?? r?.rsc_ty ?? '',
    rsc_nm: r?.rsc_nm ?? r?.RSC_NM ?? r?.rscNm ?? '',
    spec: r?.spec ?? r?.SPEC ?? '',
    unit: r?.unit ?? r?.rsc_unit ?? '',
    rsc_ordr_deta_id: r?.rsc_ordr_deta_id ?? null
  }
  console.log('[rscModal] emit select payload:', item)
  emit('select', item)
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

.search-select-wrapper {
  min-width: 150px;
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

.search-input-wide {
  flex: 1;
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

.search-input-wide:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
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
  max-height: 500px;
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
  .search-select,
  .search-input-wide,
  .btn-search-modal,
  .btn-reset-modal {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .search-select,
  .search-input-wide,
  .btn-search-modal,
  .btn-reset-modal {
    height: 38px;
    padding: 0.55rem 0.75rem;
  }

  .search-select-wrapper {
    min-width: 130px;
  }
}
</style>