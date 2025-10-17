<template>
  <div v-if="isPrcsModalOpen" class="modal-backdrop" @click="closeModal">
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
              <label class="form-label">검색조건</label>
              <select v-model="searchTerm.searchKind" class="form-select">
                <option value="all">전체</option>
                <option value="prcs_id">공정코드</option>
                <option value="prcs_nm">공정명</option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label">공정코드</label>
              <input
                v-model="searchTerm.prcs_id"
                type="text"
                class="form-control"
                placeholder="공정코드 입력"
                @keyup.enter="prcsSearch"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">공정명</label>
              <input
                v-model="searchTerm.prcs_nm"
                type="text"
                class="form-control"
                placeholder="공정명 입력"
                @keyup.enter="prcsSearch"
              />
            </div>
          </div>

          <div class="col-md-3 d-flex align-items-end">
            <button type="button" class="btn btn-secondary me-2" @click="prcsSearch">조회</button>
            <button type="button" class="btn btn-secondary" @click="prcsReset">초기화</button>
          </div>
        </div>
      </div>

      <!-- 공정 목록 테이블 -->
      <div class="table-area mt-3">
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
          <table class="table table-sm table-hover">
            <thead class="table-light">
              <tr>
                <th style="width: 50px">
                  <input
                    type="checkbox"
                    :checked="allChoice"
                    @change="toggleAll($event)"
                    class="form-check-input"
                  />
                </th>
                <th>공정아이디</th>
                <th>공정명</th>
                <th>설비그룹명</th>
                <th>리드타임</th>
                <th>금형사용유무</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="prcs in prcsList"
                :key="prcs.prcs_id"
                class="cursor-pointer"
                :class="{
                  'table-active': selectedPrcs.some(
                    (s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm,
                  ),
                }"
                @click="handleRowClick(prcs)"
              >
                <td @click.stop>
                  <input
                    type="checkbox"
                    :checked="choiceCheck(prcs)"
                    @change="checkboxDeselect(prcs)"
                    class="form-check-input"
                  />
                </td>
                <td>{{ prcs.prcs_id }}</td>
                <td>{{ prcs.prcs_nm }}</td>
                <td>{{ prcs.eqm_grp_nm }}</td>
                <td>{{ prcs.lead_tm }}</td>
                <td>{{ prcs.mold_use_at }}</td>
              </tr>
              <tr v-if="!prcsList || prcsList.length === 0">
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
        @click="onSelectPrcs"
        :disabled="selectedPrcs.length === 0"
      >
        선택 ({{ selectedPrcs.length }}건)
      </button>
      <button type="button" class="btn btn-secondary" @click="closeModal">취소</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
const pickValue = ref('') // 검색 기준 선택값
const searchKeyword = ref('') // 검색어

// Props 정의
const props = defineProps({
  isPrcsModalOpen: {
    type: Boolean,
    default: false,
  },
})

// Emit 정의
const emit = defineEmits(['close', 'select'])

// 반응형 데이터
const prcsList = ref([])
const selectedPrcs = ref([])
const selectedPrcsRow = ref(null)
const selectedPrcsRowNo = ref('')

// 검색 조건
const searchTerm = reactive({
  prcs_id: '',
  prcs_nm: '', // 기본값
  searchKind: 'all',
})

// 계산된 속성
const allChoice = computed(() => {
  return (
    prcsList.value.length > 0 &&
    prcsList.value.every((prcs) =>
      selectedPrcs.value.some((s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm),
    )
  )
})

// 공정 목록 조회
const prcsSearch = async () => {
  try {
    const params = { prcs_id: '', prcs_nm: '', eqm_grp_nm: '', lead_tm: '', mold_use_at: '' }

    // 간단한 매핑: 검색 종류가 pickValue 같은 외부 값이 아니라 searchTerm.searchKind 사용
    if (searchTerm.searchKind === 'prcs_id')
      params.prcs_id = searchTerm.prcs_id || searchTerm.prcs_nm
    else if (searchTerm.searchKind === 'prcs_nm')
      params.prcs_nm = searchTerm.prcs_nm || searchTerm.prcs_id
    else {
      params.prcs_id = searchTerm.prcs_id
      params.prcs_nm = searchTerm.prcs_nm
    }

    const result = await axios.get('/api/prcs', { params })
    prcsList.value = result.data
  } catch (err) {
    console.error('공정 검색 오류:', err)
    alert('검색 중 오류가 발생했습니다.')
  }
}

// 검색 조건 초기화
const prcsReset = () => {
  searchTerm.prcs_id = ''
  searchTerm.prcs_nm = ''
  selectedPrcs.value = []
}

// 행 클릭 핸들러 (체크박스 토글)
const handleRowClick = (prcs) => {
  checkboxDeselect(prcs)
  selectSinglePrcs(prcs)
}

// 단일 공정 선택 (행 클릭 시)
const selectSinglePrcs = (prcs) => {
  selectedPrcsRow.value = { ...prcs }
  selectedPrcsRowNo.value = prcs.prcs_id
  console.log('[prcsModal] 단일 공정 선택:', selectedPrcsRow.value)
}

// 체크박스 선택/해제
const checkboxDeselect = (prcs) => {
  // 고유 식별자: 공정ID + 공정명 조합
  const index = selectedPrcs.value.findIndex(
    (s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm,
  )
  if (index > -1) {
    selectedPrcs.value.splice(index, 1)
  } else {
    // 선택 시 원래 데이터 그대로 push
    selectedPrcs.value.push({ ...prcs })
  }
  console.log('[prcsModal] 선택된 공정들:', selectedPrcs.value)
}

// 전체 선택/해제
const toggleAll = (event) => {
  if (event.target.checked) {
    selectedPrcs.value = prcsList.value.map((prcs) => ({ ...prcs }))
  } else {
    selectedPrcs.value = []
  }
}

// 선택 여부 확인
const choiceCheck = (prcs) => {
  return selectedPrcs.value.some((s) => s.prcs_id === prcs.prcs_id && s.prcs_nm === prcs.prcs_nm)
}

// 선택 상태 초기화
const choiceReset = () => {
  selectedPrcs.value = []
  selectedPrcsRow.value = null
  selectedPrcsRowNo.value = ''
}

// 선택 확인
const onSelectPrcs = () => {
  if (selectedPrcs.value.length === 0) {
    alert('공정을 선택해주세요.')
    return
  }

  console.log('[prcsModal] 최종 선택된 공정들:', selectedPrcs.value)
  emit('select', selectedPrcs.value)
  closeModal()
}

// 모달 닫기 (이름을 template과 일치시킴)
const closeModal = () => {
  prcsReset()
  prcsList.value = []
  selectedPrcs.value = []
  emit('close')
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  console.log('[prcsModal] 컴포넌트 마운트됨')
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
