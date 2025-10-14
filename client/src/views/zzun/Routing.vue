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
  <CRow style="height: 600px">
    <CCol md="6">
      <CCard class="p-3">
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <th>코드</th>
              <th>제품명</th>
              <th>규격</th>
              <th>옵션</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(prdts, i) in prdtList"
              :key="i"
              @click="selectProduct(prdts)"
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
      </CCard>
    </CCol>

    <!-- 오른쪽 上영역 : 제품 상세정보 -->
    <CCol md="5">
      <CCard class="p-3" style="height: 45%">
        <h6 class="fw-bold mb-3">제품 상세정보</h6>
        <div v-if="selectedProduct">
          <CRow>
            <CCol md="6" class="mb-2">
              <label class="form-label fw-semibold" style="font-size: 0.85rem">제품명</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="selectedProduct.prdt_nm"
                readonly
              />
            </CCol>
            <CCol md="6" class="mb-2">
              <label class="form-label fw-semibold" style="font-size: 0.85rem">제품코드</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="selectedProduct.prdt_id"
                readonly
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md="6" class="mb-2">
              <label class="form-label fw-semibold" style="font-size: 0.85rem">옵션</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="selectedProduct.opt_nm"
                readonly
              />
            </CCol>
            <CCol md="6" class="mb-2">
              <label class="form-label fw-semibold" style="font-size: 0.85rem">규격</label>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="selectedProduct.spec"
                readonly
              />
            </CCol>
          </CRow>
        </div>

        <div v-else class="text-muted text-center mt-5">
          좌측의 제품을 클릭하면 상세정보가 여기에 표시됩니다.
        </div>
      </CCard>

      <!-- 오른쪽 下영역: 라우팅 정보 -->
      <CCard class="p-3 flex-grow-1">
        <h6 class="fw-bold mb-3">라우팅 정보</h6>
        <table class="table table-bordered table-hover text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>공정명</th>
              <th>그룹설비명</th>
              <th>리드타임(분)</th>
              <th>금형사용유무</th>
              <th>공정등록일</th>
              <th>공정순서</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(route, idx) in routingInfo" :key="idx">
              <td>{{ route.prcs_nm }}</td>
              <td>{{ route.eqm_grp_nm }}</td>
              <td>{{ route.lead_tm }}</td>
              <td :class="route.mold_use_at === 'P1' ? 'text-primary fw-semibold' : 'text-muted'">
                {{ route.mold_use_at }}
              </td>
              <td>{{ route.prcs_reg_dt }}</td>
              <td>{{ route.prcs_ord }}</td>
            </tr>
            <tr v-if="!selectedProduct">
              <td colspan="6" class="text-muted text-center">
                제품을 선택하면 라우팅정보가 표시됩니다.
              </td>
            </tr>
          </tbody>
        </table>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const pickValue = ref('prdt_nm') // 검색 기준 (기본값: 제품명)
const searchKeyword = ref('') // 검색어
const prdtList = ref([]) // 검색 결과 리스트
const selectedProduct = ref(null) // 선택된 제품 저장

const prdtSearch = async () => {
  const params = { prdt_id: '', prdt_nm: '', spec: '', opt_nm: '' }
  if (pickValue.value == 'prdt_id') params.prdt_id = searchKeyword.value
  else if (pickValue.value == 'prdt_nm') params.prdt_nm = searchKeyword.value
  else if (pickValue.value == 'spec') params.spec = searchKeyword.value
  else params.opt_nm = searchKeyword.value

  try {
    const result = await axios.get('/api/prdts', { params })
    prdtList.value = result.data
  } catch (err) {
    console.error('검색 오류:', err)
  }
}

// 초기화
function masterReset() {
  prdtList.value = []
  selectedProduct.value = null
  searchKeyword.value = ''
}

const routingInfo = ref([])

// 라우팅 정보 조회 함수
const getRoutingInfo = async (prdt_id) => {
  try {
    const response = await axios.get('/api/prcs', {
      params: { prdt_id },
    })
    routingInfo.value = response.data
  } catch (error) {
    console.error('라우팅 정보 조회 오류:', error)
    routingInfo.value = []
  }
}

// 행 클릭 시 선택 제품 정보 상세 표시 + 라우팅 정보 조회
const selectProduct = (prdts) => {
  selectedProduct.value = { ...prdts }
  getRoutingInfo(prdts.prdt_id)
}
</script>

<style scoped>
/* ============================================
   전역 스타일
   ============================================ */
:deep(*) {
  font-family: '맑은 고딕', 'Malgun Gothic', sans-serif;
  line-height: 1.4;
  box-sizing: border-box;
  color: #000;
}

/* ============================================
   버튼 스타일
   ============================================ */
:deep(.btn) {
  font-size: 11px;
  color: #fff !important;
  padding: 0.5rem 2rem;
}

/* 높이 맞추기용 투명 버튼 영역 */
.button-spacer {
  visibility: hidden;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ============================================
   폼 요소 스타일
   ============================================ */
:deep(.form-label) {
  font-size: 11px;
  font-weight: normal;
  color: #444;
  margin-bottom: 0;
}

:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
  font-weight: normal;
  padding: 0.25rem 0.5rem;
}

/* ============================================
   테이블 스타일
   ============================================ */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: collapse;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 1;
}

:deep(.data-table th) {
  font-size: 12px;
  font-weight: bold;
  background-color: #e9ecef;
  color: #212529;
  text-align: center;
}

:deep(.data-table td) {
  font-size: 11px;
  vertical-align: middle;
}

:deep(.data-table tbody tr) {
  cursor: pointer;
}

/* 선택된 행 스타일 */
:deep(.selected-row) {
  background-color: #d9edf7 !important;
}

/* 빈 행 스타일 */
.empty-row td {
  height: 32px;
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 768px) {
  :deep(.form-label),
  :deep(.form-control),
  :deep(.form-select),
  :deep(.btn),
  :deep(th),
  :deep(td) {
    font-size: 11px !important;
  }
}
</style>
