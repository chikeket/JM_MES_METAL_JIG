<template>
  <CRow class="mb-3" style="margin: 0 5%">
    <CCol md="12">
      <h6 class="fw-semibold mb-3" style="text-align: left; margin-left: 10px">공정 라우팅관리</h6>
    </CCol>
  </CRow>

  <!-- 검색 영역 -->
  <CCard class="mb-3" style="margin: 0 5%; overflow-y: auto">
    <CCardBody class="p-2 flex-column">
      <div
        class="table-wrapper"
        style="display: flex; align-items: center; justify-content: center"
      >
        <select class="form-select" style="width: 130px; margin-right: 5px" v-model="pickValue">
          <option value="prdt_id">코드</option>
          <option value="prdt_nm">제품명</option>
        </select>
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

  <!-- 왼쪽영역 그리드 : 검색 결과 테이블 -->
  <CRow style="height: 600px; margin: 0 5%">
    <CCol md="5">
      <CCard class="p-3 h-100">
        <table class="table table-bordered table-hover text-center align-middle">
          <thead class="table-light">
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
    <CCol md="7" class="d-flex flex-column justify-content-between">
      <CCard class="p-3 mb-3 flex-grow-1" style="flex-basis: 40%">
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
      <CCard class="p-3 flex-grow-1" style="flex-basis: 60%">
        <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center">
          <span>라우팅 정보</span>
          <div class="d-flex gap-2">
            <CButton color="secondary" size="sm" @click="openPrcsSearch"> 공정검색 </CButton>
            <!-- 모달 상태 -->
            <prcsModal
              v-model:visible="isPrcsModalOpen"
              @close="closePrcsModal"
              @select="onSelectPrcs"
            />

            <CButton color="danger" size="sm">행 삭제</CButton>
            <CButton color="secondary" size="sm">저장</CButton>
          </div>
        </h6>
        <div class="table-container">
          <table class="table table-bordered table-hover text-center align-middle">
            <thead class="table-light">
              <tr>
                <th>
                  <input type="checkbox" @change="toggleAllRouting($event)" />
                </th>
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
                <td>
                  <input type="checkbox" v-model="route.selected" />
                </td>
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
        </div>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import prcsModal from '../modal/prcsModal.vue'

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

// 공정 조회 모달 열기
const openPrcsSearch = () => {
  console.log('[routing]] 공정 조회 모달 열기')
  isPrcsModalOpen.value = true
}

// 모달 상태
const isPrcsModalOpen = ref(false)

// 모달 닫기 함수 (prcsModal에서 @close 이벤트를 받으면 실행될 함수)
const closePrcsModal = () => {
  isPrcsModalOpen.value = false
  console.log('[routing]] 공정 조회 모달 닫기')
}

// 초기화
function masterReset() {
  prdtList.value = []
  selectedProduct.value = null
  searchKeyword.value = ''
  selectedProduct.value = null
  routingInfo.value = []
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

// 전체 선택/해제
const toggleAllRouting = (event) => {
  const checked = event.target.checked
  routingInfo.value.forEach((route) => (route.selected = checked))
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
  font-family: '맑은 고딕', 'Malgun Gothic', sans-serif !important;
  line-height: 1.4;
  box-sizing: border-box;
  color: #000;
  text-align: center !important;
}

/* ============================================
   버튼 스타일
   ============================================ */
:deep(.btn) {
  font-size: 12px;
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
   라우팅 정보 스크롤 영역 스타일
   ============================================ */
.routing-card {
  height: 55%; /* 오른쪽 상단 카드가 45%니까, 하단은 55% 정도로 균형 맞춤 */
  display: flex;
  flex-direction: column;
}

.table-container {
  flex-grow: 1;
  overflow-y: auto; /* 세로 스크롤 생성 */
  max-height: 300px; /* 필요 시 고정 높이 설정 */
}

.table-container table {
  margin-bottom: 0;
}

/* ============================================
   폼 요소 스타일
   ============================================ */
:deep(.form-label) {
  font-size: 10px;
  font-weight: normal;
  color: #444;
  margin-bottom: 0;
}

:deep(.form-control),
:deep(.form-select) {
  font-family: '맑은 고딕', 'Malgun Gothic', sans-serif !important;
  font-size: 12px;
  font-weight: normal;
  text-align: center !important;
  padding: 0.25rem 0.5rem;
}

/* ============================================
   라벨(label)도 가운데 정렬
   ============================================ */
:deep(.form-label) {
  text-align: center !important;
  display: block;
  width: 100%;
  font-size: 11px;
  font-family: '맑은 고딕', 'Malgun Gothic', sans-serif !important;
}

/* ============================================
   테이블 스타일
   ============================================ */
:deep(.table th),
:deep(.table td) {
  text-align: center !important;
  vertical-align: middle !important;
  font-family: '맑은 고딕', 'Malgun Gothic', sans-serif !important;
  font-size: 12px;
}

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
