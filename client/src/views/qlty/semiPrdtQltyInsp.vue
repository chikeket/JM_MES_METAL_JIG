<template>
  <CContainer fluid>
    <!-- 상단 버튼 -->
    <div class="d-flex justify-content-end gap-2 mb-3">
      반제품 품질검사 관리
      <CButton color="secondary" @click="newFunc()">신규</CButton>
      <CButton color="secondary" @click="openWaitingFinishedPrdtModal()">생산실적조회</CButton>
      <waitingFinishedPrdtModal
        :visible="isWaitingFinishedPrdtModalVisible"
        @close="closeWaitingFinishedPrdtModal"
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
          <CInputGroupText style="min-width: 95px">반제품명</CInputGroupText>
          <CFormInput v-model="form.prdt_nm" readonly class="bg-light" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText>실적 수량</CInputGroupText>
          <CFormInput v-model.number="form.qy" readonly type="number" min="0" class="bg-light" />
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
          <CFormInput v-model.number="form.pass_qy" type="number" min="0" />
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
      <CButton color="secondary" @click="openEndPrdtQltyInspModal()">반제품 품질조회</CButton>
      <endPrdtQltyInspModal
        :visible="isEndPrdtQltyInspModalVisible"
        @close="closeEndPrdtQltyInspModal"
        @select="selectOrdr"
      />
    </div>
    <!-- 검사 항목 테이블 -->
    <CTable hover bordered small class="align-middle mt-4">
      <CTableHead color="dark">
        <CTableRow>
          <CTableHeaderCell class="text-center">검사항목</CTableHeaderCell>
          <CTableHeaderCell class="text-center">기준치</CTableHeaderCell>
          <CTableHeaderCell class="text-center">오차범위</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="(item, idx) in inspectItems" :key="idx">
          <CTableDataCell>{{ item.name }}</CTableDataCell>
          <CTableDataCell>{{ item.standard }}</CTableDataCell>
          <CTableDataCell>{{ item.tolerance }}</CTableDataCell>
        </CTableRow>
        <CTableRow v-if="inspectItems.length === 0">
          <CTableDataCell colspan="3" class="text-center text-muted py-4"
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
import waitingFinishedPrdtModal from '../modal/waitingSemiPrdtModal.vue'
import endPrdtQltyInspModal from '../modal/semiPrdtQltyInspModal.vue'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'
const auth = useAuthStore()
//반제품 생산실적조회 검색모달
const isWaitingFinishedPrdtModalVisible = ref(false)
const openWaitingFinishedPrdtModal = () => {
  isWaitingFinishedPrdtModalVisible.value = true
}
const closeWaitingFinishedPrdtModal = () => {
  isWaitingFinishedPrdtModalVisible.value = false
}

//반제품 품질검사조회 검색모달
const isEndPrdtQltyInspModalVisible = ref(false)
const openEndPrdtQltyInspModal = () => {
  isEndPrdtQltyInspModalVisible.value = true
}
const closeEndPrdtQltyInspModal = () => {
  isEndPrdtQltyInspModalVisible.value = false
}

const form = ref({
  emp_id: auth.user?.emp_id || 'EMP001',
  emp_nm: auth.user?.emp_nm || '홍길동',
  prdt_nm: '',
  pass_qy: '',
  qy: '',
  insp_qy: '',
  insp_dt: userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd'),
  note: '',
  prcs_ctrl_id: '',
  end_prdt_qlty_insp_id: '',
})
const inspectItems = ref([
  // { name: '외관검사', standard: '1mm', tolerance: '2%' },
])

const defectQty = computed(() => {
  const order = Number(form.value.insp_qy) || 0
  const received = Number(form.value.pass_qy) || 0
  return order - received
})
//기입고수량검증
watch(
  () => form.value.receivedQty,
  (newVal) => {
    const order = Number(form.value.qy) || 0
    const received = Number(newVal)
    if (isNaN(received) || received < 0) {
      alert('기입고 수량은 0 이상의 숫자만 입력 가능합니다.')
      form.value.receivedQty = 0
      return
    }
    if (received > order) {
      alert('기입고 수량이 발주 수량보다 많을 수 없습니다.')
      form.value.receivedQty = 0
    }
  },
)
//합격수량검증
watch(
  () => form.value.pass_qy,
  (newVal) => {
    const order = Number(form.value.insp_qy) || 0
    const received = Number(newVal)
    if (isNaN(received) || received < 0) {
      alert('합격 수량은 0 이상의 숫자만 입력 가능합니다.')
      form.value.pass_qy = 0
      return
    }
    if (received > order) {
      alert('합격 수량이 검수량보다 많을 수 없습니다.')
      form.value.pass_qy = 0
    }
  },
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
  },
)

const selectOrdr = (prdts) => {
  console.log(prdts)
  inspectItems.value = []
  form.value.prdt_nm = prdts.searchParams.prdt_nm
  form.value.qy =
    Math.floor(prdts.searchParams.bePass_qy) - Math.floor(prdts.searchParams.beInsp_qy) ||
    prdts.searchParams.qy
  form.value.insp_qy = Math.floor(prdts.searchParams.insp_qy) || 0
  form.value.pass_qy = Math.floor(prdts.searchParams.pass_qy) || 0
  form.value.note = prdts.searchParams.rm || ''
  form.value.prcs_ctrl_id = prdts.searchParams.prcs_ctrl_id
  form.value.end_prdt_qlty_insp_id = prdts.searchParams.end_prdt_qlty_insp_id
  defectQty.value = prdts.searchParams.infer_qy || 0
  for (const prdt of prdts.detailData)
    inspectItems.value.push({
      name: prdt.insp_item_nm,
      standard: prdt.basi_val,
      tolerance: prdt.eror_scope_min + '~' + prdt.eror_scope_max,
    })
}

const saveInspection = async () => {
  const payload = {
    rm: form.value.note,
    prcs_ctrl_id: form.value.prcs_ctrl_id,
    emp_id: form.value.emp_id,
    infer_qy: defectQty.value,
    pass_qy: form.value.pass_qy,
    insp_qy: form.value.insp_qy,
    insp_dt: form.value.insp_dt,
  }
  console.log(payload)
  let result = await axios
    .post('/api/endPrdtQltyInspInsert', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('반제품 검수가 등록되었습니다.')
  } else {
    console.log('반제품 검수에 실패했습니다.')
  }
}

const update = async () => {
  const payload = {
    rm: form.value.note,
    prcs_ctrl_id: form.value.prcs_ctrl_id,
    emp_id: form.value.emp_id,
    infer_qy: defectQty.value,
    pass_qy: form.value.pass_qy,
    insp_qy: form.value.insp_qy,
    insp_dt: form.value.insp_dt,
    end_prdt_qlty_insp_id: form.value.end_prdt_qlty_insp_id,
  }
  let result = await axios
    .post('/api/endPrdtQltyInspUpdate', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('반제품 검수 수정이 등록되었습니다.')
  } else {
    console.log('반제품 검수 수정에 실패했습니다.')
  }
}

const deleteFunc = async () => {
  const payload = {
    end_prdt_qlty_insp_id: form.value.end_prdt_qlty_insp_id,
  }
  let result = await axios
    .post('/api/endPrdtQltyInspDelete', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('반제품 검수 삭제가 성공되었습니다.')
  } else {
    console.log('반제품 검수 삭제가 실패했습니다.')
  }
}

const newFunc = async () => {
  // console.log(form)
  form.value.emp_id = ''
  form.value.emp_nm = ''
  form.value.prdt_nm = ''
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
