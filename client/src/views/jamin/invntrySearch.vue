<template>
  <div class="container-fluid h-100 d-flex flex-column p-3">
    <!-- 상단 툴바: 초기화 / 조회 (CompanyManage와 동일한 배치/스타일) -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <button class="btn btn-secondary btn-sm" @click="onSearch">조회</button>
      <button class="btn btn-secondary btn-sm" @click="onReset">초기화</button>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filter-box mb-2">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-3">
          <label class="form-label">입출고구분</label>
          <select v-model="filters.io_type" class="form-control">
            <option value="">전체</option>
            <option value="IN">입고</option>
            <option value="OUT">출고</option>
          </select>
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">LOT번호</label>
          <input v-model="filters.lot_no" type="text" class="form-control" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">입출고 일</label>
          <div class="d-flex align-items-center gap-1">
            <input v-model="filters.io_dt_from" type="date" class="form-control" />
            <span class="mx-1">~</span>
            <input v-model="filters.io_dt_to" type="date" class="form-control" />
          </div>
        </div>
      </div>
    </div>

    <!-- 결과 그리드 -->
    <div class="grid-box flex-grow-1 d-flex flex-column overflow-hidden">
      <div class="table-wrapper flex-grow-1">
        <table class="data-table w-100">
          <colgroup>
            <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
          </colgroup>
          <thead>
            <tr>
              <th class="text-center th-resizable">
                No<span class="col-resizer" @mousedown="onResizerDown(0, $event)"></span>
              </th>
              <th class="th-resizable">
                입출고구분<span class="col-resizer" @mousedown="onResizerDown(1, $event)"></span>
              </th>
              <th class="th-resizable">
                입출고일자<span class="col-resizer" @mousedown="onResizerDown(2, $event)"></span>
              </th>
              <th class="th-resizable">
                LOT번호<span class="col-resizer" @mousedown="onResizerDown(3, $event)"></span>
              </th>
              <th class="th-resizable">
                품목 ID<span class="col-resizer" @mousedown="onResizerDown(4, $event)"></span>
              </th>
              <th class="th-resizable">
                품목 명<span class="col-resizer" @mousedown="onResizerDown(5, $event)"></span>
              </th>
              <th class="th-resizable">
                옵션 ID<span class="col-resizer" @mousedown="onResizerDown(4, $event)"></span>
              </th>
              <th class="th-resizable">
                옵션 명<span class="col-resizer" @mousedown="onResizerDown(5, $event)"></span>
              </th>
              <th class="th-resizable">
                창고 명<span class="col-resizer" @mousedown="onResizerDown(6, $event)"></span>
              </th>
              <th class="th-resizable">
                로케이션 명<span class="col-resizer" @mousedown="onResizerDown(7, $event)"></span>
              </th>
              <th class="th-resizable">
                수량<span class="col-resizer" @mousedown="onResizerDown(8, $event)"></span>
              </th>
              <th class="th-resizable">
                담당자<span class="col-resizer" @mousedown="onResizerDown(10, $event)"></span>
              </th>
              <th class="th-resizable">
                비고<span class="col-resizer" @mousedown="onResizerDown(11, $event)"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in displayedRows" :key="idx">
              <td class="text-center">{{ idx + 1 }}</td>
              <td class="text-start" :title="r.io_type">{{ r.io_type }}</td>
              <td class="text-start" :title="formatDate(r.io_dt)">{{ formatDate(r.io_dt) }}</td>
              <td class="text-start" :title="r.lot_no">{{ r.lot_no }}</td>
              <td class="text-start" :title="r.prdt_id">{{ r.prdt_id }}</td>
              <td class="text-start" :title="r.prdt_nm">{{ r.prdt_nm }}</td>
              <td class="text-start" :title="r.opt_id">{{ r.opt_id }}</td>
              <td class="text-start" :title="r.opt_nm">{{ r.opt_nm }}</td>
              <td class="text-start" :title="r.wrhous_nm">{{ r.wrhous_nm }}</td>
              <td class="text-start" :title="r.zone_nm">{{ r.zone_nm }}</td>
              <td class="text-end" :title="formatNumber(r.qty)">{{ formatNumber(r.qty) }}</td>
              <td class="text-start" :title="r.unit">{{ r.unit || '' }}</td>
              <td class="text-start" :title="r.emp_nm">{{ r.emp_nm || '' }}</td>
              <td class="text-start" :title="r.rm">{{ r.rm || '' }}</td>
            </tr>
            <!-- 빈행 유지로 표준 높이 확보 -->
            <tr v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
              <td colspan="13">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import axios from 'axios'

// 검색 필터
const filters = reactive({
  io_type: '',
  lot_no: '',
  rsc_nm: '',
  io_dt_from: '',
  io_dt_to: '',
})

// 결과 데이터
const rows = ref([])

// 초기 컬럼 폭 (px) - 필요시 자유롭게 조절 가능
const colWidths = ref([
  '35px', // No
  '80px', // 입출고구분
  '110px', // 입출고일자
  '120px', // LOT번호
  '100px', // 자재ID
  '140px', // 자재명
  '100px', // 창고명
  '100px', // 존명
  '80px', // 수량
  '60px', // 단위
  '100px', // 담당자
  '200px', // 비고
])

// 컬럼 리사이즈 상태 및 핸들러
const resizing = reactive({ idx: -1, startX: 0, startW: 0 })
function onResizerDown(idx, e) {
  e.preventDefault()
  const w = parseInt(String(colWidths.value[idx] || '').replace(/px$/, '')) || 0
  resizing.idx = idx
  resizing.startX = e.clientX
  resizing.startW = w
  document.body.classList.add('resizing')
  document.addEventListener('mousemove', onResizerMove)
  document.addEventListener('mouseup', onResizerUp)
}
function onResizerMove(e) {
  if (resizing.idx < 0) return
  const dx = e.clientX - resizing.startX
  const min = 56 // 최소 폭
  const max = 600 // 최대 폭
  const next = Math.min(max, Math.max(min, resizing.startW + dx))
  colWidths.value[resizing.idx] = `${next}px`
}
function onResizerUp() {
  resizing.idx = -1
  document.body.classList.remove('resizing')
  document.removeEventListener('mousemove', onResizerMove)
  document.removeEventListener('mouseup', onResizerUp)
}
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onResizerMove)
  document.removeEventListener('mouseup', onResizerUp)
})

// 화면에 보이는 표준 행 수
const PAGE_ROWS = 15
// 모든 결과를 렌더링하여 스크롤 동작 (컨테이너 높이를 15행으로 제한)
const displayedRows = computed(() => rows.value)
// 표준 높이를 위한 최소 빈행 (행 수가 적을 때만 채움)
const emptyRowCount = computed(() => Math.max(0, PAGE_ROWS - rows.value.length))

function formatNumber(val) {
  if (val == null || val === '') return ''
  const num = Number(val)
  return Number.isFinite(num) ? num.toLocaleString() : String(val)
}
function toDateStr(d) {
  if (!d) return ''
  try {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}
const formatDate = toDateStr

function onReset() {
  filters.io_type = ''
  filters.lot_no = ''
  filters.rsc_nm = ''
  filters.io_dt_from = ''
  filters.io_dt_to = ''
  rows.value = []
}


// 검색 파라미터 변환 및 LOT 기준 창고 입출고 내역 API 연동
async function onSearch() {
  try {
    // 프론트 필터 → 백엔드 파라미터 매핑
    const params = {
      rcvpay_ty: filters.io_type,
      lot_no: filters.lot_no,
      from_dt: filters.io_dt_from,
      to_dt: filters.io_dt_to,
      keyword: filters.rsc_nm,
      page: 1,
      pageSize: 100,
      orderBy: 'm.RCVPAY_DT DESC, d.WRHOUS_WRHSDLVR_ID DESC'
    }
    // 조회 조건이 모두 비어있으면 전체 조회
    const isAllEmpty = !params.rcvpay_ty && !params.lot_no && !params.from_dt && !params.to_dt && !params.keyword
    if (isAllEmpty) {
      delete params.rcvpay_ty
      delete params.lot_no
      delete params.from_dt
      delete params.to_dt
      delete params.keyword
    }
    // LOT 기준 창고 입출고 내역 API 호출
    const { data } = await axios.get('/api/invntry/wh-transactions', { params })
    // 응답 데이터 매핑(컬럼명 맞추기, 품목명은 rsc/prdt/prdt_opt 모두 참고)
    rows.value = Array.isArray(data?.list)
      ? data.list.map(item => ({
          io_type: item.RCVPAY_TY === 'S1' ? '입고' : item.RCVPAY_TY === 'S2' ? '출고' : item.RCVPAY_TY,
          io_dt: item.RCVPAY_DT,
          lot_no: item.LOT_NO,
          rsc_id: item.RSC_ID,
          rsc_nm: [item.RSC_NM, item.PRDT_NM, item.PRDT_OPT_NM].filter(Boolean).join(' / '),
          wrhous_nm: item.WHOUS_NM,
          zone_nm: item.ZONE_NM,
          qty: item.DETAIL_QY,
          unit: item.UNIT || '',
          emp_nm: item.EMP_NM || '', // 담당자 정보가 있으면 출력
          rm: item.RM || ''
        }))
      : []
  } catch (err) {
    console.error('검색 오류', err)
    alert('검색 중 오류가 발생했습니다.')
  }
}

</script>

<style scoped>
/* ============================================
   기본 설정 및 컨테이너
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

:deep(.container-fluid) {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  padding: 1.5rem !important;
  height: 100vh;
  overflow: hidden;
}

/* ============================================
   검색 필터 박스
   ============================================ */
.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.25rem;
}

/* ============================================
   그리드 박스 - 15개 행 표시
   ============================================ */
.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  height: calc(46px + 15 * 46px + 2px); /* 헤더 + 15개 행 + 테두리 */
}

/* ============================================
   버튼 스타일
   ============================================ */
:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff !important;
}

:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

:deep(.btn:active) {
  transform: scale(0.98);
}

.gap-2 {
  gap: 0.5rem;
}

/* ============================================
   폼 요소
   ============================================ */
:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

:deep(.form-control) {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
}

:deep(.form-control:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}

input[type='date'].form-control {
  font-size: 13px;
}

:deep(.g-3) {
  --bs-gutter-y: 0.75rem;
  --bs-gutter-x: 1rem;
}

/* ============================================
   테이블 래퍼 - 15개 행 표시
   ============================================ */
.table-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

/* 모던 스크롤바 */
.table-wrapper::-webkit-scrollbar {
  width: 14px;
  background: #ffffff;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #ffffff;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #9ca3af 0%, #6b7280 100%);
  border-radius: 10px;
  border: 3px solid #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 100%);
  border-color: #ffffff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.table-wrapper::-webkit-scrollbar-button:single-button {
  display: block;
  height: 20px;
  background-color: #ffffff;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
}

.table-wrapper::-webkit-scrollbar-button:single-button:vertical:decrement {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 4L2 8h8z'/%3E%3C/svg%3E");
  margin-top: 46px;
}

.table-wrapper::-webkit-scrollbar-button:single-button:vertical:increment {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  margin-bottom: 46px;
}

.table-wrapper::-webkit-scrollbar-button:single-button:hover {
  background-color: #f3f4f6;
}

/* ============================================
   데이터 테이블
   ============================================ */
:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  font-size: 13px;
  width: 100%;
  display: table;
  table-layout: fixed;
}

/* 컬럼별 너비 설정 */
:deep(.data-table col:nth-child(1)) { width: 70px; }   /* No */
:deep(.data-table col:nth-child(2)) { width: 100px; }  /* 수주ID */
:deep(.data-table col:nth-child(3)) { width: 100px; }  /* 수주담당자 */
:deep(.data-table col:nth-child(4)) { width: 140px; }  /* 납품업체명 */
:deep(.data-table col:nth-child(5)) { width: 150px; }  /* 제품명 */
:deep(.data-table col:nth-child(6)) { width: 130px; }  /* 제품옵션명 */
:deep(.data-table col:nth-child(7)) { width: 100px; }  /* 규격 */
:deep(.data-table col:nth-child(8)) { width: 60px; }   /* 단위 */
:deep(.data-table col:nth-child(9)) { width: 90px; }   /* 요청수량 */
:deep(.data-table col:nth-child(10)) { width: 110px; } /* 수주등록일자 */
:deep(.data-table col:nth-child(11)) { width: 110px; } /* 납품예정일자 */
:deep(.data-table col:nth-child(12)) { width: 90px; }  /* 출고상태 */
:deep(.data-table col:nth-child(13)) { width: auto; }  /* 비고 */

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
  display: table-header-group;
}

:deep(.data-table tbody) {
  display: table-row-group;
}

:deep(.data-table th) {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.85rem 0.75rem;
  border: none;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.data-table th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.data-table th:last-child) {
  border-top-right-radius: 12px;
}

/* 컬럼 리사이즈 기능 */
.th-resizable {
  position: relative;
  padding-right: 8px;
}

.col-resizer {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 2;
}

body.resizing {
  user-select: none;
  cursor: col-resize !important;
}

:deep(.data-table td) {
  font-size: 13px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #f1f5f9;
  color: #334155;
  height: 46px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.data-table td:last-child) {
  border-right: none;
}

:deep(.data-table tbody tr) {
  transition: all 0.15s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr:hover:not(.empty-row)) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

:deep(.data-table tbody tr:hover:not(.empty-row) td) {
  background-color: #f8fafc;
}

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* ============================================
   반응형 디자인
   ============================================ */
@media (max-width: 1600px) {
  :deep(.form-label) {
    font-size: 12px !important;
  }
  
  :deep(.form-control) {
    font-size: 12px !important;
    height: 38px !important;
    padding: 0.55rem 0.75rem !important;
  }
  
  :deep(.btn) {
    font-size: 12px !important;
    padding: 0.5rem 1.1rem !important;
  }
  
  :deep(.data-table th),
  :deep(.data-table td) {
    font-size: 12px !important;
  }
  
  :deep(.data-table td) {
    height: 42px !important;
  }
  
  .empty-row td {
    height: 42px !important;
  }
}
</style>