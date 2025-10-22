<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>완제품 품질조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="mb-3">
          <div class="d-flex gap-2 mb-3">
            <CInputGroup class="mb-2">
              <CInputGroupText id="addon-ordr-name-1">검사자</CInputGroupText>
              <CFormInput v-model="emp_nm" placeholder="검수자이름" />
            </CInputGroup>
          </div>
          <div class="d-flex gap-2 mb-3">
            <CInputGroupText id="addon-ordr-name-2">검사 일자</CInputGroupText>
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
              <th>검사자</th>
              <th>제품명</th>
              <th>옵션명</th>
              <th>검사 수량</th>
              <th>검사 일자</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.emp_nm }}</td>
              <td>{{ prdts.prdt_nm }}</td>
              <td>{{ prdts.opt_nm }}</td>
              <td>{{ Math.floor(prdts.insp_qy) }}</td>
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
    .get('/api/endPrdtQltyInspSearch', { params })
    .catch((err) => console.log(err))
  // console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async (prdts) => {
  const params = { end_prdt_qlty_insp_id: '' }
  params.end_prdt_qlty_insp_id = prdts.end_prdt_qlty_insp_id
console.log(prdts)
  let result = await axios
    .get('/api/endPrdtQltyInspInferSearch', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  emit('select', {
    detailData: result.data,
    searchParams: prdts,
  }) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>

<style scoped>
/* 모달 바디 */
.modal-body {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* 검색 영역 */
.mb-3 {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.d-flex {
  display: flex;
  align-items: center;
}

.gap-2 {
  gap: 0.75rem;
}

/* 인풋 그룹 */
:deep(.input-group-text) {
  min-width: 100px;
  font-weight: 600;
  font-size: 12px;
  color: #2c3e50;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-right: none;
  border-radius: 8px 0 0 8px;
}

:deep(.form-control) {
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 0 8px 8px 0;
  background-color: #f8f9fa;
}

input[type="date"].form-control {
  border-radius: 8px;
}

/* 검색 버튼 */
.btn-secondary {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  height: 34px;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* 테이블 */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 12px;
  margin-bottom: 0;
  border: 1px solid #bcbcbc;
  border-radius: 8px;
  overflow: hidden;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.table thead th {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: 34px;
}

.table thead th:first-child {
  border-top-left-radius: 4px;
}

.table thead th:last-child {
  border-top-right-radius: 4px;
}

.table tbody td {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: 34px;
  vertical-align: middle;
  text-align: center;
}

.table tbody td:last-child {
  border-right: none;
}

.table tbody tr {
  height: 34px;
  transition: all 0.2s ease;
  background: #fff;
  cursor: pointer;
}

.table tbody tr:hover td {
  background-color: rgba(33, 37, 41, 0.075) !important;
}

/* 모달 푸터 버튼 */
:deep(.modal-footer .btn) {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}

:deep(.modal-footer .btn:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* 반응형 */
@media (max-width: 1600px) {
  .btn-secondary,
  :deep(.modal-footer .btn) {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}
</style>