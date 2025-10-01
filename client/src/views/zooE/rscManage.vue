<template>
  <CContainer fluid class="h-100 d-flex flex-column p-0 m-0">
    <CCard class="flex-grow-1 d-flex flex-column overflow-hidden m-0 h-100">
      <CCardBody class="p-2 d-flex flex-column overflow-hidden flex-grow-1 min-vh-0">

        <!-- 상단 버튼 -->
        <div class="d-flex justify-content-end mb-2 gap-2 flex-wrap">
          <CButton color="secondary" size="sm" @click="onSearch">조회</CButton>
          <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
        </div>

        <!-- 검색 필터 -->
        <CCard class="mb-2">
          <CCardBody>
            <CRow class="g-3">
              <CCol :md="4">
                <CFormLabel class="small mb-1">자재명</CFormLabel>
                <CFormInput v-model="filters.materialName" size="sm" placeholder="입력해주세요." />
              </CCol>
              <CCol :md="4">
                <CFormLabel class="small mb-1">자재분류타입</CFormLabel>
                <CFormInput v-model="filters.materialType" size="sm" placeholder="입력해주세요." />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <!-- 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="onNew">신규</CButton>
          <CButton color="secondary" size="sm" @click="onSave">저장</CButton>
          <CButton color="danger" size="sm" @click="onDelete">삭제</CButton>
        </div>

        <!-- 메인 영역 -->
        <CRow class="g-2 flex-grow-1 min-vh-0">
          <!-- 좌측 테이블 -->
          <CCol :md="6" class="d-flex flex-column min-vh-0">
            <CCard class="rounded flex-grow-1 d-flex flex-column overflow-hidden">
              <CCardBody class="p-0 flex-grow-1 overflow-auto">
                <CTable bordered hover class="ctable mb-0">
                  <CTableHead class="sticky-top bg-light">
                    <CTableRow class="text-center">
                      <CTableHeaderCell>자재코드</CTableHeaderCell>
                      <CTableHeaderCell>자재분류타입</CTableHeaderCell>
                      <CTableHeaderCell>자재명</CTableHeaderCell>
                      <CTableHeaderCell>규격</CTableHeaderCell>
                      <CTableHeaderCell>수량단위</CTableHeaderCell>
                      <CTableHeaderCell>비고</CTableHeaderCell>
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
                      <CTableDataCell class="text-end">{{ item.materialCode }}</CTableDataCell>
                      <CTableDataCell class="text-start">{{ item.materialType }}</CTableDataCell>
                      <CTableDataCell class="text-start">{{ item.materialName }}</CTableDataCell>
                      <CTableDataCell class="text-start">{{ item.spec }}</CTableDataCell>
                      <CTableDataCell class="text-start">{{ item.unit }}</CTableDataCell>
                      <CTableDataCell class="text-start">{{ item.remark }}</CTableDataCell>
                    </CTableRow>

                    <CTableRow v-for="i in emptyRows" :key="'empty-' + i">
                      <CTableDataCell colspan="6" style="height: 32px;">&nbsp;</CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- 우측 폼 -->
          <CCol :md="6" class="d-flex flex-column min-vh-0">
            <CCard class="flex-grow-1 d-flex flex-column overflow-hidden">
              <CCardBody class="p-3 overflow-auto flex-grow-1">
                <CRow>
                  <!-- 좌측 -->
                  <CCol :md="6">
                    <CRow class="mb-2" v-for="field in ['materialCode', 'materialType', 'materialName']" :key="field">
                      <CCol :md="4" class="pe-1">
                        <CFormLabel class="mb-0 pt-1 small">{{ fieldLabels[field] }}</CFormLabel>
                      </CCol>
                      <CCol :md="8" class="ps-1">
                        <CFormInput v-model="form[field]" size="sm" placeholder="입력해주세요." />
                      </CCol>
                    </CRow>
                  </CCol>

                  <!-- 우측 -->
                  <CCol :md="6">
                    <CRow class="mb-2" v-for="field in ['spec', 'unit', 'remark']" :key="field">
                      <CCol :md="4" class="pe-1">
                        <CFormLabel class="mb-0 pt-1 small">{{ fieldLabels[field] }}</CFormLabel>
                      </CCol>
                      <CCol :md="8" class="ps-1">
                        <CFormInput v-model="form[field]" size="sm" placeholder="입력해주세요." />
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>
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

const filters = reactive({ materialName: '', materialType: '' })
const form = reactive({
  materialCode: '',
  materialType: '',
  materialName: '',
  spec: '',
  unit: '',
  remark: ''
})
const fieldLabels = {
  materialCode: '자재코드',
  materialType: '자재분류타입',
  materialName: '자재명',
  spec: '규격',
  unit: '수량단위',
  remark: '비고'
}
const selectedRow = ref(null)

const gridData = ref([
  {
    materialCode: 'M001',
    materialType: '원자재',
    materialName: '철판',
    spec: '200x200',
    unit: 'EA',
    remark: '테스트용'
  },
  {
    materialCode: 'M002',
    materialType: '부자재',
    materialName: '볼트',
    spec: 'M8x20',
    unit: 'EA',
    remark: ''
  }
])

const filteredData = computed(() =>
  gridData.value.filter(item =>
    (!filters.materialName || item.materialName.includes(filters.materialName)) &&
    (!filters.materialType || item.materialType.includes(filters.materialType))
  )
)

const displayData = computed(() => filteredData.value.slice(0, 10))
const emptyRows = computed(() => Math.max(0, 10 - displayData.value.length))

const onSearch = () => { selectedRow.value = null }
const onReset = () => {
  filters.materialName = ''
  filters.materialType = ''
  selectedRow.value = null
}
const onSelect = (item) => {
  Object.assign(form, item)
  selectedRow.value = displayData.value.indexOf(item)
}
const onFormReset = () => {
  Object.assign(form, {
    materialCode: '',
    materialType: '',
    materialName: '',
    spec: '',
    unit: '',
    remark: ''
  })
  selectedRow.value = null
}
const onNew = () => { onFormReset() }
const onSave = () => {
  const idx = gridData.value.findIndex(d => d.materialCode === form.materialCode)
  if (idx >= 0) {
    gridData.value[idx] = { ...form }
  } else {
    form.materialCode = 'M' + String(gridData.value.length + 1).padStart(3, '0')
    gridData.value.push({ ...form })
  }
  onFormReset()
}
const onDelete = () => {
  const idx = gridData.value.findIndex(d => d.materialCode === form.materialCode)
  if (idx >= 0) gridData.value.splice(idx, 1)
  onFormReset()
}
</script>

<style scoped>
:deep(*) {
  font-family: '맑은 고딕', Malgun Gothic, sans-serif;
  font-size: 11px;
  line-height: 1.4;
  color: #000000
}

/* 버튼 스타일 */
:deep(.btn) {
  font-size: 11px;
  color: #fff;
  padding: 0.5rem 2rem;
}

/* 라벨 */
:deep(.form-label) {
  font-size: 11px;
  color: #495057;
}

/* 인풋 */
:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
}

/* 테이블 */
:deep(.ctable) {
  border: 1px solid #dee2e6;
  font-size: 11px;
}

:deep(.ctable th) {
  background-color: #e9ecef;
  font-weight: bold;
  font-size: 12px;
  text-align: center;
}

:deep(.ctable td) {
  vertical-align: middle;
}

:deep(.table-active) {
  background-color: #d9edf7 !important;
}

:deep(.sticky-top) {
  position: sticky;
  top: 0;
  z-index: 2;
}

/* 폼 간격 */
.right-form-cardbody .form-label {
  padding-top: 4px;
}

@media (max-width: 768px) {
  :deep(.form-label),
  :deep(.form-control),
  :deep(.btn),
  :deep(td),
  :deep(th) {
    font-size: 11px !important;
  }
}
</style>
