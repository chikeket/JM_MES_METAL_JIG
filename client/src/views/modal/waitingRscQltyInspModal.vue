<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>자재발주서 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
         <div class="mb-3">         
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px" v-model="pickValue">
            <option value="rsc_nm">자재명</option>
            <option value="qy">자재수량</option>
            <option value="emp_nm">작성자</option>
            <option value="co_nm">발주처</option>            
          </select>     
          
          <template v-if="pickValue == 'rsc_nm'">
            <input type="text" class="form-control" v-model="rsc_nm" />
          </template>    
          <template v-else-if="pickValue == 'qy'">
            <input type="text" class="form-control" v-model="qy" />
          </template>
          <template v-else-if="pickValue == 'emp_nm'">
            <input type="text" class="form-control" v-model="emp_nm" />
          </template>
          <template v-else-if="pickValue == 'co_nm'">
            <input type="text" class="form-control" v-model="co_nm" />
          </template>
          <button class="btn btn-secondary" @click="prdtSearch()">검색</button>
        </div>
        <!-- 날짜 입력창 -->
    <input
  type="text"
  class="form-control"
  v-model="reg_dt"
  placeholder="발주등록일"
  onfocus="(this.type='date')"
  onblur="if(!this.value)this.type='text'"
/>
      </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>자재명</th>
              <th>자재수량</th>
              <th>발주자명</th>
              <th>발주처</th>
              <th>발주날짜</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.rsc_nm }}</td>
              <td>{{ Math.floor(prdts.qy) }}</td>
              <td>{{ prdts.emp_nm }}</td>
              <td>{{ prdts.co_nm }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.reg_dt,'yyyy-MM-dd') }}</td>
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
import { ref, defineProps, defineEmits, shallowRef, watch } from 'vue'
import axios from 'axios'
import userDateUtils from "@/utils/useDates.js";
const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])
const close = () => {
  rsc_nm.value = ''
  qy.value = ''
  emp_nm.value = ''
  co_nm.value = ''
  reg_dt.value = ''
  pickValue.value = 'rsc_nm'

  prdtList.value = []
  emit('close')
}

const pickValue = ref('rsc_nm') // 기본값: 코드
const rsc_nm = ref('')
const qy = ref('')
const emp_nm = ref('')
const co_nm = ref('')
const reg_dt = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

watch(pickValue, (newVal) => {
  if (newVal !== 'rsc_nm') rsc_nm.value = ''
  if (newVal !== 'qy') qy.value = ''
  if (newVal !== 'emp_nm') emp_nm.value = ''
  if (newVal !== 'co_nm') co_nm.value = ''
})


const prdtSearch = async () => {
  const params = {
    rsc_nm: rsc_nm.value || '',
    qy: qy.value || '',
    emp_nm: emp_nm.value || '',
    co_nm: co_nm.value || '',
    reg_dt: reg_dt.value || ''
  }
  console.log(params)  
  let result = await axios.get('/api/rscOrdrQltyList', { params }).catch((err) => console.log(err))
  console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async  (prdts) => {  
  const params = { rsc_id: ''};
  params.rsc_id = prdts.rsc_id;
  let result = await axios.get('/api/rscQltyDeta', { params }).catch((err) => console.log(err))
  console.log(result.data)
  emit('select', {
  detailData: result.data,
  searchParams: prdts
}) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>