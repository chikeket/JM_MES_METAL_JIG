<template>
  <CModal ref="modalRef" :visible="visible" @close="emitClose" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">완제품 검사 상세 정보</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 닫기 버튼 -->
        <div class="d-flex justify-content-end mb-3">
          <button class="btn-modal-close" @click="close()">닫기</button>
        </div>

        <!-- 기본 정보 입력 -->
        <div class="info-section">
          <div class="info-row">
            <div class="info-item">
              <label class="info-label">검사자</label>
              <input 
                type="text" 
                class="info-input" 
                v-model="form.emp_nm" 
                placeholder="검사자 이름"
              />
            </div>
            <div class="info-item">
              <label class="info-label">완제품명</label>
              <input 
                type="text" 
                class="info-input readonly-input" 
                v-model="form.prdt_nm" 
                readonly
              />
            </div>
            <div class="info-item">
              <label class="info-label">옵션명</label>
              <input 
                type="text" 
                class="info-input readonly-input" 
                v-model="form.opt_nm" 
                readonly
              />
            </div>
            <div class="info-item">
              <label class="info-label">실적 수량</label>
              <input 
                type="number" 
                class="info-input readonly-input" 
                v-model.number="form.qy" 
                readonly
                min="0"
              />
            </div>
          </div>

          <div class="info-row">
            <div class="info-item">
              <label class="info-label">검수 수량</label>
              <input 
                type="number" 
                class="info-input" 
                v-model.number="form.insp_qy" 
                min="0"
              />
            </div>
            <div class="info-item">
              <label class="info-label">합격 수량</label>
              <input 
                type="number" 
                class="info-input readonly-input" 
                :value="pass_qy" 
                readonly
                min="0"
              />
            </div>
            <div class="info-item">
              <label class="info-label">불량 수량</label>
              <input 
                type="number" 
                class="info-input readonly-input" 
                :value="defectQty" 
                readonly
              />
            </div>
            <div class="info-item">
              <label class="info-label">검사 일자</label>
              <input 
                type="date" 
                class="info-input" 
                v-model="form.insp_dt"
              />
            </div>
          </div>
        </div>

        <!-- 비고 -->
        <div class="remarks-section">
          <label class="remarks-label">비고</label>
          <textarea 
            class="remarks-textarea" 
            v-model="form.rm" 
            rows="3" 
            placeholder="필요 시 기재"
          ></textarea>
        </div>

        <!-- 검사 항목 테이블 -->
        <div class="table-section">
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 30%">검사항목</th>
                  <th style="width: 20%">기준치</th>
                  <th style="width: 25%">오차범위</th>
                  <th style="width: 25%">불량수량</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(item, idx) in inspectItems" 
                  :key="idx"
                  class="data-row-modal"
                >
                  <td>{{ item.insp_item_nm }}</td>
                  <td>{{ item.basi_val }}</td>
                  <td>{{ item.eror_scope_min + '~' + item.eror_scope_max }}</td>
                  <td>{{ item.infer_qy }}</td>
                </tr>
                <tr v-if="inspectItems.length === 0" class="empty-state">
                  <td colspan="4">검사항목이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
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
   기본 정보 입력 영역
   ============================================ */
.info-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  font-family: "Pretendard", sans-serif;
  margin-bottom: 0;
}

.info-input {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  font-family: "Pretendard", sans-serif;
}

.info-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.readonly-input {
  background-color: #f8fafc;
  color: #64748b;
  cursor: not-allowed;
}

/* ============================================
   비고 영역
   ============================================ */
.remarks-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.remarks-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  font-family: "Pretendard", sans-serif;
  margin-bottom: 0.5rem;
  display: block;
}

.remarks-textarea {
  font-size: 13px;
  font-weight: 400;
  padding: 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  font-family: "Pretendard", sans-serif;
  width: 100%;
  resize: vertical;
}

.remarks-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

/* ============================================
   닫기 버튼
   ============================================ */
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
   테이블 영역
   ============================================ */
.table-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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
  font-size: 13px !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
  color: #ffffff !important;
  text-align: center !important;
  vertical-align: middle !important;
  padding: 0.85rem 0.75rem !important;
  border: none !important;
  border-bottom: none !important;
  border-top: none !important;
  letter-spacing: -0.2px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal thead tr th:first-child) {
  border-top-left-radius: 12px !important;
}

:deep(.data-table-modal thead tr th:last-child) {
  border-top-right-radius: 12px !important;
}

:deep(.data-table-modal tbody tr td) {
  font-size: 13px !important;
  font-weight: 400 !important;
  vertical-align: middle !important;
  padding: 0.75rem 0.75rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  color: #334155 !important;
  height: 46px !important;
  text-align: center !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-row-modal:hover) {
  background-color: #f8fafc !important;
}

:deep(.empty-state td) {
  text-align: center !important;
  color: #94a3b8 !important;
  font-style: italic !important;
  padding: 3rem 0.75rem !important;
  background-color: #f8fafc !important;
  font-family: "Pretendard", sans-serif !important;
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 1600px) {
  .info-label,
  .info-input,
  .remarks-label,
  .remarks-textarea,
  .btn-modal-close {
    font-size: 12px;
  }

  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .info-input,
  .btn-modal-close {
    height: 38px;
    padding: 0.55rem 0.75rem;
  }

  .info-row {
    gap: 0.75rem;
  }
}

@media (max-width: 1200px) {
  .info-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>