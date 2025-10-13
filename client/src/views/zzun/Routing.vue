<template>
  <!-- 검색 영역 -->
  <CCard md="4" class="mb-3" style="overflow-y: auto">
    <CCardBody class="p-2 flex-column">
      <div class="table-wrapper" style="display: flex; align-items: center">
        <select class="form-select" style="width: 130px; margin-right: 8px" v-model="pickValue">
          <option value="prdt_id">코드</option>
          <option value="prdt_nm">제품명</option>
        </select>
        <!-- 검색어 입력창 -->
        <input
          type="text"
          class="form-control"
          style="width: 150px; margin-right: 8px"
          v-model="searchKeyword"
          placeholder="검색어 입력"
        />
        <CButton color="secondary" class="me-2" @click="masterReset()">초기화</CButton>
        <button class="btn btn-secondary" @click="prdtSearch">검색</button>
      </div>
    </CCardBody>
  </CCard>

  <CRow class="mb-3">
    <CCol md="4">
      <h6 class="fw-semibold mb-3">공정 라우팅관리</h6>
    </CCol>
  </CRow>

  <!-- 왼쪽영역 그리드 : 검색 결과 테이블 -->
  <CRow>
    <CCol md="5">
      <table class="table table-bordered table-hover">
        <thead>
          <tr>
            <th>코드</th>
            <th>제품명</th>
            <th>규격</th>
            <th>제품명</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(prdts, i) in prdtList"
            :key="i"
            @dblclick="selectProduct(prdts)"
            style="cursor: pointer"
          >
            <td>{{ prdts.prdt_id }}</td>
            <td>{{ prdts.prdt_nm }}</td>
            <td>{{ prdts.spec }}</td>
            <td>{{ prdts.opt_nm }}</td>
          </tr>
          <tr v-if="prdtList.length === 0">
            <td colspan="4" class="text-center text-muted">검색 결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </CCol>
  </CRow>

  <!-- 가로 분할: 왼쪽영역/ 오른쪽영역 / 영역크기 다름 -->
  <CRow style="height: 400px">
    <!-- 좌측: 데이터 그리드 -->
    <CCol md="4" class="d-flex"> </CCol>
  </CRow>
  <!-- 신규/저장/삭제 버튼 -->
  <!--<div class="d-flex justify-content-end gap-2 mb-2">
    <CButton color="secondary" size="sm" @click="handleSearch">조회</CButton>
    <CButton color="secondary" size="sm" @click="handleNew">신규</CButton>
    <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
    <CButton color="danger" size="sm" @click="handleDelete">삭제</CButton>
  </div> -->
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const pickValue = ref('prdt_nm') // 검색 기준 (기본값: 제품명)
const searchKeyword = ref('') // 검색어
const prdtList = ref([]) // 검색 결과 리스트

// 🔍 검색 함수
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

  try {
    const result = await axios.get('/api/prdts', { params })
    prdtList.value = result.data
  } catch (err) {
    console.error('검색 오류:', err)
  }
}

function masterReset() {
  prdtList.value = ''
}

// ✅ 더블클릭 시 선택 이벤트 (추가 기능용)
const selectProduct = (prdts) => {
  ;`선택된 제품: ${prdts.prdt_nm}`
}
</script>
