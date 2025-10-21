<script setup>
import { ref, reactive, watch } from 'vue'

import axios from 'axios'
import userDateUtils from '@/utils/useDates.js'
import ProdPlanModal from '../modal/prodPlanRealModal.vue'
import ProdDrctModal from '../modal/rcvordMykModal.vue'
import { useAuthStore } from '@/stores/auth.js'
const auth = useAuthStore()
// console.log('auth정보')
// console.log(auth.user)

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
  // console.log(Info.value)
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
  let result = await axios
    .post('/api/insertProdPlanManage', payload)
    .catch((err) => console.log(err))
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
  let result = await axios
    .post('/api/updateProdPlanManage', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산계획수정이 등록되었습니다.')
  } else {
    console.log('생산계획수정이 실패했습니다.')
  }
}

const deleteRowsToDB = async () => {
  const payload = { prod_plan_id: Info.value.prod_plan_id }
  let result = await axios
    .post('/api/deleteProdPlanManage', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산계획삭제가 성공되었습니다.')
  } else {
    console.log('생산계획삭제가 실패했습니다. Info.value.prod_plan_id')
  }
}

const rows = ref([
  // {
  //   id: 1,
  //   prdt_id: 'a091',
  //   prdt_opt_id: 'optid',
  //   prdt_nm: 'prdt',
  //   opt_nm: 'opt',
  //   spec: 'spec',
  //   unit: 'unit',
  //   paprd_dt: '1970-01-01',
  //   plan_qy: 100,
  //   priort: 1,
  //   rm: '',
  // },
])

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

  // console.log(rows.value)
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
  // boolean 셀렉트 대비
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

<template>
  <CContainer fluid>
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="masterReset()">신규</CButton>
      <CButton color="secondary" @click="goToProdPlan()">생산계획서 조회</CButton>
      <ProdPlanModal
        :visible="isProdPlanModalVisible"
        @close="closeProdPlanModal"
        @select="selectedPrdt"
      />
      <CButton color="secondary" @click="insertRowsToDB">저장</CButton>
      <CButton color="secondary" @click="updateRowsToDB">수정</CButton>
      <CButton color="danger" @click="deleteRowsToDB()">삭제</CButton>
    </div>
<div class="search-filter-box mb-2">
    <CContainer fluid>
      <CRow class="g-3 mb-3">
        <CCol md="3">
          <c-form-label>생산계획서 명</c-form-label>
            <c-form-input v-model="Info.ordrName1" placeholder="생산지시서 명"/>
        </CCol>

        <CCol md="3">
          <c-form-label>등록 일자</c-form-label>
            <c-form-input type="date" v-model="Info.startDate" />

        </CCol>
        <CCol md="3">
          <c-form-label>시작 일자</c-form-label>
            <c-form-input type="date" v-model="Info.startDate" />
        </CCol>
        <CCol md="3">
          <c-form-label>종료 일자</c-form-label>
            <c-form-input type="date" v-model="Info.endDate" />
        </CCol>
      </CRow>
    </CContainer>
    <CFormTextarea v-model="Info.remark" label="비고" rows="3" text="필요 시 기재"></CFormTextarea>
</div>
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="goToDrctPlan()">수주서 조회</CButton>
      <ProdDrctModal
        :visible="isProdDrctModalVisible"
        @close="closeProdDrctModal"
        @select="selectedPrdt"
      />
    </div>

    <CTable hover bordered small class="align-middle">
      <CTableHead color="dark">
        <CTableRow>
          <CTableHeaderCell scope="col" class="text-center" style="width: 160px"
            >코드</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center">제품명</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center" style="width: 100px"
            >규격</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center" style="width: 60px"
            >단위</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center" style="width: 140px"
            >납품일</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center" style="width: 120px"
            >계획수량</CTableHeaderCell
          >

          <CTableHeaderCell scope="col" class="text-center">우선순위</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody>
        <CTableRow v-for="(row, idx) in rows" :key="row.id ?? idx">
          <!-- 코드 명 -->
          <CTableDataCell scope="row">{{ row.prdt_id + ' - ' + row.prdt_opt_id }}</CTableDataCell>

          <!-- 제품 명 -->
          <CTableDataCell scope="row">{{ row.prdt_nm + ' - ' + row.opt_nm }}</CTableDataCell>

          <!-- 규격 -->
          <CTableDataCell scope="row">{{ row.spec }}</CTableDataCell>

          <!-- 단위 -->
          <CTableDataCell scope="row">{{ row.unit }}</CTableDataCell>

          <!-- 납품 예정 일자 -->
          <CTableDataCell scope="row">{{
            userDateUtils.dateFormat(row.paprd_dt, 'yyyy-MM-dd')
          }}</CTableDataCell>

          <!-- 계획수량 -->
          <CTableDataCell class="text-end" @dblclick="startEdit(row, 'plan_qy')">
            <template v-if="isEditing(row, 'plan_qy')">
              <CFormInput
                v-model.number="editDraft"
                type="number"
                min="0"
                size="sm"
                class="text-end"
                @keyup.enter="commitEdit(row, 'plan_qy')"
                @keyup.esc="cancelEdit"
                @blur="commitEdit(row, 'plan_qy')"
                placeholder="0"
              />
            </template>
            <template v-else>{{ fmtQty(row.plan_qy) }}</template>
          </CTableDataCell>

          <!-- 우선순위 -->
          <CTableDataCell class="text-end" @dblclick="startEdit(row, 'priort')">
            <template v-if="isEditing(row, 'priort')">
              <CFormInput
                v-model.number="editDraft"
                type="number"
                min="0"
                size="sm"
                class="text-end"
                @keyup.enter="commitEdit(row, 'priort')"
                @keyup.esc="cancelEdit"
                @blur="commitEdit(row, 'priort')"
                placeholder="0"
              />
            </template>
            <template v-else>{{ fmtQty(row.priort) }}</template>
          </CTableDataCell>

          <!-- 비고 -->
          <CTableDataCell @dblclick="startEdit(row, 'rm')">
            <template v-if="isEditing(row, 'rm')">
              <CFormInput
                v-model="editDraft"
                size="sm"
                @keyup.enter="commitEdit(row, 'rm')"
                @keyup.esc="cancelEdit"
                @blur="commitEdit(row, 'rm')"
              />
            </template>
            <template v-else>{{ row.rm || '—' }}</template>
          </CTableDataCell>
          <!-- <CTableHeaderCell scope="row">{{ row.rm }}</CTableHeaderCell> -->
        </CTableRow>
        <CTableRow v-if="!rows || rows.length === 0">
          <CTableDataCell colspan="10" class="text-center text-muted py-5"
            >행이 없습니다.</CTableDataCell
          >
        </CTableRow>
      </CTableBody>
    </CTable>
  </CContainer>
</template>
<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1.25rem;
}

.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

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

:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

:deep(.form-control),
:deep(.form-select) {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
}

:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}

:deep(.g-2) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.5rem;
}

.table-wrapper {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: calc(100vh - 300px);
  background: #ffffff;
}

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
}

.table-wrapper::-webkit-scrollbar-button:single-button:hover {
  background-color: #f3f4f6;
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
  font-size: 13px;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
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
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  height: 46px;
}

:deep(.data-table tbody tr) {
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr:hover:not(.empty-row)) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.cell-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 13px;
  padding: 4px 6px;
  outline: none;
  font-family: inherit;
  color: #334155;
}

.cell-input:focus {
  background: #fef3c7;
  border: 1.5px solid #fbbf24;
  border-radius: 6px;
}

select.cell-input {
  cursor: pointer;
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

@media (max-width: 1600px) {
  :deep(.form-label) {
    font-size: 12px !important;
  }
  
  :deep(.form-control),
  :deep(.form-select) {
    font-size: 12px !important;
    height: 38px !important;
    padding: 0.55rem 0.75rem !important;
  }
  
  :deep(.btn) {
    font-size: 12px !important;
    padding: 0.5rem 1.1rem !important;
  }
  
  :deep(th),
  :deep(td) {
    font-size: 12px !important;
  }
  
  :deep(.data-table td) {
    height: 42px !important;
  }
  
  .empty-row td {
    height: 42px !important;
  }
  
  .cell-input {
    font-size: 12px !important;
  }
}


</style>