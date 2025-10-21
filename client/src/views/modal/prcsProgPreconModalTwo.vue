<template>
  <CModal :visible="visible" @close="onClose" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">금형 조회</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-row-single">
            <label class="search-label">금형 ID</label>
            <input 
              v-model="keyword" 
              type="text" 
              class="search-input-compact"
              @keyup.enter="fetchMolds"
            />

            <div class="button-group">
              <button class="btn-search-modal" @click="fetchMolds">조회</button>
              <button class="btn-reset-modal" @click="onReset">초기화</button>
            </div>
          </div>
        </div>

        <!-- 결과 테이블 -->
        <div class="table-section">
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 4%">No</th>
                  <th style="width: 8%">금형 ID</th>
                  <th style="width: 12%">금형 명</th>
                  <th style="width: 12%">제품 명</th>
                  <th style="width: 8%">유형</th>
                  <th style="width: 6%">CAVITY</th>
                  <th style="width: 7%">누적 샷</th>
                  <th style="width: 7%">샷 경고치</th>
                  <th style="width: 7%">폐기치</th>
                  <th style="width: 7%">점검 주기</th>
                  <th style="width: 8%">점검 일자</th>
                  <th style="width: 7%">상태</th>
                  <th style="width: 11%">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, i) in rows"
                  :key="row.mold_id"
                  @dblclick="onDblClick(row)"
                  class="data-row-modal"
                >
                  <td class="text-center">{{ i + 1 }}</td>
                  <td class="text-left">{{ row.mold_id }}</td>
                  <td class="text-left text-ellipsis" :title="row.mold_nm">
                    {{ row.mold_nm }}
                  </td>
                  <td class="text-left text-ellipsis" :title="row.prdt_nm">
                    {{ row.prdt_nm }}
                  </td>
                  <td class="text-center">{{ row.mold_ty_nm || row.mold_ty }}</td>
                  <td class="text-right">{{ fmtNumber(row.CAVITY) }}</td>
                  <td class="text-right">{{ fmtNumber(row.accmlt_shot) }}</td>
                  <td class="text-right">{{ fmtNumber(row.warn_qy) }}</td>
                  <td class="text-right">{{ fmtNumber(row.dsuse_qy) }}</td>
                  <td class="text-center">{{ row.chck_cycle }}</td>
                  <td class="text-center">{{ fmtDate(row.chck_dt) }}</td>
                  <td class="text-center">{{ row.st_nm }}</td>
                  <td class="text-left text-ellipsis" :title="row.rm">
                    {{ row.rm }}
                  </td>
                </tr>
                <tr v-if="rows.length === 0" class="empty-state">
                  <td colspan="13">데이터가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CModalBody>
    <CModalFooter class="modal-footer-custom">
      <button class="btn-modal-close" @click="onClose">닫기</button>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'selected'])

const visible = ref(!!props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    visible.value = !!v
    if (v) fetchMolds()
  },
)
watch(visible, (v) => emit('update:modelValue', v))

const keyword = ref('')
const rows = ref([])

async function fetchMolds() {
  try {
    const kw = (keyword.value || '').trim()
    const params = kw ? { mold_id: kw } : {}
    const { data } = await axios.get('/api/prcs-prog-precon/molds', { params })
    const list = Array.isArray(data) ? data : []
    rows.value = list.filter((row) => (row?.st_nm || '').trim() === '미사용')
  } catch (err) {
    console.error('금형 조회 실패', err)
    rows.value = []
  }
}

function onReset() {
  keyword.value = ''
  fetchMolds()
}

function onClose() {
  keyword.value = ''
  visible.value = false
}

function fmtDate(d) {
  if (!d) return ''
  try {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  } catch {
    return ''
  }
}

function fmtNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n.toLocaleString() : ''
}

onMounted(fetchMolds)

function onDblClick(row) {
  emit('selected', row)
  onClose()
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

.search-row-single {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  overflow-x: auto;
}

.table-wrapper-modal::-webkit-scrollbar {
  width: 14px;
  height: 8px;
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
  white-space: nowrap !important;
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

:deep(.data-row-modal:hover td) {
  background-color: #f8fafc !important;
}

:deep(.empty-state td) {
  text-align: center !important;
  color: #94a3b8 !important;
  font-style: italic !important;
  padding: 3rem 0.5rem !important;
  background-color: #f8fafc !important;
  font-family: "Pretendard", sans-serif !important;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  width: 100%;
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
  .btn-search-modal,
  .btn-reset-modal {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 11px !important;
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