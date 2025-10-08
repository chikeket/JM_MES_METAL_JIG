<template>
  <CContainer fluid>
    <!-- 상단 버튼 -->
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary">신규</CButton>
      <CButton color="secondary" @click="openOrderModal()">자재발주서 조회</CButton>
      <rscOrdrModal :visible="isrscOrdrModalVisible" @close="closerscOrdrModal" @select="selectOrdr" />
      <CButton color="secondary" @click="saveInspection()">저장</CButton>
      <CButton color="secondary">수정</CButton>
      <CButton color="danger">삭제</CButton>
    </div>

    <!-- 기본 정보 입력 -->
    <CRow class="g-3 mb-3">
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 95px;">검사자</CInputGroupText>
          <CFormInput v-model="form.emp_id" placeholder="검사자 이름" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 95px;">출고처</CInputGroupText>
          <CFormInput v-model="form.co_id" />
        </CInputGroup>
      </CCol>
      
    </CRow>

    <CRow class="g-3 mb-3">
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 95px;">자재명</CInputGroupText>
          <CFormInput v-model="form.rcs_nm" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText>발주 수량</CInputGroupText>
          <CFormInput v-model.number="form.qy" type="number" min="0" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText>기입고 수량</CInputGroupText>
          <CFormInput v-model.number="form.receivedQty" type="number" min="0" />
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
          <CFormInput v-model.number="form.pass_qy" type="number" min="0" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup> 
          <CInputGroupText style="min-width: 110px;"> 불량 수량 </CInputGroupText>
          <CFormInput :value="defectQty" readonly type="number" class="bg-light" />
        </CInputGroup>
      </CCol>
      
      
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText style="min-width: 110px;">검사 일자</CInputGroupText>
          <CFormInput type="date" v-model="form.insp_dt" />
        </CInputGroup>
      </CCol>
    </CRow>

    <CFormTextarea v-model="form.note" label="비고" rows="3" text="필요 시 기재"></CFormTextarea>

    <!-- 검사 항목 테이블 -->
    <CTable hover bordered small class="align-middle mt-4">
      <CTableHead color="light">
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
          <CTableDataCell colspan="3" class="text-center text-muted py-4">검사항목이 없습니다.</CTableDataCell>
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
import rscOrdrModal from '../modal/rscOrdrModal.vue'

//자재발주서검색모달
const isrscOrdrModalVisible = ref(false)
const openOrderModal = () => {  isrscOrdrModalVisible.value = true}
const closerscOrdrModal = () => {  isrscOrdrModalVisible.value = false}

const form = ref({
  emp_id: '',
  co_id: '',
  rcs_nm: '',
  defectQty: '',
  pass_qy: '',
  qy: '',
  receivedQty: '',
  pendingQty: '',
  insp_qy: '',
  insp_dt: '',
  note: '',
})

const pendingQty = computed(() => {
  const order = Number(form.value.qy) || 0
  const received = Number(form.value.receivedQty) || 0
  return order - received
})

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
      alert('기입고 수량은 0 이상의 숫자만 입력 가능합니다.')
      form.value.pass_qy = 0
      return
    }
    
    if (received > order) {
      alert('합격 수량이 검수량보다 많을 수 없습니다.')
      form.value.pass_qy = 0
    }
  }
)







const inspectItems = ref([
  { name: '외관검사', standard: '1mm', tolerance: '2%' },
  
])
</script>

<style scoped>
label {
  font-weight: 600;
  line-height: 34px;
}
</style>
