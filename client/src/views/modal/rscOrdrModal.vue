<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">자재 발주서 조회</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-row-multiple">
            <div class="search-select-wrapper">
              <select class="search-select" v-model="pickValue">
                <option value="rsc_ordr_nm">자재 발주서명</option>
                <option value="co_nm">업체명</option>
                <option value="emp_nm">담당자명</option>
              </select>
            </div>

            <input
              class="search-input"
              type="text"
              v-model="searchKeyword"
              @keyup.enter="search"
              placeholder="검색어 입력"
            />

            <input
              class="search-input-date"
              type="date"
              v-model="reg_dt"
            />

            <div class="button-group">
              <button class="btn-search-modal" @click="search">검색</button>
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
                  <th style="width: 18%">발주서ID</th>
                  <th style="width: 25%">발주서명</th>
                  <th style="width: 20%">업체명</th>
                  <th style="width: 20%">담당자명</th>
                  <th style="width: 17%">등록일</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(p, i) in list"
                  :key="p.rsc_ordr_id || i"
                  @dblclick="select(p)"
                  class="data-row-modal"
                >
                  <td>{{ p.rsc_ordr_id }}</td>
                  <td>{{ p.rsc_ordr_nm }}</td>
                  <td>{{ p.co_nm }}</td>
                  <td>{{ p.emp_nm }}</td>
                  <td>{{ p.reg_dt }}</td>
                </tr>
                <tr v-if="list.length === 0" class="empty-state">
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
import { useAuthStore } from '@/stores/auth.js'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const auth = useAuthStore()

const pickValue = ref('rsc_ordr_nm')
const searchKeyword = ref('')
const reg_dt = ref('')
const list = shallowRef([])

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  console.log('[rscOrdrModal] 검색 조건 초기화')
  pickValue.value = 'rsc_ordr_nm'
  searchKeyword.value = ''
  reg_dt.value = ''
  list.value = []
}

const search = async () => {
  try {
    const currentUser = auth.user
    if (!currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    const empId = currentUser.emp_id ?? currentUser.id
    if (!empId) {
      alert('사용자 정보를 찾을 수 없습니다.')
      return
    }

    const params = {
      rsc_ordr_nm: null,
      co_nm: null,
      emp_nm: null,
      reg_dt: null,
      emp_id: empId,
    }

    if (pickValue.value === 'rsc_ordr_nm') params.rsc_ordr_nm = searchKeyword.value
    else if (pickValue.value === 'co_nm') params.co_nm = searchKeyword.value
    else if (pickValue.value === 'emp_nm') params.emp_nm = searchKeyword.value
    if (reg_dt.value) params.reg_dt = reg_dt.value

    console.log('[rscOrdrModal] request params:', params)
    const res = await axios.get('/api/rscOrdr', { params })
    const data = res?.data
    console.log('[rscOrdrModal] raw response:', data)

    list.value = Array.isArray(data)
      ? data.map((it) => ({
          rsc_ordr_id: it.rsc_ordr_id ?? it.RSC_ORDR_ID ?? '',
          co_id: it.co_id ?? it.CO_ID ?? '',
          rsc_ordr_nm: it.rsc_ordr_nm ?? it.RSC_ORDR_NM ?? '',
          rm: it.rm ?? it.RM ?? '',
          co_nm: it.co_nm ?? it.CO_NM ?? '',
          emp_nm: it.emp_nm ?? it.EMP_NM ?? '',
          reg_dt: it.reg_dt ? String(it.reg_dt).slice(0, 10) : '',
          deta_count: Number(it.deta_count ?? it.DETA_COUNT ?? 0),
        }))
      : []
  } catch (err) {
    console.error('[rscOrdrModal] rscOrdr search error', err)
    list.value = []
  }
}

const select = async (row) => {
  try {
    console.log('[rscOrdrModal] select row ->', row)
    const res = await axios.get('/api/rscOrdrDeta', { params: { rsc_ordr_id: row.rsc_ordr_id } })
    const detail = Array.isArray(res.data) ? res.data : []
    console.log('[rscOrdrModal] detail length ->', detail.length)
    emit('select', { master: row, detailList: detail })
    close()
  } catch (err) {
    console.error('[rscOrdrModal] select error:', err)
    emit('select', { master: row, detailList: [] })
    close()
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

.search-input {
  flex: 1;
  min-width: 200px;
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

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.search-input-date {
  min-width: 150px;
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

.search-input-date:focus {
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
  max-height: 480px;
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
  .search-input,
  .search-input-date,
  .btn-search-modal,
  .btn-reset-modal {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .search-select,
  .search-input,
  .search-input-date,
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