<template>
  <CContainer fluid>
    <!-- 상단 버튼 -->
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="newFunc()">신규</CButton>
      <CButton color="secondary" @click="openRscQltyInspModal()">자재품질 조회</CButton>
      <rscQltyInspModal
        :visible="isRscQltyInspModalVisible"
        @close="closerRscQltyInspModal"
        @select="selectOrdr"
      />
      <rscOrdrModal
        :visible="isrscOrdrModalVisible"
        @close="closerscOrdrModal"
        @select="selectOrdr"
      />
      <CButton color="secondary" @click="saveInspection()">저장</CButton>
      <CButton color="secondary" @click="update()">수정</CButton>
      <CButton color="danger" @click="deleteFunc()">삭제</CButton>
    </div>

    <!-- 기본 정보 입력 -->
    <CRow class="g-3 mb-3">
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 95px">검사자</CInputGroupText>
          <CFormInput v-model="form.emp_nm" placeholder="검사자 이름" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 95px">출고처</CInputGroupText>
          <CFormInput v-model="form.co_nm" readonly class="bg-light" />
        </CInputGroup>
      </CCol>
    </CRow>

    <CRow class="g-3 mb-3">
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 95px">자재명</CInputGroupText>
          <CFormInput v-model="form.rcs_nm" readonly class="bg-light" placeholder="자재발주서조회"
 @click="openOrderModal"/>
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText>발주 수량</CInputGroupText>
          <CFormInput v-model.number="form.qy" readonly type="number" min="0" class="bg-light" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText>기입고 수량</CInputGroupText>
          <CFormInput v-model.number="form.receivedQty" readonly type="number" min="0" class="bg-light"/>
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText>미입고 수량</CInputGroupText>
          <CFormInput :value="pendingQty" readonly type="number" class="bg-light" />
        </CInputGroup>
      </CCol>
    </CRow>

    <CRow class="g-3 mb-3">
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText>검수 수량</CInputGroupText>
          <CFormInput v-model.number="form.insp_qy" type="number" min="0" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText>합격 수량</CInputGroupText>
          <CFormInput :value="pass_qy" readonly type="number" min="0" class="bg-light" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 110px"> 불량 수량 </CInputGroupText>
          <CFormInput :value="defectQty" readonly type="number" class="bg-light" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 110px">검사 일자</CInputGroupText>
          <CFormInput type="date" v-model="form.insp_dt" />
        </CInputGroup>
      </CCol>
    </CRow>
    <CFormTextarea v-model="form.note" label="비고" rows="3" text="필요 시 기재"></CFormTextarea>
    <div class="d-flex justify-content-end gap-2 mb-3">
      
    </div>
    <!-- 검사 항목 테이블 -->
    <CTable hover bordered small class="align-middle mt-4">
      <CTableHead color="dark">
        <CTableRow>
          <CTableHeaderCell class="text-center">검사항목</CTableHeaderCell>
          <CTableHeaderCell class="text-center">기준치</CTableHeaderCell>
          <CTableHeaderCell class="text-center">오차범위</CTableHeaderCell>
          <CTableHeaderCell class="text-center">불량수량</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="(item, idx) in inspectItems" :key="idx">
          <CTableDataCell>{{ item.insp_item_nm }}</CTableDataCell>
          <CTableDataCell>{{ item.basi_val }}</CTableDataCell>
          <CTableDataCell>{{ item.eror_scope_min + '~' + item.eror_scope_max }}</CTableDataCell>
          <CTableDataCell class="text-start" style="width: 120px">
            <CFormInput v-model="item.infer_qy" size="sm" placeholder="불량수량기입" />
          </CTableDataCell>
        </CTableRow>
        <CTableRow v-if="inspectItems.length === 0">
          <CTableDataCell colspan="4" class="text-center text-muted py-4"
            >검사항목이 없습니다.</CTableDataCell
          >
        </CTableRow>
      </CTableBody>
    </CTable>
  </CContainer>
</template>

<script setup>
import {
  CRow,
  CCol,
  CFormInput,
  CFormTextarea,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/vue'
import { ref, computed, watch } from 'vue'
import rscOrdrModal from '../modal/waitingRscQltyInspModal.vue'
import rscQltyInspModal from '../modal/rscQltyInspModal.vue'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'
const auth = useAuthStore()
//자재발주서검색모달
const isrscOrdrModalVisible = ref(false)
const openOrderModal = () => {
  isrscOrdrModalVisible.value = true
}
const closerscOrdrModal = () => {
  isrscOrdrModalVisible.value = false
}

//자재품질이력검색모달
const isRscQltyInspModalVisible = ref(false)
const openRscQltyInspModal = () => {
  isRscQltyInspModalVisible.value = true
}
const closerRscQltyInspModal = () => {
  isRscQltyInspModalVisible.value = false
}

const form = ref({
  emp_id: auth.user?.emp_id || 'EMP001',
  emp_nm: auth.user?.emp_nm || '홍길동',
  co_nm: '',
  rcs_nm: '',
  qy: '',
  receivedQty: '',
  receivedQty_base: '',
  insp_qy: '',
  insp_qy_base: '',
  insp_dt: userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd'),
  note: '',
  rsc_ordr_deta_id: '',
  rsc_qlty_insp_id: '',
})
const inspectItems = ref([
  // { name: '외관검사', standard: '1mm', tolerance: '2%' },
])
//합격수량
const pass_qy = computed(() => {
  const order = Number(form.value.insp_qy) || 0
  const received = Number(defectQty.value) || 0
  return order - received
})
//미입고수량
const pendingQty = computed(() => {
  const order = Number(form.value.qy) || 0
  const received = Number(form.value.receivedQty) || 0
  return order - received
})
//불량수량
const defectQty = ref(0)

//각각 검사항목별 불합격 수량 입력후 합격수량이 정해지는 코드
watch(
  inspectItems,
  (newItems) => {
    let total = 0
    for (const item of newItems) {
      const value = Number(item.infer_qy)
      if (!isNaN(value)) {
        total += value
      }
    }
    defectQty.value = total
  },
  { deep: true },
)

//검수수량검증
watch(
  () => form.value.insp_qy,
  (newVal) => {
    const order = Number(form.value.qy) || 0
    const received = Number(newVal)
    
    if (isNaN(received) || received < 0) {
      alert('검수 수량은 0 이상의 숫자만 입력 가능합니다.')
      form.value.pass_qy = 0
      return
    }
    if (received > order) {
      alert('검수 수량이 발주 수량보다 많을 수 없습니다.')
      form.value.pass_qy = 0
    }
    form.value.receivedQty = Number(form.value.receivedQty_base) + Number(form.value.insp_qy) - Number(form.value.insp_qy_base)
  },
)

const selectOrdr = (prdts) => {
  inspectItems.value = []
  form.value.co_nm = prdts.searchParams.co_nm
  form.value.qy = Math.floor(prdts.searchParams.qy)
  form.value.insp_qy = Math.floor(prdts.searchParams.insp_qy) || 0
  form.value.insp_qy_base = Math.floor(prdts.searchParams.insp_qy) || 0
  form.value.receivedQty =
    Math.floor(prdts.searchParams.qy) - Math.floor(prdts.searchParams.rtngud_qy) || 0
  form.value.receivedQty_base =
  Math.floor(prdts.searchParams.qy) - Math.floor(prdts.searchParams.rtngud_qy) || 0
  form.value.rcs_nm = prdts.searchParams.rsc_nm
  form.value.rsc_ordr_deta_id = prdts.searchParams.rsc_ordr_deta_id
  form.value.rsc_qlty_insp_id = prdts.searchParams.rsc_qlty_insp_id
  for (const prdt of prdts.detailData)
    inspectItems.value.push({
      insp_item_nm: prdt.insp_item_nm,
      basi_val: prdt.basi_val,
      eror_scope_min: prdt.eror_scope_min,
      eror_scope_max: prdt.eror_scope_max,
      infer_qy: prdt.infer_qy || 0,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
      rsc_qlty_insp_id: prdt.rsc_qlty_insp_id,
    })
  console.log(prdts)
}

const saveInspection = async () => {
  let inferData = []
  for (const prdt of inspectItems.value)
    inferData.push({
      infer_qy: prdt.infer_qy,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
    })

  const payload = {
    master: {
      rm: form.value.note,
      rsc_ordr_deta_id: form.value.rsc_ordr_deta_id,
      emp_id: form.value.emp_id,
      rtngud_qy: pendingQty.value,
      pass_qy: pass_qy.value,
      insp_qy: form.value.insp_qy,
      insp_dt: form.value.insp_dt,
    },
    infer: inferData,
  }
  console.log(payload)
  let result = await axios.post('/api/rscQltyInspInsert', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('자재품질검수가 등록되었습니다.')
  } else {
    console.log('자재품질검수에 실패했습니다.')
  }
}

const update = async () => {
  let inferData = []
  for (const prdt of inspectItems.value)
    inferData.push({
      infer_qy: prdt.infer_qy,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
      rsc_qlty_insp_id: prdt.rsc_qlty_insp_id,
    })
  const payload = {
    master: {
      rm: form.value.note,
      rsc_ordr_deta_id: form.value.rsc_ordr_deta_id,
      emp_id: form.value.emp_id,
      rtngud_qy: pendingQty.value,
      pass_qy: pass_qy.value,
      insp_qy: form.value.insp_qy,
      insp_dt: form.value.insp_dt,
      rsc_qlty_insp_id: form.value.rsc_qlty_insp_id,
    },
    infer: inferData,
  }
  let result = await axios.post('/api/rscQltyInspUpdate', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('자재품질검수 수정이 등록되었습니다.')
  } else {
    console.log('자재품질검수 수정에 실패했습니다.')
  }
}

const deleteFunc = async () => {
  const payload = {
    rsc_qlty_insp_id: form.value.rsc_qlty_insp_id,
  }
  let result = await axios.post('/api/rscQltyInspDelete', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('자재품질검수 삭제가 성공되었습니다.')
  } else {
    console.log('자재품질검수 삭제가 실패했습니다.')
  }
}

const newFunc = async () => {
  // console.log(form)
  // form.value.emp_id = ''
  // form.value.emp_nm = ''
  form.value.insp_dt = userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd')
  form.value.insp_qy = 0
  form.value.note = ''
  form.value.pass_qy = 0
  form.value.qy = 0
  form.value.rcs_nm = ''
  form.value.receivedQty = ''
  form.value.rsc_ordr_deta_id = ''
  form.value.rsc_qlty_insp_id = ''
  inspectItems.value = []
}
</script>

<style scoped>
label {
  font-weight: 600;
  line-height: 34px;
}
</style>
