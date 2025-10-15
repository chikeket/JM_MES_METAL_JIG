<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>공정 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- Select box : 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px" v-model="pickValue">
            <option value="prcs_id">공정코드</option>
            <option value="prcs_nm">공정명</option>
            <option value="eqm_grp_nm">그룹설비명</option>
          </select>
          <input
            type="text"
            class="form-control"
            placeholder="검색어 입력"
            v-model="searchKeyword"
          />
          <button class="btn btn-secondary" @click="prcsSearch()">검색</button>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>공정코드</th>
              <th>공정명</th>
              <th>그룹설비명</th>
              <th>리드타임</th>
              <th>금형사용유무</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <!-- 결과 값 row를 더블클릭 시 ...-->
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectPrcs(prcs)">
              <td>{{ prcs.prcs_id }}</td>
              <td>{{ prcs.prcs_nm }}</td>
              <td>{{ prcs.eqm_grp_nm }}</td>
              <td>{{ prcs.lead_tm }}</td>
              <td>{{ prcs.mold_use_at }}</td>
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
  prcsList.value = []
  emit('close')
}

const pickValue = ref('prdt_nm') // 기본값: 코드
const searchKeyword = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

const prcsSearch = async () => {
  const params = { prcs_id: '', prcs_nm: '', eqm_grp_nm: '', lead_tm: '', mold_use_at: '' }

  if (pickValue.value == 'prcs_id') {
    params.prcs_id = searchKeyword.value
  } else if (pickValue.value == 'prcs_nm') {
    params.prcs_nm = searchKeyword.value
  } else if (pickValue.value == 'eqm_grp_nm') {
    params.eqm_grp_nm = searchKeyword.value
  } else if (pickValue.value == 'lead_tm') {
    params.lead_tm = searchKeyword.value
  } else {
    params.mold_use_at = searchKeyword.value
  }
  // console.log(params)
  let result = await axios.get('/api/prcs', { params }).catch((err) => console.log(err))
  // console.log(result.data)
  prcsList.value = result.data
}

const selectPrcs = (prcs) => {
  emit('select', {
    detailData: prcs,
    searchParams: {
      prcs_id: '',
      prcs_nm: '',
      eqm_grp_nm: '',
      lead_tm: '',
      mold_use_at: '',
    },
  }) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>
