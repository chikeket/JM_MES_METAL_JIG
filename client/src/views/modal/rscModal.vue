<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>자재 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px">
            <option value="RSC_ID">자재 코드</option>
            <option value="RSC_TY">자재 분류</option>
            <option value="RSC_NM">자재 명</option>
            <option value="SPEC">규격</option>
            <option value="RSC_UNIT">단위</option>
          </select>
          <input type="text" class="form-control" placeholder="검색어 입력" />
          <button class="btn btn-secondary" @click="rscSearch()">검색</button>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>자재 코드</th>
              <th>자재 분류</th>
              <th>자재 명</th>
              <th>규격</th>
              <th>단위</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- v-for="(prdts, i) in prdtList" :key="i" -->
            <tr v-for="(rscs, i) in rscList" :key="i" @dblclick="selectRsc(rscs)">
              <td>{{ rscs.rsc_id }}</td>
              <td>{{ rscs.rsc_clsf_id }}</td>
              <td>{{ rscs.rsc_nm }}</td>
              <td>{{ rscs.spec }}</td>
              <td>{{ rscs.rsc_unit }}</td>
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

let rscList = shallowRef([]) // <- 반응형 객체

const rscSearch = async () => {
  let result = await axios.get('/api/rscs').catch((err) => console.log(err))
  rscList.value = result.data // 수정
}

const selectRsc = (rscs) => {
  emit('select', rscs) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>

<!-- RscOrdr.vue -->
<RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />
