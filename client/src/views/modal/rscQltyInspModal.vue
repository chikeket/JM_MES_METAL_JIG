<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>자재품질 검수서 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="mb-3">
          <div class="d-flex gap-2 mb-3">
            <CInputGroup class="mb-2">
              <CInputGroupText id="addon-ordr-name-1">검수자</CInputGroupText>
              <CFormInput v-model="emp_nm" placeholder="검수자이름" />
            </CInputGroup>
          </div>
          <div class="d-flex gap-2 mb-3">
            <CInputGroupText id="addon-ordr-name-2">검수 일자</CInputGroupText>
            <input type="date" class="form-control" v-model="insp_dt" />
            <button class="btn btn-secondary" style="width: 70px" @click="prdtSearch()">
              검색
            </button>
          </div>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>검수자</th>
              <th>자재명</th>
              <th>검수 수량</th>
              <th>합격 수량</th>
              <th>검수 일자</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.emp_nm }}</td>
              <td>{{ prdts.rsc_nm }}</td>
              <td>{{ Math.floor(prdts.insp_qy) }}</td>
              <td>{{ Math.floor(prdts.pass_qy) }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.reg_dt, 'yyyy-MM-dd') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="close">닫기</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, shallowRef, watch } from 'vue'
import axios from 'axios'
import userDateUtils from '@/utils/useDates.js'
const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])
const close = () => {
  emp_nm.value = ''
  insp_dt.value = ''
  prdtList.value = []
  emit('close')
}

const emp_nm = ref('')
const insp_dt = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

const prdtSearch = async () => {
  const params = {
    emp_nm: emp_nm.value || '',
    insp_dt: insp_dt.value || '1970-01-01',
  }
  console.log(params)
  let result = await axios
    .get('/api/rscQltyInspSelect', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async (prdts) => {
  const params = { rsc_qlty_insp_id: '' }
  params.rsc_qlty_insp_id = prdts.rsc_qlty_insp_id
  let result = await axios
    .get('/api/rscQltyInspInferSelect', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  const copyPrdts = { ...prdts }
  const formatInspDt = userDateUtils.dateFormat(prdts.insp_dt, 'yyyy-MM-dd')
  copyPrdts.insp_dt = formatInspDt
  emit('select', {
    detailData: result.data,
    searchParams: copyPrdts,
  }) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
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
	 모달 바디 스타일
	 ============================================ */
.modal-body {
  background: #ffffff;
  padding: 1rem;
}

/* ============================================
	 버튼 스타일
	 ============================================ */
.btn {
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}
.btn-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
.btn:active {
  transform: translateY(0);
}

/* ============================================
	 폼 요소 스타일
	 ============================================ */
.form-control {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}
.form-control:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}
input[type='date'].form-control {
  font-size: 12px;
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
	 테이블 스타일
	 ============================================ */
.table {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  table-layout: fixed;
  width: 100%;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.table thead th {
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

.table thead th:first-child {
  border-top-left-radius: 10px;
}
.table thead th:last-child {
  border-top-right-radius: 10px;
}

.table tbody td {
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

.table tbody td:last-child {
  border-right: none;
}

.table tbody tr {
  transition: all 0.2s ease;
  background-color: #ffffff;
  cursor: pointer;
}

/* hover 효과 */
.table {
  --row-hover-bg: var(
    --cui-table-hover-bg,
    var(
      --bs-table-hover-bg,
      rgba(var(--cui-emphasis-color-rgb, var(--bs-emphasis-color-rgb, 33, 37, 41)), 0.075)
    )
  );
}

.table tbody tr:hover {
  background-color: var(--row-hover-bg) !important;
}
.table tbody tr:hover td {
  background-color: var(--row-hover-bg) !important;
}

/* ============================================
	 모던 스크롤바
	 ============================================ */
.modal-body::-webkit-scrollbar {
  width: 6px;
}
.modal-body::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(2px);
  transition: all 0.2s ease;
}
.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
.modal-body {
  scrollbar-width: thin;
  scrollbar-color: #9ea2a8 rgba(240, 240, 240, 0.6);
}

/* ============================================
	 간격 조정
	 ============================================ */
.gap-2 {
  gap: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

/* ============================================
	 반응형
	 ============================================ */
@media (max-width: 1600px) {
  .form-control,
  .btn,
  .table th,
  .table td,
  :deep(.input-group-text) {
    font-size: 11px !important;
  }
  .btn {
    padding: 0.4rem 1rem;
  }
}
</style>