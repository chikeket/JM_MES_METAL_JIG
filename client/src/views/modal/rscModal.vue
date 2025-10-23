<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader><CModalTitle>자재 검색</CModalTitle></CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 500px; overflow-y: auto">
        <div class="d-flex gap-2 mb-3 align-items-center flex-wrap">
          <select class="form-select" style="width: 150px; flex-shrink: 0" v-model="pickValue">
            <option value="rsc_id">자재 코드</option>
            <option value="rsc_clsf_id">자재 분류</option>
            <option value="rsc_nm">자재 명</option>
            <option value="spec">규격</option>
            <option value="unit">단위</option>
          </select>
          <input
            type="text"
            class="form-control"
            v-model="searchKeyword"
            @keyup.enter="rscSearch"
            placeholder="검색어 입력"
            style="width: 300px; flex-shrink: 0"
          />
          <div class="ms-auto d-flex gap-2">
            <button class="btn btn-secondary" @click="rscSearch">검색</button>
            <button class="btn btn-secondary" @click="resetSearch">초기화</button>
          </div>
        </div>

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th style="width: 40px">
                <input type="checkbox" :checked="allSelected" @change="toggleAll($event)" />
              </th>
              <th>자재 코드</th>
              <th>분류</th>
              <th>자재 명</th>
              <th>규격</th>
              <th>단위</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rscList" :key="r.rsc_id || i" @click="toggleSelection(r)">
              <td @click.stop>
                <input type="checkbox" :checked="isSelected(r)" @change="toggleSelection(r)" />
              </td>
              <td>{{ r.rsc_id }}</td>
              <td>{{ mapRscClsf(r.rsc_clsf_id || r.rsc_ty) }}</td>
              <td>{{ r.rsc_nm }}</td>
              <td>{{ r.spec }}</td>
              <td>{{ r.rsc_unit || r.unit }}</td>
            </tr>
            <tr v-if="rscList.length === 0">
              <td colspan="6" class="text-center text-muted">검색결과가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="emitSelected">선택 ({{ selectedItems.length }}건)</CButton>
      <CButton color="secondary" @click="close">닫기</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, shallowRef, computed } from 'vue'
import axios from 'axios'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const pickValue = ref('rsc_nm')
const searchKeyword = ref('')
const rscList = shallowRef([])

// rsc_clsf_id 매핑: H1=원자재, H2=부자재, H3=외장재
function mapRscClsf(val) {
  const v = val ?? ''
  if (v === 'H1') return '원자재'
  if (v === 'H2') return '부자재'
  if (v === 'H3') return '외장재'
  return v
}

// 선택 관련 상태
const selectedItems = ref([])
const allSelected = computed(() => rscList.value.length > 0 && rscList.value.every(isSelected))

function isSelected(item) {
  return selectedItems.value.some((s) => s.rsc_id === (item.rsc_id || item.RSC_ID || item.rscId))
}

function toggleSelection(item) {
  const id = item.rsc_id || item.RSC_ID || item.rscId
  const idx = selectedItems.value.findIndex((s) => s.rsc_id === id)
  if (idx > -1) selectedItems.value.splice(idx, 1)
  else selectedItems.value.push({ ...item })
}

function toggleAll(event) {
  if (event.target.checked) {
    selectedItems.value = rscList.value.map((r) => ({ ...r }))
  } else {
    selectedItems.value = []
  }
}

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  pickValue.value = 'rsc_nm'
  searchKeyword.value = ''
  rscList.value = []
  selectedItems.value = []
}

const rscSearch = async () => {
  try {
    const params = { rsc_id: '', rsc_clsf_id: '', rsc_nm: '', spec: '', unit: '' }
    if (pickValue.value === 'rsc_id') params.rsc_id = searchKeyword.value || ''
    else if (pickValue.value === 'rsc_clsf_id') params.rsc_clsf_id = searchKeyword.value || ''
    else if (pickValue.value === 'rsc_nm') params.rsc_nm = searchKeyword.value || ''
    else if (pickValue.value === 'spec') params.spec = searchKeyword.value || ''
    else if (pickValue.value === 'unit') params.unit = searchKeyword.value || ''
    const res = await axios.get('/api/rscs', { params }).catch((err) => {
      throw err
    })
    const data = res?.data
    if (Array.isArray(data)) {
      rscList.value = data
    } else {
      rscList.value = []
    }
    selectedItems.value = []
  } catch (err) {
    rscList.value = []
    selectedItems.value = []
  }
}

// 선택된 자재 emit (여러개)
function emitSelected() {
  if (selectedItems.value.length === 0) {
    alert('자재를 선택해주세요.')
    return
  }
  // 정규화된 페이로드로 emit
  const items = selectedItems.value.map((r) => ({
    rsc_id: r?.rsc_id ?? r?.RSC_ID ?? r?.rscId ?? '',
    rsc_clsf_id: r?.rsc_clsf_id ?? r?.rsc_ty ?? '',
    rsc_nm: r?.rsc_nm ?? r?.RSC_NM ?? r?.rscNm ?? '',
    spec: r?.spec ?? r?.SPEC ?? '',
    unit: r?.unit ?? r?.rsc_unit ?? '',
    rsc_ordr_deta_id: r?.rsc_ordr_deta_id ?? null,
  }))
  emit('select', items)
  close()
}
</script>

<!-- RscOrdr.vue -->
<RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />

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
	 모달 바디 스타일
	 ============================================ */
.modal-body {
  background: #ffffff;
  padding: 1rem;
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
.form-control,
.form-select {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}
.form-control:focus,
.form-select:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
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

/* 체크박스 셀 스타일 */
.table tbody td:first-child,
.table thead th:first-child {
  text-align: center;
}

/* 체크박스 스타일 */
input[type='checkbox'] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #6c757d;
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
.modal-body::-webkit-scrollbar {
  width: 6px;
}
.modal-body::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(2px);
  transition: all 0.2s ease;
}
.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
.modal-body {
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

.ms-auto {
  margin-left: auto;
}

/* ============================================
	 반응형
	 ============================================ */
@media (max-width: 1600px) {
  .form-control,
  .form-select,
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
