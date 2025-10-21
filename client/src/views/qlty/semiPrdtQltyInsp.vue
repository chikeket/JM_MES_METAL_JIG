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
<div class="search-filter-box mb-2">
    <!-- 기본 정보 입력 -->
    <CRow class="g-3 mb-3">
      <CCol md="3">
        <c-form-label>검사자</c-form-label>
            <c-form-input v-model="form.emp_nm" placeholder="검사자 이름"/>
      </CCol>
      <CCol md="3">
        <c-form-label>반제품명</c-form-label>
            <c-form-input v-model="form.prdt_nm" readonly class="bg-light"/>
      </CCol>
      <CCol md="3">
        <c-form-label>옵션명</c-form-label>
            <c-form-input v-model="form.opt_nm" readonly class="bg-light"/>
      </CCol>
      <CCol md="3">
        <c-form-label>실적 수량</c-form-label>
            <c-form-input v-model.number="form.qy" readonly type="number" min="0" class="bg-light"/>
      </CCol>
    </CRow>
    <CRow class="g-3 mb-3">
      <CCol md="3">
        <c-form-label>검수 수량</c-form-label>
            <c-form-input v-model.number="form.insp_qy" type="number" min="0"/>
      </CCol>
      <CCol md="3">
        <c-form-label>합격 수량</c-form-label>
            <c-form-input :value="pass_qy" readonly type="number" min="0" class="bg-light"/>
      </CCol>
      <CCol md="3">
        <c-form-label>불량 수량</c-form-label>
            <c-form-input :value="defectQty" readonly type="number" class="bg-light"/>
      </CCol>
      <CCol md="3">
        <c-form-label>검사 일자</c-form-label>
            <c-form-input type="date" v-model="form.insp_dt" />
      </CCol>
    </CRow>
    <CFormTextarea v-model="form.rm" label="비고" rows="3" text="필요 시 기재"></CFormTextarea>
    </div>
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
  opt_nm: '',
  qy: '',
  insp_qy: '',
  insp_dt: userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd'),
  rm: '',
  prcs_ctrl_id: '',
  end_prdt_qlty_insp_id: '',
})
const inspectItems = ref([
  // { name: '외관검사', standard: '1mm', tolerance: '2%' },
])

//불량수량
const defectQty = ref(0)
//합격수량
const pass_qy = computed(() => {
  const order = Number(form.value.insp_qy) || 0
  const received = Number(defectQty.value) || 0
  return order - received
})
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
      alert('검수 수량이 실적 수량보다 많을 수 없습니다.')
      form.value.insp_qy = 0
    }
  },
)

const selectOrdr = (prdts) => {
  console.log(prdts)
  inspectItems.value = []
  form.value.prdt_nm = prdts.searchParams.prdt_nm
  form.value.opt_nm = prdts.searchParams.opt_nm
  form.value.qy = Math.floor(prdts.searchParams.bePass_qy)
  form.value.insp_qy = Math.floor(prdts.searchParams.insp_qy) || 0
  form.value.pass_qy = Math.floor(prdts.searchParams.pass_qy) || 0
  form.value.rm = prdts.searchParams.rm || ''
  form.value.prcs_ctrl_id = prdts.searchParams.prcs_ctrl_id
  form.value.semi_prdt_qlty_insp_id = prdts.searchParams.semi_prdt_qlty_insp_id
  form.value.emp_id = prdts.searchParams.emp_id ?? auth.user?.emp_id ?? 'EMP001'
  defectQty.value = prdts.searchParams.infer_qy || 0
  for (const prdt of prdts.detailData)
    inspectItems.value.push({
      insp_item_nm: prdt.insp_item_nm,
      basi_val: prdt.basi_val,
      eror_scope_min: prdt.eror_scope_min,
      eror_scope_max: prdt.eror_scope_max,
      infer_qy: prdt.infer_qy || 0,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
      semi_prdt_qlty_insp_id: prdt.semi_prdt_qlty_insp_id,
    })
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
      rm: form.value.rm,
      prcs_ctrl_id: form.value.prcs_ctrl_id,
      emp_id: form.value.emp_id,
      infer_qy: defectQty.value,
      pass_qy: pass_qy.value,
      insp_qy: form.value.insp_qy,
      insp_dt: form.value.insp_dt,
    },
    infer: inferData,
  }
  console.log(payload)
  let result = await axios
    .post('/api/semiPrdtQltyInspInsert', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('반제품 검수가 등록되었습니다.')
  } else {
    console.log('반제품 검수에 실패했습니다.')
  }
}

const update = async () => {
  let inferData = []
  for (const prdt of inspectItems.value)
    inferData.push({
      infer_qy: prdt.infer_qy,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
      semi_prdt_qlty_insp_id: prdt.semi_prdt_qlty_insp_id,
    })
  const payload = {
    master: {
      rm: form.value.rm,
      prcs_ctrl_id: form.value.prcs_ctrl_id,
      emp_id: form.value.emp_id,
      infer_qy: defectQty.value,
      pass_qy: form.value.pass_qy,
      insp_qy: form.value.insp_qy,
      insp_dt: form.value.insp_dt,
      semi_prdt_qlty_insp_id: form.value.semi_prdt_qlty_insp_id,
    },
    infer: inferData,
  }
  let result = await axios
    .post('/api/semiPrdtQltyInspUpdate', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('완제품 검수 수정이 등록되었습니다.')
  } else {
    console.log('완제품 검수 수정에 실패했습니다.')
  }
}

const deleteFunc = async () => {
  const payload = {
    semi_prdt_qlty_insp_id: form.value.semi_prdt_qlty_insp_id,
  }
  let result = await axios
    .post('/api/semiPrdtQltyInspDelete', payload)
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
