<template>
  <CContainer fluid class="h-100 d-flex flex-column p-0 m-0">
    <CCard class="flex-grow-1 d-flex flex-column overflow-hidden m-0 h-100">
      <CCardBody class="p-2 d-flex flex-column overflow-hidden flex-grow-1">

        <!-- 상단 조회/초기화 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" class="custom-btn" @click="handleSearch">조회</CButton>
          <CButton color="secondary" size="sm" class="custom-btn" @click="handleReset">초기화</CButton>
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
          <CButton color="secondary" size="sm" class="custom-btn" @click="handleNew">신규</CButton>
          <CButton color="secondary" size="sm" class="custom-btn" @click="handleSave">저장</CButton>
        </div>

        <!-- 하단 좌우 그리드 -->
        <CRow class="flex-grow-1 overflow-hidden g-2">

          <!-- 좌측 그리드 -->
          <CCol :md="6" class="d-flex flex-column overflow-hidden gap-2">
            <CCard class="flex-grow-1 d-flex flex-column overflow-hidden">
              <CCardHeader class="d-flex justify-content-end">
                <CButton color="danger" size="sm" class="custom-btn" @click="handleLeftDelete">선택삭제</CButton>
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
                      <CTableRow v-for="(item,index) in leftDisplayData" :key="index">
                        <CTableDataCell class="text-center" style="width:30px;">
                          <CFormCheck v-model="item.selected" />
                        </CTableDataCell>
                        <CTableDataCell class="text-end" style="width:40px;">{{ index + 1 }}</CTableDataCell>
                        <CTableDataCell class="text-end text-primary" style="width:80px; cursor:pointer"
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
                      <CTableRow v-for="i in leftEmptyRows" :key="'empty-'+i">
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
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
                <CButton color="danger" size="sm" class="custom-btn" @click="handleRightDelete">선택삭제</CButton>
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
                      <!-- 빈 행 채우기: 항상 10행 표시 -->
                      <CTableRow v-for="i in rightEmptyRows" :key="'empty-right-'+i">
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
                        <CTableDataCell>&nbsp;</CTableDataCell>
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
:deep(*){ font-family:'맑은 고딕','Malgun Gothic',sans-serif; box-sizing:border-box; color:#000; line-height:1.4;}
:deep(.form-label){ font-size:11px; margin-bottom:0; color:#444;}
:deep(.form-control),:deep(.form-select){ font-size:12px; padding:0.25rem 0.5rem; height:28px;}
:deep(input[type="date"]){ font-size:12px; }

.custom-btn {
  font-size:11px !important;
  padding:0.25rem 0.5rem !important;
  color:#fff !important;
}

.d-flex.gap-2 { gap:0.5rem !important; }
.CRow.g-2 { gap:0.5rem !important; }

.table-wrapper {
  flex: 1;
  overflow-y: scroll; 
  min-height: 0;
}

.data-table{ 
  margin-bottom:0; 
  border-collapse:collapse; 
  table-layout: fixed; 
  width:100%;
}
.data-table thead{ 
  position:sticky; top:0; z-index:1; background-color:#e9ecef;
}
.data-table th,
.data-table td{
  font-size:11px; 
  vertical-align:middle; 
  padding:0.25rem; 
  border: 1px solid #dee2e6;
  word-break: break-word;
  text-align:center;
}
.data-table td.text-end{ text-align:right; }
.data-table td.text-start{ text-align:left; }

.selected-row{ background-color:#d9edf7 !important; }
</style>
