<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>완제품 품질조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="mb-3">
          <div class="d-flex gap-2 mb-3">
            <CInputGroup class="mb-2">
              <CInputGroupText id="addon-ordr-name-1">검사자</CInputGroupText>
              <CFormInput v-model="emp_nm" placeholder="검수자이름" />
            </CInputGroup>
          </div>
          <div class="d-flex gap-2 mb-3">
            <CInputGroupText id="addon-ordr-name-2">검사 일자</CInputGroupText>
            <input type="date" class="form-control" v-model="insp_dt" />
            <button class="btn btn-secondary" style="width: 70px" @click="prdtSearch()">
              검색
            </button>
          </div>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>검사자</th>
              <th>제품명</th>
              <th>옵션명</th>
              <th>검사 수량</th>
              <th>검사 일자</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.emp_nm }}</td>
              <td>{{ prdts.prdt_nm }}</td>
              <td>{{ prdts.opt_nm }}</td>
              <td>{{ Math.floor(prdts.insp_qy) }}</td>
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
import { ref, defineProps, defineEmits, shallowRef, watch } from 'vue'
import axios from 'axios'
import userDateUtils from '@/utils/useDates.js'
const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])
const close = () => {
  emp_nm.value = ''
  insp_dt.value = ''
  prdtList.value = []
  emit('close')
}

const emp_nm = ref('')
const insp_dt = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

const prdtSearch = async () => {
  const params = {
    emp_nm: emp_nm.value || '',
    insp_dt: insp_dt.value || '1970-01-01',
  }
  console.log(params)
  let result = await axios
    .get('/api/endPrdtQltyInspSearch', { params })
    .catch((err) => console.log(err))
  // console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async (prdts) => {
  const params = { end_prdt_qlty_insp_id: '' }
  params.end_prdt_qlty_insp_id = prdts.end_prdt_qlty_insp_id
console.log(prdts)
  let result = await axios
    .get('/api/endPrdtQltyInspInferSearch', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  emit('select', {
    detailData: result.data,
    searchParams: prdts,
  }) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>
