<script setup>
import { ref, reactive } from 'vue'

import axios from 'axios'
import PrdtModal from '../modal/prdtModal.vue'
import ProdPlanModal from '../modal/prodPlanModal.vue'
const isPrdtModalVisible = ref(false)

const goToPrdtModal = () => {
  isPrdtModalVisible.value = true
}

const closePrdtModal = () => {
  isPrdtModalVisible.value = false
}

const isProdPlanModalVisible = ref(false)

const goToProdPlan = () => {
  isProdPlanModalVisible.value = true
}

const closeProdPlanModal = () => {
  isProdPlanModalVisible.value = false
}
let empId = 'emp01'

const Info = ref({
  ordrName1: '',
  regDate: '',
  startDate: '',
  endDate: '',
  remark: '',
})

const insertRowsToDB = async () => {
  // console.log(Info.value)

  let nullchk
  if (Info.value.regDate == '') {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    nullchk = formattedDate
  } else {
    nullchk = Info.value.regDate
  }
  const master = {    
    prod_drct_nm: Info.value.ordrName1,
    emp_id: empId,
    prod_drct_fr_dt: Info.value.startDate,
    prod_drct_to_dt: Info.value.endDate,
    reg_dt: nullchk,
    rm: Info.value.remark,
  }

  const detail = rows.value.map((row) => ({      
    prod_plan_deta_id: row.prod_plan_deta_id,
    prdt_id: row.prdt_id,
    prdt_opt_id: row.prdt_opt_id,
    drct_qy: row.drct_qy,
    priort: row.priort,
    rm: row.rm,
  }))

  const payload = {
    masterInfo: master,
    detailList: detail,
  }

  let result = await axios.post('/api/instruction', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산지시가 등록되었습니다.')
  } else {
    console.log('생산지시에 실패했습니다.')
  }
}

const rows = ref([
  // {
  //   id: 1,
  //   prdtId: 'a091',
  //   prdtNm: 'a091',
  //   spec: 'a091',
  //   unit: 'a091',
  //   planQy: 600,
  //   drctQy: 0,
  //   baseQuantity: 100,
  //   unspecifiedQuantity: 0,
  //   priort: 0,
  //   rm: '',
  // },
  // {
  //   id: 2,
  //   prdtId: 'a091',
  //   prdtNm: 'a091',
  //   spec: 'a091',
  //   unit: 'a091',
  //   planQy: 0,
  //   drctQy: 0,
  //   baseQuantity: 0,
  //   unspecifiedQuantity: 0,
  //   priort: 0,
  //   rm: '',
  // },
])

const selectedPrdt = (prdts) => {
  console.log(prdts)
  const new_id = rows.value.length > 0 ? Math.max(...rows.value.map((r) => r.id ?? 0)) + 1 : 1
  if (Array.isArray(prdts)){
    for(prdt of prdts)
rows.value.push({
    id: new_id,
    prod_plan_deta_id: prdt.prod_plan_deta_id,
    prdt_id: prdt.prdt_id,
    prdt_nm: prdt.prdt_nm,
    prdt_opt_id: prdt.prdt_opt_id,
    spec: prdt.spec,
    unit: prdt.unit,
    plan_qy: prdt.plan_qy,
    drct_qy: 0,
    base_quantity: 0,
    unspecified_quantity: 0,
    priort: prdt.priort,
    rm: prdt.rm,
  })
  } else {
rows.value.push({
    id: new_id,
    prod_plan_deta_id: 'none',
    prdt_id: prdts.prdt_id,
    prdt_nm: prdts.prdt_nm,
    prdt_opt_id: prdts.prdt_opt_id,
    spec: prdts.spec,
    unit: prdts.unit,
    plan_qy: 0,
    drct_qy: 0,
    base_quantity: 0,
    unspecified_quantity: 0,
    priort: 0,
    rm: prdts.rm,
  })
  }
  
  console.log(rows.value)
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
    const validQty = Number.isFinite(n) ? n : 0;

    row.drct_qy = validQty;

    row.base_quantity = row.base_quantity+row.drct_qy;  

    //미지시수량 출력 조건
    if (row.plan_qy === 0) {
      row.unspecified_quantity = 0
    } else {
      row.unspecified_quantity = row.plan_qy - row.base_quantity
    }
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

const fmtQty = (n) => (n ?? 0).toLocaleString()
</script>

<template>
  <CContainer fluid>
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary">신규</CButton>
      <CButton color="secondary">생산지시서 조회</CButton>
      <CButton color="secondary" @click="insertRowsToDB">저장</CButton>
      <CButton color="secondary">수정</CButton>
      <CButton color="danger">삭제</CButton>
    </div>

    <CContainer fluid>
      <CRow class="g-3 mb-3">
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-1">생산지시서 명</CInputGroupText>
            <CFormInput v-model="Info.ordrName1" placeholder="자재 발주서 명" />
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
      <ProdPlanModal :visible="isProdPlanModalVisible" @close="closeProdPlanModal" @select="selectedPrdt" />

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
          <CTableHeaderCell scope="col" class="text-center" style="width: 90px"
            >지시수량</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center" style="width: 140px"
            >기지시수량</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center">미지시수량</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">우선순위</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
        </CTableRow>
      </CTableHead>

      <CTableBody>
        <CTableRow v-for="(row, idx) in rows" :key="row.id ?? idx">
          <!-- 코드 명 -->
          <CTableHeaderCell scope="row">{{ row.prdt_id }}</CTableHeaderCell>

          <!-- 제품 명 -->
          <CTableHeaderCell scope="row">{{ row.prdt_nm }}</CTableHeaderCell>

          <!-- 규격 -->
          <CTableHeaderCell scope="row">{{ row.spec }}</CTableHeaderCell>

          <!-- 단위 -->
          <CTableHeaderCell scope="row">{{ row.unit }}</CTableHeaderCell>

          <!-- 계획수량 -->
          <CTableHeaderCell scope="row">{{ row.plan_qy }}</CTableHeaderCell>

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

          <!-- 기지시수량 -->
          <CTableHeaderCell scope="row">{{ row.base_quantity }}</CTableHeaderCell>

          <!-- 미지시수량 -->
          <CTableHeaderCell scope="row">{{ row.unspecified_quantity }}</CTableHeaderCell>

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
          <CTableHeaderCell scope="row">{{ row.rm }}</CTableHeaderCell>
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
