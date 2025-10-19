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
            <c-form-label for="prdt_type">유형</c-form-label>
            <c-form-select v-model="type" id="prdt_type">
              <option value="">선택하세요</option>
              <option value="자재">자재</option>
              <option value="완제품">완제품</option>
              <option value="반제품">반제품</option>
            </c-form-select>
          </c-col>
          <c-col md="3">
            <c-form-label for="prdt_nm">제품 ID</c-form-label>
            <c-form-input v-model="form.prdt_id" id="prdt_nm" />
          </c-col>
          <c-col md="3">
            <c-form-label for="prdt_opt_nm">옵션 ID</c-form-label>
            <c-form-input v-model="form.prdt_opt_id" id="prdt_opt_nm" />
          </c-col>
          <c-col md="3">
            <c-form-label for="reg_dt">등록일자</c-form-label>
            <c-form-input type="date" v-model="form.insp_dt" id="reg_dt" />
          </c-col>
        </c-row>
        <c-row class="mb-3 gx-2">      
          <c-col md="3">
            <c-form-label for="prdt_opt_nm">검사자</c-form-label>
            <c-form-input v-model="form.emp_nm" id="prdt_opt_nm" />
          </c-col>
        </c-row>
        <c-row class="mb-3 gx-2"> </c-row>
      </c-form>

      <!-- 테이블 -->
      <c-table hover bordered small class="align-middle">
        <c-table-head color="dark">
          <c-table-row>            
            <c-table-header-cell>검사코드</c-table-header-cell>
            <c-table-header-cell>검사일자</c-table-header-cell>
            <c-table-header-cell>제품ID</c-table-header-cell>
            <c-table-header-cell>제품명</c-table-header-cell>
            <c-table-header-cell>검사수량</c-table-header-cell>
            <c-table-header-cell>합격수량</c-table-header-cell>
            <c-table-header-cell>불량수량</c-table-header-cell>
            <c-table-header-cell>단위</c-table-header-cell>
            <c-table-header-cell>검사자</c-table-header-cell>
            <c-table-header-cell>비고</c-table-header-cell>
            <c-table-header-cell>검사항목</c-table-header-cell>
          </c-table-row>
        </c-table-head>
        <c-table-body>
          <c-table-row v-for="(item, index) in tableData" :key="index">
            <c-table-data-cell>{{ item.rsc_qlty_insp_id ?? item.end_prdt_qlty_insp_id ?? item.semi_prdt_qlty_insp_id }}</c-table-data-cell>
            <c-table-data-cell>{{ userDateUtils.dateFormat(item.insp_dt, 'yyyy-MM-dd') }}</c-table-data-cell>
            <c-table-data-cell>{{ !item.prdt_id ? item.rsc_id : item.prdt_id
            +'-'+item.prdt_opt_id }}</c-table-data-cell>
            <c-table-data-cell>{{ !item.prdt_nm ? item.rsc_nm : item.prdt_nm
            +'-'+item.opt_nm }}</c-table-data-cell>
            <c-table-data-cell>{{ Math.floor(item.insp_qy) }}</c-table-data-cell>
            <c-table-data-cell>{{ Math.floor(item.pass_qy) }}</c-table-data-cell>
            <c-table-data-cell>{{ item.insp_qy-item.pass_qy }}</c-table-data-cell>
            <c-table-data-cell>{{ item.unit }}</c-table-data-cell>
            <c-table-data-cell>{{ item.emp_nm }}</c-table-data-cell>
            <c-table-data-cell>{{ item.rm }}</c-table-data-cell>
            <c-table-data-cell style="display: flex; justify-content: center;"><CButton color="secondary" @click="detail(item)" >상세보기</CButton></c-table-data-cell>
          </c-table-row>
        </c-table-body>
      </c-table>
    </c-card-body>
  </CContainer>
  <rscQltyInspModal
        ref="rscModalRef"
        :visible="isRscQltyInspModalVisible"
        :modaldata="modaldata.value"
        @close="closerRscQltyInspModal"        
      />
  <endQltyInspModal
    ref="endModalRef"
    :visible="isEndQltyInspModalVisible"
    :modaldata="modaldata.value"
    @close="closerEndQltyInspModal"        
  />
  <semiQltyInspModal
    ref="semiModalRef"
    :visible="isSemiQltyInspModalVisible"
    :modaldata="modaldata.value"
    @close="closerSemiQltyInspModal"        
  />
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
  CFormSelect,
} from '@coreui/vue'
import { ref } from 'vue'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'
import rscQltyInspModal from '../modal/rscQltyBoardModal.vue'
import endQltyInspModal from '../modal/endPrdtQltyBoardModal.vue'
import semiQltyInspModal from '../modal/semiPrdtQltyBoardModal.vue'
//자재품질이력검색모달
const isRscQltyInspModalVisible = ref(false)
const openRscQltyInspModal = () => {
  isRscQltyInspModalVisible.value = true
}
const closerRscQltyInspModal = () => {
  isRscQltyInspModalVisible.value = false
}
//완제품 품질이력검색모달
const isEndQltyInspModalVisible = ref(false)
const openEndQltyInspModal = () => {
  isEndQltyInspModalVisible.value = true
}
const closerEndQltyInspModal = () => {
  isEndQltyInspModalVisible.value = false
}
//반제품 품질이력검색모달
const isSemiQltyInspModalVisible = ref(false)
const openSemiQltyInspModal = () => {
  isSemiQltyInspModalVisible.value = true
}
const closerSemiQltyInspModal = () => {
  isSemiQltyInspModalVisible.value = false
}
const form = ref({  
  emp_nm: '',
  insp_dt: '1970-01-01',//userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd'),
  prdt_id: '',  
  prdt_opt_id: '',
})

const tableData = ref([
//   {
//     qlty_id: 'qlty_id',
//     insp_dt: 'insp_dt',
//     prdt_id: 'prdt_id',
//     prdt_opt_id: 'prdt_opt_id',
//     prdt_nm: 'prdt_nm',
//     opt_nm: 'opt_nm',
//     insp_qy: 'insp_qy',
//     pass_qy: 'pass_qy',
//     unit: 'unit',
//     emp_nm: 'emp_nm',
//     rm: 'rm',
// },
])
const type = ref('')
const modaldata = ref({ detailData: [], searchParams: {} });
const rscModalRef = ref(null)
const endModalRef = ref(null)
const semiModalRef = ref(null)


const search = async () => {
  // tableData.value = [];
  let params ;
if(type.value == '자재'){
 params = {type: type.value,
  emp_nm: form.value.emp_nm || '',
    insp_dt: form.value.insp_dt || '1970-01-01',
    rsc_id: form.value.prdt_id || ''}
}else{
  params = {type: type.value,
    emp_nm: form.value.emp_nm || '',
    insp_dt: form.value.insp_dt || '1970-01-01',
    prdt_id: form.value.prdt_id || '',
    prdt_opt_id: form.value.prdt_opt_id || ''}
}
  console.log(params)
  let result = await axios
    .get('/api/qltyBoardListSearch', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  tableData.value = result.data
}

const detail = async (data) => { 
  let result = null;
    if(type.value == '자재') {
  const params = { rsc_qlty_insp_id: '' }
  params.rsc_qlty_insp_id = data.rsc_qlty_insp_id
      result = await axios
    .get('/api/rscQltyInspInferSelect', { params })
    .catch((err) => console.log(err))  
  modaldata.value.detailData = result.data
  modaldata.value.searchParams = data  
    console.log(modaldata.value)    
    openRscQltyInspModal()    
     rscModalRef.value?.selectOrdr(modaldata.value);
    }else if(type.value == '완제품'){
      const params = { end_prdt_qlty_insp_id: '' }
  params.end_prdt_qlty_insp_id = data.end_prdt_qlty_insp_id
      result = await axios
    .get('/api/endPrdtQltyInspInferSearch', { params })
    .catch((err) => console.log(err))
    modaldata.value.detailData = result.data
  modaldata.value.searchParams = data  
    console.log(modaldata.value)    
    openEndQltyInspModal()    
     endModalRef.value?.selectOrdr(modaldata.value);
    }else{
      const params = { semi_prdt_qlty_insp_id: ''}
  params.semi_prdt_qlty_insp_id = data.semi_prdt_qlty_insp_id  
      result = await axios
    .get('/api/semiPrdtQltyInspInferSearch', { params })
    .catch((err) => console.log(err))
    modaldata.value.detailData = result.data
  modaldata.value.searchParams = data  
    console.log(modaldata.value) 
      openSemiQltyInspModal()
      semiModalRef.value?.selectOrdr(modaldata.value);
    }
}
</script>
