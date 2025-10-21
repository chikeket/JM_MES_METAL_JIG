<template>
  <CContainer fluid>
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="search">조회</CButton>
      <CButton color="secondary">초기화</CButton>
    </div>

    <c-card-body class="container-fluid">
      <div class="search-filter-box mb-2">
      <!-- 입력 폼 -->
      <c-form>
        <c-row class="mb-3 gx-2">
          <c-col md="3">
            <c-form-label for="prod_plan_id">계획서ID</c-form-label>
            <c-form-input v-model="form.prod_plan_id" id="prod_plan_id" />
          </c-col>
          <c-col md="3">
            <c-form-label for="prod_plan_nm">계획서제목</c-form-label>
            <c-form-input v-model="form.prod_plan_nm" id="prod_plan_nm" />
          </c-col>
          <c-col md="3">
            <c-form-label for="prod_expc_fr_dt">생산시작예정</c-form-label>
            <c-form-input v-model="form.prod_expc_fr_dt" id="prod_expc_fr_dt" />
          </c-col>
          <c-col md="3">
            <c-form-label for="prod_expc_to_dt">생산종료예정</c-form-label>
            <c-form-input v-model="form.prod_expc_to_dt" id="prod_expc_to_dt" />
          </c-col>
        </c-row>
        <c-row class="mb-3 gx-2">
          <c-col md="3">
            <c-form-label for="prdt_id">제품ID</c-form-label>
            <c-form-input v-model="form.prdt_id" id="prdt_id" />
          </c-col>
          <c-col md="3">
            <c-form-label for="prdt_nm">제품명</c-form-label>
            <c-form-input v-model="form.prdt_nm" id="prdt_nm" />
          </c-col>
          <c-col md="3">
            <c-form-label for="prdt_opt_nm">옵션명</c-form-label>
            <c-form-input v-model="form.prdt_opt_nm" id="prdt_opt_nm" />
          </c-col>
          <c-col md="3">
            <c-form-label for="reg_dt">등록일자</c-form-label>
            <c-form-input type="date" v-model="form.reg_dt" id="reg_dt" />
          </c-col>
        </c-row>
        <c-row class="mb-3 gx-2"> </c-row>
      </c-form>
</div>
<div style="max-height: 400px; overflow-y: auto;">
      <!-- 테이블 -->
      <c-table hover bordered small class="align-middle">
        <c-table-head color="dark">
          <c-table-row>
            <c-table-header-cell class="sticky-header">계획서ID</c-table-header-cell>
            <c-table-header-cell class="sticky-header">계획서 제목</c-table-header-cell>
            <c-table-header-cell class="sticky-header">계획서 비고</c-table-header-cell>
            <c-table-header-cell class="sticky-header">제품명</c-table-header-cell>
            <c-table-header-cell class="sticky-header">옵션명</c-table-header-cell>
            <c-table-header-cell class="sticky-header">수량</c-table-header-cell>
            <c-table-header-cell class="sticky-header">단위</c-table-header-cell>
            <c-table-header-cell class="sticky-header">우선순위</c-table-header-cell>
            <c-table-header-cell class="sticky-header">등록일자</c-table-header-cell>
            <c-table-header-cell class="sticky-header">생산 시작일자</c-table-header-cell>
            <c-table-header-cell class="sticky-header">생산 종료일자</c-table-header-cell>
            <c-table-header-cell class="sticky-header">비고</c-table-header-cell>
          </c-table-row>
        </c-table-head>
        <c-table-body>
          <c-table-row v-for="(item, index) in tableData" :key="index">
            <c-table-data-cell>{{ item.prod_plan_id }}</c-table-data-cell>
            <c-table-data-cell>{{ item.prod_plan_nm }}</c-table-data-cell>
            <c-table-data-cell>{{ item.rm }}</c-table-data-cell>
            <c-table-data-cell>{{ item.prdt_nm }}</c-table-data-cell>
            <c-table-data-cell>{{ item.opt_nm }}</c-table-data-cell>
            <c-table-data-cell>{{ item.plan_qy }}</c-table-data-cell>
            <c-table-data-cell>{{ item.unit }}</c-table-data-cell>
            <c-table-data-cell>{{ item.priort }}</c-table-data-cell>
            <c-table-data-cell>{{
              userDateUtils.dateFormat(item.reg_dt, 'yyyy-MM-dd')
            }}</c-table-data-cell>
            <c-table-data-cell>{{
              userDateUtils.dateFormat(item.prod_expc_fr_dt, 'yyyy-MM-dd')
            }}</c-table-data-cell>
            <c-table-data-cell>{{
              userDateUtils.dateFormat(item.prod_expc_to_dt, 'yyyy-MM-dd')
            }}</c-table-data-cell>
            <c-table-data-cell>{{ item.rm_deta }}</c-table-data-cell>
          </c-table-row>
        </c-table-body>
      </c-table>
      </div>
    </c-card-body>
  </CContainer>
</template>

<script setup>
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CContainer,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/vue'
import { ref } from 'vue'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'
const form = ref({
  prod_plan_id: '',
  prod_plan_nm: '',
  prod_expc_fr_dt: '',
  prod_expc_to_dt: '',
  prdt_id: '',
  prdt_nm: '',
  prdt_opt_nm: '',
  reg_dt: userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd'),
})

const tableData = ref([
  // {
  //   prod_plan_id: '1002',
  //   prod_plan_nm: '정기생산',
  //   rm: '평가생산',
  //   prdt_nm: '제품명',
  //   prdt_opt_nm: '옵션명',
  //   plan_qy: 300,
  //   unit: 'EA',
  //   priort: 2,
  //   reg_dt: '2025-10-12',
  //   prod_expc_fr_dt: '2025-11-20',
  //   prod_expc_to_dt: '2025-11-21',
  //   rm_deta: '메모',
  // },
])

const search = async () => {
  const params = {
    prod_plan_id: form.value.prod_plan_id || '',
    prod_plan_nm: form.value.prod_plan_nm || '',
    prod_expc_fr_dt: form.value.prod_expc_fr_dt || '1970-01-01',
    prod_expc_to_dt: form.value.prod_expc_to_dt || '2125-01-01',
    prdt_id: form.value.prdt_id || '',
    prdt_nm: form.value.prdt_nm || '',
    opt_nm: form.value.opt_nm || '',
    reg_dt: form.value.reg_dt,
  }
  console.log(params)
  let result = await axios
    .get('/api/prodPlanBoardListSearch', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  tableData.value = result.data
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

:deep(.sticky-header) {
  position: sticky;
  top: 0;
  background-color: #343a40;
  z-index: 1;
  color: #fff; /* 텍스트가 잘 보이도록 */
  font-weight: bold;
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