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
    console.log('생산지시가 등록되었습니다.')
  } else {
    console.log('생산지시에 실패했습니다.')
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
    console.log('생산지시수정이 등록되었습니다.')
  } else {
    console.log('생산지시수정이 실패했습니다.')
  }
}

const deleteRowsToDB = async () => {
  const payload = { prod_drct_id: Info.value.prod_drct_id }
  let result = await axios.post('/api/deleteInstruction', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산지시삭제가 성공되었습니다.')
  } else {
    console.log('생산지시삭제가 실패했습니다.')
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
  Info.value.remark = !prdts.searchParams.remark ? Info.value.remark : prdts.searchParams.remark
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
      <CButton color="secondary" @click="insertRowsToDB">저장</CButton>
      <CButton color="secondary" @click="updateRowsToDB">수정</CButton>
      <CButton color="danger" @click="deleteRowsToDB()">삭제</CButton>
    </div>

    <CContainer fluid>
      <CRow class="g-3 mb-3">
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-1">생산지시서 명</CInputGroupText>
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
          <CTableDataCell scope="row">{{ row.plan_qy }}</CTableDataCell>

          <!-- 기지시수량 -->
          <CTableDataCell scope="row">{{ row.base_quantity }}</CTableDataCell>

          <!-- 미지시수량 -->
          <CTableDataCell scope="row">{{ row.unspecified_quantity }}</CTableDataCell>

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
