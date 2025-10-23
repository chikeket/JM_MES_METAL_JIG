<template>
  <CModal :visible="visible" @close="onClose" size="xl">
    <CModalHeader class="modal-header-custom">
      <CModalTitle>금형 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <!-- 검색 영역 -->
      <div class="search-bar mb-3">
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">금형 ID</label>
          <CFormInput v-model="keyword" style="width: 220px" @keyup.enter="fetchMolds" />
        </div>
        <div class="flex-spacer"></div>
        <div class="right-controls">
          <CButton color="secondary" @click="fetchMolds">조회</CButton>
          <CButton color="secondary" @click="onReset">초기화</CButton>
        </div>
      </div>

      <!-- 결과 테이블 -->
      <div class="table-responsive">
        <CTable bordered hover small>
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 60px">No</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 140px">금형 ID</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 180px">금형 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 160px">제품 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 100px">유형</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">CAVITY</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 110px">누적 샷</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 110px"
                >샷 경고치</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 100px">폐기치</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 110px"
                >점검 주기</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >점검 일자</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 120px">상태</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 200px">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow
              v-for="(row, i) in rows"
              :key="row.mold_id"
              style="cursor: pointer"
              @dblclick="onDblClick(row)"
            >
              <CTableDataCell class="cell-no">{{ i + 1 }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.mold_id }}</CTableDataCell>
              <CTableDataCell class="cell-left text-ellipsis" :title="row.mold_nm">{{
                row.mold_nm
              }}</CTableDataCell>
              <CTableDataCell class="cell-left text-ellipsis" :title="row.prdt_nm">{{
                row.prdt_nm
              }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.mold_ty_nm || row.mold_ty }}</CTableDataCell>
              <CTableDataCell class="cell-number">{{ fmtNumber(row.CAVITY) }}</CTableDataCell>
              <CTableDataCell class="cell-number">{{ fmtNumber(row.accmlt_shot) }}</CTableDataCell>
              <CTableDataCell class="cell-number">{{ fmtNumber(row.warn_qy) }}</CTableDataCell>
              <CTableDataCell class="cell-number">{{ fmtNumber(row.dsuse_qy) }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.chck_cycle }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ fmtDate(row.chck_dt) }}</CTableDataCell>
              <CTableDataCell class="cell-left">{{ row.st_nm }}</CTableDataCell>
              <CTableDataCell class="cell-left text-ellipsis" :title="row.rm">{{
                row.rm
              }}</CTableDataCell>
            </CTableRow>
            <CTableRow v-if="rows.length === 0">
              <CTableDataCell colspan="13" class="text-center text-muted py-3">
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
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'selected'])

const visible = ref(!!props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    visible.value = !!v
    if (v) fetchMolds()
  },
)
watch(visible, (v) => emit('update:modelValue', v))

const keyword = ref('')
const rows = ref([])

async function fetchMolds() {
  try {
    const kw = (keyword.value || '').trim()
    const params = kw ? { mold_id: kw } : {}
    const { data } = await axios.get('/api/prcs-prog-precon/molds', { params })
    const list = Array.isArray(data) ? data : []
    // 상태가 '미사용'인 금형만 표시
    rows.value = list.filter((row) => (row?.st_nm || '').trim() === '미사용')
  } catch (err) {
    console.error('금형 조회 실패', err)
    rows.value = []
  }
}

function onReset() {
  keyword.value = ''
  fetchMolds()
}

function onClose() {
  keyword.value = ''
  visible.value = false
}

function fmtDate(d) {
  if (!d) return ''
  try {
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  } catch {
    return ''
  }
}

function fmtNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n.toLocaleString() : ''
}

onMounted(fetchMolds)

function onDblClick(row) {
  emit('selected', row)
  onClose()
}
</script>

<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 닫기(X) 버튼을 살짝 왼쪽으로 이동 */
  padding-right: 25px;
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
  min-width: 56px;
  text-align: right;
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

/* CoreUI 테이블 룩 앤 필 */
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
:deep(.table-responsive tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
}
:deep(.table-responsive tbody tr:hover) {
  background-color: #f8f9fa !important;
}
:deep(.table-responsive tbody tr:hover) td {
  background-color: #f8f9fa !important;
}

/* 모던 스크롤바 */
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

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
