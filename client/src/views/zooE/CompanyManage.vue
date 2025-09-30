<template>
  <CContainer fluid class="p-0 m-0" style="width:100vw; height:100vh; overflow: hidden;">
    <!-- 헤더 -->
    <CCard class="mb-2 h-100 d-flex flex-column m-2 rounded">
      <CCardHeader>
        <strong>공급/납품 관리</strong>
      </CCardHeader>

      <CCardBody class="d-flex flex-column p-3" style="height:calc(100% - 56px);">
        <!-- 상단 필터 + 버튼 -->
        <CRow class="align-items-end mb-4 g-3">
          <!-- 필터 그룹 -->
          <CCol :md="8" class="d-flex align-items-end gap-3">
            <div class="d-flex align-items-center gap-2">
              <CFormLabel style="width:100px;">업체유형</CFormLabel>
              <CFormSelect v-model="filters.type" style="width:180px">
                <option value="">전체</option>
                <option value="customer">고객사</option>
                <option value="supplier">공급업체</option>
              </CFormSelect>
            </div>
            <div class="d-flex align-items-center gap-2">
              <CFormLabel style="width:100px;">상태</CFormLabel>
              <CFormSelect v-model="filters.status" style="width:180px">
                <option value="">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </CFormSelect>
            </div>
            <div class="d-flex align-items-center gap-2">
              <CFormLabel style="width:100px;">업체명</CFormLabel>
              <CFormSelect v-model="filters.name" style="width:180px">
                <option value="">선택해주세요</option>
                <option v-for="item in gridData" :key="item.id" :value="item.name">{{ item.name }}</option>
              </CFormSelect>
            </div>
          </CCol>

          <!-- 버튼 그룹 -->
          <CCol :md="4" class="d-flex justify-content-end gap-2">
            <CButton color="primary" @click="onSearch">조회</CButton>
            <CButton color="secondary" @click="onReset">초기화</CButton>
          </CCol>
        </CRow>

        <!-- 본문 - 좌측 그리드 / 우측 상세폼 -->
        <CRow class="flex-grow-1" style="overflow:hidden;">
          <!-- 좌측 그리드, 스크롤만 좌측에 -->
          <CCol :md="6" class="h-100" style="overflow-y:auto;">
            <CTable bordered hover class="rounded" style="table-layout: fixed; width:100%; background:white;">
              <CTableHead class="bg-light text-secondary fw-bold rounded-top">
                <CTableRow>
                  <CTableHeaderCell>업체 ID</CTableHeaderCell>
                  <CTableHeaderCell>업체유형</CTableHeaderCell>
                  <CTableHeaderCell>업체명</CTableHeaderCell>
                  <CTableHeaderCell>대표자명</CTableHeaderCell>
                  <CTableHeaderCell>담당자명</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in filteredData"
                  :key="index"
                  @click="onSelect(item)"
                  :class="{ 'table-active': selectedRow === index }"
                >
                  <CTableDataCell>{{ item.id }}</CTableDataCell>
                  <CTableDataCell>{{ item.customerSupplier === 'customer' ? '고객사' : '공급업체' }}</CTableDataCell>
                  <CTableDataCell>{{ item.name }}</CTableDataCell>
                  <CTableDataCell>{{ item.ceo }}</CTableDataCell>
                  <CTableDataCell>{{ item.managerName }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in Math.max(0,10 - filteredData.length)" :key="'empty-'+i">
                  <CTableDataCell colspan="5">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCol>

          <!-- 우측 상세 폼 -->
          <CCol :md="6" class="h-100 d-flex flex-column">
            <CCard class="p-3 h-100 rounded d-flex flex-column">
              <!-- 신규, 저장 삭제 버튼 우측 상단 -->
              <div class="d-flex justify-content-end gap-2 mb-3">
                <CButton color="primary" @click="onNew">신규</CButton>
                <CButton color="success" @click="onSave">저장</CButton>
                <CButton color="danger" @click="onDelete">삭제</CButton>
              </div>

              <div class="flex-grow-1 overflow-y-auto">
                <div class="mb-3">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <CFormLabel style="min-width:120px;">업체 ID</CFormLabel>
                    <CFormSelect v-model="form.id" :options="gridData.map(i => i.id)" style="flex:1" />
                  </div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <CFormLabel style="min-width:120px;">사업자 등록번호</CFormLabel>
                    <CFormSelect v-model="form.businessNo" :options="gridData.map(i => i.businessNo)" style="flex:1" />
                  </div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <CFormLabel style="min-width:120px;">대표자명</CFormLabel>
                    <CFormSelect v-model="form.ceo" :options="gridData.map(i => i.ceo)" style="flex:1" />
                  </div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <CFormLabel style="min-width:120px;">대표 이메일</CFormLabel>
                    <CFormSelect v-model="form.email" :options="gridData.map(i => i.email)" style="flex:1" />
                  </div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <CFormLabel style="min-width:120px;">등록일자</CFormLabel>
                    <CFormSelect v-model="form.regDate" :options="gridData.map(i => i.regDate)" style="flex:1" />
                  </div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <CFormLabel style="min-width:120px;">담당자명</CFormLabel>
                    <CFormSelect v-model="form.managerName" :options="gridData.map(i => i.managerName)" style="flex:1" />
                  </div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <CFormLabel style="min-width:120px;">담당자 연락처</CFormLabel>
                    <CFormSelect v-model="form.managerPhone" :options="gridData.map(i => i.managerPhone)" style="flex:1" />
                  </div>
                </div>

                <div class="mb-3 d-flex flex-column gap-3">
                  <div class="d-flex align-items-center gap-4 mb-2" role="radiogroup" aria-labelledby="customerSupplier-label">
                    <CFormLabel id="customerSupplier-label" style="min-width:120px;">업체유형</CFormLabel>
                    <label class="form-check-label">
                      <input type="radio" class="form-check-input" value="customer" v-model="form.customerSupplier" />
                      고객사
                    </label>
                    <label class="form-check-label ms-3">
                      <input type="radio" class="form-check-input" value="supplier" v-model="form.customerSupplier" />
                      공급업체
                    </label>
                  </div>
                  <div class="d-flex align-items-center gap-4 mb-2" role="radiogroup" aria-labelledby="status-label">
                    <CFormLabel id="status-label" style="min-width:120px;">상태</CFormLabel>
                    <label class="form-check-label">
                      <input type="radio" class="form-check-input" value="active" v-model="form.status" />
                      활성
                    </label>
                    <label class="form-check-label ms-3">
                      <input type="radio" class="form-check-input" value="inactive" v-model="form.status" />
                      비활성
                    </label>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <CFormLabel style="min-width:120px;">대표 연락처</CFormLabel>
                  <CFormInput v-model="form.ceoPhone" placeholder="대표 연락처 입력" style="flex:1" />
                </div>
              </div>
            </CCard>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const filters = reactive({ type:'', status:'', name:'' })

const form = reactive({
  id:'', businessNo:'', ceo:'', email:'', regDate:'',
  managerName:'', managerPhone:'', name:'', type:'',
  customerSupplier:'customer', ceoPhone:'', status:'active'
})

const selectedRow = ref(null)
const gridData = ref([
  { id:'C001', code:'C001', name:'삼성전자', businessNo:'123-45-67890', ceo:'홍길동', email:'hong@test.com', regDate:'2025-09-30', managerName:'김부장', managerPhone:'010-1234-5678', type:'A', customerSupplier:'customer', ceoPhone:'010-1111-1111', status:'active' },
  { id:'C002', code:'C002', name:'LG전자', businessNo:'987-65-43210', ceo:'김철수', email:'kim@test.com', regDate:'2025-09-30', managerName:'박대리', managerPhone:'010-2345-6789', type:'B', customerSupplier:'supplier', ceoPhone:'010-2222-2222', status:'inactive' },
])

const filteredData = computed(() => gridData.value.filter(item =>
  (!filters.type || (item.customerSupplier === filters.type)) &&
  (!filters.status || item.status === filters.status) &&
  (!filters.name || item.name.includes(filters.name))
))

const onSearch = () => {
  selectedRow.value = null
}

const onReset = () => {
  filters.type = ''
  filters.status = ''
  filters.name = ''
  selectedRow.value = null
}

const onSelect = (item) => {
  Object.assign(form, item)
  selectedRow.value = filteredData.value.indexOf(item)
}

const onFormReset = () => {
  Object.assign(form, {
    id: '',
    businessNo: '',
    ceo: '',
    email: '',
    regDate: '',
    managerName: '',
    managerPhone: '',
    name: '',
    type: '',
    customerSupplier: 'customer',
    ceoPhone: '',
    status: 'active'
  })
  selectedRow.value = null
}

const onNew = () => {
  onFormReset()
}

const onSave = () => {
  const idx = gridData.value.findIndex(d => d.id === form.id)
  if (idx >= 0) {
    gridData.value[idx] = { ...form }
  } else {
    form.id = 'C' + String(gridData.value.length + 1).padStart(3, '0')
    gridData.value.push({ ...form })
  }
  onFormReset()
}

const onDelete = () => {
  const idx = gridData.value.findIndex(d => d.id === form.id)
  if (idx >= 0) {
    gridData.value.splice(idx, 1)
  }
  onFormReset()
}
</script>

<style scoped>
/* 좌측 그리드 헤더 배경 및 텍스트 색상 */
.ctable thead {
  background-color: #f8f9fa !important; /* 연한 회색배경 */
  color: #6c757d !important;  /* 진한 회색 */
  font-weight: 600;
  border-radius: 0.75rem 0.75rem 0 0;
}

/* 좌측 그리드 둥근모서리와 그림자 효과 */
.ctable {
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.25rem rgb(0 0 0 / 0.075);
}

/* 좌측 그리드 활성행 배경색 */
.ctable tr.table-active {
  background-color: #e9ecef !important;
}

/* 페이지 전체 수직 스크롤 제거 */
html, body, #app {
  overflow-y: hidden !important;
  height: 100%;
}

/* 좌측 그리드 스크롤 강제 표시 */
.c-col-scrollable {
  overflow-y: auto !important;
}

/* 좌측, 우측 세로 폼 그룹 공간 띄우기 */
.form-vertical-group > * + * {
  margin-top: 12px;
}
</style>
