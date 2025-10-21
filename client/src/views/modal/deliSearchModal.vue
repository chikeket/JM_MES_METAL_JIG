<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">
        수주 리스트
        <span v-if="deliId" class="ms-2 text-muted" style="font-weight: 600; font-size: 0.95rem">
          (납품 ID: {{ deliId }})
        </span>
      </CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 상단 테이블: 수주 헤더 목록 -->
        <div class="table-section mb-3">
          <div class="table-header-label">수주 정보</div>
          <div class="table-wrapper-modal" style="max-height: 260px">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 5%">No</th>
                  <th style="width: 12%">수주 ID</th>
                  <th style="width: 12%">수주 담당자</th>
                  <th style="width: 15%">납품 업체 명</th>
                  <th style="width: 13%">수주 등록 일자</th>
                  <th style="width: 11%">수주 상태</th>
                  <th style="width: 32%">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in rcvordHeaders"
                  :key="row.rcvord_id"
                  :class="{ 'row-selected': row.rcvord_id === selectedHeaderId }"
                  @click="selectHeader(row)"
                  class="data-row-modal"
                >
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td class="text-left">{{ row.rcvord_id }}</td>
                  <td class="text-left">{{ row.emp_nm }}</td>
                  <td class="text-left">{{ row.co_nm }}</td>
                  <td class="text-center">{{ formatDate(row.rcv_reg_dt || row.reg_dt) }}</td>
                  <td class="text-center">{{ row.status || row.rcv_status || '진행 중' }}</td>
                  <td class="text-left">{{ row.rcv_rm }}</td>
                </tr>
                <tr v-if="!rcvordHeaders.length" class="empty-state">
                  <td colspan="7">데이터가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 하단 테이블: 선택된 수주의 상세 라인 -->
        <div class="table-section">
          <div class="table-header-label">수주 상세</div>
          <div class="table-wrapper-modal" style="max-height: 260px">
            <table class="data-table-modal" style="table-layout: fixed; width: 100%">
              <thead>
                <tr>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[0] }"
                  >
                    No<span class="col-resizer" @mousedown="onResizerDownLines(0, $event)"></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[1] }"
                  >
                    제품 명<span class="col-resizer" @mousedown="onResizerDownLines(1, $event)"></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[2] }"
                  >
                    제품 옵션 명<span
                      class="col-resizer"
                      @mousedown="onResizerDownLines(2, $event)"
                    ></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[3] }"
                  >
                    규격<span class="col-resizer" @mousedown="onResizerDownLines(3, $event)"></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[4] }"
                  >
                    단위<span class="col-resizer" @mousedown="onResizerDownLines(4, $event)"></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[5] }"
                  >
                    요청 수량<span
                      class="col-resizer"
                      @mousedown="onResizerDownLines(5, $event)"
                    ></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[6] }"
                  >
                    기납품 수량<span
                      class="col-resizer"
                      @mousedown="onResizerDownLines(6, $event)"
                    ></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[7] }"
                  >
                    미납품 수량<span
                      class="col-resizer"
                      @mousedown="onResizerDownLines(7, $event)"
                    ></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[8] }"
                  >
                    당회 납품 수량<span
                      class="col-resizer"
                      @mousedown="onResizerDownLines(8, $event)"
                    ></span>
                  </th>
                  <th
                    class="th-resizable"
                    :style="{ width: colWidthsLines[9] }"
                  >
                    비고<span class="col-resizer" @mousedown="onResizerDownLines(9, $event)"></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in rcvordLinesFiltered"
                  :key="row.rcvord_deta_id"
                  class="data-row-modal"
                >
                  <td class="text-center" :style="{ width: colWidthsLines[0] }">
                    {{ idx + 1 }}
                  </td>
                  <td class="text-left" :style="{ width: colWidthsLines[1] }">
                    {{ row.prdt_nm }}
                  </td>
                  <td class="text-left" :style="{ width: colWidthsLines[2] }">
                    {{ row.opt_nm }}
                  </td>
                  <td class="text-left" :style="{ width: colWidthsLines[3] }">
                    {{ row.spec }}
                  </td>
                  <td class="text-left" :style="{ width: colWidthsLines[4] }">
                    {{ row.unit }}
                  </td>
                  <td class="text-right" :style="{ width: colWidthsLines[5] }">
                    {{ formatNumber(row.total_req_qty) }}
                  </td>
                  <td class="text-right" :style="{ width: colWidthsLines[6] }">
                    {{ formatNumber(row.delivered_qty) }}
                  </td>
                  <td class="text-right" :style="{ width: colWidthsLines[7] }">
                    {{ formatNumber(Math.max((row.total_req_qty || 0) - (row.delivered_qty || 0), 0)) }}
                  </td>
                  <td class="text-right" :style="{ width: colWidthsLines[8] }">
                    {{ formatNumber(row.doc_delivered_qty) }}
                  </td>
                  <td class="text-left" :style="{ width: colWidthsLines[9] }">
                    {{ row.line_rm }}
                  </td>
                </tr>
                <tr v-if="!rcvordLinesFiltered.length" class="empty-state">
                  <td colspan="10">데이터가 없습니다.</td>
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
import {
  defineProps,
  defineEmits,
  shallowRef,
  ref,
  watch,
  computed,
  reactive,
  onBeforeUnmount,
} from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: { type: Boolean, default: false },
  deliId: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const close = () => emit('close')

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

const rcvordHeaders = shallowRef([])
const rcvordLines = shallowRef([])
const selectedHeaderId = ref('')

const rcvordLinesFiltered = computed(() => {
  const id = selectedHeaderId.value
  return (rcvordLines.value || []).filter((r) => r.rcvord_id === id)
})

const colWidthsLines = ref([
  '50px',
  '150px',
  '150px',
  '100px',
  '100px',
  '120px',
  '120px',
  '120px',
  '140px',
  '240px',
])

const resizingLines = reactive({ idx: -1, startX: 0, startW: 0 })

function onResizerDownLines(idx, e) {
  e.preventDefault()
  const w = parseInt(String(colWidthsLines.value[idx] || '').replace(/px$/, '')) || 0
  resizingLines.idx = idx
  resizingLines.startX = e.clientX
  resizingLines.startW = w
  document.body.classList.add('resizing')
  document.addEventListener('mousemove', onResizerMoveLines)
  document.addEventListener('mouseup', onResizerUpLines)
}

function onResizerMoveLines(e) {
  if (resizingLines.idx < 0) return
  const dx = e.clientX - resizingLines.startX
  const min = 56
  const max = 600
  const next = Math.min(max, Math.max(min, resizingLines.startW + dx))
  colWidthsLines.value[resizingLines.idx] = `${next}px`
}

function onResizerUpLines() {
  resizingLines.idx = -1
  document.body.classList.remove('resizing')
  document.removeEventListener('mousemove', onResizerMoveLines)
  document.removeEventListener('mouseup', onResizerUpLines)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onResizerMoveLines)
  document.removeEventListener('mouseup', onResizerUpLines)
})

const loadByDeli = async (deliId) => {
  if (!deliId) {
    rcvordHeaders.value = []
    rcvordLines.value = []
    selectedHeaderId.value = ''
    return
  }
  try {
    const { data } = await axios.get(`/api/delis/${encodeURIComponent(deliId)}`)
    const hdr = data?.header || {}
    const lines = Array.isArray(data?.lines) ? data.lines : []

    const headersMap = new Map()
    for (const ln of lines) {
      const key = ln.rcvord_id
      if (!key || headersMap.has(key)) continue
      headersMap.set(key, {
        rcvord_id: ln.rcvord_id,
        emp_nm: ln.emp_nm,
        co_nm: ln.co_nm,
        reg_dt: ln.rcv_reg_dt || hdr.deli_dt,
        status: ln.rcv_deta_st_nm || ln.deli_st_nm || '',
        rcv_rm: ln.rcv_rm || '',
      })
    }
    rcvordHeaders.value = Array.from(headersMap.values())
    rcvordLines.value = lines
    selectedHeaderId.value = rcvordHeaders.value[0]?.rcvord_id || ''
  } catch (err) {
    console.error('loadByDeli error', err)
    rcvordHeaders.value = []
    rcvordLines.value = []
    selectedHeaderId.value = ''
  }
}

function selectHeader(row) {
  selectedHeaderId.value = row?.rcvord_id || ''
}

const formatNumber = (n) => (n == null || n === '' ? '' : Number(n).toLocaleString())

watch(
  () => ({ v: props.visible, id: props.deliId }),
  ({ v, id }) => {
    if (v) loadByDeli(id)
  },
  { immediate: true, deep: false },
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
   테이블 영역
   ============================================ */
.table-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table-header-label {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  letter-spacing: -0.2px;
}

.table-wrapper-modal {
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

:deep(.data-row-modal.row-selected),
:deep(.data-row-modal.row-selected td) {
  background-color: #eff6ff !important;
  box-shadow: inset 0 0 0 1px #bfdbfe !important;
}

:deep(.empty-state td) {
  text-align: center !important;
  color: #94a3b8 !important;
  font-style: italic !important;
  padding: 2.5rem 0.5rem !important;
  background-color: #f8fafc !important;
  font-family: "Pretendard", sans-serif !important;
}

/* 컬럼 리사이즈 핸들 */
.th-resizable {
  position: relative;
}

.th-resizable .col-resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  user-select: none;
  background: transparent;
  transition: background 0.2s ease;
}

.th-resizable:hover .col-resizer {
  background: rgba(59, 130, 246, 0.3);
}

:global(.resizing) {
  cursor: col-resize !important;
  user-select: none !important;
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
  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 11px !important;
  }
}
</style>