<template>
  <CContainer fluid class="routing-page-container h-100 d-flex flex-column p-3">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <button class="btn btn-sm btn-outline-secondary" @click="prdtSearch">조회</button>
      <button class="btn btn-sm btn-outline-secondary" @click="masterReset">초기화</button>
    </div>

    <!-- 검색 필터 영역 (Eqm.vue 스타일) -->
    <div class="search-filter-box mb-2 vars-scope">
      <CRow class="g-3">
        <CCol :md="6">
          <label class="form-label">제품 명</label>
          <input
            type="text"
            class="form-control"
            v-model="searchForm.prdt_nm"
            placeholder="제품명을 입력하세요"
          />
        </CCol>
        <CCol :md="6">
          <label class="form-label">옵션 명</label>
          <input
            type="text"
            class="form-control"
            v-model="searchForm.opt_nm"
            placeholder="옵션명을 입력하세요"
          />
        </CCol>
      </CRow>
    </div>

    <!-- 왼쪽영역 그리드 : 검색 결과 테이블 -->
    <CRow class="flex-grow-1 overflow-hidden g-2">
      <CCol md="5" class="d-flex flex-column overflow-hidden">
        <CCard class="p-3 flex-grow-1 d-flex flex-column">
          <div class="table-wrapper">
            <table class="data-table">
              <thead class="table-light">
                <tr>
                  <th style="width: 60px">No</th>
                  <th>제품ID</th>
                  <th>제품명</th>
                  <th>옵션ID</th>
                  <th>옵션명</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(prdts, i) in prdtList"
                  :key="i"
                  @click="selectProduct(prdts)"
                  :class="{
                    'selected-row':
                      selectedProduct &&
                      selectedProduct.prdt_id === prdts.prdt_id &&
                      selectedProduct.prdt_opt_id === prdts.prdt_opt_id,
                  }"
                  style="cursor: pointer"
                >
                  <td class="text-center">{{ i + 1 }}</td>
                  <td>{{ prdts.prdt_id }}</td>
                  <td>{{ prdts.prdt_nm }}</td>
                  <td>{{ prdts.prdt_opt_id }}</td>
                  <td>{{ prdts.opt_nm }}</td>
                </tr>
                <tr v-if="prdtList.length === 0">
                  <td colspan="5" class="text-center text-muted">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CCard>
      </CCol>

      <!-- 오른쪽 上영역 : 제품 상세정보 -->
      <CCol md="7" class="d-flex flex-column justify-content-between overflow-hidden">
        <CCard class="p-3 mb-3 flex-grow-1 details-card" style="flex-basis: 40%">
          <div>
            <CRow>
              <CCol md="6" class="mb-2">
                <label class="form-label fw-semibold" style="font-size: 0.85rem">제품명</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :value="selectedView.prdt_nm"
                  readonly
                />
              </CCol>
              <CCol md="6" class="mb-2">
                <label class="form-label fw-semibold" style="font-size: 0.85rem">옵션명</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :value="selectedView.opt_nm"
                  readonly
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6" class="mb-2">
                <label class="form-label fw-semibold" style="font-size: 0.85rem">규격</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :value="selectedView.spec"
                  readonly
                />
              </CCol>
              <CCol md="6" class="mb-2">
                <label class="form-label fw-semibold" style="font-size: 0.85rem">단위</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :value="selectedView.unit"
                  readonly
                />
              </CCol>
            </CRow>
          </div>
        </CCard>

        <!-- 오른쪽 下영역 상단 외부 툴바 -->
        <div class="d-flex justify-content-end align-items-center gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="openPrcsSearch"> 공정검색 </CButton>
          <!-- 모달 상태 -->
          <prcsModal
            :isPrcsModalOpen="isPrcsModalOpen"
            @close="closePrcsModal"
            @select="onSelectPrcs"
          />
          <CButton color="secondary" size="sm" @click="saveRoutingRows">저장</CButton>
          <CButton color="danger" size="sm" @click="deleteSelectedRows">삭제</CButton>
        </div>

        <!-- 오른쪽 下영역: 라우팅 정보 -->
        <CCard class="p-3 flex-grow-1" style="flex-basis: 60%">
          <h6 class="fw-bold mb-3 d-flex justify-content-between align-items-center"></h6>
          <div class="table-wrapper">
            <table class="data-table">
              <thead class="table-light">
                <tr>
                  <th><input type="checkbox" @change="toggleAllRouting($event)" /></th>
                  <th>No</th>
                  <th>공정ID</th>
                  <th>공정 명</th>
                  <th>설비 그룹 명</th>
                  <th>금형 사용 유무</th>
                  <th>공정 상태</th>
                  <th>리드 타임</th>
                  <th>공정 순서</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(route, idx) in routingInfo" :key="idx">
                  <td><input type="checkbox" v-model="route.selected" /></td>
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td>{{ route.prcs_id }}</td>
                  <td>{{ route.prcs_nm }}</td>
                  <td>{{ route.eqm_grp_nm }}</td>
                  <td>{{ route.mold_use_at_nm || route.mold_use_at }}</td>
                  <td>{{ route.st_nm || route.st }}</td>
                  <td>{{ route.lead_tm }}</td>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="route.prcs_ord"
                      style="width: 70px; text-align: right"
                    />
                  </td>
                </tr>

                <tr v-if="!selectedProduct">
                  <td colspan="9" class="text-muted text-center">라우팅 정보가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import prcsModal from '../modal/prcsModal.vue'

// 조회 조건 폼
const searchForm = reactive({
  prdt_nm: '',
  opt_nm: '',
})
const prdtList = ref([]) // 검색 결과 리스트
const selectedProduct = ref(null) // 선택된 제품 저장

// 상세 패널 표시용 null-안전 뷰 모델
const selectedView = computed(() => ({
  prdt_nm: selectedProduct.value?.prdt_nm ?? '',
  opt_nm: selectedProduct.value?.opt_nm ?? '',
  spec: selectedProduct.value?.spec ?? '',
  unit: selectedProduct.value?.unit ?? '',
}))

const prdtSearch = async () => {
  const params = { prdt_nm: '', prdt_opt_id: '' }
  // 조건이 없으면 전체 조회 -> 모든 필드 빈 문자열 유지
  if (searchForm.prdt_nm && searchForm.prdt_nm.trim()) {
    params.prdt_nm = searchForm.prdt_nm
  }
  if (searchForm.opt_nm && searchForm.opt_nm.trim()) {
    params.prdt_opt_id = searchForm.opt_nm
  }

  try {
    const result = await axios.get('/api/routing/prdts', { params })
    prdtList.value = result.data
  } catch (err) {
    console.error('검색 오류:', err)
  }
}

/* 행 저장(INSERT 또는 UPDATE, 백엔드 연동) */
const saveRoutingRows = async () => {
  if (!selectedProduct.value) return
  if (!routingInfo.value.length) return
  try {
    const res = await axios.post('/api/routing/deta/save', {
      prdt_id: selectedProduct.value.prdt_id,
      prdt_opt_id: selectedProduct.value.prdt_opt_id,
      rows: routingInfo.value.map((r) => ({
        prcs_routing_deta_id: r.prcs_routing_deta_id || '',
        prcs_id: r.prcs_id,
        prcs_ord: r.prcs_ord,
        prcs_reg_dt: r.prcs_reg_dt || new Date().toISOString().split('T')[0],
      })),
    })
    // 저장 후 재조회
    await getRoutingInfo(selectedProduct.value.prdt_id, selectedProduct.value.prdt_opt_id)
    if (res?.data?.success) {
      alert('저장에 성공 하였습니다.')
    } else {
      alert('저장에 실패했습니다.')
    }
  } catch (err) {
    console.error('행 저장 오류:', err)
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
  searchForm.prdt_nm = ''
  searchForm.opt_nm = ''
  selectedProduct.value = null
  routingInfo.value = []
}

const routingInfo = ref([])

// 라우팅 정보 조회 함수
const getRoutingInfo = async (prdt_id, prdt_opt_id) => {
  try {
    const response = await axios.get('/api/prdt/prcs', {
      params: { prdt_id, prdt_opt_id },
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
  getRoutingInfo(prdts.prdt_id, prdts.prdt_opt_id)
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
      prcs_routing_deta_id: '', // 신규 행은 빈값으로 처리
      prcs_id: prcs.prcs_id,
      prcs_nm: prcs.prcs_nm,
      eqm_grp_nm: prcs.eqm_grp_nm,
      lead_tm: prcs.lead_tm,
      mold_use_at: prcs.mold_use_at,
      mold_use_at_nm: prcs.mold_use_at_nm || prcs.mold_use_at,
      st: prcs.st,
      st_nm: prcs.st_nm || prcs.st,
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

/* 행 삭제(선택된 체크박스 삭제, 백엔드 연동) */
const deleteSelectedRows = async () => {
  if (!selectedProduct.value) return
  // 삭제 확인
  if (!confirm('삭제 하시겠습니까?')) return

  const toDelete = routingInfo.value
    .filter((r) => r.selected)
    .map((r) => ({
      prcs_routing_deta_id: r.prcs_routing_deta_id || '',
      prcs_id: r.prcs_id,
      prcs_ord: r.prcs_ord,
    }))
  if (toDelete.length === 0) return

  try {
    await axios.post('/api/routing/deta/delete', {
      prdt_id: selectedProduct.value.prdt_id,
      prdt_opt_id: selectedProduct.value.prdt_opt_id,
      rows: toDelete,
    })
    // 삭제 후 재조회
    getRoutingInfo(selectedProduct.value.prdt_id, selectedProduct.value.prdt_opt_id)
  } catch (err) {
    console.error('행 삭제 오류:', err)
  }
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

/* 검색 필터 박스 - Eqm.vue와 유사 스타일 */
.search-filter-box {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background: #ffffff;
}

/* 페이지 컨테이너 - Eqm.vue와 동일한 전체 높이/여백 */
:deep(.routing-page-container) {
  background: #ffffff;
  padding: 1rem !important;
  height: 100vh;
  overflow: hidden;
}

.table-wrapper {
  flex: 1;
  height: 100%;
  overflow-y: auto; /* 상하 스크롤 */
  overflow-x: hidden; /* 좌우 스크롤 제거 */
  border-radius: 10px;
}

.data-table {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  table-layout: fixed; /* 가로 폭 고정으로 가로 스크롤 방지 */
  width: 100%;
}
.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}
.data-table th {
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  letter-spacing: -0.2px;
}
.data-table th:first-child {
  border-top-left-radius: 10px;
}
.data-table th:last-child {
  border-top-right-radius: 10px;
}
.data-table td {
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
  overflow: hidden; /* 긴 텍스트 말줄임 */
  text-overflow: ellipsis;
  white-space: nowrap;
}
.data-table tbody tr {
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
}
.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

/* 선택된 행 스타일 - 모던 그레이 테마 (필요 시 적용) */
.selected-row {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%) !important;
  font-weight: 600;
  box-shadow: inset 0 0 0 2px #6c757d;
}
.selected-row td {
  border-bottom: 2px solid #495057;
  color: #212529;
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

/* 상세 카드 내 인풋 회색 처리 */
.details-card :deep(input[readonly]) {
  background-color: #f0f1f3 !important;
  color: #6b7280; /* 중간 톤 그레이 */
  border-color: #e5e7eb;
}
.details-card :deep(input[readonly]::placeholder) {
  color: #9ca3af;
}

@media (max-width: 1600px) {
  .btn {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}
</style>
