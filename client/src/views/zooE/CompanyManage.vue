<template>
  <CContainer fluid class="h-100 d-flex flex-column p-0 m-0">
    <CCard class="flex-grow-1 d-flex flex-column overflow-hidden m-0 h-100">
      <CCardBody class="p-2 d-flex flex-column overflow-hidden flex-grow-1 min-vh-0">

        <!-- 상단 버튼 -->
        <div class="d-flex justify-content-end mb-2 gap-2 flex-wrap">
          <CButton color="secondary" size="sm" @click="onSearch">조회</CButton>
          <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
        </div>

        <!-- 상단 폼 -->
        <CCard class="mb-2">
          <CCardBody>
            <CRow class="g-3">
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
                <CFormInput v-model="filters.name" size="sm" placeholder="입력해주세요." />
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

        <!-- 본문: 좌측 그리드 + 우측 상세폼 -->
        <CRow class="flex-grow-1 overflow-hidden g-2">
          <!-- 좌측 그리드 -->
          <CCol :md="6" class="d-flex flex-column overflow-hidden">
            <CCard class="flex-grow-1 overflow-hidden d-flex flex-column">
              <CCardBody class="p-0 d-flex flex-column">
                <div style="flex: 1; overflow-y: auto;">
                  <CTable bordered hover class="mb-0" style="border-collapse: collapse;">
                    <CTableHead style="position: sticky; top: 0; z-index: 1;">
                      <CTableRow class="text-center" style="font-weight: bold; background-color: #e9ecef;">
                        <CTableHeaderCell style="background-color: #e9ecef;">업체 ID</CTableHeaderCell>
                        <CTableHeaderCell style="background-color: #e9ecef;">업체유형</CTableHeaderCell>
                        <CTableHeaderCell style="background-color: #e9ecef;">업체명</CTableHeaderCell>
                        <CTableHeaderCell style="background-color: #e9ecef;">대표자명</CTableHeaderCell>
                        <CTableHeaderCell style="background-color: #e9ecef;">담당자명</CTableHeaderCell>
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

                      <!-- 빈 줄 고정 -->
                      <CTableRow v-for="i in emptyRows" :key="'empty-'+i">
                        <CTableDataCell colspan="5" style="height: 32px;">&nbsp;</CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- 우측 상세폼 -->
          <CCol :md="6" class="d-flex flex-column overflow-hidden">
            <!-- 버튼 -->
            <div class="d-flex justify-content-end gap-2 mb-2">
              <CButton color="secondary" size="sm" @click="onNew">신규</CButton>
              <CButton color="secondary" size="sm" @click="onSave">저장</CButton>
              <CButton color="danger" size="sm" @click="onDelete">삭제</CButton>
            </div>
            <CCard class="flex-grow-1 overflow-hidden d-flex flex-column">
              <CCardBody class="p-3 overflow-auto flex-grow-1 right-form-cardbody">
                <div style="flex:1; overflow-y:auto;">
                  <CRow class="mb-2" v-for="key in fieldOrder" :key="key">
                    <CCol :md="3" class="text-end pe-1">
                      <CFormLabel class="mb-0 pt-1 small">{{ fieldLabels[key] }}</CFormLabel>
                    </CCol>
                    <CCol :md="7" class="ps-2">
                      <!-- 일반 입력 -->
                      <CFormInput
                        v-if="!['status','customerSupplier','regDate'].includes(key)"
                        v-model="form[key]"
                        size="sm"
                        placeholder="입력해주세요."
                      />
                      <!-- 날짜 -->
                      <CFormInput
                        v-else-if="key === 'regDate'"
                        v-model="form[key]"
                        type="date"
                        size="sm"
                      />
                      <!-- 업체유형 -->
                      <div v-else-if="key === 'customerSupplier'" class="d-flex align-items-center gap-3">
                        <CFormCheck type="radio" name="customerSupplier" label="고객사" value="customer" v-model="form.customerSupplier" />
                        <CFormCheck type="radio" name="customerSupplier" label="공급업체" value="supplier" v-model="form.customerSupplier" />
                      </div>
                      <!-- 상태 -->
                      <div v-else-if="key === 'status'" class="d-flex align-items-center gap-3">
                        <CFormCheck type="radio" name="status" label="활성" value="active" v-model="form.status" />
                        <CFormCheck type="radio" name="status" label="비활성" value="inactive" v-model="form.status" />
                      </div>
                    </CCol>
                  </CRow>
                </div>
              </CCardBody>
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

<style scoped>
/* 전체 기본 폰트 설정 */
:deep(*) {
  font-family: '맑은 고딕', Malgun Gothic, sans-serif;
  line-height: 1.4;
}

/* 버튼 스타일 */
:deep(.btn) {
  font-size: 11px;
}

/* 폼 라벨 */
:deep(label),
:deep(.form-label) {
  font-size: 11px;
  color: #444;
  font-weight: normal;
}

/* 입력 필드 (input, select 등) */
:deep(input),
:deep(select),
:deep(textarea),
:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
  font-weight: normal;
}

/* 테이블 헤더 */
:deep(th),
:deep(.table thead th) {
  font-size: 12px;
  font-weight: bold;
  background-color: #e9ecef;
  color: #212529;
  text-align: center;
}

/* 테이블 본문 셀 */
:deep(td),
:deep(.table tbody td) {
  font-size: 11px;
  color: #333;
}

/* 체크박스 라벨 (숨겨진 텍스트 방지용) */
:deep(.form-check-label) {
  font-size: 11px;
}

/* 날짜 입력 필드 */
:deep(input[type="date"]) {
  font-size: 12px;
}

/* 반응형 대응 (선택사항) */
@media (max-width: 768px) {
  :deep(label),
  :deep(.form-label),
  :deep(input),
  :deep(select),
  :deep(.btn),
  :deep(td),
  :deep(th) {
    font-size: 11px !important;
  }
}
</style>