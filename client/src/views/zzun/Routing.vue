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
              :isPrcsModalOpen="isPrcsModalOpen"
              @close="closePrcsModal"
              @select="onSelectPrcs"
            />

            <CButton color="danger" size="sm" @click="deleteSelectedRows">행 삭제</CButton>
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
              
                <td class="cell-number editable" @click="startEdit(row, 'requestQty')">
              <template v-if="isCellEditing(row, 'requestQty')">
                <input
                  ref="qtyInputs"
                  type="text"
                  v-model="editValue"
                  @keyup.enter="commitEdit"
                  @blur="commitEdit"
                  @keyup.esc="cancelEdit"
                  class="editor-input text-end"
                  placeholder="입력"
                />
              </template>
              <template v-else>
                <div class="input-like input-like--compact input-like--number">
                  <span class="value" :class="{ 'placeholder-text': !row.requestQty }">
                    {{ row.requestQty ? formatNumber(row.requestQty) : '입력' }}
                  </span>
                </div>
              </template>
            </td>
              
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
/* 기존 스타일 그대로 유지 (생략 가능) */
:deep(*) {
  font-family: '맑은 고딕', 'Malgun Gothic', sans-serif !important;
  line-height: 1.4;
  box-sizing: border-box;
  color: #000;
  text-align: center !important;
}

/* ... (기존 스타일 전부 동일하게 유지) ... */

.table-container {
  flex-grow: 1;
  overflow-y: auto; /* 세로 스크롤 생성 */
  max-height: 300px; /* 필요 시 고정 높이 설정 */
}
</style>
