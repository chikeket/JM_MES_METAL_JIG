<template>
  <div class="prcs-prog-page vars-scope">
    <div class="global-toolbar">
      <div class="toolbar-buttons">
        <button class="btn btn-sm btn-outline-secondary" @click="onOpenModal">지시 조회</button>
        <button class="btn btn-sm btn-outline-secondary" @click="onReset">초기화</button>
      </div>
    </div>

    <div class="grid-card">
      <div class="grid-title main-title">
        <span v-if="selectedId" class="id-badge" :title="selectedId">{{ selectedId }}</span>
        공정 진행
      </div>
      <div class="table-wrapper table-wrapper-expanded">
        <table class="data-grid">
          <thead>
            <tr>
              <th class="no-col">No</th>
              <th class="date-col">지시 일자</th>
              <th class="name-col">생산 지시 명</th>
              <th class="prod-col">제품 명</th>
              <th class="opt-col">제품 옵션 명</th>
              <th class="ord-col">공정 순서</th>
              <th class="pr-col">공정 코드</th>
              <th class="drct-col">지시 수량</th>
              <th class="inpt-col">투입 수량</th>
              <th class="st-col">상태</th>
              <th class="remark-col">비고</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in mainRows" :key="r.prcs_id + '-' + i">
              <td class="cell-no">{{ i + 1 }}</td>
              <td class="cell-left">
                <span class="cell-text" :title="fmtDate(selectedFrDt)">{{
                  fmtDate(selectedFrDt)
                }}</span>
              </td>
              <td class="cell-left">
                <span class="cell-text" :title="selectedNm">{{ selectedNm }}</span>
              </td>
              <td class="cell-left">
                <span class="cell-text" :title="r.prdt_nm">{{ r.prdt_nm }}</span>
              </td>
              <td class="cell-left">
                <span class="cell-text" :title="r.opt_nm">{{ r.opt_nm }}</span>
              </td>
              <td class="cell-number">{{ r.prcs_ord }}</td>
              <td class="cell-left">
                <span class="cell-text mono" :title="r.prcs_id">{{ r.prcs_id }}</span>
              </td>
              <td class="cell-number">
                <span class="cell-text">{{ fmtNumber(r.drct_qy) }}</span>
              </td>
              <td class="cell-number">
                <span class="cell-text">{{ fmtNumber(r.inpt_qy) }}</span>
              </td>
              <td class="cell-left">
                <span class="cell-text" :title="r.st_nm || r.st">{{ r.st_nm || r.st }}</span>
              </td>
              <td class="cell-left">
                <span class="cell-text" :title="r.rm">{{ r.rm }}</span>
              </td>
            </tr>
            <tr
              v-for="n in Math.max(0, 12 - mainRows.length)"
              :key="'m-empty-' + n"
              class="empty-row"
            >
              <td colspan="11">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-row">
      <div class="grid-card small">
        <div class="grid-title">작업자</div>
        <div class="table-wrapper table-wrapper-sm">
          <table class="data-grid">
            <thead>
              <tr>
                <th class="empid-col">사원 ID</th>
                <th class="empname-col">사원 이름</th>
                <th class="dept-col">부서 명</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in empRows" :key="r.emp_id + '-' + i">
                <td class="cell-left">
                  <span class="cell-text mono" :title="r.emp_id">{{ r.emp_id }}</span>
                </td>
                <td class="cell-left">
                  <span class="cell-text" :title="r.emp_nm">{{ r.emp_nm }}</span>
                </td>
                <td class="cell-left">
                  <span class="cell-text" :title="r.dept_nm">{{ r.dept_nm }}</span>
                </td>
              </tr>
              <tr
                v-for="n in Math.max(0, 8 - empRows.length)"
                :key="'e-empty-' + n"
                class="empty-row"
              >
                <td colspan="3">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid-card small">
        <div class="grid-title">설비</div>
        <div class="table-wrapper table-wrapper-sm">
          <table class="data-grid">
            <thead>
              <tr>
                <th class="pr-col">설비 ID</th>
                <th class="prod-col">설비 명</th>
                <th class="st-col">설비 상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in eqmRows" :key="r.eqm_id + '-' + i">
                <td class="cell-left">
                  <span class="cell-text mono" :title="r.eqm_id">{{ r.eqm_id }}</span>
                </td>
                <td class="cell-left">
                  <span class="cell-text" :title="r.eqm_nm">{{ r.eqm_nm }}</span>
                </td>
                <td class="cell-left">
                  <span class="cell-text" :title="r.st_nm || r.st">{{ r.st_nm || r.st }}</span>
                </td>
              </tr>
              <tr
                v-for="n in Math.max(0, 8 - eqmRows.length)"
                :key="'q-empty-' + n"
                class="empty-row"
              >
                <td colspan="3">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <PrcsProgPreconModalOne v-model="showModal" @selected="onSelected" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import PrcsProgPreconModalOne from '../modal/prcsProgPreconModalOne.vue'

const showModal = ref(false)
const selectedId = ref('')
const selectedFrDt = ref('')
const selectedNm = ref('')

const mainRows = ref([])
const empRows = ref([])
const eqmRows = ref([])

const onOpenModal = () => {
  showModal.value = true
}
const onReset = () => {
  selectedId.value = ''
  selectedFrDt.value = ''
  selectedNm.value = ''
  mainRows.value = []
  empRows.value = []
  eqmRows.value = []
}

const onSelected = async (payload) => {
  selectedId.value = payload?.prod_drct_id || ''
  selectedFrDt.value = payload?.prod_drct_fr_dt || ''
  selectedNm.value = payload?.prod_drct_nm || ''
  showModal.value = false
  await Promise.all([fetchMainList(), fetchEmpList(), fetchEqmList()])
}

const fetchMainList = async () => {
  if (!selectedId.value) {
    mainRows.value = []
    return
  }
  try {
    const { data } = await axios.get('/api/prcs-prog-precon/main', {
      params: { prod_drct_id: selectedId.value },
    })
    const arr = Array.isArray(data) ? data : []
    // 서버가 st='J2'만 내려주지 않는 경우를 대비해 클라이언트에서 보조 필터
    const hasStCode = arr.some((r) => r && typeof r.st === 'string')
    mainRows.value = hasStCode ? arr.filter((r) => (r.st || '').trim() === 'J2') : arr
  } catch (err) {
    console.error('fetchMainList error', err)
    mainRows.value = []
  }
}

const fetchEmpList = async () => {
  // 선택된 지시가 없으면 비워둔다
  if (!selectedId.value) {
    empRows.value = []
    return
  }
  try {
    const { data } = await axios.get('/api/prcs-prog-precon/emps')
    empRows.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('fetchEmpList error', err)
    empRows.value = []
  }
}

const fetchEqmList = async () => {
  try {
    const { data } = await axios.get('/api/prcs-prog-precon/eqms')
    eqmRows.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('fetchEqmList error', err)
    eqmRows.value = []
  }
}

function fmtDate(d) {
  if (!d) return ''
  try {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return ''
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}
function fmtNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n.toLocaleString() : ''
}
</script>

<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}
.vars-scope {
  --radius-sm: 4px;
  --radius-md: 6px;
  --color-btn-gray: #6e7b85;
  --color-btn-gray-hover: #5d6871;
  --color-btn-danger: #c53030;
  --color-btn-danger-hover: #a82323;
  --color-btn-text: #fff;
  --table-visible-rows: 9;
  --row-h: 34px;
  --thead-h: 34px;

  /* 메인 그리드 열 너비 변수 (필요 시 여기서만 숫자 조절) */
  --col-main-no: 46px;
  --col-main-date: 110px;
  --col-main-name: 180px;
  --col-main-prod: 120px;
  --col-main-opt: 140px;
  --col-main-ord: 90px;
  --col-main-pr: 100px;
  --col-main-drct: 90px;
  --col-main-inpt: 90px;
  --col-main-st: 110px;
  --col-main-remark: 320px;
}
.global-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0 14px;
  margin-bottom: 8px;
}
.global-toolbar .toolbar-buttons {
  display: flex;
  gap: 6px;
}
.card-like {
  border: 1px solid #ccc;
  background: #fff;
  padding: 12px 14px 16px;
  margin-bottom: 12px;
  border-radius: var(--radius-md);
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px 18px;
}
.field {
  display: flex;
  flex-direction: column;
}
.field label {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
  color: #2c3e50;
}
.field input[type='text'] {
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
}
.field input[readonly] {
  background: #e9e9e9;
  color: #222;
}

.btn {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: var(--color-btn-text);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-sm {
  height: auto;
  padding: 0.5rem 1.2rem;
  font-size: 13px;
}
.btn-outline-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: var(--color-btn-text);
}
.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
.btn-ghost {
  background: transparent;
  border: 1px solid #c7c7c7;
  color: #333;
}

.table-wrapper {
  height: calc(var(--row-h) * var(--table-visible-rows) + var(--thead-h));
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #bcbcbc;
  border-radius: var(--radius-md);
}
.table-wrapper-expanded {
  margin-top: 0;
  background: #ffffff;
  padding: 0;
}
.table-wrapper-sm {
  height: calc(var(--row-h) * 6 + var(--thead-h));
}

table.data-grid {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 12px;
}
.data-grid thead th {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  z-index: 10;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: var(--thead-h);
}
.data-grid thead th:first-child {
  border-top-left-radius: var(--radius-sm);
}
.data-grid thead th:last-child {
  border-top-right-radius: var(--radius-sm);
}
.data-grid tbody td {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: var(--row-h);
}
.data-grid tbody td:last-child {
  border-right: none;
}
.data-grid tbody tr {
  height: var(--row-h);
  transition: all 0.2s ease;
  background: #fff;
}
.data-grid tbody tr:hover:not(.empty-row),
.data-grid tbody tr:hover:not(.empty-row) td,
.data-grid tbody tr:hover:not(.empty-row) .input-like {
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
}

.cell-no {
  text-align: center;
}
.cell-number {
  text-align: right;
}
.cell-left {
  text-align: left;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.input-like {
  display: block;
  width: 100%;
  background-color: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  min-height: 28px;
  line-height: 1.2;
}
.input-like--compact {
  padding: 0.2rem 0.5rem;
  min-height: 26px;
}
.input-like--number {
  text-align: right;
}
.input-like--textarea {
  padding-top: 0.35rem;
  padding-bottom: 0.35rem;
}
.input-like .value {
  display: inline-block;
  color: #2c3e50;
}

/* 메인 그리드: 열별 너비 매핑 */
.no-col {
  width: var(--col-main-no);
}
.date-col {
  width: var(--col-main-date);
}
.name-col {
  width: var(--col-main-name);
}
.prod-col {
  width: var(--col-main-prod);
}
.opt-col {
  width: var(--col-main-opt);
}
.ord-col {
  width: var(--col-main-ord);
}
.pr-col {
  width: var(--col-main-pr);
}
.drct-col {
  width: var(--col-main-drct);
}
.inpt-col {
  width: var(--col-main-inpt);
}
.st-col {
  width: var(--col-main-st);
}
.remark-col {
  width: var(--col-main-remark);
}

.grid-row {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
.grid-card {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
}
.grid-card .grid-title {
  font-weight: 600;
  color: #111827;
}

.table-wrapper {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

.data-grid tbody td {
  padding-top: 6px;
  padding-bottom: 6px;
  vertical-align: middle;
  overflow: hidden;
}
.data-grid .cell-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: calc(var(--row-h) - 12px);
  max-height: calc(var(--row-h) - 12px);
}
.data-grid .input-like {
  min-height: 0;
  height: calc(var(--row-h) - 12px);
  padding-top: 2px;
  padding-bottom: 2px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.data-grid .input-like .value {
  line-height: 1.2;
  max-height: calc(var(--row-h) - 12px);
}
.data-grid .editor-input {
  height: calc(var(--row-h) - 12px) !important;
  min-height: 0 !important;
  padding-top: 2px;
  padding-bottom: 2px;
  box-sizing: border-box;
}
.data-grid .editor-textarea {
  height: calc(var(--row-h) - 12px) !important;
  min-height: 0 !important;
  max-height: calc(var(--row-h) - 12px) !important;
  overflow-y: auto !important;
  box-sizing: border-box;
}

@media (max-width: 1600px) {
  .btn {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}
@media (max-height: 900px) {
  .table-wrapper {
    height: calc(var(--row-h) * 7 + var(--thead-h));
  }
}
@media (max-height: 780px) {
  .table-wrapper {
    height: calc(var(--row-h) * 6 + var(--thead-h));
  }
}
@media (max-height: 700px) {
  .table-wrapper {
    height: calc(var(--row-h) * 5 + var(--thead-h));
  }
}

/* 행 높이 고정 패치 변수 */
.vars-scope {
  --row-h: 34px;
  --row-vpad: 6px;
  --cell-inner-h: calc(var(--row-h) - (var(--row-vpad) * 2));
}
.data-grid tbody td {
  padding-top: var(--row-vpad);
  padding-bottom: var(--row-vpad);
}
.data-grid .input-like {
  height: var(--cell-inner-h);
}
/* 메인 타이틀 + 지시 ID 배지 */
.main-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #111827;
  margin: 6px 0 6px 2px;
}
.id-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #0b5ed7;
  background: #e7f1ff;
  border: 1px solid #cde0ff;
  border-radius: 999px;
  padding: 2px 8px;
}
</style>
