<template>
  <CContainer fluid style="width:100%; height:100vh; padding:0; margin:0; overflow:hidden;">
    <CRow class="h-100 g-0">
      <!-- 좌측 그리드 -->
      <CCol :md="6" class="h-100 p-0">
        <CCard class="mb-0 h-100">
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <strong>공급/납품 관리</strong>
            <div>
              <CButton color="primary" class="me-2" @click="onSearch">조회</CButton>
              <CButton color="secondary" @click="onReset">초기화</CButton>
            </div>
          </CCardHeader>
          <CCardBody style="overflow:auto; height: calc(100% - 56px);">
            <CTable bordered hover style="table-layout: fixed; width: 100%;">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 20%;">회사 코드</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%;">회사 명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%;">사업자 번호</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%;">대표자</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%;">연락처</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in filteredData"
                  :key="index"
                  @click="onSelect(item)"
                  :class="{ 'table-active': selectedRow === index }"
                >
                  <CTableDataCell>{{ item.code }}</CTableDataCell>
                  <CTableDataCell>{{ item.name }}</CTableDataCell>
                  <CTableDataCell>{{ item.businessNo }}</CTableDataCell>
                  <CTableDataCell>{{ item.ceo }}</CTableDataCell>
                  <CTableDataCell>{{ item.phone }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in (10 - filteredData.length)" :key="'empty-' + i">
                  <CTableDataCell colspan="5">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- 우측 폼 (좌측으로 이동) -->
      <CCol :md="6" class="h-100 p-0 d-flex justify-content-start">
        <CCard class="h-100 d-flex flex-column p-3" style="max-width:100%;">
          <div class="d-flex justify-content-end mb-3">
            <CButton color="primary" class="me-2" @click="onNew">신규</CButton>
            <CButton color="success" class="me-2" @click="onSave">저장</CButton>
            <CButton color="danger" @click="onDelete">삭제</CButton>
          </div>

          <div class="flex-grow-1 d-flex flex-column" style="overflow:hidden;">
            <CRow class="mb-3">
              <CCol :md="6" class="d-flex align-items-center">
                <CFormLabel class="me-2 mb-0" style="min-width: 120px;">업체 ID</CFormLabel>
                <CFormInput v-model="form.id" placeholder="업체 ID 입력" />
              </CCol>
              <CCol :md="6" class="d-flex align-items-center">
                <CFormLabel class="me-2 mb-0" style="min-width: 120px;">사업자 등록번호</CFormLabel>
                <CFormInput v-model="form.businessNo" placeholder="사업자 번호 입력" />
              </CCol>
            </CRow>

            <CRow class="mb-3">
              <CCol :md="6" class="d-flex align-items-center">
                <CFormLabel class="me-2 mb-0" style="min-width: 120px;">대표자명</CFormLabel>
                <CFormInput v-model="form.ceo" placeholder="대표자명 입력" />
              </CCol>
              <CCol :md="6" class="d-flex align-items-center">
                <CFormLabel class="me-2 mb-0" style="min-width: 120px;">대표 이메일</CFormLabel>
                <CFormInput v-model="form.email" placeholder="이메일 입력" />
              </CCol>
            </CRow>

            <CRow class="mb-3">
              <CCol :md="6" class="d-flex align-items-center">
                <CFormLabel class="me-2 mb-0" style="min-width: 120px;">등록일자</CFormLabel>
                <CFormInput v-model="form.regDate" type="date" />
              </CCol>
              <CCol :md="6" class="d-flex align-items-center">
                <CFormLabel class="me-2 mb-0" style="min-width: 120px;">담당자명</CFormLabel>
                <CFormInput v-model="form.managerName" placeholder="담당자명 입력" />
              </CCol>
            </CRow>

            <CRow class="mb-3">
              <CCol :md="6" class="d-flex align-items-center">
                <CFormLabel class="me-2 mb-0" style="min-width: 120px;">담당자 연락처</CFormLabel>
                <CFormInput v-model="form.managerPhone" placeholder="연락처 입력" />
              </CCol>

              <CCol :md="6">
                <CRow class="mb-2">
                  <CCol :md="12" class="d-flex align-items-center">
                    <CFormLabel class="me-2 mb-0" style="min-width: 120px;">업체명</CFormLabel>
                    <CFormInput v-model="form.name" placeholder="업체명 입력" />
                  </CCol>
                </CRow>

                <CRow class="mb-2">
                  <CCol :md="12" class="d-flex align-items-center">
                    <CFormLabel class="me-2 mb-0" style="min-width: 120px;">업체유형</CFormLabel>
                    <CFormInput v-model="form.type" placeholder="업체유형 입력" />
                  </CCol>
                </CRow>

                <CRow class="mb-2">
                  <CCol :md="12" class="d-flex align-items-center flex-nowrap">
                    <CFormLabel class="me-2 mb-0" style="min-width: 120px;">고객사/공급업체</CFormLabel>
                    <CFormCheck v-model="form.customerSupplier" type="radio" value="customer" label="고객사" class="me-3" />
                    <CFormCheck v-model="form.customerSupplier" type="radio" value="supplier" label="공급업체" />
                  </CCol>
                </CRow>

                <CRow class="mb-2">
                  <CCol :md="12" class="d-flex align-items-center">
                    <CFormLabel class="me-2 mb-0" style="min-width: 120px;">대표 연락처</CFormLabel>
                    <CFormInput v-model="form.ceoPhone" placeholder="대표 연락처 입력" />
                  </CCol>
                </CRow>

                <CRow>
                  <CCol :md="12" class="d-flex align-items-center flex-nowrap">
                    <CFormLabel class="me-2 mb-0" style="min-width: 120px;">상태</CFormLabel>
                    <CFormCheck v-model="form.status" type="radio" value="active" label="활성" class="me-3" />
                    <CFormCheck v-model="form.status" type="radio" value="inactive" label="비활성" />
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </div>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const filters = reactive({ type: '', status: '', name: '' })

const form = reactive({
  id: '', businessNo: '', ceo: '', email: '', regDate: '',
  managerName: '', managerPhone: '', name: '', type: '',
  customerSupplier: 'customer', ceoPhone: '', status: 'active'
})

const selectedRow = ref(null)
const gridData = ref([
  { id:'C001', code:'C001', name:'삼성전자', businessNo:'123-45-67890', ceo:'홍길동', email:'hong@test.com', regDate:'2025-09-30', managerName:'김부장', managerPhone:'010-1234-5678', type:'A', customerSupplier:'customer', ceoPhone:'010-1111-1111', status:'active' },
  { id:'C002', code:'C002', name:'LG전자', businessNo:'987-65-43210', ceo:'김철수', email:'kim@test.com', regDate:'2025-09-30', managerName:'박대리', managerPhone:'010-2345-6789', type:'B', customerSupplier:'supplier', ceoPhone:'010-2222-2222', status:'inactive' },
])

const filteredData = computed(() =>
  gridData.value.filter(item =>
    (!filters.type || item.type === filters.type) &&
    (!filters.status || item.status === filters.status) &&
    (!filters.name || item.name.includes(filters.name))
  )
)

const onSearch = () => { selectedRow.value = null }
const onReset = () => { filters.type = ''; filters.status=''; filters.name=''; selectedRow.value=null }
const onSelect = (item) => { Object.assign(form, item); selectedRow.value = filteredData.value.indexOf(item) }
const onFormReset = () => {
  Object.assign(form, {
    id:'', businessNo:'', ceo:'', email:'', regDate:'',
    managerName:'', managerPhone:'', name:'', type:'',
    customerSupplier:'customer', ceoPhone:'', status:'active'
  })
  selectedRow.value=null
}
const onNew = () => { onFormReset() }
const onSave = () => {
  const idx = gridData.value.findIndex(d=>d.id===form.id)
  if(idx>=0) gridData.value[idx] = {...form}
  else { form.id='C'+String(gridData.value.length+1).padStart(3,'0'); gridData.value.push({...form}) }
  onFormReset()
}
const onDelete = () => {
  const idx = gridData.value.findIndex(d=>d.id===form.id)
  if(idx>=0) gridData.value.splice(idx,1)
  onFormReset()
}
</script>
