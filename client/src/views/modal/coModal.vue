<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>업체 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 500px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px">
            <option value="CO_TY_ID">업체 유형</option>
          </select>
          <select class="form-select" style="width: 150px">
            <option value="CO_NM">업체 이름</option>
            <option value="RPSTR_NM">대표자 이름</option>
            <option value="RPSTR_TEL">대표자 연락처</option>
          </select>
          <select class="form-select" style="width: 150px">
            <option value="ST">상태</option>
          </select>
          <input type="text" class="form-control" placeholder="검색어 입력" />
          <button class="btn btn-secondary" @click="coSearch()">검색</button>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>업체 ID</th>
              <th>업체 이름</th>
              <th>업체 유형</th>
              <th>대표자 이름</th>
              <th>대표자 연락처</th>
              <th>사업자 등록 번호</th>
              <th>상태</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(cos, i) in coList" :key="i" @dblclick="selectCo(cos)">
              <td>{{ cos.co_id }}</td>
              <td>{{ cos.co_nm }}</td>
              <td>{{ cos.co_ty_id }}</td>
              <td>{{ cos.rpstr_nm }}</td>
              <td>{{ cos.rpstr_tel }}</td>
              <td>{{ cos.bizr_reg_no }}</td>
              <td>{{ cos.st }}</td>
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
  emit('close')
}

let coList = shallowRef([]) // <- 반응형 객체

const coSearch = async () => {
  let result = await axios.get('/api/cos').catch((err) => console.log(err))
  coList.value = result.data // 수정
}

const selectCo = (cos) => {
  emit('select', cos) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>

<!-- CoOrdr.vue -->
<CoModal :visible="isCoModalVisible" @close="closeCoModal" @select="selectedCo" />
