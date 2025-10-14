<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle>제품 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <!-- 검색 영역 -->
      <div class="search-bar mb-3">
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">제품명</label>
          <CFormInput v-model="searchPrdtNm" style="width: 200px" />
          <label class="search-label ml-3">제품옵션명</label>
          <CFormInput v-model="searchOptNm" style="width: 200px" />
        </div>
        <div class="flex-spacer"></div>
        <div class="right-controls">
          <CButton color="secondary" @click="searchProducts">조회</CButton>
          <CButton color="secondary" @click="reset">초기화</CButton>
        </div>
      </div>

      <!-- 결과 테이블 -->
      <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
        <CTable bordered hover small>
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 50px">No</CTableHeaderCell>
              <CTableHeaderCell class="text-center">제품 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center">제품 옵션 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center">생산 가능 여부</CTableHeaderCell>
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
              <CTableDataCell class="cell-left">{{ row.unit }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.prdt_st_nm || row.prdt_st }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.rm || '' }}</CTableDataCell>
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
const searchProducts = async () => {
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
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}
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

/* CompanyManage 스타일 적용 */
:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}
:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.25);
}

/* 테이블 헤더/바디 스타일 (CompanyManage 준용) */
:deep(.table-responsive) {
  border-radius: 10px;
}
:deep(.table-responsive thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}
:deep(.table-responsive thead th) {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%) !important;
  color: #ffffff !important;
  text-align: center;
  padding: 0.6rem 0.5rem;
  border: none;
}
:deep(.table-responsive tbody td) {
  font-size: 14px;
  vertical-align: middle;
}

/* Row hover - match prdtManage look */
:deep(.table-responsive tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
}
:deep(.table-responsive tbody tr:hover) {
  background-color: #f8f9fa !important;
  transform: scale(1.005);
}
/* Ensure cell background also changes to the same tone */
:deep(.table-responsive tbody tr:hover) td {
  background-color: #f8f9fa !important;
}

/* 모던 스크롤바 (CompanyManage 준용) */
:deep(.table-responsive) {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
:deep(.table-responsive::-webkit-scrollbar) {
  width: 8px;
}
:deep(.table-responsive::-webkit-scrollbar-track) {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
:deep(.table-responsive::-webkit-scrollbar-thumb) {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
:deep(.table-responsive::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
</style>
