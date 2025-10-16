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
          <label class="form-label">수주 ID</label>
          <input v-model="filters.rcvord_id" type="text" class="form-control" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">납품 업체 명</label>
          <input v-model="filters.co_nm" type="text" class="form-control" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">수주 담당자</label>
          <input v-model="filters.emp_nm" type="text" class="form-control" />
        </div>
        <div class="col-12 col-md-3">
          <label class="form-label">수주 등록 일자</label>
          <div class="d-flex align-items-center gap-1">
            <input v-model="filters.reg_dt_from" type="date" class="form-control" />
            <span class="mx-1">~</span>
            <input v-model="filters.reg_dt_to" type="date" class="form-control" />
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
                수주 ID<span class="col-resizer" @mousedown="onResizerDown(1, $event)"></span>
              </th>
              <th class="th-resizable">
                수주 담당자<span class="col-resizer" @mousedown="onResizerDown(2, $event)"></span>
              </th>
              <th class="th-resizable">
                납품 업체 명<span class="col-resizer" @mousedown="onResizerDown(3, $event)"></span>
              </th>
              <th class="th-resizable">
                제품 명<span class="col-resizer" @mousedown="onResizerDown(4, $event)"></span>
              </th>
              <th class="th-resizable">
                제품 옵션 명<span class="col-resizer" @mousedown="onResizerDown(5, $event)"></span>
              </th>
              <th class="th-resizable">
                규격<span class="col-resizer" @mousedown="onResizerDown(6, $event)"></span>
              </th>
              <th class="th-resizable">
                단위<span class="col-resizer" @mousedown="onResizerDown(7, $event)"></span>
              </th>
              <th class="th-resizable">
                요청 수량<span class="col-resizer" @mousedown="onResizerDown(8, $event)"></span>
              </th>
              <th class="th-resizable">
                수주 등록 일자<span
                  class="col-resizer"
                  @mousedown="onResizerDown(9, $event)"
                ></span>
              </th>
              <th class="th-resizable">
                납품 예정 일자<span
                  class="col-resizer"
                  @mousedown="onResizerDown(10, $event)"
                ></span>
              </th>
              <th class="th-resizable">
                출고 상태<span class="col-resizer" @mousedown="onResizerDown(11, $event)"></span>
              </th>
              <th class="th-resizable">
                비고<span class="col-resizer" @mousedown="onResizerDown(12, $event)"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in displayedRows" :key="idx">
              <td class="text-center">{{ idx + 1 }}</td>
              <td class="text-start" :title="r.rcvord_id">{{ r.rcvord_id }}</td>
              <td class="text-start" :title="r.emp_nm">{{ r.emp_nm }}</td>
              <td class="text-start" :title="r.co_nm">{{ r.co_nm }}</td>
              <td class="text-start" :title="r.prdt_nm">{{ r.prdt_nm || '' }}</td>
              <td class="text-start" :title="r.opt_nm">{{ r.opt_nm || '' }}</td>
              <td class="text-start" :title="r.spec">{{ r.spec || '' }}</td>
              <td class="text-start" :title="r.unit">{{ r.unit || '' }}</td>
              <td class="text-end" :title="formatNumber(r.rcvord_qy)">
                {{ formatNumber(r.rcvord_qy) }}
              </td>
              <td class="text-start" :title="formatDate(r.reg_dt)">{{ formatDate(r.reg_dt) }}</td>
              <td class="text-start" :title="formatDate(r.paprd_dt)">
                {{ formatDate(r.paprd_dt) }}
              </td>
              <td class="text-start" :title="r.st_nm">{{ r.st_nm || '' }}</td>
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
  rcvord_id: '',
  co_nm: '',
  emp_nm: '',
  reg_dt_from: '',
  reg_dt_to: '',
})

// 결과 데이터
const rows = ref([])

// 초기 컬럼 폭 (px) - 필요시 자유롭게 조절 가능
const colWidths = ref([
  '35px', // No
  '120px', // 수주 ID
  '100px', // 수주 담당자
  '140px', // 납품 업체 명
  '100px', // 제품 명
  '100px', // 제품 옵션 명
  '60px', // 규격
  '60px', // 단위
  '110px', // 요청 수량
  '100px', // 수주 등록 일자
  '100px', // 납품 예정 일자
  '110px', // 출고 상태
  '300px', // 비고
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
  filters.rcvord_id = ''
  filters.co_nm = ''
  filters.emp_nm = ''
  filters.reg_dt_from = ''
  filters.reg_dt_to = ''
  rows.value = []
}

async function onSearch() {
  try {
    const params = { ...filters }
    const { data } = await axios.get('/api/rcvord-search', { params })
    rows.value = Array.isArray(data?.data) ? data.data : []
  } catch (err) {
    console.error('검색 오류', err)
    alert('검색 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
/* ============================================
	 컨테이너 / 박스 - CompanyManage 스타일 준용
	 ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}
:deep(.container-fluid) {
  background: #ffffff;
  padding: 1rem !important;
  height: 100vh;
  overflow: hidden;
}
.search-filter-box {
  border: 1px solid #dee2e6; /* 얇은 회색 테두리 */
  border-radius: 8px;
  padding: 1rem;
  background: #ffffff;
}
.grid-box {
  border: 1px solid #dee2e6; /* 얇은 회색 테두리 */
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

/* ============================================
	 버튼 - CompanyManage 스타일 준용
	 ============================================ */
.btn {
  /* CoreUI 버튼 톤에 맞춰 커스텀 */
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}
.btn-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
.btn:active {
  transform: translateY(0);
}

/* ============================================
	 폼 요소 - CompanyManage 스타일 준용
	 ============================================ */
.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}
.form-control {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}
.form-control:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}
input[type='date'].form-control {
  font-size: 12px;
}

/* 검색 필터 영역 압축 - CompanyManage와 동일 */
:deep(.g-3) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
}

/* ============================================
	 테이블 - CompanyManage 스타일 준용
	 ============================================ */
.table-wrapper {
  --row-h: 35px; /* td 높이와 동일하게 유지 */
  --head-h: 44px; /* thead 높이 근사값 */
  flex: 1 1 auto;
  border-radius: 10px;
  /* 정확히 15행이 보이도록 높이 고정 (헤더 + 15 * 행 높이) */
  height: calc(var(--head-h) + (15 * var(--row-h)));
  max-height: calc(var(--head-h) + (15 * var(--row-h)));
  overflow-y: auto; /* 세로 스크롤만 허용 */
  overflow-x: hidden; /* 가로 스크롤 제거 */
}
.data-table {
  margin-bottom: 0;
  border-collapse: separate; /* prdtManage와 동일 */
  border-spacing: 0;
  user-select: none;
  cursor: default;
  table-layout: fixed; /* 가로 스크롤 없이 셀 폭 고정 */
  width: 100%;
}
.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}
.data-table th {
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  letter-spacing: -0.2px;
  white-space: nowrap; /* 줄바꿈 방지 */
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  text-overflow: ellipsis; /* 말줄임 */
}
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

.data-table th:first-child {
  border-top-left-radius: 10px;
}
.data-table th:last-child {
  border-top-right-radius: 10px;
}
.data-table td {
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid #e9ecef; /* 바디는 하단 보더만 */
  border-right: 2px solid #e9ecef; /* 열과 열 사이 세로 구분선 */
  color: #2c3e50;
  height: var(--row-h);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #ffffff; /* 기본 흰색으로 hover 대비 */
}
.data-table td:last-child {
  border-right: none; /* 마지막 컬럼은 우측 선 제거 */
}
.data-table tbody tr {
  transition: all 0.2s ease;
  background-color: #ffffff;
}
/* 파일1과 동일한 계산식으로 hover 배경을 칠함 */
.data-table {
  /* 파일1에서 쓰는 변수 → 없으면 Bootstrap 기본 계산식으로 폴백 */
  --row-hover-bg: var(
    --cui-table-hover-bg,
    var(
      --bs-table-hover-bg,
      rgba(var(--cui-emphasis-color-rgb, var(--bs-emphasis-color-rgb, 33, 37, 41)), 0.075)
    )
  );
}

/* tr/td 둘 다 같은 톤으로 */
.data-table tbody tr:hover:not(.empty-row) {
  background-color: var(--row-hover-bg) !important;
}
.data-table tbody tr:hover:not(.empty-row) td {
  background-color: var(--row-hover-bg) !important;
}
.empty-row td {
  height: var(--row-h);
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef; /* 빈행도 구분선을 유지하여 가시성 확보 */
}

/* ============================================
	 모던 스크롤바 - CompanyManage 스타일 준용
	 ============================================ */
.table-wrapper {
  /* overflow는 위 블록에서 제어(세로만) */
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
.table-wrapper::-webkit-scrollbar {
  width: 6px; /* prdtManage와 동일한 슬림 스크롤 */
}
.table-wrapper::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(2px);
  transition: all 0.2s ease;
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
.table-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #9ea2a8 rgba(240, 240, 240, 0.6);
}

/* 버튼 간격 */
.gap-2 {
  gap: 0.5rem;
}

/* 반응형 축소 시 폰트 크기 조정 */
@media (max-width: 1600px) {
  .form-label,
  .form-control,
  .btn,
  th,
  td {
    font-size: 11px !important;
  }
  .btn {
    padding: 0.4rem 1rem;
  }
}
</style>
