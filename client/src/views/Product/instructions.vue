<script setup>
import { ref, reactive, watch } from 'vue'

import axios from 'axios'
import PrdtModal from '../modal/prdtModal.vue'
import ProdPlanModal from '../modal/prodPlanModal.vue'
import ProdDrctModal from '../modal/prodDrctModal.vue'
import { useAuthStore } from '@/stores/auth.js'
const auth = useAuthStore()
// console.log('auth정보')
// console.log(auth.user)
//제품검색모달
const isPrdtModalVisible = ref(false)
const goToPrdtModal = () => {
  isPrdtModalVisible.value = true
}
const closePrdtModal = () => {
  isPrdtModalVisible.value = false
}
//생산계획모달
const isProdPlanModalVisible = ref(false)
const goToProdPlan = () => {
  isProdPlanModalVisible.value = true
}
const closeProdPlanModal = () => {
  isProdPlanModalVisible.value = false
}
//생산지시모달
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
  prod_drct_id: '',
  regDate: new Date().toISOString().slice(0, 10),
  startDate: new Date().toISOString().slice(0, 10),
  endDate: null,
  remark: '',
})

let crudBoolean = true
const insertRowsToDB = async () => {
  // console.log(Info.value)

  const master = {
    rm: Info.value.remark,
    prod_drct_nm: Info.value.ordrName1,
    emp_id: empId,
    prod_drct_fr_dt: Info.value.startDate,
    prod_drct_to_dt: Info.value.endDate,
    reg_dt: Info.value.regDate,
  }

  const detail = rows.value.map((row) => ({
    rm: row.rm,
    prod_drct_deta_id: row.prod_drct_deta_id,
    prod_plan_deta_id: row.prod_plan_deta_id,
    prdt_id: row.prdt_id,
    prdt_opt_id: row.prdt_opt_id,
    drct_qy: row.drct_qy,
    priort: row.priort,
  }))

  const payload = {
    masterInfo: master,
    detailList: detail,
  }
  console.log(payload)
  let result = await axios.post('/api/instruction', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    alert('생산지시가 등록되었습니다.')
  } else {
    alert('생산지시에 실패했습니다.')
  }
}

const updateRowsToDB = async () => {
  // console.log(Info.value)
  const master = {
    rm: Info.value.remark,
    prod_drct_nm: Info.value.ordrName1,
    emp_id: empId,
    prod_drct_fr_dt: Info.value.startDate,
    prod_drct_to_dt: Info.value.endDate,
    reg_dt: Info.value.regDate,
  }

  const detail = rows.value.map((row) => ({
    rm: row.rm,
    prod_drct_deta_id: row.prod_drct_deta_id,
    prod_plan_deta_id: row.prod_plan_deta_id,
    prdt_id: row.prdt_id,
    prdt_opt_id: row.prdt_opt_id,
    drct_qy: row.drct_qy,
    priort: row.priort,
  }))

  //수정을 위한 prod_drct_id 정보
  const editProdDrctId = { prod_drct_id: Info.value.prod_drct_id }
  const payload = {
    masterInfo: master,
    detailList: detail,
    editProdDrctId: editProdDrctId,
  }
  console.log(payload)
  let result = await axios.post('/api/updateInstruction', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    alert('생산지시수정이 등록되었습니다.')
  } else {
    alert('생산지시수정이 실패했습니다.')
  }
}

const deleteRowsToDB = async () => {
  const payload = { prod_drct_id: Info.value.prod_drct_id }
  let result = await axios.post('/api/deleteInstruction', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    alert('생산지시삭제가 성공되었습니다.')
  } else {
    alert('생산지시삭제가 실패했습니다.')
  }
}

const rows = ref([
  // {
  //   id: 1,
  //   prdt_id: 'a091',
  //   prdt_nm: 'a091',
  //   spec: 'a091',
  //   unit: 'a091',
  //   plan_qy: 600,
  //   drct_qy: 0,
  //   base_quantity: 90,
  //   unspecified_quantity: 500,
  //   priort: 0,
  //   rm: '',
  // },
])

const selectedPrdt = (prdts) => {
  console.log(prdts)
  if (prdts.crudBoolean == true) {
    crudBoolean = true
  } else {
    crudBoolean = false
  }
  Info.value.prod_drct_id = !prdts.searchParams.prod_drct_id
    ? Info.value.prod_drct_id
    : prdts.searchParams.prod_drct_id
  Info.value.ordrName1 = !prdts.searchParams.prod_drct_nm
    ? Info.value.ordrName1
    : prdts.searchParams.prod_drct_nm
  Info.value.startDate = !prdts.searchParams.prod_expc_fr_dt
    ? Info.value.startDate
    : prdts.searchParams.prod_expc_fr_dt
  Info.value.endDate = !prdts.searchParams.prod_expc_to_dt
    ? Info.value.endDate
    : prdts.searchParams.prod_expc_to_dt
  Info.value.regDate = !prdts.searchParams.reg_dt ? Info.value.regDate : prdts.searchParams.reg_dt
  Info.value.remark = !prdts.searchParams.rm ? Info.value.remark : prdts.searchParams.rm
  empId = !prdts.searchParams.emp_id ? empId : prdts.searchParams.emp_id
  let new_id = rows.value.length > 0 ? Math.max(...rows.value.map((r) => r.id ?? 0)) + 1 : 1
  if (Array.isArray(prdts.detailData)) {
    rows.value = []
    for (const prdt of prdts.detailData)
      rows.value.push({
        id: new_id++,
        prod_drct_deta_id: prdt.prod_drct_deta_id,
        prod_plan_deta_id: prdt.prod_plan_deta_id,
        prdt_id: prdt.prdt_id,
        prdt_nm: prdt.prdt_nm,
        prdt_opt_id: prdt.prdt_opt_id,
        spec: prdt.spec,
        unit: prdt.unit,
        plan_qy: prdt.plan_qy || 0,
        drct_qy: prdt.drct_qy ?? 0,
        base_quantity: prdt.base_quantity ?? 0,
        unspecified_quantity: !prdt.drct_qy ? prdt.plan_qy : prdt.plan_qy - prdt.base_quantity,
        priort: prdt.priort,
        rm: prdt.rm,
      })
  } else {
    console.log('제품조회할때')
    console.log(prdts)
    rows.value.push({
      id: new_id,
      prod_plan_deta_id: 'none',
      prdt_id: prdts.detailData.prdt_id,
      prdt_nm: prdts.detailData.prdt_nm,
      prdt_opt_id: prdts.detailData.prdt_opt_id,
      spec: prdts.detailData.spec,
      unit: prdts.detailData.unit,
      plan_qy: 0,
      drct_qy: 0,
      base_quantity: 0,
      unspecified_quantity: 0,
      priort: 0,
      rm: '',
    })
  }

  console.log(rows.value)
}

const masterReset = () => {
  Info.value.ordrName1 = ''
  Info.value.startDate = new Date().toISOString().slice(0, 10)
  Info.value.endDate = null
  Info.value.regDate = new Date().toISOString().slice(0, 10)
  Info.value.remark = ''
  rows.value = []
}
const reset = () => {
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
    const n = Number(v)
    const validQty = Number.isFinite(n) ? n : 0
    //  조건 검사: 계획수량이 총합보다 작으면 경고
    const total = validQty
    if (!row.plan_qy) {
    } else {
      if (row.plan_qy < total) {
        alert('계획수량을 초과할 수 없습1니다.')
        cancelEdit()
        return
      }
    }
    row.drct_qy = validQty
  } else if (field === 'producible') {
    row.producible = v === 'true' || v === true
  } else if (field === 'unit') {
    row.unit = String(v || 'EA')
  } else {
    row[field] = (v ?? '').toString()
  }
  cancelEdit()
}

//미지시수량 검증
watch(
  rows,
  (newRows) => {
    for (const row of newRows) {
      const order = Number(row.base_quantity) || 0
      const received = Number(row.plan_qy) || 0
      const unspecified = received - order
      row.unspecified_quantity = unspecified < 0 ? 0 : unspecified
    }
  },
  { deep: true },
)

function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}

const fmtQty = (n) => (n ?? 0).toLocaleString()
</script>

<template>
  <CContainer fluid>
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="masterReset()">신규</CButton>
      <CButton color="secondary" @click="goToDrctPlan()">생산지시서 조회</CButton>
      <ProdDrctModal
        :visible="isProdDrctModalVisible"
        @close="closeProdDrctModal"
        @select="selectedPrdt"
      />
      <CButton v-if="crudBoolean" color="secondary" @click="insertRowsToDB">저장</CButton>
      <CButton v-if="!crudBoolean" color="secondary" @click="updateRowsToDB">수정</CButton>
      <CButton v-if="!crudBoolean" color="danger" @click="deleteRowsToDB()">삭제</CButton>
    </div>
    <div class="search-filter-box mb-2">
      <CContainer fluid>
        <CRow class="g-3 mb-3">
          <CCol md="3">
            <c-form-label for="prod_plan_id">생산지시서 명</c-form-label>
            <c-form-input v-model="Info.ordrName1" id="ordrName1" placeholder="생산지시서 명" />
          </CCol>
          <CCol md="3">
            <c-form-label for="prod_plan_id">등록 일자</c-form-label>
            <c-form-input type="date" v-model="Info.regDate" id="regDate" />
          </CCol>
          <CCol md="3">
            <c-form-label for="reg_dt">시작 일자</c-form-label>
            <c-form-input type="date" v-model="Info.startDate" id="startDate" />
          </CCol>
          <CCol md="3">
            <c-form-label for="reg_dt">종료 일자</c-form-label>
            <c-form-input type="date" v-model="Info.endDate" id="endDate" />
          </CCol>
        </CRow>
      </CContainer>
      <CFormTextarea
        v-model="Info.remark"
        label="비고"
        rows="3"
        text="필요 시 기재"
      ></CFormTextarea>
    </div>
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="goToPrdtModal()">제품 조회</CButton>
      <!-- 모달 컴포넌트 -->
      <PrdtModal :visible="isPrdtModalVisible" @close="closePrdtModal" @select="selectedPrdt" />

      <CButton color="secondary" @click="goToProdPlan()">생산계획서 조회</CButton>
      <ProdPlanModal
        :visible="isProdPlanModalVisible"
        @close="closeProdPlanModal"
        @select="selectedPrdt"
      />

      <CButton color="secondary" @click="reset()">초기화</CButton>
    </div>

    <CTable hover bordered small class="align-middle">
      <CTableHead color="dark">
        <CTableRow>
          <CTableHeaderCell scope="col" class="text-center" style="width: 56px"
            >코드</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center">제품명</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">규격</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center" style="width: 140px"
            >단위</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center" style="width: 120px"
            >계획수량</CTableHeaderCell
          >

          <CTableHeaderCell scope="col" class="text-center" style="width: 140px"
            >기지시수량</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center">미지시수량</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center" style="width: 90px"
            >지시수량</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center">우선순위</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody>
        <CTableRow v-for="(row, idx) in rows" :key="row.id ?? idx">
          <!-- 코드 명 -->
          <CTableDataCell scope="row">{{ row.prdt_id }}</CTableDataCell>

          <!-- 제품 명 -->
          <CTableDataCell scope="row">{{ row.prdt_nm }}</CTableDataCell>

          <!-- 규격 -->
          <CTableDataCell scope="row">{{ row.spec }}</CTableDataCell>

          <!-- 단위 -->
          <CTableDataCell scope="row">{{ row.unit }}</CTableDataCell>

          <!-- 계획수량 -->
          <CTableDataCell class="text-end" scope="row">{{ row.plan_qy }}</CTableDataCell>

          <!-- 기지시수량 -->
          <CTableDataCell class="text-end" scope="row">{{ row.base_quantity }}</CTableDataCell>

          <!-- 미지시수량 -->
          <CTableDataCell class="text-end" scope="row">{{
            row.unspecified_quantity
          }}</CTableDataCell>

          <!-- 지시수량 -->
          <CTableDataCell class="text-end" @dblclick="startEdit(row, 'drct_qy')">
            <template v-if="isEditing(row, 'drct_qy')">
              <CFormInput
                v-model.number="editDraft"
                type="number"
                min="0"
                size="sm"
                class="text-end"
                @keyup.enter="commitEdit(row, 'drct_qy')"
                @keyup.esc="cancelEdit"
                @blur="commitEdit(row, 'drct_qy')"
                placeholder="0"
              />
            </template>
            <template v-else>{{ fmtQty(row.drct_qy) }}</template>
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
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
