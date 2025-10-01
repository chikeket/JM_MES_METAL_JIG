<template>
  <CContainer fluid class="h-100 d-flex flex-column p-0 m-0">
    <CCard class="flex-grow-1 d-flex flex-column overflow-hidden m-0 h-100">
      <CCardBody class="p-2 d-flex flex-column overflow-hidden flex-grow-1 min-vh-0">

        <!-- 상단 버튼 -->
        <div class="d-flex justify-content-end mb-2 gap-2 flex-wrap">
          <CButton color="secondary" size="sm" @click="onSearch">조회</CButton>
          <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
          <CButton color="secondary" size="sm" @click="onSave">저장</CButton>
          <CButton color="danger" size="sm" @click="onDelete">삭제</CButton>
        </div>

        <!-- 상단 폼 -->
        <CCard class="mb-2">
          <CCardBody>
            <CRow class="g-3">
              <CCol :md="3">
                <CFormLabel class="small mb-2">항목코드</CFormLabel>
                <CFormInput v-model="form.itemCode" size="sm" placeholder="입력해주세요." />
              </CCol>
              <CCol :md="3">
                <CFormLabel class="small mb-2">항목명</CFormLabel>
                <CFormInput v-model="form.itemName" size="sm" placeholder="입력해주세요." />
              </CCol>
              <CCol :md="2">
                <CFormLabel class="small mb-2">타입</CFormLabel>
                <CFormSelect v-model="form.type" size="sm">
                  <option value="">선택</option>
                  <option value="정량">정량</option>
                  <option value="미달">미달</option>
                </CFormSelect>
              </CCol>
              <CCol :md="2">
                <CFormLabel class="small mb-2">버전</CFormLabel>
                <CFormInput v-model="form.version" size="sm" placeholder="예: 1.0" />
              </CCol>
              <CCol :md="2">
                <CFormLabel class="small mb-2">상태</CFormLabel>
                <CFormSelect v-model="form.status" size="sm">
                  <option value="active">사용</option>
                  <option value="inactive">미사용</option>
                </CFormSelect>
              </CCol>
              <CCol :md="2">
                <CFormLabel class="small mb-">기준치</CFormLabel>
                <CFormInput v-model="form.standard" size="sm" placeholder="입력" />
              </CCol>
              <CCol :md="2">
                <CFormLabel class="small mb-2">오차범위</CFormLabel>
                <CFormInput v-model="form.tolerance" size="sm" placeholder="입력" />
              </CCol>
              <CCol :md="3">
                <CFormLabel class="small mb-2">등록일</CFormLabel>
                <CFormInput type="date" v-model="form.createdAt" size="sm" />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <!-- 신규/저장/삭제 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="onNew">신규</CButton>
          <CButton color="secondary" size="sm" @click="onSave">저장</CButton>
          <CButton color="danger" size="sm" @click="onDelete">삭제</CButton>
        </div>

        <!-- 본문: 그리드 -->
        <CCard class="flex-grow-1 overflow-hidden d-flex flex-column">
          <CCardBody class="p-0 d-flex flex-column">
            <div style="flex: 1; overflow-y: scroll;">
              <CTable bordered hover class="mb-0" style="min-height: 320px; border-collapse: collapse;">
                <CTableHead style="position: sticky; top: 0; z-index: 1;">
                  <CTableRow class="text-center" style="font-weight: bold; background-color: #e9ecef;">
                    <CTableHeaderCell style="width: 50px; background-color: #e9ecef;">
                      <CFormCheck :checked="allChecked" @change="toggleAllCheck" />
                    </CTableHeaderCell>
                    <CTableHeaderCell style="background-color: #e9ecef;">품목코드</CTableHeaderCell>
                    <CTableHeaderCell style="background-color: #e9ecef;">품목명</CTableHeaderCell>
                    <CTableHeaderCell style="background-color: #e9ecef;">담당자명</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow v-for="(item, idx) in displayTableData" :key="idx">
                    <CTableDataCell class="text-center" style="background-color: #f8f9fa;">
                      <CFormCheck v-model="item.checked" />
                    </CTableDataCell>
                    <CTableDataCell>{{ item.productCode }}</CTableDataCell>
                    <CTableDataCell>{{ item.productName }}</CTableDataCell>
                    <CTableDataCell>{{ item.manager }}</CTableDataCell>
                  </CTableRow>

                  <!-- 빈 줄로 10줄 고정 -->
                  <CTableRow v-for="i in emptyRows" :key="'empty-' + i">
                    <CTableDataCell colspan="4" style="height: 32px;">&nbsp;</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>

      </CCardBody>
    </CCard>
  </CContainer>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

// 상단 폼 데이터
const form = reactive({
  itemCode: '',
  itemName: '',
  type: '',
  version: '',
  status: 'active',
  standard: '',
  tolerance: '',
  createdAt: ''
})

// 하단 그리드 데이터
const tableData = ref([
  { checked: false, productCode: 'P001', productName: '품목 A', manager: '홍길동' },
  { checked: false, productCode: 'P002', productName: '품목 B', manager: '이몽룡' },
  { checked: false, productCode: 'P003', productName: '품목 C', manager: '성춘향' }
])

const displayTableData = computed(() => tableData.value.slice(0, 10))
const emptyRows = computed(() => Math.max(0, 10 - displayTableData.value.length))

// 모든 체크박스가 선택됐는지 계산 (헤더 체크박스 상태)
const allChecked = computed(() => {
  return displayTableData.value.length > 0 && displayTableData.value.every(item => item.checked)
})

// 헤더 체크박스 클릭 시 모두 선택/해제 토글
const toggleAllCheck = (event) => {
  const checked = event.target.checked
  displayTableData.value.forEach(item => (item.checked = checked))
}

// 버튼 핸들러
const onSearch = () => {
  console.log('조회 클릭')
}

const onReset = () => {
  Object.assign(form, {
    itemCode: '',
    itemName: '',
    type: '',
    version: '',
    status: 'active',
    standard: '',
    tolerance: '',
    createdAt: ''
  })
  tableData.value.forEach(row => (row.checked = false))
}

const onNew = () => {
  onReset()
}

const onSave = () => {
  console.log('저장:', form)
}

const onDelete = () => {
  tableData.value = tableData.value.filter(row => !row.checked)
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
  color: #fff;
  padding: 0.5rem 2rem;
}

/* 폼 라벨 */
:deep(label),
:deep(.form-label) {
  font-size: 11px;
  color: #white;
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