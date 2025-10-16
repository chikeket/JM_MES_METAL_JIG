<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>제품 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px" v-model="pickValue">
            <option value="rcvord_id">코드</option>
            <option value="co_nm">납품업체</option>
            <option value="emp_nm">수주담당자</option>            
          </select>
          <input
            type="text"
            class="form-control"
            placeholder="검색어 입력"
            v-model="searchKeyword"
          />
          
        </div>
        <div class="d-flex gap-2 mb-3">
            <CInputGroupText id="addon-ordr-name-2">수주 일자</CInputGroupText>
            <input type="date" class="form-control" v-model="reg_dt" />
            <button class="btn btn-secondary" style="width: 90px" @click="prdtSearch()">
              검색
            </button>
          </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>코드</th>
              <th>납품업체</th>
              <th>수주담당자</th>
              <th>등록일자</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.rcvord_id }}</td>
              <td>{{ prdts.co_nm }}</td>
              <td>{{ prdts.emp_nm }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.reg_dt, 'yyyy-MM-dd') }}</td>
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
import userDateUtils from '@/utils/useDates.js'

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close','select'])
const close = () => {
  prdtList.value = []
  emit('close')
}

const pickValue = ref('co_nm') // 기본값: 코드
const searchKeyword = ref('')
const reg_dt = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

const prdtSearch = async () => {
  const params = { rcvord_id: '', co_nm: '', emp_nm: '', reg_dt: '' }

  if (pickValue.value == 'rcvord_id') {
    params.rcvord_id = searchKeyword.value
  } else if (pickValue.value == 'co_nm') {
    params.co_nm = searchKeyword.value
  } else   {
    params.emp_nm = searchKeyword.value
  } 
  params.reg_dt = !reg_dt.value ? '1970-01-01' : reg_dt.value
  // console.log(params)
  let result = await axios.get('/api/prodPlanRcvordMasterSearch', { params }).catch((err) => console.log(err))
  console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async (prdts) => {  
  const params = { rsc_qlty_insp_id: '' }
  params.rsc_qlty_insp_id = prdts.rsc_qlty_insp_id
  let result = await axios
    .get('/api/rscQltyInspInferSelect', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  emit('select', {
  detailData: prdts,
  searchParams: prdts
}) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>
