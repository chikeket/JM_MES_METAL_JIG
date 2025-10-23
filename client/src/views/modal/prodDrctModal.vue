<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>생산지시조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="mb-3">
          <CInputGroup class="mb-2">
            <CInputGroupText id="addon-ordr-name-1">생산지시명</CInputGroupText>
            <CFormInput v-model="prod_drct_nm" placeholder="생산지시명" />
          </CInputGroup>

          <div class="d-flex gap-2 align-items-center">
            <select class="form-select" style="width: 200px" v-model="pickValue">
              <option value="singleDate">생산지시등록일</option>
              <option value="prod_drct_dt">생산지시일정조회</option>
            </select>

            <!-- 날짜 입력창 -->
            <template v-if="pickValue == 'singleDate'">
              <input type="date" class="form-control" v-model="reg_dt" />
            </template>

            <template v-else-if="pickValue == 'prod_drct_dt'">
              <input type="date" class="form-control" v-model="prod_drct_fr_dt" />
              <span>~</span>
              <input type="date" class="form-control" v-model="prod_drct_to_dt" />
            </template>

            <button class="btn btn-secondary" @click="prdtSearch()" style="width: 70px">
              검색
            </button>
          </div>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>생산지시명</th>
              <th>생산지시시작일</th>
              <th>생산지시종료일</th>
              <th>등록일</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.prod_drct_nm }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.prod_drct_fr_dt, 'yyyy-MM-dd') }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.prod_drct_to_dt, 'yyyy-MM-dd') }}</td>
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
import { ref, defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'
import userDateUtils from '@/utils/useDates.js'
const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])
const close = () => {
  prdtList.value = []
  prod_drct_nm.value = ''
  reg_dt.value = ''
  prod_drct_fr_dt.value = ''
  prod_drct_to_dt.value = ''
  emit('close')
}

const pickValue = ref('singleDate') // 기본값: 코드
const prod_drct_nm = ref('')
const reg_dt = ref('')
const prod_drct_fr_dt = ref('')
const prod_drct_to_dt = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

const prdtSearch = async () => {
  const params = { prod_drct_nm: '', reg_dt: '', prod_drct_fr_dt: '', prod_drct_to_dt: '' }

  params.prod_drct_nm = prod_drct_nm.value
  if (pickValue.value == 'singleDate') {
    if (!reg_dt.value) {
      params.reg_dt = '1970-01-01'
    } else {
      params.reg_dt = reg_dt.value
    }
    params.prod_drct_fr_dt = '1970-01-01'
    params.prod_drct_to_dt = '2125-01-01'
  } else {
    params.reg_dt = '1970-01-01'
    if (prod_drct_fr_dt.value != null && !prod_drct_to_dt.value) {
      params.prod_drct_fr_dt = prod_drct_fr_dt.value
      params.prod_drct_to_dt = '2125-01-01'
    } else if (!prod_drct_fr_dt.value && prod_drct_to_dt.value != null) {
      params.prod_drct_fr_dt = '1970-01-01'
      params.prod_drct_to_dt = prod_drct_to_dt.value
    } else {
      params.prod_drct_fr_dt = prod_drct_fr_dt.value
      params.prod_drct_to_dt = prod_drct_to_dt.value
    }
  }
  console.log(params)
  let result = await axios.get('/api/prodDrctSearch', { params }).catch((err) => console.log(err))
  console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async (prdts) => {
  const params = { prod_drct_id: '' }
  params.prod_drct_id = prdts.prod_drct_id
  let result = await axios
    .get('/api/prodDrctDetaSearch', { params })
    .catch((err) => console.log(err))
  emit('select', {
    detailData: result.data,
    searchParams: {
      prod_drct_id: prdts.prod_drct_id,
      prod_drct_nm: prdts.prod_drct_nm,
      reg_dt: userDateUtils.dateFormat(prdts.reg_dt, 'yyyy-MM-dd'),
      prod_expc_fr_dt: userDateUtils.dateFormat(prdts.prod_drct_fr_dt, 'yyyy-MM-dd'),
      prod_expc_to_dt: userDateUtils.dateFormat(prdts.prod_drct_to_dt, 'yyyy-MM-dd'),
      remark: prdts.rm,
    },
    crudBoolean: false,
  }) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>

<style scoped>
/* 모달 헤더 */
:deep(.modal-header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
}

:deep(.modal-title) {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

/* 모달 바디 */
.modal-body {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: #f5f7fa;
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

.mb-2 {
  margin-bottom: 0.75rem !important;
}

/* 인풋 그룹 */
:deep(.input-group) {
  display: flex;
}

:deep(.input-group-text) {
  min-width: 120px;
  font-weight: 600;
  font-size: 12px;
  color: #2c3e50;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-right: none;
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
}

:deep(.input-group .form-control) {
  border-radius: 0 8px 8px 0;
  border-left: none;
}

/* 날짜 선택 영역 */
.d-flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.align-items-center {
  align-items: center;
}

/* 폼 셀렉트 */
.form-select {
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.form-select:focus {
  border-color: #6c757d;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.1);
}

/* 폼 컨트롤 */
.form-control {
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #6c757d;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.1);
}

input[type="date"].form-control {
  border-radius: 8px;
}

/* 날짜 범위 구분자 */
span {
  font-weight: 600;
  color: #6c757d;
  padding: 0 0.25rem;
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
  white-space: nowrap;
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

/* 모달 푸터 */
:deep(.modal-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 2px solid #e5e7eb;
  background: #f8f9fa;
}

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

@media (max-height: 900px) {
  .modal-body {
    max-height: 350px;
  }
}

@media (max-height: 780px) {
  .modal-body {
    max-height: 300px;
  }
}

@media (max-height: 700px) {
  .modal-body {
    max-height: 250px;
  }
}
</style>