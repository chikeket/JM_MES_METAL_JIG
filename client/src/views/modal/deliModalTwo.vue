<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle>수주 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <!-- 검색 영역 -->
      <div class="search-bar mb-3">
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">수주 ID</label>
          <CFormInput v-model="searchRoNm" style="width: 200px" />
          <!-- <label class="search-label ml-3">제품옵션명</label>
          <CFormInput v-model="searchOptNm" style="width: 200px" /> -->
        </div>
        <div class="flex-spacer"></div>
        <div class="right-controls">
          <CButton color="secondary" @click="searchRcvords">조회</CButton>
          <CButton color="secondary" @click="reset">초기화</CButton>
        </div>
      </div>

      <!-- 결과 테이블 -->
      <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
        <CTable bordered hover small>
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 50px">No</CTableHeaderCell>
              <CTableHeaderCell class="text-center">수주 ID</CTableHeaderCell>
              <CTableHeaderCell class="text-center">납품 업체 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center">제품 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center">제품 옵션 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center">총 요청 수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center">기납품 수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center">미납품 수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell colspan="7" class="text-center py-3">로딩중...</CTableDataCell>
            </CTableRow>
            <CTableRow v-else-if="errorMsg">
              <CTableDataCell colspan="7" class="text-center text-danger py-3">{{
                errorMsg
              }}</CTableDataCell>
            </CTableRow>
            <CTableRow
              v-else
              v-for="(row, idx) in productList"
              :key="row.prdt_id + '_' + (row.prdt_opt_id || 'no_opt') + '_' + idx"
              @dblclick="selectProduct(row)"
              style="cursor: pointer"
            >
              <CTableDataCell class="cell-no">{{ idx + 1 }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.prdt_nm }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.opt_nm || '-' }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.spec }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{}}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.unit }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.prdt_st_nm || row.prdt_st }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{}}</CTableDataCell>
              <CTableDataCell class="cell-left">{{}}</CTableDataCell>
              <CTableDataCell class="cell-left">{{}}</CTableDataCell>
              <CTableDataCell class="cell-left">{{}}</CTableDataCell>
            </CTableRow>
            <CTableRow v-if="!loading && !errorMsg && !productList.length">
              <CTableDataCell colspan="7" class="text-center text-muted py-3">
                데이터가 없습니다.
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'select'])

// 상태
const searchPrdtNm = ref('')
const searchOptNm = ref('')
const productList = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 닫기
const close = () => {
  emit('close')
}

// 서버에서 제품 목록 가져오기 (기존 /prdts + prdtSelect 사용)
// prdtSelect 바인딩 순서: prdt_id, prdt_nm, spec, opt_nm LIKE
// 여기서는 prdt_id는 전체검색 위해 빈문자, spec은 전체검색 위해 빈문자 전달
const fetchAll = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const prdtNm = (searchPrdtNm.value || '').trim()
    const optNm = (searchOptNm.value || '').trim()
    const params = {
      prdt_id: '',
      prdt_nm: prdtNm,
      spec: '',
      opt_nm: optNm,
    }
    const { data } = await axios.get('/api/prdts', { params })
    productList.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('products fetch error', err)
    errorMsg.value = '조회 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// 조회 버튼 - 서버에서 검색어 기반 조회
const searchRcvords = async () => {
  await fetchAll()
}

// 초기화: 입력창 비우고 전체 재조회
const reset = async () => {
  searchPrdtNm.value = ''
  searchOptNm.value = ''
  await fetchAll()
}

// 행 선택 (더블클릭)
const selectProduct = (row) => {
  emit('select', row)
  close()
}

// 모달 표시될 때마다 목록 동기화
watch(
  () => props.visible,
  (v) => {
    if (v) {
      // 모달 열릴 때마다 검색조건 초기화 후 전체 재조회
      searchPrdtNm.value = ''
      searchOptNm.value = ''
      fetchAll()
    }
  },
)

// 수동 초기 로드 (이미 열려 있는 상태로 mount될 가능성)
onMounted(() => {
  if (props.visible && !productList.value.length) fetchAll()
})
</script>

<style scoped>
.text-danger {
  color: #dc3545;
}
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 12px;
}
.search-bar {
  display: flex;
  align-items: center;
}
.flex-spacer {
  flex: 1;
}
.right-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #222;
  display: inline-block;
  min-width: 70px;
  text-align: right;
}
.ml-3 {
  margin-left: 1rem;
}
/* 기존 nth-child 고정 폭 제거: 콘텐츠에 따라 자동 크기 */
::v-deep table {
  table-layout: auto !important; /* CoreUI 기본 fixed 일 경우 override */
  width: 100%;
}
/* 최소 가독성 확보: 너무 좁아지지 않게 주요 컬럼에 min-width 적용 (필요 시 자동 확대) */
::v-deep table thead th:nth-child(2),
::v-deep table tbody td:nth-child(2) {
  /* 제품 명 */
  min-width: 100px;
}
::v-deep table thead th:nth-child(3),
::v-deep table tbody td:nth-child(3) {
  /* 제품 옵션 명 */
  min-width: 100px;
}
::v-deep table thead th:nth-child(7),
::v-deep table tbody td:nth-child(7) {
  /* 비고 */
  min-width: 160px;
}
.cell-no {
  text-align: center !important;
}
.cell-number {
  text-align: right !important;
}
.cell-left {
  text-align: left !important;
}
</style>
