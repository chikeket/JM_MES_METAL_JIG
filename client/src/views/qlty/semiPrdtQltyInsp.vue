<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="newFunc()" class="btn-action">신규</CButton>
      <CButton color="secondary" size="sm" @click="openWaitingFinishedPrdtModal()" class="btn-action">
        생산실적조회
      </CButton>
      <waitingFinishedPrdtModal
        :visible="isWaitingFinishedPrdtModalVisible"
        @close="closeWaitingFinishedPrdtModal"
        @select="selectOrdr"
      />
      <CButton color="secondary" size="sm" @click="saveInspection()" class="btn-action">저장</CButton>
      <CButton color="secondary" size="sm" @click="update()" class="btn-action">수정</CButton>
      <CButton color="danger" size="sm" @click="deleteFunc()" class="btn-action">삭제</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">검사자</CFormLabel>
          <CFormInput v-model="form.emp_nm" placeholder="검사자 이름" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">완제품명</CFormLabel>
          <CFormInput v-model="form.prdt_nm" readonly class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">옵션명</CFormLabel>
          <CFormInput v-model="form.opt_nm" readonly class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">실적 수량</CFormLabel>
          <CFormInput
            v-model.number="form.qy"
            readonly
            type="number"
            min="0"
            class="form-input-enhanced"
          />
        </CCol>
      </CRow>

      <CRow class="g-3 mt-2">
        <CCol :md="3">
          <CFormLabel class="form-label">검수 수량</CFormLabel>
          <CFormInput v-model.number="form.insp_qy" type="number" min="0" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">합격 수량</CFormLabel>
          <CFormInput :value="pass_qy" readonly type="number" min="0" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">불량 수량</CFormLabel>
          <CFormInput :value="defectQty" readonly type="number" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">검사 일자</CFormLabel>
          <CFormInput type="date" v-model="form.insp_dt" class="form-input-enhanced" />
        </CCol>
      </CRow>

      <CRow class="g-3 mt-2">
        <CCol :md="12">
          <CFormLabel class="form-label">비고</CFormLabel>
          <CFormTextarea
            v-model="form.rm"
            rows="2"
            placeholder="필요 시 기재"
            class="form-input-enhanced"
          ></CFormTextarea>
        </CCol>
      </CRow>
    </div>

    <!-- 품질조회 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="openEndPrdtQltyInspModal()" class="btn-action">
        완제품 품질조회
      </CButton>
      <endPrdtQltyInspModal
        :visible="isEndPrdtQltyInspModalVisible"
        @close="closeEndPrdtQltyInspModal"
        @select="selectOrdr"
      />
    </div>

    <!-- 검사 항목 테이블 -->
    <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
      <div class="table-wrapper">
        <CTable bordered hover class="data-table">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style="width: 200px">검사항목</CTableHeaderCell>
              <CTableHeaderCell style="width: 140px">기준치</CTableHeaderCell>
              <CTableHeaderCell style="width: 140px">오차범위</CTableHeaderCell>
              <CTableHeaderCell style="width: 140px">불량수량</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(item, idx) in inspectItems" :key="idx" class="data-row">
              <CTableDataCell class="text-start">{{ item.insp_item_nm }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ item.basi_val }}</CTableDataCell>
              <CTableDataCell class="text-center">{{
                item.eror_scope_min + '~' + item.eror_scope_max
              }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <input
                  v-model="item.infer_qy"
                  class="form-control form-control-sm"
                  placeholder="불량수량기입"
                />
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
              <CTableDataCell colspan="4">&nbsp;</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </CContainer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import waitingFinishedPrdtModal from '../modal/waitingFinishedPrdtModal.vue'
import endPrdtQltyInspModal from '../modal/endPrdtQltyInspModal.vue'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'

const PAGE_ROWS = 5
const emptyRowCount = computed(() => Math.max(0, PAGE_ROWS - inspectItems.value.length))
const auth = useAuthStore()

const isWaitingFinishedPrdtModalVisible = ref(false)
const openWaitingFinishedPrdtModal = () => {
  isWaitingFinishedPrdtModalVisible.value = true
}
const closeWaitingFinishedPrdtModal = () => {
  isWaitingFinishedPrdtModalVisible.value = false
}

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

const inspectItems = ref([])
const defectQty = ref(0)

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

const pass_qy = computed(() => {
  const order = Number(form.value.insp_qy) || 0
  const received = Number(defectQty.value) || 0
  return order - received
})

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
      form.value.pass_qy = 0
    }
  },
)

const selectOrdr = (prdts) => {
  inspectItems.value = []
  form.value.prdt_nm = prdts.searchParams.prdt_nm
  form.value.opt_nm = prdts.searchParams.opt_nm
  form.value.qy = Math.floor(prdts.searchParams.bePass_qy)
  form.value.insp_qy = Math.floor(prdts.searchParams.insp_qy) || 0
  form.value.pass_qy = Math.floor(prdts.searchParams.pass_qy) || 0
  form.value.rm = !prdts.searchParams.rm ? '' : prdts.searchParams.rm
  form.value.prcs_ctrl_id = prdts.searchParams.prcs_ctrl_id
  form.value.end_prdt_qlty_insp_id = prdts.searchParams.end_prdt_qlty_insp_id

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
  console.log(form.value)
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
    .post('/api/endPrdtQltyInspInsert', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('완제품 검수가 등록되었습니다.')
  } else {
    console.log('완제품 검수에 실패했습니다.')
  }
}

const update = async () => {
  let inferData = []
  for (const prdt of inspectItems.value)
    inferData.push({
      infer_qy: prdt.infer_qy,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
      end_prdt_qlty_insp_id: prdt.end_prdt_qlty_insp_id,
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
      end_prdt_qlty_insp_id: form.value.end_prdt_qlty_insp_id,
    },
    infer: inferData,
  }
  let result = await axios
    .post('/api/endPrdtQltyInspUpdate', payload)
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
    end_prdt_qlty_insp_id: form.value.end_prdt_qlty_insp_id,
  }
  let result = await axios
    .post('/api/endPrdtQltyInspDelete', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('완제품 검수 삭제가 성공되었습니다.')
  } else {
    console.log('완제품 검수 삭제가 실패했습니다.')
  }
}

const newFunc = async () => {
  form.value.prdt_nm = ''
  form.value.opt_nm = ''
  form.value.qy = 0
  form.value.insp_qy = 0
  form.value.insp_dt = userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd')
  form.value.rm = ''
  form.value.prcs_ctrl_id = ''
  form.value.end_prdt_qlty_insp_id = ''
  inspectItems.value = []
}
</script>

<style scoped>
/* ============================================
   기본 설정 및 컨테이너
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

:deep(.container-fluid) {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  padding: 1.5rem !important;
  min-height: 100vh;
  overflow: auto;
  width: 100%;
}

/* ============================================
   검색 필터 박스
   ============================================ */
.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
}

/* ============================================
   그리드 박스 - 고정 높이 (5개 행)
   ============================================ */
.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-height: calc(46px + 5 * 46px + 2px);
}

/* ============================================
   버튼 스타일
   ============================================ */
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

/* ============================================
   폼 요소
   ============================================ */
:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

.form-input-enhanced {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
}

.form-input-enhanced:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  background-color: #ffffff;
  outline: none;
}

.form-input-enhanced:disabled,
.form-input-enhanced[readonly] {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.form-input-enhanced::placeholder {
  display: none;
}

:deep(.g-3) {
  --bs-gutter-y: 0.75rem;
  --bs-gutter-x: 1rem;
}

:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

:deep(.mb-4) {
  margin-bottom: 1rem !important;
}

:deep(.mt-2) {
  margin-top: 0.5rem !important;
}

/* ============================================
   테이블 래퍼
   ============================================ */
.table-wrapper {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  scrollbar-gutter: stable;
}

/* 스크롤바 전체 너비 */
.table-wrapper::-webkit-scrollbar {
  width: 16px;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

/* 스크롤바 트랙 (배경) */
.table-wrapper::-webkit-scrollbar-track {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 6px 0;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.05);
}

/* 스크롤바 썸 (손잡이) */
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  border-radius: 12px;
  border: 3px solid #f1f5f9;
  box-shadow: 0 3px 10px rgba(71, 85, 105, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 호버 시 */
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-color: #e2e8f0;
  box-shadow: 0 5px 15px rgba(71, 85, 105, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scaleX(1.15);
}

/* 활성화(드래그) 시 */
.table-wrapper::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  border-width: 2px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.5), inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

/* 스크롤바 버튼 제거 */
.table-wrapper::-webkit-scrollbar-button {
  display: none;
}

/* Firefox용 */
.table-wrapper {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
}

/* ============================================
   데이터 테이블
   ============================================ */
:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  font-size: 13px;
  width: 100%;
  display: table;
  table-layout: fixed;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
  display: table-header-group;
}

:deep(.data-table tbody) {
  display: table-row-group;
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

:deep(.data-table tbody tr.data-row) {
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr.data-row:hover) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* 테이블 내부 입력 필드 */
:deep(.data-table input.form-control-sm) {
  font-size: 12px;
  padding: 0.4rem 0.6rem;
  height: 32px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  width: 100%;
}

:deep(.data-table input.form-control-sm:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* ============================================
   텍스트 정렬
   ============================================ */
:deep(.text-end) {
  text-align: right;
}

:deep(.text-start) {
  text-align: left;
}

:deep(.text-center) {
  text-align: center;
}

/* ============================================
   반응형 디자인
   ============================================ */
@media (max-width: 1600px) {
  :deep(.form-label) {
    font-size: 12px !important;
  }

  .form-input-enhanced {
    font-size: 12px !important;
    height: 38px !important;
    padding: 0.55rem 0.75rem !important;
  }

  :deep(.btn) {
    font-size: 12px !important;
    padding: 0.5rem 1.1rem !important;
  }

  :deep(.data-table th),
  :deep(.data-table td) {
    font-size: 12px !important;
  }

  :deep(.data-table td) {
    height: 42px !important;
  }

  .empty-row td {
    height: 42px !important;
  }

  .grid-box {
    max-height: calc(42px + 5 * 42px + 2px) !important;
  }
}
</style>