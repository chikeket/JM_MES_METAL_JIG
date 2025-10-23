<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>자재 발주서 조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="d-flex gap-2 mb-3">
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">수불 명</label>
          <CFormInput v-model="searchOrderNm" style="width: 140px" />
        </div>
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">수불 유형</label>
          <CFormInput v-model="searchOrderType" style="width: 100px" placeholder="IN/OUT" />
        </div>
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">담당자 명</label>
          <CFormInput v-model="searchOrderEmp" style="width: 100px" />
        </div>
        <div class="left-controls d-flex gap-2 align-items-center">
          <label class="search-label">수불 일자</label>
          <CFormInput type="date" v-model="searchOrderDate" style="width: 120px" />
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-secondary" @click="search">검색</button>
          <button class="btn btn-secondary" @click="resetSearch">초기화</button>
        </div>
      </div>

      <div style="max-height: 480px; overflow: auto">
        <table class="table table-sm table-hover mb-0">
          <thead>
            <tr>
              <th>수불 ID</th>
              <th>수불 명</th>
              <th>수불 유형</th>
              <th>담당자명</th>
              <th>등록일</th>
              <th>품목 명</th>
              <th>옵션 명</th>
              <th>수량</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in list" :key="p.wrhsdlvr_mas_id || i" @dblclick="select(p)">
              <td>{{ p.wrhsdlvr_mas_id }}</td>
              <td>{{ p.rcvpay_nm }}</td>
              <td>{{ p.rcvpay_ty }}</td>
              <td>{{ p.emp_nm }}</td>
              <td>{{ p.rcvpay_dt }}</td>
              <td>{{ p.prdt_nm || p.rsc_nm || '-' }}</td>
              <td>{{ p.opt_nm || '-' }}</td>
              <td>{{ p.all_rcvpay_qy ?? '-' }}</td>
            </tr>
            <tr v-if="list.length === 0">
              <td colspan="5" class="text-center text-muted">검색 결과 없음</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="close">닫기</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const auth = useAuthStore()

const searchOrderNm = ref('')
const searchOrderType = ref('')
const searchOrderEmp = ref('')
const searchOrderDate = ref('')
const list = shallowRef([])

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  console.log('[rscOrdrModal] 검색 조건 초기화')
  searchOrderNm.value = ''
  searchOrderType.value = ''
  searchOrderEmp.value = ''
  searchOrderDate.value = ''
  list.value = []
}

const search = async () => {
  try {
    // // 로그인 사용자 정보 가져오기
    // const currentUser = auth.user
    // if (!currentUser) {
    //   alert('로그인이 필요합니다.')
    //   return
    // }
    // const empId = currentUser.emp_id ?? currentUser.id
    // if (!empId) {
    //   alert('사용자 정보를 찾을 수 없습니다.')
    //   return
    // }
    const params = {
      rsc_ordr_nm: searchOrderNm.value || null,
      rcvpay_ty: searchOrderType.value || null,
      emp_nm: searchOrderEmp.value || null,
      reg_dt: searchOrderDate.value || null,
      emp_id: 'EMP005' ||empId || null,
    }
    const res = await axios.get('/api/wrhsdlvr/search', { params })
    const data = res?.data
    list.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('[wrhsdlvrModal] search error', err)
    list.value = []
  }
}

const select = async (row) => {
  try {
    const res = await axios.get(`/api/wrhsdlvr/${row.wrhsdlvr_mas_id}`)
    const { master, details } = res.data || {}
    emit('select', { master, details })
    close()
  } catch (err) {
    console.error('[wrhsdlvrModal] select error:', err)
    emit('select', { master: row, details: mappedDetails })
    close()
  }
}
</script>

<style scoped>
/* ============================================
	 기본 폰트 및 박스 설정
	 ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

/* ============================================
	 검색 영역
	 ============================================ */
.search-label {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
}

.left-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.ms-auto {
  margin-left: auto;
}

/* ============================================
	 버튼 스타일
	 ============================================ */
.btn {
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}
.btn-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
.btn:active {
  transform: translateY(0);
}

/* ============================================
	 폼 요소 스타일
	 ============================================ */
:deep(.form-control) {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}
:deep(.form-control:focus) {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}
:deep(input[type='date'].form-control) {
  font-size: 12px;
}

/* ============================================
	 테이블 스타일
	 ============================================ */
.table {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  table-layout: fixed;
  width: 100%;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.table thead th {
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table thead th:first-child {
  border-top-left-radius: 10px;
}
.table thead th:last-child {
  border-top-right-radius: 10px;
}

.table tbody td {
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.55rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #ffffff;
}

.table tbody td:last-child {
  border-right: none;
}

.table tbody tr {
  transition: all 0.2s ease;
  background-color: #ffffff;
  cursor: pointer;
}

/* hover 효과 */
.table {
  --row-hover-bg: var(
    --cui-table-hover-bg,
    var(
      --bs-table-hover-bg,
      rgba(var(--cui-emphasis-color-rgb, var(--bs-emphasis-color-rgb, 33, 37, 41)), 0.075)
    )
  );
}

.table tbody tr:hover {
  background-color: var(--row-hover-bg) !important;
}
.table tbody tr:hover td {
  background-color: var(--row-hover-bg) !important;
}

/* ============================================
	 모던 스크롤바
	 ============================================ */
div[style*='overflow']::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
div[style*='overflow']::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
div[style*='overflow']::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(2px);
  transition: all 0.2s ease;
}
div[style*='overflow']::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
div[style*='overflow'] {
  scrollbar-width: thin;
  scrollbar-color: #9ea2a8 rgba(240, 240, 240, 0.6);
}

/* ============================================
	 간격 조정
	 ============================================ */
.gap-2 {
  gap: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

/* ============================================
	 반응형
	 ============================================ */
@media (max-width: 1600px) {
  .search-label,
  :deep(.form-control),
  .btn,
  .table th,
  .table td {
    font-size: 11px !important;
  }
  .btn {
    padding: 0.4rem 1rem;
  }
}
</style>