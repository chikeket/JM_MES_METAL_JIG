<template>
  <CRow class="mb-3 vars-scope" style="margin: 0 5%">
    <CCol md="12">
      <h6 class="fw-semibold mb-3" style="text-align: left; margin-left: 10px">공정 라우팅관리</h6>
    </CCol>
  </CRow>

  <!-- 검색 영역 -->
  <div class="global-toolbar vars-scope" style="margin: 0 5%">
    <div
      class="toolbar-buttons"
      style="display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center"
    >
      <select class="form-select" style="width: 130px" v-model="pickValue">
        <option value="prdt_id">코드</option>
        <option value="prdt_nm">제품명</option>
      </select>
      <input
        type="text"
        class="form-control"
        style="width: 180px"
        v-model="searchKeyword"
        placeholder="검색어 입력"
      />
      <button class="btn btn-sm btn-outline-secondary" @click="masterReset">초기화</button>
      <button class="btn btn-sm btn-outline-secondary" @click="prdtSearch">검색</button>
    </div>
  </div>

  <!-- 왼쪽영역 그리드 : 검색 결과 테이블 -->
  <CRow style="height: 600px; margin: 0 5%">
    <CCol md="5">
      <CCard class="p-3 h-100">
        <div class="table-wrapper table-wrapper-expanded">
          <table class="data-grid">
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
        </div>
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
              :isPrcsModalOpen="isPrcsModalOpen"
              @close="closePrcsModal"
              @select="onSelectPrcs"
            />

            <CButton color="danger" size="sm" @click="deleteSelectedRows">행 삭제</CButton>
            <CButton color="secondary" size="sm">저장</CButton>
          </div>
        </h6>
        <div class="table-wrapper table-wrapper-expanded">
          <table class="data-grid">
            <thead class="table-light">
              <tr>
                <th>
                  <input type="checkbox" @change="toggleAllRouting($event)" />
                </th>
                <th>공정코드</th>
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
                <td>{{ route.prcs_id }}</td>
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
                <td colspan="8" class="text-muted text-center">
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
    const response = await axios.get('/api/prdt/prcs', {
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

/* --------------------
   추가된 함수: prcsModal에서 전달된 선택값을 받아 라우팅정보에 추가
   -------------------- */
const onSelectPrcs = (selectedPrcsList) => {
  console.log('[routing] 선택된 공정목록:', selectedPrcsList)

  if (!selectedProduct.value) {
    alert('제품을 먼저 선택하세요.')
    return
  }

  // 중복 방지: 동일 prcs_id, prcs_nm 이 이미 있으면 추가하지 않음
  const existingKey = (p) => `${p.prcs_id}||${p.prcs_nm}`

  const currentSet = new Set(routingInfo.value.map((r) => existingKey(r)))

  const toAdd = selectedPrcsList
    .filter((p) => !currentSet.has(existingKey(p)))
    .map((prcs, idx) => ({
      prcs_id: prcs.prcs_id,
      prcs_nm: prcs.prcs_nm,
      eqm_grp_nm: prcs.eqm_grp_nm,
      lead_tm: prcs.lead_tm,
      mold_use_at: prcs.mold_use_at,
      prcs_reg_dt: prcs.prcs_reg_dt || new Date().toISOString().split('T')[0],
      prcs_ord: routingInfo.value.length + 1 + idx,
      selected: false,
    }))

  if (toAdd.length > 0) {
    routingInfo.value.push(...toAdd)
  } else {
    console.log('[routing] 추가할 공정이 없습니다(중복 또는 빈값).')
  }

  // 모달 닫기
  closePrcsModal()
  console.log('[routing] 라우팅정보 갱신 후:', routingInfo.value)
}

/* 행 삭제(선택된 체크박스 삭제) */
const deleteSelectedRows = () => {
  routingInfo.value = routingInfo.value.filter((r) => !r.selected)
}
</script>

<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

.vars-scope {
  --radius-sm: 4px;
  --radius-md: 6px;
  --color-btn-gray: #6e7b85;
  --color-btn-gray-hover: #5d6871;
  --color-btn-danger: #c53030;
  --color-btn-danger-hover: #a82323;
  --color-btn-text: #fff;
  --table-visible-rows: 10;
  --row-h: 34px;
  --thead-h: 34px;
}

.global-toolbar {
  display: flex;
  justify-content: center;
  padding: 0 14px;
  margin-bottom: 8px;
}
.global-toolbar .toolbar-buttons {
  display: flex;
  gap: 6px;
}

.btn {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: var(--color-btn-text);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-sm,
.btn-xs {
  height: auto;
  padding: 0.5rem 1.2rem;
  font-size: 13px;
}
.btn-outline-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: var(--color-btn-text);
}
.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
.btn-outline-danger,
.btn.btn-outline-danger,
.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: var(--color-btn-text);
}
.btn-outline-danger:hover,
.btn-danger:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.table-wrapper {
  height: calc(var(--row-h) * var(--table-visible-rows) + var(--thead-h));
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #bcbcbc;
  border-radius: var(--radius-md);
}
.table-wrapper-expanded {
  margin-top: 0;
  background: #ffffff;
  padding: 0;
}
.data-grid {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 12px;
}
.data-grid thead th {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  z-index: 10;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: var(--thead-h);
}
.data-grid thead th:first-child {
  border-top-left-radius: var(--radius-sm);
}
.data-grid thead th:last-child {
  border-top-right-radius: var(--radius-sm);
}
.data-grid tbody td {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: var(--row-h);
}
.data-grid tbody td:last-child {
  border-right: none;
}
.data-grid tbody tr {
  height: var(--row-h);
  transition: all 0.2s ease;
  background-color: #ffffff;
}
.data-grid tbody tr:hover:not(.empty-row),
.data-grid tbody tr:hover:not(.empty-row) td,
.data-grid tbody tr:hover:not(.empty-row) .input-like {
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
}
.data-grid input,
.data-grid select,
.data-grid textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  background: transparent;
  padding: 2px 4px;
  font-size: 12px;
  border-radius: var(--radius-sm);
}
.data-grid input[readonly],
.data-grid input[readonly='readonly'] {
  background: #e9e9e9;
}
.data-grid input:focus,
.data-grid select:focus,
.data-grid textarea:focus {
  outline: none;
  border-color: #5b9dd9;
  background: #fff;
}
.status-cell.empty {
  background: #e9e9e9;
}
.empty-row td {
  background-color: #fafbfc;
}
.table-wrapper {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

@media (max-width: 1600px) {
  .btn {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}
</style>
