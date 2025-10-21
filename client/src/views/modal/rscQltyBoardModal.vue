<template>
  <CModal ref="modalRef" :visible="visible" @close="emitClose" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">검수 입력</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <CContainer fluid>
        <div class="modal-content-wrapper">
          <!-- 기본 정보 입력 -->
          <div class="form-section">
            <CRow class="g-3 mb-3">
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">검사자</CInputGroupText>
                  <CFormInput v-model="form.emp_nm" placeholder="검사자 이름" class="form-input-custom" />
                </CInputGroup>
              </CCol>
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">출고처</CInputGroupText>
                  <CFormInput v-model="form.co_nm" readonly class="form-input-custom bg-light" />
                </CInputGroup>
              </CCol>
            </CRow>

            <CRow class="g-3 mb-3">
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">자재명</CInputGroupText>
                  <CFormInput v-model="form.rcs_nm" readonly class="form-input-custom bg-light" placeholder="자재발주서조회" />
                </CInputGroup>
              </CCol>
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">발주 수량</CInputGroupText>
                  <CFormInput v-model.number="form.qy" readonly type="number" min="0" class="form-input-custom bg-light" />
                </CInputGroup>
              </CCol>
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">기입고 수량</CInputGroupText>
                  <CFormInput v-model.number="form.receivedQty" readonly type="number" min="0" class="form-input-custom bg-light"/>
                </CInputGroup>
              </CCol>
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">미입고 수량</CInputGroupText>
                  <CFormInput :value="pendingQty" readonly type="number" class="form-input-custom bg-light" />
                </CInputGroup>
              </CCol>
            </CRow>

            <CRow class="g-3 mb-3">
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">검수 수량</CInputGroupText>
                  <CFormInput v-model.number="form.insp_qy" type="number" min="0" class="form-input-custom" />
                </CInputGroup>
              </CCol>
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">합격 수량</CInputGroupText>
                  <CFormInput :value="pass_qy" readonly type="number" min="0" class="form-input-custom bg-light" />
                </CInputGroup>
              </CCol>
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">불량 수량</CInputGroupText>
                  <CFormInput :value="defectQty" readonly type="number" class="form-input-custom bg-light" />
                </CInputGroup>
              </CCol>
              <CCol md="3">
                <CInputGroup size="sm">
                  <CInputGroupText class="form-label-custom">검사 일자</CInputGroupText>
                  <CFormInput type="date" v-model="form.insp_dt" class="form-input-custom" />
                </CInputGroup>
              </CCol>
            </CRow>

            <div class="mb-3">
              <CFormTextarea 
                v-model="form.note" 
                label="비고" 
                rows="3" 
                placeholder="필요 시 기재"
                class="form-textarea-custom"
              ></CFormTextarea>
            </div>
          </div>

          <!-- 검사 항목 테이블 -->
          <div class="table-section">
            <div class="table-header-label">검사 항목</div>
            <div class="table-wrapper-modal">
              <CTable hover small class="data-table-modal align-middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell class="text-center">검사항목</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">기준치</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">오차범위</CTableHeaderCell>
                    <CTableHeaderCell class="text-center">불량수량</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="(item, idx) in inspectItems" :key="idx" class="data-row-modal">
                    <CTableDataCell class="text-center">{{ item.insp_item_nm }}</CTableDataCell>
                    <CTableDataCell class="text-center">{{ item.basi_val }}</CTableDataCell>
                    <CTableDataCell class="text-center">{{ item.eror_scope_min + '~' + item.eror_scope_max }}</CTableDataCell>
                    <CTableDataCell class="text-center">{{ item.infer_qy }}</CTableDataCell>
                  </CTableRow>
                  <CTableRow v-if="inspectItems.length === 0" class="empty-state">
                    <CTableDataCell colspan="4" class="text-center">검사항목이 없습니다.</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>
          </div>
        </div>
      </CContainer>
    </CModalBody>
    <CModalFooter class="modal-footer-custom">
      <button class="btn-modal-close" @click="close()">닫기</button>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import {
  CRow,
  CCol,
  CFormInput,
  CFormTextarea,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CInputGroup,
  CInputGroupText,
} from '@coreui/vue'
import { ref, computed, watch, defineProps, defineEmits} from 'vue'
import userDateUtils from '@/utils/useDates.js'
import { useAuthStore } from '@/stores/auth.js'

const auth = useAuthStore()
const props = defineProps(['modaldata', 'visible'])
const emit = defineEmits(['close'])

const emitClose = () => {
  emit('close')
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

const inspectItems = ref([])

// 합격수량
const pass_qy = computed(() => {
  const order = Number(form.value.insp_qy) || 0
  const received = Number(defectQty.value) || 0
  return order - received
})

// 미입고수량
const pendingQty = computed(() => {
  const order = Number(form.value.qy) || 0
  const received = Number(form.value.receivedQty) || 0
  return order - received
})

// 불량수량
const defectQty = ref(0)

// 각각 검사항목별 불합격 수량 입력후 합격수량이 정해지는 코드
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

// 검수수량검증
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

watch(
  () => props,
  (newVal) => {
    console.log(props)
    selectOrdr(props)
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

defineExpose({ selectOrdr })

const close = () => {  
  emit('close')
}
</script>

<style scoped>
/* ============================================
   모달 헤더
   ============================================ */
:deep(.modal-header-custom) {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-bottom: none;
  padding: 1.25rem 1.5rem;
  border-radius: 12px 12px 0 0;
}

:deep(.modal-title-custom) {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif;
}

:deep(.btn-close) {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

:deep(.btn-close:hover) {
  opacity: 1;
}

/* ============================================
   모달 바디
   ============================================ */
:deep(.modal-body-custom) {
  padding: 0;
  background: #f8fafc;
}

.modal-content-wrapper {
  padding: 1.5rem;
}

/* ============================================
   폼 영역
   ============================================ */
.form-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.form-label-custom) {
  min-width: 95px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
}

:deep(.form-input-custom) {
  font-size: 13px;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s ease;
}

:deep(.form-input-custom:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

:deep(.form-textarea-custom) {
  font-size: 13px;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s ease;
}

:deep(.form-textarea-custom:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

:deep(.form-textarea-custom label) {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 13px;
  color: #334155;
}

/* ============================================
   테이블 영역
   ============================================ */
.table-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table-header-label {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  letter-spacing: -0.2px;
}

.table-wrapper-modal {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-wrapper-modal::-webkit-scrollbar {
  width: 14px;
  background: #ffffff;
}

.table-wrapper-modal::-webkit-scrollbar-track {
  background: #ffffff;
}

.table-wrapper-modal::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #9ca3af 0%, #6b7280 100%);
  border-radius: 10px;
  border: 3px solid #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.table-wrapper-modal::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #6b7280 0%, #4b5563 100%);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

:deep(.data-table-modal) {
  width: 100% !important;
  margin-bottom: 0 !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-size: 13px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal thead) {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}

:deep(.data-table-modal thead tr th) {
  font-size: 12px !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
  color: #ffffff !important;
  text-align: center !important;
  vertical-align: middle !important;
  padding: 0.75rem 0.75rem !important;
  border: none !important;
  letter-spacing: -0.2px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal thead tr th:first-child) {
  border-top-left-radius: 0 !important;
}

:deep(.data-table-modal thead tr th:last-child) {
  border-top-right-radius: 0 !important;
}

:deep(.data-table-modal tbody tr td) {
  font-size: 13px !important;
  font-weight: 400 !important;
  vertical-align: middle !important;
  padding: 0.75rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  height: 44px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-row-modal) {
  transition: all 0.15s ease !important;
  background-color: #ffffff !important;
}

:deep(.data-row-modal:hover) {
  background-color: #f8fafc !important;
  box-shadow: inset 0 0 0 1px #e2e8f0 !important;
}

:deep(.empty-state td) {
  text-align: center !important;
  color: #94a3b8 !important;
  font-style: italic !important;
  padding: 2.5rem 0.75rem !important;
  background-color: #f8fafc !important;
}

/* ============================================
   모달 푸터
   ============================================ */
:deep(.modal-footer-custom) {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  border-radius: 0 0 12px 12px;
}

.btn-modal-close {
  font-size: 13px;
  font-weight: 600;
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff;
  cursor: pointer;
  font-family: "Pretendard", sans-serif;
}

.btn-modal-close:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

.btn-modal-close:active {
  transform: scale(0.98);
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 1600px) {
  :deep(.form-label-custom),
  :deep(.form-input-custom),
  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  :deep(.form-label-custom) {
    min-width: 80px;
    padding: 0.45rem 0.65rem;
  }
}
</style>