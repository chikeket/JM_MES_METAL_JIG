<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3 page-container">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2 button-group">
      <CButton color="secondary" size="sm" @click="prdtSearch" class="btn-search">조회</CButton>
      <CButton color="secondary" size="sm" @click="masterReset" class="btn-reset">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4 fade-in-up" style="animation-delay: 0.1s">
      <CRow class="g-3">
        <CCol :md="6">
          <CFormLabel class="form-label">제품 명</CFormLabel>
          <CFormInput
            v-model="searchForm.prdt_nm"
            size="sm"
            class="form-control"
            placeholder="제품명을 입력하세요"
          />
        </CCol>
        <CCol :md="6">
          <CFormLabel class="form-label">옵션 명</CFormLabel>
          <CFormInput
            v-model="searchForm.opt_nm"
            size="sm"
            class="form-control"
            placeholder="옵션명을 입력하세요"
          />
        </CCol>
      </CRow>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2 fade-in-up" style="animation-delay: 0.2s">
      <!-- 좌측: 제품 목록 그리드 -->
      <CCol :md="5" class="d-flex flex-column overflow-hidden pe-1">
        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 10%">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">제품ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 30%">제품명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">옵션ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">옵션명</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(prdts, i) in prdtList"
                  :key="i"
                  @click="selectProduct(prdts)"
                  :class="{
                    'selected-row':
                      selectedProduct &&
                      selectedProduct.prdt_id === prdts.prdt_id &&
                      selectedProduct.prdt_opt_id === prdts.prdt_opt_id,
                  }"
                  class="data-row"
                >
                  <CTableDataCell class="text-center">{{ i + 1 }}</CTableDataCell>
                  <CTableDataCell>{{ prdts.prdt_id }}</CTableDataCell>
                  <CTableDataCell>{{ prdts.prdt_nm }}</CTableDataCell>
                  <CTableDataCell>{{ prdts.prdt_opt_id }}</CTableDataCell>
                  <CTableDataCell>{{ prdts.opt_nm }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-if="prdtList.length === 0">
                  <CTableDataCell colspan="5" class="text-center text-muted">
                    검색 결과가 없습니다.
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측 영역 -->
      <CCol :md="7" class="d-flex flex-column overflow-hidden ps-1">
        <!-- 상단: 제품 상세정보 -->
        <div class="form-box mb-2" style="flex: 0 0 auto">
          <div class="p-3">
            <CRow class="g-2">
              <CCol :md="6">
                <CFormLabel class="form-label">제품 상태</CFormLabel>
                <CFormInput
                  :value="selectedView.prdt_st_nm"
                  size="sm"
                  readonly
                  class="form-control"
                />
              </CCol>
              <CCol :md="6">
                <CFormLabel class="form-label">옵션 상태</CFormLabel>
                <CFormInput
                  :value="selectedView.opt_st_nm"
                  size="sm"
                  readonly
                  class="form-control"
                />
              </CCol>
              <CCol :md="6">
                <CFormLabel class="form-label">제품 비고</CFormLabel>
                <CFormInput :value="selectedView.rm" size="sm" readonly class="form-control" />
              </CCol>
              <CCol :md="6">
                <CFormLabel class="form-label">옵션 비고</CFormLabel>
                <CFormInput :value="selectedView.opt_rm" size="sm" readonly class="form-control" />
              </CCol>
            </CRow>
          </div>
        </div>

        <!-- 라우팅 정보 버튼 -->
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="openPrcsSearch" class="btn-action">
            공정검색
          </CButton>
          <prcsModal
            :isPrcsModalOpen="isPrcsModalOpen"
            @close="closePrcsModal"
            @select="onSelectPrcs"
          />
          <CButton color="danger" size="sm" @click="deleteSelectedRows" class="btn-action">
            행 삭제
          </CButton>
          <CButton color="secondary" size="sm" @click="saveRoutingRows" class="btn-action">
            저장
          </CButton>
        </div>

        <!-- 하단: 라우팅 정보 그리드 -->
        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 5%">
                    <input type="checkbox" @change="toggleAllRouting($event)" />
                  </CTableHeaderCell>
                  <CTableHeaderCell style="width: 7%">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 13%">공정ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">공정 명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">설비 그룹 명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 13%">금형 사용</CTableHeaderCell>
                  <CTableHeaderCell style="width: 10%">공정 상태</CTableHeaderCell>
                  <CTableHeaderCell style="width: 10%">리드 타임</CTableHeaderCell>
                  <CTableHeaderCell style="width: 12%">공정 순서</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="(route, idx) in routingInfo" :key="idx" class="data-row">
                  <CTableDataCell class="text-center">
                    <input type="checkbox" v-model="route.selected" />
                  </CTableDataCell>
                  <CTableDataCell class="text-center">{{ idx + 1 }}</CTableDataCell>
                  <CTableDataCell>{{ route.prcs_id }}</CTableDataCell>
                  <CTableDataCell>{{ route.prcs_nm }}</CTableDataCell>
                  <CTableDataCell>{{ route.eqm_grp_nm }}</CTableDataCell>
                  <CTableDataCell>{{ route.mold_use_at_nm || route.mold_use_at }}</CTableDataCell>
                  <CTableDataCell>{{ route.st_nm || route.st }}</CTableDataCell>
                  <CTableDataCell>{{ route.lead_tm }}</CTableDataCell>
                  <CTableDataCell>
                    <CFormInput
                      v-model="route.prcs_ord"
                      size="sm"
                      class="form-input-inline"
                      type="text"
                    />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-if="!selectedProduct">
                  <CTableDataCell colspan="9" class="text-muted text-center">
                    라우팅 정보가 없습니다.
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
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
const prdtList = ref([])
const selectedProduct = ref(null)

// 상세 패널 표시용 null-안전 뷰 모델
const selectedView = computed(() => ({
  prdt_st_nm: selectedProduct.value?.prdt_st_nm ?? '',
  opt_st_nm: selectedProduct.value?.opt_st_nm ?? '',
  rm: selectedProduct.value?.rm ?? '',
  opt_rm: selectedProduct.value?.opt_rm ?? '',
}))

const prdtSearch = async () => {
  const params = { prdt_nm: '', prdt_opt_id: '' }
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

const openPrcsSearch = () => {
  console.log('[routing] 공정 조회 모달 열기')
  isPrcsModalOpen.value = true
}

const isPrcsModalOpen = ref(false)

const closePrcsModal = () => {
  isPrcsModalOpen.value = false
  console.log('[routing] 공정 조회 모달 닫기')
}

function masterReset() {
  prdtList.value = []
  selectedProduct.value = null
  searchForm.prdt_nm = ''
  searchForm.opt_nm = ''
  routingInfo.value = []
}

const routingInfo = ref([])

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

const toggleAllRouting = (event) => {
  const checked = event.target.checked
  routingInfo.value.forEach((route) => (route.selected = checked))
}

const selectProduct = (prdts) => {
  selectedProduct.value = { ...prdts }
  getRoutingInfo(prdts.prdt_id, prdts.prdt_opt_id)
}

const onSelectPrcs = (selectedPrcsList) => {
  console.log('[routing] 선택된 공정목록:', selectedPrcsList)

  if (!selectedProduct.value) {
    alert('제품을 먼저 선택하세요.')
    return
  }

  const existingKey = (p) => `${p.prcs_id}||${p.prcs_nm}`
  const currentSet = new Set(routingInfo.value.map((r) => existingKey(r)))

  const toAdd = selectedPrcsList
    .filter((p) => !currentSet.has(existingKey(p)))
    .map((prcs, idx) => ({
      prcs_routing_deta_id: '',
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

  closePrcsModal()
  console.log('[routing] 라우팅정보 갱신 후:', routingInfo.value)
}

const deleteSelectedRows = async () => {
  if (!selectedProduct.value) return
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
    getRoutingInfo(selectedProduct.value.prdt_id, selectedProduct.value.prdt_opt_id)
  } catch (err) {
    console.error('행 삭제 오류:', err)
  }
}
</script>

<style scoped>
/* 페이지 진입 애니메이션 */
.page-container {
  animation: pageLoad 0.5s ease-out;
}

@keyframes pageLoad {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.button-group {
  animation: fadeInDown 0.4s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

:deep(.container-fluid) {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  padding: 1.5rem !important;
  min-height: 100vh;
  overflow: auto;
  width: 100%;
}

.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 100;
}

.grid-box,
.form-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.form-box {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff !important;
}

:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

:deep(.btn-danger) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff !important;
}

:deep(.btn-danger:hover) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
  transform: translateY(-1px);
}

:deep(.btn:active) {
  transform: scale(0.98);
}

:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

:deep(.form-control) {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
}

:deep(.form-control:focus) {
  border-color: #6b7280;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  background-color: #ffffff;
  outline: none;
}

:deep(.form-control:disabled),
:deep(.form-control[readonly]) {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

:deep(.form-control)::placeholder {
  color: #cbd5e1;
}

.form-input-inline {
  font-size: 11px;
  font-weight: 400;
  padding: 0.3rem 0.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 28px;
  width: 70px;
  text-align: right;
}

.form-input-inline:focus {
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  background-color: #ffffff;
  outline: none;
}

.table-wrapper {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  scrollbar-gutter: stable;
}

.table-wrapper::-webkit-scrollbar {
  width: 16px;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.table-wrapper::-webkit-scrollbar-track {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 6px 0;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.05);
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  border-radius: 12px;
  border: 3px solid #f1f5f9;
  box-shadow: 0 3px 10px rgba(71, 85, 105, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-color: #e2e8f0;
  box-shadow: 0 5px 15px rgba(71, 85, 105, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scaleX(1.15);
}

.table-wrapper::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  border-width: 2px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.5), inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

.table-wrapper::-webkit-scrollbar-button {
  display: none;
}

.table-wrapper {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  font-size: 13px;
  width: 100%;
  display: table;
  table-layout: fixed;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
  display: table-header-group;
}

:deep(.data-table tbody) {
  display: table-row-group;
}

:deep(.data-table th) {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.85rem 0.75rem;
  border: none;
  letter-spacing: -0.2px;
}

:deep(.data-table th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.data-table th:last-child) {
  border-top-right-radius: 12px;
}

:deep(.data-table td) {
  font-size: 13px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  height: 46px;
}

:deep(.data-table tbody tr.data-row) {
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr.data-row:hover) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

:deep(.selected-row) {
  background: #e5e7eb !important;
  font-weight: 600;
  box-shadow: inset 4px 0 0 0 #6b7280, 0 4px 12px rgba(107, 114, 128, 0.3) !important;
}

:deep(.selected-row td) {
  border-bottom: 1px solid #d1d5db !important;
  color: #1f2937 !important;
}

:deep(.form-check-input:checked) {
  background-color: #6b7280 !important;
  border-color: #6b7280 !important;
}

:deep(.form-check-input:checked:hover) {
  background-color: #4b5563 !important;
  border-color: #4b5563 !important;
}

:deep(.form-check-input:focus) {
  border-color: #6b7280 !important;
  box-shadow: 0 0 0 0.25rem rgba(107, 114, 128, 0.25) !important;
}
</style>