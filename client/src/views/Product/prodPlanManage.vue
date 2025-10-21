<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="masterReset()" class="btn-action">신규</CButton>
      <CButton color="secondary" size="sm" @click="goToProdPlan()" class="btn-action">
        생산계획서 조회
      </CButton>
      <ProdPlanModal
        :visible="isProdPlanModalVisible"
        @close="closeProdPlanModal"
        @select="selectedPrdt"
      />
      <CButton color="secondary" size="sm" @click="insertRowsToDB" class="btn-action">저장</CButton>
      <CButton color="secondary" size="sm" @click="updateRowsToDB" class="btn-action">수정</CButton>
      <CButton color="danger" size="sm" @click="deleteRowsToDB()" class="btn-action">삭제</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">생산계획서 명</CFormLabel>
          <CFormInput v-model="Info.ordrName1" placeholder="생산지시서 명" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">등록 일자</CFormLabel>
          <CFormInput type="date" v-model="Info.regDate" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">시작 일자</CFormLabel>
          <CFormInput type="date" v-model="Info.startDate" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">종료 일자</CFormLabel>
          <CFormInput type="date" v-model="Info.endDate" class="form-input-enhanced" />
        </CCol>
      </CRow>

      <CRow class="g-3 mt-2">
        <CCol :md="12">
          <CFormLabel class="form-label">비고</CFormLabel>
          <CFormTextarea
            v-model="Info.remark"
            rows="2"
            placeholder="필요 시 기재"
            class="form-input-enhanced"
          ></CFormTextarea>
        </CCol>
      </CRow>
    </div>

    <!-- 수주서 조회 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="goToDrctPlan()" class="btn-action">
        수주서 조회
      </CButton>
      <ProdDrctModal
        :visible="isProdDrctModalVisible"
        @close="closeProdDrctModal"
        @select="selectedPrdt"
      />
    </div>

    <!-- 테이블 -->
    <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
      <div class="table-wrapper">
        <CTable bordered hover class="data-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style="width: 160px">코드</CTableHeaderCell>
              <CTableHeaderCell style="width: 200px">제품명</CTableHeaderCell>
              <CTableHeaderCell style="width: 100px">규격</CTableHeaderCell>
              <CTableHeaderCell style="width: 60px">단위</CTableHeaderCell>
              <CTableHeaderCell style="width: 140px">납품일</CTableHeaderCell>
              <CTableHeaderCell style="width: 120px">계획수량</CTableHeaderCell>
              <CTableHeaderCell style="width: 100px">우선순위</CTableHeaderCell>
              <CTableHeaderCell style="width: 150px">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            <CTableRow v-for="(row, idx) in rows" :key="row.id ?? idx" class="data-row">
              <!-- 코드 명 -->
              <CTableDataCell class="text-center">{{
                row.prdt_id + ' - ' + row.prdt_opt_id
              }}</CTableDataCell>

              <!-- 제품 명 -->
              <CTableDataCell>{{ row.prdt_nm + ' - ' + row.opt_nm }}</CTableDataCell>

              <!-- 규격 -->
              <CTableDataCell class="text-center">{{ row.spec }}</CTableDataCell>

              <!-- 단위 -->
              <CTableDataCell class="text-center">{{ row.unit }}</CTableDataCell>

              <!-- 납품 예정 일자 -->
              <CTableDataCell class="text-center">{{
                userDateUtils.dateFormat(row.paprd_dt, 'yyyy-MM-dd')
              }}</CTableDataCell>

              <!-- 계획수량 -->
              <CTableDataCell class="text-end editable-cell" @dblclick="startEdit(row, 'plan_qy')">
                <template v-if="isEditing(row, 'plan_qy')">
                  <CFormInput
                    v-model.number="editDraft"
                    type="number"
                    min="0"
                    size="sm"
                    class="text-end edit-input"
                    @keyup.enter="commitEdit(row, 'plan_qy')"
                    @keyup.esc="cancelEdit"
                    @blur="commitEdit(row, 'plan_qy')"
                    placeholder="0"
                  />
                </template>
                <template v-else>{{ fmtQty(row.plan_qy) }}</template>
              </CTableDataCell>

              <!-- 우선순위 -->
              <CTableDataCell class="text-end editable-cell" @dblclick="startEdit(row, 'priort')">
                <template v-if="isEditing(row, 'priort')">
                  <CFormInput
                    v-model.number="editDraft"
                    type="number"
                    min="0"
                    size="sm"
                    class="text-end edit-input"
                    @keyup.enter="commitEdit(row, 'priort')"
                    @keyup.esc="cancelEdit"
                    @blur="commitEdit(row, 'priort')"
                    placeholder="0"
                  />
                </template>
                <template v-else>{{ fmtQty(row.priort) }}</template>
              </CTableDataCell>

              <!-- 비고 -->
              <CTableDataCell class="editable-cell" @dblclick="startEdit(row, 'rm')">
                <template v-if="isEditing(row, 'rm')">
                  <CFormInput
                    v-model="editDraft"
                    size="sm"
                    class="edit-input"
                    @keyup.enter="commitEdit(row, 'rm')"
                    @keyup.esc="cancelEdit"
                    @blur="commitEdit(row, 'rm')"
                  />
                </template>
                <template v-else>{{ row.rm || '—' }}</template>
              </CTableDataCell>
            </CTableRow>

            <CTableRow v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
              <CTableDataCell colspan="8">&nbsp;</CTableDataCell>
            </CTableRow>

            <CTableRow v-if="!rows || rows.length === 0">
              <CTableDataCell colspan="8" class="text-center text-muted py-5">
                행이 없습니다.
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </CContainer>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import axios from 'axios'
import userDateUtils from '@/utils/useDates.js'
import ProdPlanModal from '../modal/prodPlanRealModal.vue'
import ProdDrctModal from '../modal/rcvordMykModal.vue'
import { useAuthStore } from '@/stores/auth.js'

const auth = useAuthStore()
const PAGE_ROWS = 7
const emptyRowCount = computed(() => Math.max(0, PAGE_ROWS - rows.value.length))

//생산계획모달
const isProdPlanModalVisible = ref(false)
const goToProdPlan = () => {
  isProdPlanModalVisible.value = true
}
const closeProdPlanModal = () => {
  isProdPlanModalVisible.value = false
}
//수주서모달
const isProdDrctModalVisible = ref(false)
const goToDrctPlan = () => {
  isProdDrctModalVisible.value = true
}
const closeProdDrctModal = () => {
  isProdDrctModalVisible.value = false
}

//로그인 세션기반으로 정보 등록함
let empId = auth.user?.emp_id || 'EMP001'

const Info = ref({
  ordrName1: '',
  prod_plan_id: '',
  rcvord_id: '',
  regDate: new Date().toISOString().slice(0, 10),
  startDate: new Date().toISOString().slice(0, 10),
  endDate: null,
  remark: '',
})

const insertRowsToDB = async () => {
  if (Info.value.endDate == null) {
    return alert('종료일을 지정해주세요')
  }
  const master = {
    rm: Info.value.remark,
    rcvord_id: Info.value.rcvord_id,
    emp_id: empId,
    prod_plan_nm: Info.value.ordrName1,
    prod_expc_fr_dt: Info.value.startDate,
    prod_expc_to_dt: Info.value.endDate,
    reg_dt: Info.value.regDate,
  }

  const detail = rows.value.map((row) => ({
    rm: row.rm,
    prdt_id: row.prdt_id,
    prdt_opt_id: row.prdt_opt_id,
    plan_qy: row.plan_qy,
    priort: row.priort,
  }))

  const payload = {
    masterInfo: master,
    detailList: detail,
  }
  console.log(payload)
  let result = await axios.post('/api/insertProdPlanManage', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산계획이 등록되었습니다.')
  } else {
    console.log('생산계획이 실패했습니다.')
  }
}

const updateRowsToDB = async () => {
  console.log(Info.value)
  console.log(rows.value)
  const master = {
    rm: Info.value.remark,
    rcvord_id: Info.value.rcvord_id,
    emp_id: empId,
    prod_plan_nm: Info.value.ordrName1,
    prod_expc_fr_dt: Info.value.startDate,
    prod_expc_to_dt: Info.value.endDate,
    reg_dt: Info.value.regDate,
    prod_plan_id: Info.value.prod_plan_id,
  }

  const detail = rows.value.map((row) => ({
    rm: row.rm,
    prdt_id: row.prdt_id,
    prdt_opt_id: row.prdt_opt_id,
    plan_qy: row.plan_qy,
    priort: row.priort,
    prod_plan_id: row.prod_plan_id,
    prod_plan_deta_id: row.prod_plan_deta_id,
  }))

  const payload = {
    masterInfo: master,
    detailList: detail,
  }
  console.log(payload)
  let result = await axios.post('/api/updateProdPlanManage', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산계획수정이 등록되었습니다.')
  } else {
    console.log('생산계획수정이 실패했습니다.')
  }
}

const deleteRowsToDB = async () => {
  const payload = { prod_plan_id: Info.value.prod_plan_id }
  let result = await axios.post('/api/deleteProdPlanManage', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산계획삭제가 성공되었습니다.')
  } else {
    console.log('생산계획삭제가 실패했습니다. Info.value.prod_plan_id')
  }
}

const rows = ref([])

const selectedPrdt = (prdts) => {
  console.log(prdts)
  Info.value.prod_plan_id = !prdts.searchParams.prod_plan_id
    ? Info.value.prod_plan_id
    : prdts.searchParams.prod_plan_id
  Info.value.rcvord_id = !prdts.searchParams.rcvord_id
    ? Info.value.rcvord_id
    : prdts.searchParams.rcvord_id
  Info.value.ordrName1 = !prdts.searchParams.prod_plan_nm
    ? Info.value.ordrName1
    : prdts.searchParams.prod_plan_nm
  empId = !prdts.searchParams.emp_id ? empId : prdts.searchParams.emp_id
  Info.value.startDate = !prdts.searchParams.prod_expc_fr_dt
    ? Info.value.startDate
    : prdts.searchParams.prod_expc_fr_dt
  Info.value.endDate = !prdts.searchParams.prod_expc_to_dt
    ? Info.value.endDate
    : prdts.searchParams.prod_expc_to_dt
  Info.value.regDate = !prdts.searchParams.reg_dt ? Info.value.regDate : prdts.searchParams.reg_dt
  Info.value.remark = !prdts.searchParams.rm ? Info.value.remark : prdts.searchParams.rm
  let new_id = rows.value.length > 0 ? Math.max(...rows.value.map((r) => r.id ?? 0)) + 1 : 1

  rows.value = []
  for (const prdt of prdts.detailData)
    rows.value.push({
      id: new_id++,
      prod_plan_deta_id: prdt.prod_plan_deta_id,
      prod_plan_id: prdt.prod_plan_id,
      prdt_id: prdt.prdt_id,
      prdt_nm: prdt.prdt_nm,
      prdt_opt_id: prdt.prdt_opt_id,
      opt_nm: prdt.opt_nm,
      spec: prdt.spec,
      unit: prdt.unit,
      plan_qy: !prdt.plan_qy ? 0 : prdt.plan_qy,
      paprd_dt: prdt.paprd_dt,
      priort: prdt.priort,
      rm: prdt.rm,
    })
}

const masterReset = () => {
  Info.value.ordrName1 = ''
  Info.value.startDate = new Date().toISOString().slice(0, 10)
  Info.value.endDate = null
  Info.value.regDate = new Date().toISOString().slice(0, 10)
  Info.value.remark = ''
  rows.value = []
}

const editing = reactive({ id: null, field: null })
const editDraft = ref(null)

const isEditing = (row, field) => editing.id === row.id && editing.field === field

function startEdit(row, field) {
  editing.id = row.id
  editing.field = field
  const cur = row[field]
  editDraft.value = field === 'producible' ? String(!!cur) : cur
}

function commitEdit(row, field) {
  let v = editDraft.value
  if (field === 'drct_qy') {
  } else if (field === 'producible') {
    row.producible = v === 'true' || v === true
  } else if (field === 'unit') {
    row.unit = String(v || 'EA')
  } else {
    row[field] = (v ?? '').toString()
  }
  cancelEdit()
}

function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}
watch(
  () => Info.value.endDate,
  (newEndDate) => {
    if (Info.value.endDate < Info.value.startDate) {
      alert('종료일은 시작일과 같거나 이후여야 합니다')
    } else {
      Info.value.endDate = newEndDate
    }
  },
)
const fmtQty = (n) => (n ?? 0).toLocaleString()
</script>

<style scoped>
/* ============================================
   기본 설정 및 컨테이너
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
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

/* ============================================
   검색 필터 박스
   ============================================ */
.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
}

/* ============================================
   그리드 박스 - 고정 높이 (10개 행)
   ============================================ */
.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-height: calc(46px + 7 * 46px + 2px);
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

:deep(.btn-danger) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff !important;
}

:deep(.btn-danger:hover) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
  transform: translateY(-1px);
}

:deep(.btn:active) {
  transform: scale(0.98);
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

.form-input-enhanced {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
}

.form-input-enhanced:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}

.form-input-enhanced::placeholder {
  display: none;
}

:deep(.g-3) {
  --bs-gutter-y: 0.75rem;
  --bs-gutter-x: 1rem;
}

:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

:deep(.mb-4) {
  margin-bottom: 1rem !important;
}

:deep(.mt-2) {
  margin-top: 0.5rem !important;
}

/* ============================================
   테이블 래퍼
   ============================================ */
.table-wrapper {
  overflow-y: scroll;
  overflow-x: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  scrollbar-gutter: stable;
}

/* 스크롤바 전체 너비 */
.table-wrapper::-webkit-scrollbar {
  width: 16px;
  height: 16px;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

/* 스크롤바 트랙 (배경) */
.table-wrapper::-webkit-scrollbar-track {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 6px 0;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.05);
}

/* 스크롤바 썸 (손잡이) */
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  border-radius: 12px;
  border: 3px solid #f1f5f9;
  box-shadow: 0 3px 10px rgba(71, 85, 105, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 호버 시 */
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-color: #e2e8f0;
  box-shadow: 0 5px 15px rgba(71, 85, 105, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scaleX(1.15);
}

/* 활성화(드래그) 시 */
.table-wrapper::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  border-width: 2px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.5), inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

/* 스크롤바 버튼 제거 */
.table-wrapper::-webkit-scrollbar-button {
  display: none;
}

/* Firefox용 */
.table-wrapper {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
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
  width: max-content;
  min-width: 100%;
  display: table;
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
  white-space: nowrap;
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
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  height: 46px;
  white-space: nowrap;
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

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* 편집 가능한 셀 스타일 */
.editable-cell {
  cursor: pointer;
  position: relative;
}

.editable-cell:hover {
  background-color: #fef3c7 !important;
}

.edit-input {
  font-size: 12px;
  padding: 0.3rem 0.5rem;
  height: 30px;
  border: 1.5px solid #3b82f6;
  border-radius: 4px;
}

.edit-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  outline: none;
}

/* ============================================
   텍스트 정렬
   ============================================ */
:deep(.text-end) {
  text-align: right;
}

:deep(.text-start) {
  text-align: left;
}

:deep(.text-center) {
  text-align: center;
}

:deep(.text-muted) {
  color: #94a3b8 !important;
}

:deep(.py-5) {
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
}

/* ============================================
   반응형 디자인
   ============================================ */
@media (max-width: 1600px) {
  :deep(.form-label) {
    font-size: 12px !important;
  }

  .form-input-enhanced {
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

  .grid-box {
    max-height: calc(42px + 7 * 42px + 2px) !important;
  }
}
</style>