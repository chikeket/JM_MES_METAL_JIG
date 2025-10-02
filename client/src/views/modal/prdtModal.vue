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
            <option value="prdt_id">코드</option>
            <option value="prdt_nm">제품명</option>
            <option value="spec">규격</option>
            <option value="prdt_opt_id">색상</option>
          </select>
          <input
            type="text"
            class="form-control"
            placeholder="검색어 입력"
            v-model="searchKeyword"
          />
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
              <td>{{ prdts.prdt_id }}</td>
              <td>{{ prdts.prdt_nm }}</td>
              <td>{{ prdts.spec }}</td>
              <td>{{ prdts.opt_nm }}</td>
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
const emit = defineEmits(['close'])
const close = () => {
  prdtList.value = []
  emit('close')
}

const pickValue = ref('prdt_nm') // 기본값: 코드
const searchKeyword = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

const prdtSearch = async () => {
  const params = { prdt_id: '', prdt_nm: '', spec: '', opt_nm: '' }

  if (pickValue.value == 'prdt_id') {
    params.prdt_id = searchKeyword.value
  } else if (pickValue.value == 'prdt_nm') {
    params.prdt_nm = searchKeyword.value
  } else if (pickValue.value == 'spec') {
    params.spec = searchKeyword.value
  } else {
    params.opt_nm = searchKeyword.value
  }
  // console.log(params)
  let result = await axios.get('/api/prdts', { params }).catch((err) => console.log(err))
  // console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = (prdts) => {
  emit('select', prdts) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>
