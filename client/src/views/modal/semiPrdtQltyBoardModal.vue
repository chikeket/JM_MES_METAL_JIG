<template>
  <CModal ref="modalRef" :visible="visible" @close="emitClose" size="xl">
  <CContainer fluid>
    <div class="d-flex justify-content-end gap-2 mb-3" style="margin-top: 16px;">
      <CButton color="secondary" @click="close()">닫기</CButton>      
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
          <CInputGroupText style="min-width: 95px">옵션명</CInputGroupText>
          <CFormInput v-model="form.opt_nm" readonly class="bg-light" />
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
    <CFormTextarea v-model="form.rm" label="비고" rows="3" text="필요 시 기재"></CFormTextarea>
    
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
          <CTableDataCell class="text-end" style="width: 120px" readonly>{{ item.infer_qy }}</CTableDataCell>
        </CTableRow>
        <CTableRow v-if="inspectItems.length === 0">
          <CTableDataCell colspan="4" class="text-center text-muted py-4"
            >검사항목이 없습니다.</CTableDataCell
          >
        </CTableRow>
      </CTableBody>
    </CTable>
  </CContainer>
  </CModal>
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
import userDateUtils from '@/utils/useDates.js'
import { useAuthStore } from '@/stores/auth.js'
const auth = useAuthStore()
const props = defineProps(['modaldata', 'visible']);

const emit = defineEmits(['close'])

const emitClose = () => {
  emit('close')
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
      // alert('합격 수량은 0 이상의 숫자만 입력 가능합니다.')
      form.value.pass_qy = 0
      return
    }
    if (received > order) {
      // alert('합격 수량이 검수량보다 많을 수 없습니다.')
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
      // alert('검수 수량은 0 이상의 숫자만 입력 가능합니다.')
      form.value.pass_qy = 0
      return
    }
    if (received > order) {
      // alert('검수 수량이 실적 수량보다 많을 수 없습니다.')
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
  form.value.end_prdt_qlty_insp_id = prdts.searchParams.end_prdt_qlty_insp_id
  defectQty.value = prdts.searchParams.infer_qy || 0
  for (const prdt of prdts.detailData)
    inspectItems.value.push({
      insp_item_nm: prdt.insp_item_nm,
      basi_val: prdt.basi_val,
      eror_scope_min: prdt.eror_scope_min,
      eror_scope_max: prdt.eror_scope_max,
      infer_qy: prdt.infer_qy || 0,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
      end_prdt_qlty_insp_id: prdt.end_prdt_qlty_insp_id,
    })
}
defineExpose({ selectOrdr });

const close = () => {  
  emit('close')
}

</script>

<style scoped>
/* ============================================
	 기본 폰트 및 박스 설정
	 ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

/* ============================================
	 컨테이너 스타일
	 ============================================ */
:deep(.container-fluid) {
  background: #ffffff;
  padding: 1rem !important;
}

/* ============================================
	 버튼 스타일
	 ============================================ */
:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}
:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
:deep(.btn:active) {
  transform: translateY(0);
}

/* ============================================
	 폼 요소 스타일
	 ============================================ */
:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}
:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}
:deep(input[type='date'].form-control),
:deep(input[type='number'].form-control) {
  font-size: 12px;
}

/* Textarea 스타일 */
:deep(textarea.form-control) {
  height: auto;
  min-height: 80px;
}

/* 읽기 전용 필드 */
:deep(.form-control.bg-light) {
  background-color: #e9ecef !important;
  cursor: not-allowed;
}

/* ============================================
	 Input Group 스타일
	 ============================================ */
:deep(.input-group-text) {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
}

/* ============================================
	 Label 스타일
	 ============================================ */
:deep(.form-label) {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

/* ============================================
	 테이블 스타일
	 ============================================ */
:deep(.table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  table-layout: fixed;
  width: 100%;
}

:deep(.table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.table thead th) {
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.table thead th:first-child) {
  border-top-left-radius: 10px;
}
:deep(.table thead th:last-child) {
  border-top-right-radius: 10px;
}

:deep(.table tbody td) {
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #ffffff;
}

:deep(.table tbody td:last-child) {
  border-right: none;
}

:deep(.table tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
}

/* hover 효과 */
:deep(.table) {
  --row-hover-bg: var(
    --cui-table-hover-bg,
    var(
      --bs-table-hover-bg,
      rgba(var(--cui-emphasis-color-rgb, var(--bs-emphasis-color-rgb, 33, 37, 41)), 0.075)
    )
  );
}

:deep(.table tbody tr:hover) {
  background-color: var(--row-hover-bg) !important;
}
:deep(.table tbody tr:hover td) {
  background-color: var(--row-hover-bg) !important;
}

/* ============================================
	 그리드 간격 조정
	 ============================================ */
:deep(.g-3) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
}

/* ============================================
	 간격 조정
	 ============================================ */
.gap-2 {
  gap: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

/* ============================================
	 반응형
	 ============================================ */
@media (max-width: 1600px) {
  :deep(.form-control),
  :deep(.form-select),
  :deep(.btn),
  :deep(.table th),
  :deep(.table td),
  :deep(.input-group-text),
  :deep(.form-label) {
    font-size: 11px !important;
  }
  :deep(.btn) {
    padding: 0.4rem 1rem;
  }
}
</style>