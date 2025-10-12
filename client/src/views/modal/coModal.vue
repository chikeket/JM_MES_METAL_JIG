<template>
  <CModal :visible="visible" @close="close" size="xl" alignment="center">
    <CModalHeader>
      <CModalTitle>업체 검색</CModalTitle>
    </CModalHeader>
    <!-- 본문 높이를 뷰포트 기준으로 계산하고 내부 스크롤 사용 -->
    <CModalBody>
      <div class="modal-body" style="max-height: calc(100vh - 200px); overflow-y: auto; padding-right:8px;">
        <!-- 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px" v-model="coTy">
            <option value="">전체유형</option>
            <option value="CO_TY_ID">업체 유형</option>
          </select>
          <select class="form-select" style="width: 150px" v-model="pickValue">
            <option value="CO_NM">업체 이름</option>
            <option value="RPSTR_NM">대표자 이름</option>
            <option value="RPSTR_TEL">대표자 연락처</option>
          </select>
          <select class="form-select" style="width: 150px" v-model="st">
            <option value="">전체상태</option>
            <option value="ST">상태</option>
          </select>
          <!-- 검색어 입력 너비 축소 -->
          <input type="text" class="form-control" placeholder="검색어 입력" v-model="searchKeyword" style="width: 180px;" />
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
import { ref, defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const coTy = ref('') // 업체 유형 필터
const pickValue = ref('CO_NM')
const st = ref('') // 상태 필터
const searchKeyword = ref('')
let coList = shallowRef([])

const close = () => {
  coTy.value = ''
  pickValue.value = 'CO_NM'
  st.value = ''
  searchKeyword.value = ''
  coList.value = []
  emit('close')
}

const coSearch = async () => {
  const params = { co_ty_id: coTy.value || '', co_nm: '', rpstr_nm: '', rpstr_tel: '', st: st.value || '' }
  if (pickValue.value === 'CO_NM') params.co_nm = searchKeyword.value
  else if (pickValue.value === 'RPSTR_NM') params.rpstr_nm = searchKeyword.value
  else if (pickValue.value === 'RPSTR_TEL') params.rpstr_tel = searchKeyword.value

  let result = await axios.get('/api/cos', { params }).catch((err) => console.log(err))
  coList.value = result?.data ?? []
}

const selectCo = (cos) => {
  emit('select', cos)
  close()
}
</script>
 
 <!-- CoOrdr.vue -->
 <!-- 사용: <CoModal :visible="isCoModalVisible" @close="closeCoModal" @select="selectedCo" /> -->
