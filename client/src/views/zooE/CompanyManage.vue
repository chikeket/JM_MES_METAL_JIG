<template>
  <CContainer fluid class="p-3" style="height:100vh; overflow: hidden;">
    <!-- 조회/초기화 버튼 (폼 바깥 우측 상단) -->
    <div class="d-flex justify-content-end mb-2">
      <CButton color="secondary" size="sm" class="me-1" @click="onSearch">조회</CButton>
      <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
    </div>

    <!-- 검색 폼 -->
    <CCard class="mb-3">
      <CCardBody class="p-3">
        <CRow class="g-2 align-items-end">
          <CCol :md="3">
            <CFormLabel class="small mb-1">업체유형</CFormLabel>
            <CFormSelect v-model="filters.type" size="sm">
              <option value="">전체</option>
              <option value="customer">고객사</option>
              <option value="supplier">공급업체</option>
            </CFormSelect>
          </CCol>

          <CCol :md="4">
            <CFormLabel class="small mb-1">업체명</CFormLabel>
            <CFormInput v-model="filters.name" size="sm" placeholder="입력해주세요." class="text-start" />
          </CCol>

          <CCol :md="3">
            <CFormLabel class="small mb-1">상태</CFormLabel>
            <CFormSelect v-model="filters.status" size="sm">
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </CFormSelect>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <!-- 본문: 좌측 그리드 / 우측 입력폼 -->
    <CRow class="h-100 g-3">
<!-- 좌측: 그리드 -->
<CCol :md="6" class="h-100 d-flex flex-column">
  <!-- flex-grow-1 안에 mt-0 제거, 카드 높이 그대로 유지 -->
  <CCard class="flex-grow-1 rounded" style="overflow: hidden; margin-top: 47px;">
 <!-- 우측 버튼 영역 높이만큼 여백 -->
    <CCardBody class="p-0 h-100" style="overflow-y: scroll;">
      <CTable bordered hover class="mb-0">
        <CTableHead style="position: sticky; top: 0; z-index: 10;">
  <CTableRow class="text-center" style="font-weight: bold;">
    <CTableHeaderCell style="background-color: #f1f1f1;">업체 ID</CTableHeaderCell>
    <CTableHeaderCell style="background-color: #f1f1f1;">업체유형</CTableHeaderCell>
    <CTableHeaderCell style="background-color: #f1f1f1;">업체명</CTableHeaderCell>
    <CTableHeaderCell style="background-color: #f1f1f1;">대표자명</CTableHeaderCell>
    <CTableHeaderCell style="background-color: #f1f1f1;">담당자명</CTableHeaderCell>
  </CTableRow>
</CTableHead>

        <CTableBody>
          <CTableRow
            v-for="(item, index) in displayData"
            :key="index"
            @click="onSelect(item)"
            :class="{ 'table-active': selectedRow === index }"
            style="cursor: pointer;"
          >
            <CTableDataCell class="text-end">{{ item.id }}</CTableDataCell>
            <CTableDataCell class="text-start">{{ item.customerSupplier === 'customer' ? '고객사' : '공급업체' }}</CTableDataCell>
            <CTableDataCell class="text-start">{{ item.name }}</CTableDataCell>
            <CTableDataCell class="text-start">{{ item.ceo }}</CTableDataCell>
            <CTableDataCell class="text-start">{{ item.managerName }}</CTableDataCell>
          </CTableRow>

          <CTableRow v-for="i in emptyRows" :key="'empty-'+i">
            <CTableDataCell colspan="5">&nbsp;</CTableDataCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
</CCol>


      <!-- 우측: 상세폼 -->
      <CCol :md="6" class="h-100 d-flex flex-column">
        <!-- 우측 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-3">
          <CButton color="secondary" size="sm" @click="onNew">신규</CButton>
          <CButton color="secondary" size="sm" @click="onSave">저장</CButton>
          <CButton color="danger" size="sm" @click="onDelete">삭제</CButton>
        </div>

        <CCard class="flex-grow-1" style="overflow: hidden;">
          <CCardBody class="p-3" style="overflow-y: auto;">
            <CRow class="mb-2" v-for="key in fieldOrder" :key="key">
              <CCol :md="4" class="text-end">
                <CFormLabel class="mb-0 pt-2">{{ fieldLabels[key] }}</CFormLabel>
              </CCol>
              <CCol :md="8">
                <!-- 일반 입력 -->
                <CFormInput
                  v-if="!['status','customerSupplier','regDate'].includes(key)"
                  v-model="form[key]"
                  size="sm"
                  placeholder="입력해주세요."
                  class="text-start"
                />
                <!-- 날짜 -->
                <CFormInput
                  v-else-if="key === 'regDate'"
                  v-model="form[key]"
                  size="sm"
                  type="date"
                  placeholder="입력해주세요."
                  class="text-start"
                />
<!-- 업체유형 -->
<div v-else-if="key === 'customerSupplier'" class="d-flex align-items-center gap-3">
  <CFormCheck type="radio" name="customerSupplier" label="고객사" value="customer" v-model="form.customerSupplier" />
  <CFormCheck type="radio" name="customerSupplier" label="공급업체" value="supplier" v-model="form.customerSupplier" />
</div>
<!-- 상태 (아래) -->
<div v-else-if="key === 'status'" class="d-flex align-items-center gap-3">
  <CFormCheck type="radio" name="status" label="활성" value="active" v-model="form.status" class="flex-shrink-0" />
  <CFormCheck type="radio" name="status" label="비활성" value="inactive" v-model="form.status" class="flex-shrink-0" />
</div>

              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const filters = reactive({ type:'', status:'', name:'' })
const form = reactive({
  id:'', businessNo:'', ceo:'', email:'', regDate:'',
  managerName:'', managerPhone:'', name:'', customerSupplier:'customer',
  ceoPhone:'', status:'active'
})

const fieldLabels = {
  id: '업체 ID',
  businessNo: '사업자 등록번호',
  name: '업체명',
  ceo: '대표자명',
  email: '대표 이메일',
  ceoPhone: '대표 연락처',
  regDate: '등록일자',
  managerName: '담당자명',
  managerPhone: '담당자 연락처',
  customerSupplier: '업체유형',
  status: '상태'
}
const fieldOrder = ['id','businessNo','name','ceo','email','ceoPhone','regDate','managerName','managerPhone','customerSupplier','status']

const selectedRow = ref(null)
const gridData = ref([
  { id:'C001', name:'삼성전자', businessNo:'123-45-67890', ceo:'홍길동', email:'hong@test.com', regDate:'2025-09-30', managerName:'김부장', managerPhone:'010-1234-5678', customerSupplier:'customer', ceoPhone:'010-1111-1111', status:'active' },
  { id:'C002', name:'LG전자', businessNo:'987-65-43210', ceo:'김철수', email:'kim@test.com', regDate:'2025-09-30', managerName:'박대리', managerPhone:'010-2345-6789', customerSupplier:'supplier', ceoPhone:'010-2222-2222', status:'inactive' },
])

const filteredData = computed(() =>
  gridData.value.filter(item =>
    (!filters.type || item.customerSupplier === filters.type) &&
    (!filters.status || item.status === filters.status) &&
    (!filters.name || item.name.includes(filters.name))
  )
)

const displayData = computed(() => filteredData.value.slice(0, 10))
const emptyRows = computed(() => Math.max(0, 10 - displayData.value.length))

const onSearch = () => { selectedRow.value = null }
const onReset = () => { filters.type=''; filters.status=''; filters.name=''; selectedRow.value=null }
const onSelect = (item) => { Object.assign(form, item); selectedRow.value = displayData.value.indexOf(item) }
const onFormReset = () => { Object.assign(form, { id:'', businessNo:'', ceo:'', email:'', regDate:'', managerName:'', managerPhone:'', name:'', customerSupplier:'customer', ceoPhone:'', status:'active' }); selectedRow.value=null }
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
