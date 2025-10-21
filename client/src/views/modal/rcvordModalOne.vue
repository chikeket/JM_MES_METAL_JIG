<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle class="modal-title-custom">수주 상세 조회</CModalTitle>
    </CModalHeader>
    <CModalBody class="modal-body-custom">
      <div class="modal-content-wrapper">
        <!-- 요약 정보 섹션 -->
        <div class="info-section">
          <div class="info-row">
            <div class="info-item">
              <label class="info-label">수주 ID</label>
              <div class="info-value">{{ searchParams?.rcvord_id || '-' }}</div>
            </div>
            <div class="info-item">
              <label class="info-label">납품 업체</label>
              <div class="info-value">{{ searchParams?.co_nm || '-' }}</div>
            </div>
            <div class="info-item">
              <label class="info-label">담당자</label>
              <div class="info-value">{{ searchParams?.emp_nm || '-' }}</div>
            </div>
            <div class="info-item">
              <label class="info-label">상태</label>
              <div class="info-value">{{ searchParams?.status || '-' }}</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <label class="info-label">총 요청 수량</label>
              <div class="info-value">{{ formatNumber(searchParams?.total_qty) || '-' }}</div>
            </div>
            <div class="info-item">
              <label class="info-label">등록일</label>
              <div class="info-value">{{ formatDate(searchParams?.reg_dt) || '-' }}</div>
            </div>
            <div class="info-item">
              <label class="info-label">비고</label>
              <div class="info-value">{{ searchParams?.rm || '-' }}</div>
            </div>
          </div>
        </div>

        <!-- 상세 테이블 -->
        <div class="table-section">
          <div class="table-header-label">수주 상세</div>
          <div class="table-wrapper-modal">
            <table class="data-table-modal">
              <thead>
                <tr>
                  <th style="width: 8%">No</th>
                  <th style="width: 15%">제품 ID</th>
                  <th style="width: 25%">제품명</th>
                  <th style="width: 15%">요청 수량</th>
                  <th style="width: 15%">단가</th>
                  <th style="width: 15%">합계</th>
                  <th style="width: 7%">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(row, idx) in detailList" 
                  :key="idx"
                  class="data-row-modal"
                >
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td class="text-center">{{ row.prdct_id || '-' }}</td>
                  <td class="text-left">{{ row.prdct_nm || '-' }}</td>
                  <td class="text-right">{{ formatNumber(row.qty) || '-' }}</td>
                  <td class="text-right">{{ formatNumber(row.unit_price) || '-' }}</td>
                  <td class="text-right">{{ formatNumber((row.qty || 0) * (row.unit_price || 0)) }}</td>
                  <td class="text-center">{{ row.rm || '-' }}</td>
                </tr>
                <tr v-if="!detailList.length" class="empty-state">
                  <td colspan="7">상세 데이터가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CModalBody>
    <CModalFooter class="modal-footer-custom">
      <button class="btn-modal-close" @click="close">닫기</button>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { defineProps, defineEmits, shallowRef, ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  searchParams: { type: Object, default: () => ({}) },
  detailList: { type: Array, default: () => [] },
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const formatNumber = (n) => (n == null ? '' : Number(n).toLocaleString())

const formatDate = (d) => {
  if (!d) return ''
  try {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const date = new Date(d)
    if (isNaN(date.getTime())) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
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
   정보 섹션
   ============================================ */
.info-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: "Pretendard", sans-serif;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  padding: 0.65rem 0.85rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: "Pretendard", sans-serif;
  min-height: 36px;
  display: flex;
  align-items: center;
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
  font-size: 13px !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
  color: #ffffff !important;
  text-align: center !important;
  vertical-align: middle !important;
  padding: 0.85rem 0.75rem !important;
  border: none !important;
  letter-spacing: -0.2px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.data-table-modal tbody tr td) {
  font-size: 13px !important;
  font-weight: 400 !important;
  vertical-align: middle !important;
  padding: 0.75rem 0.75rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  height: 46px !important;
  font-family: "Pretendard", sans-serif !important;
}

:deep(.text-center) {
  text-align: center !important;
}

:deep(.text-left) {
  text-align: left !important;
}

:deep(.text-right) {
  text-align: right !important;
}

:deep(.data-row-modal) {
  transition: all 0.15s ease !important;
  background-color: #ffffff !important;
}

:deep(.data-row-modal:hover) {
  background-color: #f8fafc !important;
  box-shadow: inset 0 0 0 1px #e2e8f0 !important;
}

:deep(.data-row-modal:hover td) {
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
  .info-label,
  .info-value,
  :deep(.data-table-modal thead tr th),
  :deep(.data-table-modal tbody tr td) {
    font-size: 12px !important;
  }

  .info-value {
    min-height: 34px;
    padding: 0.5rem 0.75rem;
  }

  .info-row {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
}
</style>