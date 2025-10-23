<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle>
        수주 리스트
        <span v-if="deliId" class="ms-2 text-muted" style="font-weight: 600; font-size: 0.95rem">
          (납품 ID: {{ deliId }})
        </span>
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <!-- 상단 그리드: 해당 납품서의 수주 헤더 목록 -->
      <div
        class="table-responsive"
        style="max-height: 260px; overflow-y: auto; margin-bottom: 12px"
      >
        <CTable bordered hover small>
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 50px">No</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 160px">수주 ID</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 160px"
                >수주 담당자</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 200px"
                >납품 업체 명</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 160px"
                >수주 등록 일자</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 140px"
                >수주 상태</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow
              v-for="(row, idx) in rcvordHeaders"
              :key="row.rcvord_id"
              :class="{ 'row-active': row.rcvord_id === selectedHeaderId }"
              @click="selectHeader(row)"
              style="cursor: pointer"
            >
              <CTableDataCell class="cell-no">{{ idx + 1 }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.rcvord_id }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.emp_nm }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.co_nm }}</CTableDataCell>
              <CTableDataCell class="text-center">{{
                formatDate(row.rcv_reg_dt || row.reg_dt)
              }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{
                row.status || row.rcv_status || '진행 중'
              }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.rcv_rm }}</CTableDataCell>
            </CTableRow>
            <CTableRow v-if="!rcvordHeaders.length">
              <CTableDataCell colspan="7" class="text-center text-muted py-3"
                >데이터가 없습니다.</CTableDataCell
              >
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>

      <!-- 하단 그리드: 선택된 헤더의 상세 라인 -->
      <div class="table-responsive" style="max-height: 260px; overflow-y: auto">
        <CTable bordered hover small style="table-layout: fixed; width: 100%">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[0] }"
              >
                No<span class="col-resizer" @mousedown="onResizerDownLines(0, $event)"></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[1] }"
              >
                제품 명<span class="col-resizer" @mousedown="onResizerDownLines(1, $event)"></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[2] }"
              >
                제품 옵션 명<span
                  class="col-resizer"
                  @mousedown="onResizerDownLines(2, $event)"
                ></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[3] }"
              >
                규격<span class="col-resizer" @mousedown="onResizerDownLines(3, $event)"></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[4] }"
              >
                단위<span class="col-resizer" @mousedown="onResizerDownLines(4, $event)"></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[5] }"
              >
                요청 수량<span
                  class="col-resizer"
                  @mousedown="onResizerDownLines(5, $event)"
                ></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[6] }"
              >
                기납품 수량<span
                  class="col-resizer"
                  @mousedown="onResizerDownLines(6, $event)"
                ></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[7] }"
              >
                미납품 수량<span
                  class="col-resizer"
                  @mousedown="onResizerDownLines(7, $event)"
                ></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[8] }"
              >
                당회 납품 수량<span
                  class="col-resizer"
                  @mousedown="onResizerDownLines(8, $event)"
                ></span>
              </CTableHeaderCell>
              <CTableHeaderCell
                class="text-center th-resizable"
                :style="{ width: colWidthsLines[9] }"
              >
                비고<span class="col-resizer" @mousedown="onResizerDownLines(9, $event)"></span>
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(row, idx) in rcvordLinesFiltered" :key="row.rcvord_deta_id">
              <CTableDataCell class="cell-no" :style="{ width: colWidthsLines[0] }">{{
                idx + 1
              }}</CTableDataCell>
              <CTableDataCell class="cell-left" :style="{ width: colWidthsLines[1] }">{{
                row.prdt_nm
              }}</CTableDataCell>
              <CTableDataCell class="cell-left" :style="{ width: colWidthsLines[2] }">{{
                row.opt_nm
              }}</CTableDataCell>
              <CTableDataCell class="cell-left" :style="{ width: colWidthsLines[3] }">{{
                row.spec
              }}</CTableDataCell>
              <CTableDataCell class="cell-left" :style="{ width: colWidthsLines[4] }">{{
                row.unit
              }}</CTableDataCell>
              <CTableDataCell class="cell-number" :style="{ width: colWidthsLines[5] }">{{
                formatNumber(row.total_req_qty)
              }}</CTableDataCell>
              <CTableDataCell class="cell-number" :style="{ width: colWidthsLines[6] }">{{
                formatNumber(row.delivered_qty)
              }}</CTableDataCell>
              <CTableDataCell class="cell-number" :style="{ width: colWidthsLines[7] }">{{
                formatNumber(Math.max((row.total_req_qty || 0) - (row.delivered_qty || 0), 0))
              }}</CTableDataCell>
              <CTableDataCell class="cell-number" :style="{ width: colWidthsLines[8] }">{{
                formatNumber(row.doc_delivered_qty)
              }}</CTableDataCell>
              <CTableDataCell class="cell-left" :style="{ width: colWidthsLines[9] }">{{
                row.line_rm
              }}</CTableDataCell>
            </CTableRow>
            <CTableRow v-if="!rcvordLinesFiltered.length">
              <CTableDataCell colspan="10" class="text-center text-muted py-3"
                >데이터가 없습니다.</CTableDataCell
              >
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </CModalBody>
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

// 닫기
const close = () => emit('close')

// 포맷 함수
const formatDate = (d) => {
  if (!d) return ''
  try {
    // d가 이미 'YYYY-MM-DD' 형태 문자열일 경우 그대로 반환
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

// 상/하단 데이터 상태
const rcvordHeaders = shallowRef([])
const rcvordLines = shallowRef([])
const selectedHeaderId = ref('')

const rcvordLinesFiltered = computed(() => {
  const id = selectedHeaderId.value
  return (rcvordLines.value || []).filter((r) => r.rcvord_id === id)
})

// 하단 그리드: 컬럼 폭 상태 및 리사이즈 핸들러
const colWidthsLines = ref([
  '50px', // No
  '150px', // 제품 명
  '150px', // 제품 옵션 명
  '100px', // 규격
  '100px', // 단위
  '120px', // 요청 수량
  '120px', // 기납품 수량
  '120px', // 미납품 수량
  '140px', // 당회 납품 수량
  '240px', // 비고
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

// 데이터 로드: deli_id 기준으로 헤더/라인 로드
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

    // 상단 그리드: 라인에서 rcvord 헤더 정보를 집계(중복 제거)
    const headersMap = new Map()
    for (const ln of lines) {
      const key = ln.rcvord_id
      if (!key || headersMap.has(key)) continue
      headersMap.set(key, {
        rcvord_id: ln.rcvord_id,
        emp_nm: ln.emp_nm,
        co_nm: ln.co_nm,
        reg_dt: ln.rcv_reg_dt || hdr.deli_dt, // 없으면 문서일자 보조
        status: ln.rcv_deta_st_nm || ln.deli_st_nm || '', // 보조 표시
        rcv_rm: ln.rcv_rm || '',
      })
    }
    rcvordHeaders.value = Array.from(headersMap.values())
    rcvordLines.value = lines
    // 기본 선택: 첫 행
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

// 숫자 포맷터
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
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}
.text-danger {
  color: #dc3545;
}
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 12px;
}
.search-bar {
  display: flex;
  align-items: center;
}
.flex-spacer {
  flex: 1;
}
.right-controls {
  display: flex;
  align-items: center;
  gap: 10px; /* 조회와 초기화 사이 간격 */
}
.search-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #222;
  display: inline-block;
  min-width: 56px;
  text-align: right;
}
.cell-no {
  text-align: center !important;
}
.cell-number {
  text-align: right !important;
}
.cell-left {
  text-align: left !important;
}

/* CompanyManage 스타일 적용 */
:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}
:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.25);
}

/* 테이블 헤더/바디 스타일 (CompanyManage 준용) */
:deep(.table-responsive) {
  border-radius: 10px;
}
:deep(.table-responsive thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}
:deep(.table-responsive thead th) {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%) !important;
  color: #ffffff !important;
  text-align: center;
  padding: 0.6rem 0.5rem;
  border: none;
}
:deep(.table-responsive tbody td) {
  font-size: 14px;
  vertical-align: middle;
}

/* Row hover - match prdtManage look */
:deep(.table-responsive tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
}
:deep(.table-responsive tbody tr:hover) {
  background-color: #f8f9fa !important;
}
/* Ensure cell background also changes to the same tone */
:deep(.table-responsive tbody tr:hover) td {
  background-color: #f8f9fa !important;
}

/* Active row highlight */
:deep(.table-responsive tbody tr.row-active),
:deep(.table-responsive tbody tr.row-active td) {
  background-color: #e9f5ff !important;
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
}
.resizing {
  cursor: col-resize !important;
}

/* 모던 스크롤바 (CompanyManage 준용) */
:deep(.table-responsive) {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
:deep(.table-responsive::-webkit-scrollbar) {
  width: 8px;
}
:deep(.table-responsive::-webkit-scrollbar-track) {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
:deep(.table-responsive::-webkit-scrollbar-thumb) {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
:deep(.table-responsive::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
</style>
