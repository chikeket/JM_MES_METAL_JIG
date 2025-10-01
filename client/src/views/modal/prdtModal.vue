<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>제품 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px">
            <option value="PRDT_ID">코드</option>
            <option value="PRDT_NM">제품명</option>
            <option value="SPEC">규격</option>
            <option value="PRDT_OPT_ID">색상</option>
          </select>
          <input type="text" class="form-control" placeholder="검색어 입력" />
          <button class="btn btn-secondary" @click="prdtSearch()">검색</button>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>코드</th>
              <th>제품명</th>
              <th>규격</th>
              <th>색상</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.PRDT_ID }}</td>
              <td>{{ prdts.PRDT_NM }}</td>
              <td>{{ prdts.SPEC }}</td>
              <td>{{ prdts.PRDT_ST }}</td>
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
import { defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close'])
const close = () => {
  prdtList.value = [] 
  emit('close')
}

let prdtList = shallowRef([]) // <- 반응형 객체

const prdtSearch = async () => {
  let result = await axios.get('/api/prdts').catch((err) => console.log(err))
  prdtList.value = result.data
}

const selectProduct = (prdts) => {
  emit('select', prdts) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>
