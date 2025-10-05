<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>제품 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="mb-3">
  <CInputGroup class="mb-2">
    <CInputGroupText id="addon-ordr-name-1">생산지시명</CInputGroupText>
    <CFormInput v-model="prod_drct_nm" placeholder="생산지시명" />
  </CInputGroup>

  <div class="d-flex gap-2 align-items-center">
    <select class="form-select" style="width: 200px" v-model="pickValue">
      <option value="singleDate">생산지시등록일</option>
      <option value="prod_drct_dt">생산지시일정조회</option>
    </select>

    <!-- 날짜 입력창 -->
    <template v-if="pickValue == 'singleDate'">
      <input type="date" class="form-control" v-model="reg_dt" />
    </template>

    <template v-else-if="pickValue == 'prod_drct_dt'">
      <input type="date" class="form-control" v-model="prod_drct_fr_dt" />
      <span>~</span>
      <input type="date" class="form-control" v-model="prod_drct_to_dt" />
    </template>

    <button class="btn btn-secondary" @click="prdtSearch()" style="width: 70px">검색</button>
  </div>
</div>


        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>생산지시명</th>
              <th>생산지시시작일</th>
              <th>생산지시종료일</th>
              <th>등록일</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">            
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{  prdts.prod_drct_nm }}</td>
              <td>{{ formatDate(prdts.prod_drct_fr_dt) }}</td>
              <td>{{ formatDate(prdts.prod_drct_to_dt) }}</td>
              <td>{{ formatDate(prdts.reg_dt) }}</td>
            </tr>
          </tbody>
        </table>        
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="close">닫기</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])
const close = () => {
  prdtList.value = []
  prod_drct_nm.value = '';
  reg_dt.value = '';
  prod_drct_fr_dt.value = '';
  prod_drct_to_dt.value = '';
  emit('close')
}

const pickValue = ref('singleDate') // 기본값: 코드
const prod_drct_nm = ref('')
const reg_dt = ref('')
const prod_drct_fr_dt = ref('')
const prod_drct_to_dt = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

//날짜포멧
const formatDate = (dateStr) => {
  return new Date(dateStr).toISOString().split('T')[0];
};


const prdtSearch = async () => {
  const params = { prod_drct_nm: '', reg_dt: '', prod_drct_fr_dt: '', prod_drct_to_dt: '' }

  params.prod_drct_nm = prod_drct_nm.value;
  if (pickValue.value == 'singleDate') {
    if(!reg_dt.value){
        params.reg_dt = '1970-01-01';        
    }else{
        params.reg_dt = reg_dt.value;
    }
    params.prod_drct_fr_dt = '1970-01-01';
    params.prod_drct_to_dt = '2125-01-01';
  } else {   
      params.reg_dt = '1970-01-01';
    if(prod_drct_fr_dt.value != null && !prod_drct_to_dt.value) {
        params.prod_drct_fr_dt = prod_drct_fr_dt.value;
        params.prod_drct_to_dt = '2125-01-01';
    }else if(!prod_drct_fr_dt.value && prod_drct_to_dt.value != null) {        
        params.prod_drct_fr_dt = '1970-01-01';
        params.prod_drct_to_dt = prod_drct_to_dt.value;
    } else{       
        params.prod_drct_fr_dt = prod_drct_fr_dt.value;
        params.prod_drct_to_dt = prod_drct_to_dt.value;
    }
  }
  console.log(params)
  let result = await axios.get('/api/prodDrctSearch', { params }).catch((err) => console.log(err))
  console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async (prdts) => {
  const params = { prod_drct_id: ''};
  params.prod_drct_id = prdts.prod_drct_id;
  let result = await axios.get('/api/prodDrctDetaSearch', { params }).catch((err) => console.log(err))
  emit('select', result.data) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>
