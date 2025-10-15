<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>공정 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
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
          <button class="btn btn-secondary" @click="prcsSearch">검색</button>
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
          <tbody>
            <tr v-for="(prcs, i) in prcsList" :key="i" @dblclick="selectPrcs(prcs)">
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
import { ref, shallowRef, defineProps, defineEmits } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])

const pickValue = ref('prcs_id')
const searchKeyword = ref('')
const prcsList = shallowRef([])

// 모달 닫기
const close = () => {
  prcsList.value = []
  emit('close')
}

// 검색 버튼 클릭
const prcsSearch = async () => {
  try {
    const params = { prcsId: '', prcsName: '', eqmGrpNm: '' }

    if (pickValue.value === 'prcs_id') {
      params.prcsId = searchKeyword.value
    } else if (pickValue.value === 'prcs_nm') {
      params.prcsName = searchKeyword.value
    } else if (pickValue.value === 'eqm_grp_nm') {
      params.eqmGrpNm = searchKeyword.value
    }

    const result = await axios.get('/api/prcsModal', { params })
    prcsList.value = result.data
  } catch (err) {
    console.error('공정 검색 오류:', err)
    alert('검색 중 오류가 발생했습니다.')
  }
}

// row 더블클릭: 선택
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
  })
  close()
}
</script>
