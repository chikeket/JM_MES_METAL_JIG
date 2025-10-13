<template>
  <CContainer fluid>
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="search">조회</CButton>
      <CButton color="secondary">초기화</CButton>
    </div>

    <c-card-body class="container-fluid">
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

      <!-- 테이블 -->
      <c-table hover bordered small class="align-middle">
        <c-table-head color="dark">
          <c-table-row>
            <c-table-header-cell>계획서ID</c-table-header-cell>
            <c-table-header-cell>계획서 제목</c-table-header-cell>
            <c-table-header-cell>계획서 비고</c-table-header-cell>
            <c-table-header-cell>제품명</c-table-header-cell>
            <c-table-header-cell>옵션명</c-table-header-cell>
            <c-table-header-cell>수량</c-table-header-cell>
            <c-table-header-cell>단위</c-table-header-cell>
            <c-table-header-cell>우선순위</c-table-header-cell>
            <c-table-header-cell>등록일자</c-table-header-cell>
            <c-table-header-cell>생산 시작일자</c-table-header-cell>
            <c-table-header-cell>생산 종료일자</c-table-header-cell>
            <c-table-header-cell>비고</c-table-header-cell>
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
    .get('/api/prodDrctBoardListSearch', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  tableData.value = result.data
}
</script>
