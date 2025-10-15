<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>완제품생산실적조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px" v-model="ctrlValue.pickValue">
            <option value="prdt_nm">완제품명</option>
            <option value="pass_qy">검사대기수량</option>
          </select>
          <input
            type="text"
            class="form-control"
            placeholder="검색어 입력"
            v-model="ctrlValue.searchKeyword"
          />
        </div>
        <div class="d-flex gap-2 mb-3">
          <CInputGroupText id="addon-ordr-name-2">작업종료날짜</CInputGroupText>
          <input type="date" class="form-control" v-model="ctrlValue.wk_to_dt" />
          <button class="btn btn-secondary" style="width: 100px" @click="prdtSearch()">검색</button>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>완제품명</th>
              <th>옵션명</th>
              <th>검사대기수량</th>
              <th>작업종료날짜</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.prdt_nm }}</td>
              <td>{{ prdts.opt_nm }}</td>
              <td>{{ Number(prdts.bePass_qy) - Number(prdts.beInsp_qy) }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.wk_to_dt, 'yyyy-MM-dd') }}</td>
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
const emit = defineEmits(['close', 'select'])
const close = () => {
  prdtList.value = []
  emit('close')
}
const ctrlValue = ref({
  pickValue: 'prdt_nm',
  wk_to_dt: '',
  searchKeyword: '',
})

let prdtList = shallowRef([]) // <- 반응형 객체

const prdtSearch = async () => {
  prdtList.value = []
  const params = {
    prdt_nm: '',
    pass_qy: '',
    wk_to_dt: ctrlValue.value.wk_to_dt || '1970-01-01',
  }
  if (ctrlValue.value.pickValue == 'prdt_nm') {
    params.prdt_nm = ctrlValue.value.searchKeyword
  } else {
    params.pass_qy = ctrlValue.value.searchKeyword
  }
  // console.log(params)
  let result = await axios
    .get('/api/waitingFinishedPrdt', { params })
    .catch((err) => console.log(err))
  // console.log(result.data)
  prdtList.value = result.data
  console.log(prdtList.value)

  ctrlValue.value.wk_to_dt = ''
  ctrlValue.value.searchKeyword = ''
}

const selectProduct = async (prdts) => {
  const params = { prdt_id: '', prdt_opt_id: '' }
  params.prdt_id = prdts.prdt_id
  params.prdt_opt_id = prdts.prdt_opt_id
  let result = await axios
    .get('/api/waitingPrdtQltyDeta', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  emit('select', {
    detailData: result.data,
    searchParams: prdts,
  }) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>
