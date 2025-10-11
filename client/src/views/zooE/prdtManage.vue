<template>
  <CContainer fluid class="h-100 d-flex flex-column p-0 m-0">
    <CCard class="flex-grow-1 d-flex flex-column overflow-hidden m-0 h-100">
      <CCardBody class="p-2 d-flex flex-column overflow-hidden flex-grow-1">

        <!-- 상단 조회/초기화 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="handleSearch">조회</CButton>
          <CButton color="secondary" size="sm" @click="handleReset">초기화</CButton>
        </div>

        <!-- 상단폼 -->
        <CCard class="mb-2">
          <CCardBody>
            <CRow class="g-2 align-items-end">
              <CCol :md="3">
                <CFormLabel class="form-label">제품ID</CFormLabel>
                <CFormInput v-model="formData.productId" size="sm" placeholder="제품ID 입력"/>
              </CCol>
              <CCol :md="4">
                <CFormLabel class="form-label">제품명</CFormLabel>
                <CFormInput v-model="formData.productName" size="sm" placeholder="제품명 입력"/>
              </CCol>
              <CCol :md="3">
                <CFormLabel class="form-label">제품상태</CFormLabel>
                <CFormSelect v-model="formData.productStatus" size="sm">
                  <option value="생산가능">생산가능</option>
                  <option value="생산불가">생산불가</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <!-- 신규/저장 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="handleNew">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
        </div>

        <!-- 하단 좌우 그리드 -->
        <CRow class="flex-grow-1 overflow-hidden g-2">

          <!-- 좌측 그리드 -->
          <CCol :md="6" class="d-flex flex-column overflow-hidden gap-2">
            <CCard class="flex-grow-1 d-flex flex-column overflow-hidden">
              <CCardHeader class="d-flex justify-content-end">
                <CButton color="danger" size="sm" @click="handleLeftDelete">선택삭제</CButton>
              </CCardHeader>
              <CCardBody class="p-2 flex-grow-1 d-flex flex-column">
                <div class="table-wrapper">
                  <CTable bordered hover class="data-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell style="width:30px;"><CFormCheck disabled /></CTableHeaderCell>
                        <CTableHeaderCell style="width:40px;">No</CTableHeaderCell>
                        <CTableHeaderCell style="width:80px;">제품ID</CTableHeaderCell>
                        <CTableHeaderCell style="width:120px;">제품명</CTableHeaderCell>
                        <CTableHeaderCell style="width:80px;">규격</CTableHeaderCell>
                        <CTableHeaderCell style="width:60px;">단위</CTableHeaderCell>
                        <CTableHeaderCell style="width:100px;">제품상태</CTableHeaderCell>
                        <CTableHeaderCell>비고</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      <CTableRow v-for="(item,index) in leftDisplayData" :key="index"
                        :class="{'selected-row': selectedProductId === item.productId}">
                        <CTableDataCell class="text-center" style="width:30px;">
                          <CFormCheck v-model="item.selected" />
                        </CTableDataCell>
                        <CTableDataCell class="text-end" style="width:40px;">{{ index + 1 }}</CTableDataCell>
                        <CTableDataCell class="text-end text-primary clickable" style="width:80px;"
                          @click="selectProduct(item)">{{ item.productId }}</CTableDataCell>
                        <CTableDataCell class="text-start" style="width:120px;">
                          <CFormInput v-model="item.productName" size="sm" placeholder="제품명 입력"/>
                        </CTableDataCell>
                        <CTableDataCell class="text-start" style="width:80px;">
                          <CFormInput v-model="item.spec" size="sm" placeholder="규격 입력"/>
                        </CTableDataCell>
                        <CTableDataCell class="text-start" style="width:60px;">
                          <CFormInput v-model="item.unit" size="sm" placeholder="단위 입력"/>
                        </CTableDataCell>
                        <CTableDataCell class="text-start" style="width:100px;">
                          <CFormSelect v-model="item.productStatus" size="sm">
                            <option value="생산가능">생산가능</option>
                            <option value="생산불가">생산불가</option>
                          </CFormSelect>
                        </CTableDataCell>
                        <CTableDataCell class="text-start">
                          <CFormInput v-model="item.remark" size="sm" placeholder="비고 입력"/>
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow v-for="i in leftEmptyRows" :key="'empty-'+i" class="empty-row">
                        <CTableDataCell colspan="8">&nbsp;</CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- 우측 그리드 -->
          <CCol :md="6" class="d-flex flex-column overflow-hidden gap-2">
            <CCard class="flex-grow-1 d-flex flex-column overflow-hidden">
              <CCardHeader class="d-flex justify-content-end">
                <CButton color="danger" size="sm" @click="handleRightDelete">선택삭제</CButton>
              </CCardHeader>
              <CCardBody class="p-2 flex-grow-1 d-flex flex-column">
                <div class="table-wrapper">
                  <CTable bordered hover class="data-table">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell style="width:30px;"><CFormCheck disabled /></CTableHeaderCell>
                        <CTableHeaderCell style="width:40px;">No</CTableHeaderCell>
                        <CTableHeaderCell style="width:80px;">제품옵션ID</CTableHeaderCell>
                        <CTableHeaderCell>옵션명</CTableHeaderCell>
                        <CTableHeaderCell>사용여부</CTableHeaderCell>
                        <CTableHeaderCell>비고</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      <CTableRow v-for="(item,index) in filteredRightData" :key="index">
                        <CTableDataCell class="text-center" style="width:30px;">
                          <CFormCheck v-model="item.selected" />
                        </CTableDataCell>
                        <CTableDataCell class="text-end" style="width:40px;">{{ index + 1 }}</CTableDataCell>
                        <CTableDataCell class="text-end" style="width:80px;">{{ item.optionId }}</CTableDataCell>
                        <CTableDataCell class="text-start">{{ item.optionName }}</CTableDataCell>
                        <CTableDataCell class="text-start">
                          <span>{{ item.used ? '사용' : '미사용' }}</span>
                        </CTableDataCell>
                        <CTableDataCell class="text-start">{{ item.remark }}</CTableDataCell>
                      </CTableRow>
                      <CTableRow v-for="i in rightEmptyRows" :key="'empty-right-'+i" class="empty-row">
                        <CTableDataCell colspan="6">&nbsp;</CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
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

const formData = reactive({
  productId: '',
  productName: '',
  productStatus: '생산가능'
})

// 좌측 그리드 데이터
const leftGridData = ref([
  { productId:'P001', productName:'제품A', spec:'100ml', unit:'EA', productStatus:'생산가능', remark:'', selected:false },
  { productId:'P002', productName:'제품B', spec:'200ml', unit:'EA', productStatus:'생산불가', remark:'', selected:false }
])
const leftDisplayData = computed(()=> leftGridData.value.slice(0,10))
const leftEmptyRows = computed(()=> Math.max(0,10-leftDisplayData.value.length))

// 우측 그리드 데이터
const rightGridData = ref([
  { optionId:'O001', optionName:'옵션A', used:false, remark:'', selected:false },
  { optionId:'O002', optionName:'옵션B', used:false, remark:'', selected:false }
])
const selectedProductId = ref(null)

// 필터링 후 우측 데이터
const filteredRightData = computed(()=>{
  if(!selectedProductId.value) return []
  return rightGridData.value
    .filter(item => item.optionId.endsWith(selectedProductId.value.slice(-1)))
    .map(item => ({ ...item, used: true }))
})

// 빈행 계산: 항상 10행
const rightEmptyRows = computed(()=> Math.max(0, 10 - filteredRightData.value.length))

// 좌측 그리드 제품 클릭 시 선택
const selectProduct = (item)=>{
  selectedProductId.value = item.productId
  formData.productId = item.productId
  formData.productName = item.productName
  formData.productStatus = item.productStatus
}

// 조회
const handleSearch = ()=>{
  if(!formData.productId && !formData.productName) return
  leftGridData.value = leftGridData.value.filter(item=>{
    return (!formData.productId || item.productId.includes(formData.productId)) &&
           (!formData.productName || item.productName.includes(formData.productName))
  })
}

// 초기화
const handleReset = ()=>{
  formData.productId=''
  formData.productName=''
  formData.productStatus='생산가능'
  selectedProductId.value = null
  leftGridData.value = [
    { productId:'P001', productName:'제품A', spec:'100ml', unit:'EA', productStatus:'생산가능', remark:'', selected:false },
    { productId:'P002', productName:'제품B', spec:'200ml', unit:'EA', productStatus:'생산불가', remark:'', selected:false }
  ]
}

// 신규
const handleNew = ()=>{
  formData.productId=''
  formData.productName=''
  formData.productStatus='생산가능'
  selectedProductId.value = null
}

// 저장
const handleSave = ()=>{
  if(!formData.productId) return
  const idx = leftGridData.value.findIndex(item => item.productId === formData.productId)
  if(idx >= 0){
    leftGridData.value[idx].productName = formData.productName
    leftGridData.value[idx].productStatus = formData.productStatus
  }else{
    leftGridData.value.push({
      productId: formData.productId,
      productName: formData.productName,
      spec:'',
      unit:'',
      productStatus: formData.productStatus,
      remark:'',
      selected:false
    })
  }
}

// 좌측 선택삭제
const handleLeftDelete = ()=>{ 
  leftGridData.value = leftGridData.value.filter(item=>!item.selected)
}

// 우측 선택삭제
const handleRightDelete = ()=>{ 
  rightGridData.value = rightGridData.value.filter(item=>!item.selected)
}
</script>

<style scoped>
/* ============================================
   전역 스타일 - 2025 Modern Design
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

/* 전체 컨테이너 높이 조정 */
:deep(.container-fluid) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 0.75rem !important;
  height: 100vh;
  overflow: hidden;
}

:deep(.card) {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #ffffff;
  transition: all 0.3s ease;
}

:deep(.card:hover) {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

:deep(.card-body) {
  padding: 1rem;
}

:deep(.card-header) {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  padding: 0.75rem;
  border-radius: 12px 12px 0 0;
}

/* ============================================
   버튼 스타일 - Modern & Clean
   ============================================ */
:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}

:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

:deep(.btn-danger) {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: #fff !important;
}

:deep(.btn-danger:hover) {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

:deep(.btn:active) {
  transform: translateY(0);
}

/* ============================================
   폼 요소 스타일 - Clean & Modern
   ============================================ */
:deep(.form-label) {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  letter-spacing: -0.2px;
}

:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}

:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}

/* 검색 필터 영역 압축 */
:deep(.g-2) {
  --bs-gutter-y: 0.5rem;
  --bs-gutter-x: 0.75rem;
}

/* ============================================
   테이블 스타일 - Modern & Clean
   ============================================ */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  border-radius: 10px;
  max-height: calc(100vh - 350px);
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.data-table th) {
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  letter-spacing: -0.2px;
}

:deep(.data-table th:first-child) {
  border-top-left-radius: 10px;
}

:deep(.data-table th:last-child) {
  border-top-right-radius: 10px;
}

:deep(.data-table td) {
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
  word-break: break-word;
}

:deep(.data-table tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr:hover:not(.empty-row)) {
  background-color: #f8f9fa;
  transform: scale(1.005);
}

/* 클릭 가능한 셀 */
.clickable {
  cursor: pointer;
  font-weight: 600;
}

.clickable:hover {
  text-decoration: underline;
}

/* 선택된 행 스타일 - 모던 그레이 테마 */
:deep(.selected-row) {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%) !important;
  font-weight: 600;
  box-shadow: inset 0 0 0 2px #6c757d;
}

:deep(.selected-row td) {
  border-bottom: 2px solid #495057;
  color: #212529;
}

/* 빈 행 스타일 */
.empty-row td {
  height: 34px;
  background-color: #fafbfc;
}

/* 텍스트 정렬 */
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
  color: #0d6efd !important;
}

/* ============================================
   스크롤바 스타일
   ============================================ */
.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 8px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #adb5bd;
  border-radius: 8px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #868e96;
}

/* 간격 조정 */
:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

:deep(.gap-2) {
  gap: 0.5rem !important;
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 1600px) {
  :deep(.form-label),
  :deep(.form-control),
  :deep(.form-select),
  :deep(.btn),
  :deep(th),
  :deep(td) {
    font-size: 11px !important;
  }
  
  :deep(.btn) {
    padding: 0.4rem 1rem;
  }
}
</style>