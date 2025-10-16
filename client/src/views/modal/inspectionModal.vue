<template>
  <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5>공정검색</h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>

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
              <button type="button" class="btn btn-secondary" @click="onResetpr">초기화</button>
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

// 검사서 목록 조회   밥 먹고 여기서부터 하셈 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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

    inspectionList.value = response.data || []
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.modal-header h5 {
  margin: 0;
  font-weight: 600;
  color: #495057;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:before {
  content: '×';
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.search-area {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.table-area {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.cursor-pointer {
  cursor: pointer;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table tbody tr.table-active {
  background-color: #e3f2fd !important;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25em 0.5em;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
