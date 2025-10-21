<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 버튼 영역 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="onOpenModal" class="btn-search">지시 조회</CButton>
      <CButton color="secondary" size="sm" @click="onReset" class="btn-reset">초기화</CButton>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2">
      <!-- 상단: 공정 진행 그리드 (전체 너비) -->
      <CCol :md="12" class="d-flex flex-column overflow-hidden mb-2">
        <!-- 타이틀 영역 -->
        <div class="section-header-box mb-2">
          <span v-if="selectedId" class="id-badge" :title="selectedId">{{ selectedId }}</span>
          <span class="section-title">공정 진행</span>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 50px">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 10%">지시 일자</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">생산 지시 명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 12%">제품 명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 12%">제품 옵션 명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 8%">공정 순서</CTableHeaderCell>
                  <CTableHeaderCell style="width: 10%">공정 ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 8%">지시 수량</CTableHeaderCell>
                  <CTableHeaderCell style="width: 8%">투입 수량</CTableHeaderCell>
                  <CTableHeaderCell style="width: 8%">상태</CTableHeaderCell>
                  <CTableHeaderCell>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in mainRows"
                  :key="item.prcs_id + '-' + index"
                  @click="onSelectMain(item)"
                  :class="{ 'selected-row': selectedMain && selectedMain.prcs_id === item.prcs_id }"
                  class="data-row"
                >
                  <CTableDataCell class="text-end">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <span class="cell-text">{{ fmtDate(selectedFrDt) }}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span class="cell-text" :title="selectedNm">{{ selectedNm }}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span class="cell-text" :title="item.prdt_nm">{{ item.prdt_nm }}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span class="cell-text" :title="item.opt_nm">{{ item.opt_nm }}</span>
                  </CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.prcs_ord }}</CTableDataCell>
                  <CTableDataCell class="text-center text-primary">
                    <span class="cell-text mono" :title="item.prcs_id">{{ item.prcs_id }}</span>
                  </CTableDataCell>
                  <CTableDataCell class="text-end">
                    <span class="cell-text">{{ fmtNumber(item.drct_qy) }}</span>
                  </CTableDataCell>
                  <CTableDataCell class="text-end">
                    <span class="cell-text">{{ fmtNumber(item.inpt_qy) }}</span>
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <span class="cell-text" :title="item.st_nm || item.st">{{ item.st_nm || item.st }}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span class="cell-text" :title="item.rm">{{ item.rm }}</span>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in mainEmptyRows" :key="'main-empty-' + i" class="empty-row">
                  <CTableDataCell colspan="11">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 하단 좌측: 작업자 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden pe-1">
        <!-- 타이틀 영역 -->
        <div class="section-header-box mb-2">
          <span class="section-title">작업자</span>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 30%">사원 ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 30%">사원 이름</CTableHeaderCell>
                  <CTableHeaderCell>부서 명</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in empRows"
                  :key="item.emp_id + '-' + index"
                  @click="onSelectEmp(item)"
                  :class="{ 'selected-row': selectedEmp && selectedEmp.emp_id === item.emp_id }"
                  class="data-row"
                >
                  <CTableDataCell class="text-center text-primary">
                    <span class="cell-text mono" :title="item.emp_id">{{ item.emp_id }}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span class="cell-text" :title="item.emp_nm">{{ item.emp_nm }}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span class="cell-text" :title="item.dept_nm">{{ item.dept_nm }}</span>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in empEmptyRows" :key="'emp-empty-' + i" class="empty-row">
                  <CTableDataCell colspan="3">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 하단 우측: 설비 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden ps-1">
        <!-- 타이틀 영역 -->
        <div class="section-header-box mb-2">
          <span class="section-title">설비</span>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 30%">설비 ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 40%">설비 명</CTableHeaderCell>
                  <CTableHeaderCell>설비 상태</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in eqmRows"
                  :key="item.eqm_id + '-' + index"
                  @click="onSelectEqm(item)"
                  :class="{ 'selected-row': selectedEqm && selectedEqm.eqm_id === item.eqm_id }"
                  class="data-row"
                >
                  <CTableDataCell class="text-center text-primary">
                    <span class="cell-text mono" :title="item.eqm_id">{{ item.eqm_id }}</span>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span class="cell-text" :title="item.eqm_nm">{{ item.eqm_nm }}</span>
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <span class="cell-text" :title="item.st_nm || item.st">{{ item.st_nm || item.st }}</span>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in eqmEmptyRows" :key="'eqm-empty-' + i" class="empty-row">
                  <CTableDataCell colspan="3">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>
    </CRow>

    <PrcsProgPreconModalOne v-model="showModal" @selected="onSelected" />
    <PrcsProgPreconModalTwo v-model="showModalTwo" @selected="onSelectedMold" />
  </CContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import PrcsProgPreconModalOne from '../modal/prcsProgPreconModalOne.vue'
import PrcsProgPreconModalTwo from '../modal/prcsProgPreconModalTwo.vue'

const showModal = ref(false)
const selectedId = ref('')
const selectedFrDt = ref('')
const selectedNm = ref('')

const mainRows = ref([])
const empRows = ref([])
const eqmRows = ref([])

const selectedMain = ref(null)
const selectedEmp = ref(null)
const selectedEqm = ref(null)

const showModalTwo = ref(false)
const router = useRouter()

// Empty rows 계산
const mainEmptyRows = computed(() => {
  const dataCount = mainRows.value.length
  return dataCount < 10 ? Math.max(0, 5 - dataCount) : 0
})

const empEmptyRows = computed(() => {
  const dataCount = empRows.value.length
  return dataCount < 10 ? Math.max(0, 5 - dataCount) : 0
})

const eqmEmptyRows = computed(() => {
  const dataCount = eqmRows.value.length
  return dataCount < 10 ? Math.max(0, 5 - dataCount) : 0
})

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
  selectedMain.value = null
  selectedEmp.value = null
  selectedEqm.value = null
}

const onSelected = async (payload) => {
  selectedId.value = payload?.prod_drct_id || ''
  selectedFrDt.value = payload?.prod_drct_fr_dt || ''
  selectedNm.value = payload?.prod_drct_nm || ''
  showModal.value = false
  selectedMain.value = null
  selectedEmp.value = null
  selectedEqm.value = null
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
    const hasStCode = arr.some((r) => r && typeof r.st === 'string')
    mainRows.value = hasStCode ? arr.filter((r) => (r.st || '').trim() === 'J2') : arr
  } catch (err) {
    console.error('fetchMainList error', err)
    mainRows.value = []
  }
}

const fetchEmpList = async () => {
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
    const arr = Array.isArray(data) ? data : []
    eqmRows.value = arr.filter((r) => {
      const text = (r?.st_nm ?? '').toString().trim()
      const code = (r?.st ?? '').toString().trim()
      if (text) return text === '비가동'
      if (code) return code === 'Q2'
      return false
    })
  } catch (err) {
    console.error('fetchEqmList error', err)
    eqmRows.value = []
  }
}

function onSelectMain(row) {
  selectedMain.value = row
  maybeProceed()
}

function onSelectEmp(row) {
  selectedEmp.value = row
  maybeProceed()
}

function onSelectEqm(row) {
  selectedEqm.value = row
  maybeProceed()
}

async function maybeProceed() {
  if (!selectedMain.value || !selectedEmp.value || !selectedEqm.value) return
  try {
    const prcsId = selectedMain.value.prcs_id
    let moldUse = selectedMain.value.mold_use_at
    if (!moldUse) {
      const { data } = await axios.get(`/api/prcs-prog-precon/prcs/${encodeURIComponent(prcsId)}`)
      moldUse = data?.mold_use_at
    }
    if (String(moldUse || '').trim() === 'P1') {
      showModalTwo.value = true
    } else {
      const m = selectedMain.value || {}
      const e = selectedEmp.value || {}
      const q = selectedEqm.value || {}
      const params = new URLSearchParams({
        prod_drct_deta_id: m.prod_drct_deta_id || '',
        prod_drct_id: selectedId.value || '',
        prod_drct_nm: selectedNm.value || '',
        prcs_id: m.prcs_id || '',
        prcs_nm: m.prcs_nm || '',
        prcs_prog_precon_id: m.prcs_prog_precon_id || '',
        prcs_ord: m.prcs_ord != null ? String(m.prcs_ord) : '',
        prdt_id: m.prdt_id || '',
        prdt_nm: m.prdt_nm || '',
        prdt_opt_id: m.prdt_opt_id || '',
        opt_nm: m.opt_nm || '',
        eqm_id: q.eqm_id || '',
        eqm_nm: q.eqm_nm || '',
        emp_id: e.emp_id || '',
        mold_id: '-',
        mold_nm: '-',
        cavity: '-',
        drct_qy: m.drct_qy != null ? String(m.drct_qy) : '',
        prev_inpt_qy: m.inpt_qy != null ? String(m.inpt_qy) : '',
        emp_nm: e.emp_nm || '',
      })
      router.push({ path: '/Minsu/procCtrl', query: Object.fromEntries(params) })
    }
  } catch (err) {
    console.error('mold_use_at 확인 실패', err)
  }
}

function onSelectedMold(moldRow) {
  const m = selectedMain.value || {}
  const e = selectedEmp.value || {}
  const q = selectedEqm.value || {}

  const params = new URLSearchParams({
    prod_drct_deta_id: m.prod_drct_deta_id || '',
    prod_drct_id: selectedId.value || '',
    prod_drct_nm: selectedNm.value || '',
    prcs_id: m.prcs_id || '',
    prcs_nm: m.prcs_nm || '',
    prcs_prog_precon_id: m.prcs_prog_precon_id || '',
    prcs_ord: m.prcs_ord != null ? String(m.prcs_ord) : '',
    prdt_id: m.prdt_id || '',
    prdt_nm: m.prdt_nm || '',
    prdt_opt_id: m.prdt_opt_id || '',
    opt_nm: m.opt_nm || '',
    eqm_id: q.eqm_id || '',
    eqm_nm: q.eqm_nm || '',
    emp_id: e.emp_id || '',
    mold_id: moldRow?.mold_id || '-',
    mold_nm: moldRow?.mold_nm || '-',
    cavity: moldRow?.CAVITY != null ? String(moldRow.CAVITY) : '-',
    drct_qy: m.drct_qy != null ? String(m.drct_qy) : '',
    prev_inpt_qy: m.inpt_qy != null ? String(m.inpt_qy) : '',
    emp_nm: e.emp_nm || '',
  })
  router.push({ path: '/Minsu/procCtrl', query: Object.fromEntries(params) })
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

:deep(.container-fluid) {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  padding: 1.5rem !important;
  min-height: 100vh;
  overflow: auto;
  width: 100%;
}

.section-header-box {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  transition: all 0.2s ease;
  overflow: hidden;
}

.section-header-box:hover {
  border-color: #cbd5e1;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

/* 타이틀 왼쪽 강조 바 */
.section-header-box::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #64748b 0%, #cbd5e1 100%);
  border-radius: 8px 0 0 8px;
}

.section-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 13px;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.id-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  color: #1e40af;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #93c5fd;
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
  letter-spacing: -0.2px;
}

/* ============================================
   그리드 박스
   ============================================ */
.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-height: calc(46px + 5 * 46px + 2px);
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

/* ============================================
   테이블 래퍼
   ============================================ */
.table-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
}

/* ============================================
   두툼한 모던 스크롤바 디자인
   ============================================ */
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
}

:deep(.data-table th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.data-table th:last-child) {
  border-top-right-radius: 12px;
}

:deep(.data-table td) {
  font-size: 13px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  height: 46px;
}

:deep(.data-table tbody tr.data-row) {
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr.data-row:hover) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

:deep(.selected-row) {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
  font-weight: 600;
  box-shadow: inset 0 0 0 2px #3b82f6;
}

:deep(.selected-row td) {
  border-bottom: 1px solid #93c5fd;
  color: #1e40af;
}

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* ============================================
   셀 텍스트
   ============================================ */
.cell-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-text.mono {
  font-family: 'Courier New', monospace;
}

:deep(.text-end) {
  text-align: right;
}

:deep(.text-start) {
  text-align: left;
}

:deep(.text-center) {
  text-align: center;
}

:deep(.text-primary) {
  color: #3b82f6 !important;
}

:deep(.g-2) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.5rem;
}

:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 1600px) {
  .section-title {
    font-size: 12px !important;
  }
  
  .id-badge {
    font-size: 10px !important;
    padding: 0.2rem 0.55rem !important;
  }
  
  .section-header-box::before {
    height: 16px !important;
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
    padding: 0.35rem 0.45rem !important;
    height: 42px !important;
  }
  
  .empty-row td {
    height: 42px !important;
  }

  .grid-box {
    max-height: calc(42px + 5 * 42px + 2px) !important;
  }
}
</style>