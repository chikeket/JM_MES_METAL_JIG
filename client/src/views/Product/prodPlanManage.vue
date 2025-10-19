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

    <CContainer fluid>
      <CRow class="g-3 mb-3">
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-1">생산계획서 명</CInputGroupText>
            <CFormInput v-model="Info.ordrName1" placeholder="생산지시서 명" />
          </CInputGroup>
        </CCol>

        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-2">등록 일자</CInputGroupText>
            <CFormInput type="date" v-model="Info.regDate" />
          </CInputGroup>
        </CCol>
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-2">시작 일자</CInputGroupText>
            <CFormInput type="date" v-model="Info.startDate" />
          </CInputGroup>
        </CCol>
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-2">종료 일자</CInputGroupText>
            <CFormInput type="date" v-model="Info.endDate" />
          </CInputGroup>
        </CCol>
      </CRow>
    </CContainer>
    <CFormTextarea v-model="Info.remark" label="비고" rows="3" text="필요 시 기재"></CFormTextarea>

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
