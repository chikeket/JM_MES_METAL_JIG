<script setup>
import { CFormInput } from '@coreui/vue'
import { AgGridVue } from 'ag-grid-vue3'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule, MenuModule])

const vDate = ref(new Date(2022, 2, 1))
const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}

const columns = [
  {
    field: 'PRDT_ID',
    headerName: '코드',
  },
  {
    field: 'PRDT_NM',
    headerName: '제품명',
  },
  {
    field: 'SPEC',
    headerName: '규격',
  },
  {
    field: 'UNIT',
    headerName: '단위',
  },
  {
    field: 'PLAN_QY',
    headerName: '계획수량',
  },
  {
    field: 'drctqy',
    headerName: '지시수량',
  },
  {
    field: 'base_quantity',
    headerName: '기지시수량',
  },
  {
    field: 'Unspecified_quantity',
    headerName: '미지시수량',
  },
  {
    field: 'PRIORT',
    headerName: '우선순위',
  },
  {
    field: 'RM',
    headerName: '비고',
  },
]
const items = ref([
  {
    PRDT_ID: 'a_red_030',
    PRDT_NM: '메탈지그A',
    SPEC: '30',
    UNIT: 'g',
    PLAN_QY: 300,
    drctqy: 1,
    base_quantity: 300,
    Unspecified_quantity: 300,
    PRIORT: 1,
    RM: '정기생산',
  },
  {
    PRDT_ID: 'a_red_030',
    PRDT_NM: '메탈지그A',
    SPEC: '30',
    UNIT: 'g',
    PLAN_QY: 300,
    drctqy: 300,
    base_quantity: 300,
    Unspecified_quantity: 300,
    PRIORT: 1,
    RM: '정기생산',
  },
])
</script>
<template>
  <div class="mb-3 d-grid gap-2 d-md-flex justify-content-md-end">
    <CButton color="primary">신규</CButton>
    <CButton color="info">생산지시서조회</CButton>
    <CButton color="success">저장</CButton>
    <CButton color="warning">수정</CButton>
    <CButton color="danger">삭제</CButton>
  </div>

  <CInputGroup class="mb-3">
    <CInputGroupText id="basic-addon1">생산지시제목</CInputGroupText>
    <CFormInput placeholder="생산지시제목" aria-label="Username" aria-describedby="basic-addon1" />
    <CInputGroupText id="basic-addon1">등록일자</CInputGroupText>
    <input style="border: 1px solid #dbdfe6" type="date" id="REG_DT" />
    <CInputGroupText id="basic-addon1">생산시작일자</CInputGroupText>
    <input style="border: 1px solid #dbdfe6" type="date" id="PROD_DRCT_FR_DT" />
    <CInputGroupText id="basic-addon1">생산종료일자</CInputGroupText>
    <input style="border: 1px solid #dbdfe6" type="date" id="PROD_DRCT_TO_DT" />
  </CInputGroup>
  <CInputGroup class="mb-3">
    <CInputGroupText>비고</CInputGroupText>
    <CFormTextarea aria-label="With textarea"></CFormTextarea>
  </CInputGroup>
  <div class="mb-3 d-grid gap-2 d-md-flex justify-content-md-end">
    <CButton color="primary">제품조회</CButton>
    <CButton color="info">생산계획서조회</CButton>
    <CButton color="dark">삭제</CButton>
  </div>
  <AgGridVue
    class="ag-theme-alpine"
    style="width: 100%; height: 400px"
    :rowData="rowData"
    :columnDefs="columnDefs"
    rowSelection="single"
  />
</template>

<style></style>
