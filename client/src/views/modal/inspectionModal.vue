<template>
  <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5>공정검색</h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>
      <!-- 커밋 용 -->
      <div class="modal-body">
        <!-- 검색 조건 영역 -->
        <div class="search-area">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">입고서 종류</label>
              <select v-model="searchCondition.insp_type" class="form-select">
                <option value="">전체</option>
                <option value="materialQuality">자재 품질 검사</option>
                <option value="semiQuality">반제품 품질 검사</option>
                <option value="finishedQuality">완제품 품질 검사</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">품목코드</label>
              <input
                v-model="searchCondition.item_code"
                type="text"
                class="form-control"
                placeholder="품목코드 입력"
                @keyup.enter="onSearch"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">품목명</label>
              <input
                v-model="searchCondition.item_name"
                type="text"
                class="form-control"
                placeholder="품목명 입력"
                @keyup.enter="onSearch"
              />
            </div>
            <div class="col-md-3 d-flex align-items-end">
              <button type="button" class="btn btn-secondary me-2" @click="onSearch">조회</button>
              <button type="button" class="btn btn-secondary" @click="onReset">초기화</button>
            </div>
          </div>
        </div>

        <!-- 검사서 목록 테이블 -->
        <div class="table-area mt-3">
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
            <table class="table table-sm table-hover">
              <thead class="table-light">
                <tr>
                  <th style="width: 50px">
                    <input
                      type="checkbox"
                      :checked="allSelected"
                      @change="toggleAll($event)"
                      class="form-check-input"
                    />
                  </th>
                  <th style="width: 120px">검사서 코드</th>
                  <th style="width: 100px">품목 코드</th>
                  <th style="width: 150px">품목 명</th>
                  <th style="width: 100px">옵션 코드</th>
                  <th style="width: 150px">옵션 명</th>
                  <th style="width: 80px">총 수량</th>
                  <th style="width: 80px">합격 수량</th>
                  <th style="width: 80px">불합격 수량</th>
                  <th style="width: 80px">검사 상태</th>
                  <th style="width: 100px">검사 일자</th>
                  <th style="width: 100px">검사자</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in inspectionList"
                  :key="item.insp_no"
                  class="cursor-pointer"
                  :class="{
                    'table-active': selectedItems.some(
                      (s) =>
                        s.insp_no === item.insp_no &&
                        s.item_code === item.item_code &&
                        s.opt_code === item.opt_code,
                    ),
                  }"
                  @click="handleRowClick(item)"
                >
                  <td @click.stop>
                    <input
                      type="checkbox"
                      :checked="isSelected(item)"
                      @change="toggleSelection(item)"
                      class="form-check-input"
                    />
                  </td>
                  <td>{{ item.insp_no }}</td>
                  <td>{{ item.item_code }}</td>
                  <td>{{ item.item_name }}</td>
                  <td>{{ item.opt_code || '-' }}</td>
                  <td>{{ item.opt_name || '-' }}</td>
                  <td class="text-end">{{ Number(item.insp_qty || 0).toLocaleString() }}</td>
                  <td class="text-end">{{ Number(item.pass_qty || 0).toLocaleString() }}</td>
                  <td class="text-end">{{ Number(item.fail_qty || 0).toLocaleString() }}</td>
                  <td>
                    <span
                      :class="{
                        'badge bg-success': item.insp_status === '완료',
                        'badge bg-warning': item.insp_status === '대기',
                        'badge bg-secondary': !item.insp_status,
                      }"
                    >
                      {{ item.insp_status || '미정' }}
                    </span>
                  </td>
                  <td>{{ item.insp_date ? formatDate(item.insp_date) : '' }}</td>
                  <td>{{ item.insp_emp_name }}</td>
                </tr>
                <tr v-if="!inspectionList || inspectionList.length === 0">
                  <td colspan="11" class="text-center text-muted py-4">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="onSelect"
          :disabled="selectedItems.length === 0"
        >
          선택 ({{ selectedItems.length }}건)
        </button>
        <button type="button" class="btn btn-secondary" @click="closeModal">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

// Props 정의
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

// Emit 정의
const emit = defineEmits(['close', 'select'])

// 반응형 데이터
const inspectionList = ref([])
const selectedItems = ref([])
const selectedInspection = ref(null)
const selectedInspectionNo = ref('')

// 검색 조건
const searchCondition = reactive({
  item_code: '',
  item_name: '',
  insp_type: 'finishedQuality', // 기본값: 완제품 품질 검사
})

// 계산된 속성
const allSelected = computed(() => {
  return (
    inspectionList.value.length > 0 &&
    inspectionList.value.every((item) =>
      selectedItems.value.some(
        (s) =>
          s.insp_no === item.insp_no &&
          s.item_code === item.item_code &&
          s.opt_code === item.opt_code,
      ),
    )
  )
})

// 검사서 목록 조회   
const onSearch = async () => {
  try {
    const params = {
      item_code: searchCondition.item_code?.trim() || '',
      item_name: searchCondition.item_name?.trim() || '',
      insp_status: '완료', // 기본적으로 완료된 검사서만 조회
    }

    console.log('[inspectionModal] 전송 파라미터:', params)
    console.log('[inspectionModal] 검사서 종류:', searchCondition.insp_type)

    // 검사서 종류에 따라 다른 API 호출 (wrhousdlvr 라우터 사용)
    let apiUrl = '/warehouse/inspections/list'

    // 검사서 종류를 params에 추가
    params.insp_type = searchCondition.insp_type

    switch (searchCondition.insp_type) {
      case 'materialQuality':
        // 자재 품질검사서 (입고)
        apiUrl = '/warehouse/rscQltyInsp/list'
        break

      case 'semiQuality':
        // 반제품 품질검사서 (입고)
        apiUrl = '/warehouse/semiPrdtQltyInsp/list'
        break

      case 'finishedQuality':
        // 완제품 품질검사서 (입고)
        apiUrl = '/warehouse/endPrdtQltyInsp/list'
        break

      default:
        // 전체 조회 (완제품 품질검사 기본)
        apiUrl = '/warehouse/endPrdtQltyInsp/list'
        break
    }

    console.log('[inspectionModal] 호출 API:', apiUrl)

    const response = await axios.get(`/api${apiUrl}`, { params })

    console.log('[inspectionModal] API 응답:', response)
    console.log('[inspectionModal] 응답 데이터:', response.data)
    console.log('[inspectionModal] 응답 건수:', response.data?.length)

    if (response.data?.length > 100) {
      console.warn('[inspectionModal] 조회 결과가 100건을 초과합니다!')
    }

    // 반제품 품질 검사서 조회 시 opt_code가 없는 검사서만 표시
    if (searchCondition.insp_type === 'semiQuality') {
      inspectionList.value = (response.data || []).filter(item => !item.opt_code)
    } else {
      inspectionList.value = response.data || []
    }
    resetSelection()
  } catch (error) {
    console.error('[inspectionModal] 검사서 조회 실패:', error)
    console.error('[inspectionModal] 에러 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    alert(`검사서 목록 조회 중 오류가 발생했습니다: ${error.message}`)
    inspectionList.value = []
  }
}

// 검색 조건 초기화
const onReset = () => {
  searchCondition.item_code = ''
  searchCondition.item_name = ''
  searchCondition.insp_type = 'finishedQuality'
  resetSelection()
}

// 행 클릭 핸들러 (체크박스 토글)
const handleRowClick = (item) => {
  toggleSelection(item)
  selectSingleInspection(item)
}

// 단일 검사서 선택 (행 클릭 시)
const selectSingleInspection = (item) => {
  selectedInspection.value = { ...item }
  selectedInspectionNo.value = item.insp_no
  console.log('[inspectionModal] 단일 검사서 선택:', selectedInspection.value)
}

// 체크박스 선택/해제
const toggleSelection = (item) => {
  // 고유 식별자: 검사서번호 + 품목코드 + 옵션코드 조합
  const index = selectedItems.value.findIndex(
    (s) =>
      s.insp_no === item.insp_no && s.item_code === item.item_code && s.opt_code === item.opt_code,
  )
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push({ ...item, insp_type: searchCondition.insp_type })
  }
  console.log('[inspectionModal] 선택된 검사서들:', selectedItems.value)
}

// 전체 선택/해제
const toggleAll = (event) => {
  if (event.target.checked) {
    selectedItems.value = inspectionList.value.map((item) => ({
      ...item,
      insp_type: searchCondition.insp_type,
    }))
  } else {
    selectedItems.value = []
  }
}

// 선택 여부 확인
const isSelected = (item) => {
  return selectedItems.value.some(
    (s) =>
      s.insp_no === item.insp_no && s.item_code === item.item_code && s.opt_code === item.opt_code,
  )
}

// 선택 상태 초기화
const resetSelection = () => {
  selectedItems.value = []
  selectedInspection.value = null
  selectedInspectionNo.value = ''
}

// 날짜 포맷팅
const formatDate = (dateStr) => {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0] // YYYY-MM-DD 형식
  } catch (error) {
    return dateStr
  }
}

// 선택 확인
const onSelect = () => {
  if (selectedItems.value.length === 0) {
    alert('검사서를 선택해주세요.')
    return
  }

  console.log('[inspectionModal] 최종 선택된 검사서들:', selectedItems.value)
  emit('select', selectedItems.value)
  closeModal()
}

// 모달 닫기
const closeModal = () => {
  onReset()
  inspectionList.value = []
  selectedItems.value = []
  emit('close')
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  console.log('[inspectionModal] 컴포넌트 마운트됨')
})
</script>

<style scoped>
/* 모달 백드롭 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 모달 컨테이너 */
.modal-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px 12px 0 0;
}

.modal-header h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.btn-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  padding: 0;
  transition: transform 0.2s ease;
}

.btn-close:before,
.btn-close:after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 2px;
  background: #6c757d;
  transition: background 0.2s ease;
}

.btn-close:before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.btn-close:after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.btn-close:hover {
  transform: scale(1.1);
}

.btn-close:hover:before,
.btn-close:hover:after {
  background: #495057;
}

/* 모달 바디 */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* 검색 영역 */
.search-area {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
}

.g-3 > * {
  padding: 0.5rem;
}

.col-md-3 {
  flex: 0 0 25%;
  max-width: 25%;
}

/* 폼 라벨 */
.form-label {
  display: block;
  font-weight: 600;
  font-size: 12px;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

/* 폼 컨트롤 */
.form-control,
.form-select {
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  width: 100%;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #6c757d;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.1);
}

/* 버튼 그룹 */
.d-flex {
  display: flex;
}

.align-items-end {
  align-items: flex-end;
}

.me-2 {
  margin-right: 0.5rem;
}

/* 버튼 */
.btn {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
}

/* 테이블 영역 */
.table-area {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #bcbcbc;
  border-radius: 8px;
  scrollbar-gutter: stable;
}

.table-responsive::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* 테이블 */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 12px;
  margin-bottom: 0;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.table thead th {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: 34px;
  white-space: nowrap;
}

.table thead th:first-child {
  border-top-left-radius: 4px;
}

.table thead th:last-child {
  border-top-right-radius: 4px;
}

.table tbody td {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: 34px;
  vertical-align: middle;
  text-align: center;
}

.table tbody td:last-child {
  border-right: none;
}

.table tbody tr {
  height: 34px;
  transition: all 0.2s ease;
  background: #fff;
  cursor: pointer;
}

.table tbody tr:hover td {
  background-color: rgba(33, 37, 41, 0.075) !important;
}

.table tbody tr.table-active td {
  background-color: #e7f1ff !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* 체크박스 */
.form-check-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  border: 2px solid #6c757d;
  border-radius: 3px;
}

.form-check-input:checked {
  background-color: #6c757d;
  border-color: #6c757d;
}

/* 텍스트 정렬 */
.text-end {
  text-align: right !important;
}

.text-center {
  text-align: center !important;
}

.text-muted {
  color: #6c757d !important;
}

.py-4 {
  padding-top: 1.5rem !important;
  padding-bottom: 1.5rem !important;
}

/* 배지 */
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  border-radius: 4px;
  white-space: nowrap;
}

.bg-success {
  background-color: #198754 !important;
  color: #fff;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

.bg-secondary {
  background-color: #6c757d !important;
  color: #fff;
}

/* 모달 푸터 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 2px solid #e5e7eb;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

/* 반응형 */
@media (max-width: 1600px) {
  .btn {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}

@media (max-width: 1200px) {
  .col-md-3 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 768px) {
  .col-md-3 {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .modal-container {
    width: 95%;
  }
}

@media (max-height: 900px) {
  .table-responsive {
    max-height: 350px;
  }
}

@media (max-height: 780px) {
  .table-responsive {
    max-height: 300px;
  }
}
</style>