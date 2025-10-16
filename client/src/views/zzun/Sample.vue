<template>
  <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5>입고서 목록</h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>

      <div class="modal-body">
        <!-- 검색 조건 영역 -->
        <div class="search-area">
          <div class="row g-3">
            <div>공정MODAL 출력값</div>

            <div class="col-md-3 d-flex align-items-end">
              <button type="button" class="btn btn-secondary me-2" @click="prcsSearch">조회</button>
              <button type="button" class="btn btn-secondary" @click="prcsReset">초기화</button>
            </div>

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
                      <th style="width: 120px">공정아이디</th>
                      <th style="width: 100px">공정명</th>
                      <th style="width: 150px">설비그룹명</th>
                      <th style="width: 100px">리드타임</th>
                      <th style="width: 150px">금형사용유무</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="prcs in selectPrcs"
                      :key="prcs.prcs_id"
                      class="cursor-pointer"
                      :class="{
                        'table-active': selectedPrcs.some(
                          (s) =>
                            s.prcs_id === prcs.prcs_id &&
                            s.prcs_nm === prcs.prcs_nm &&
                            s.eqm_grp_nm === prcs.eqm_grp_nm,
                        ),
                      }"
                      @click="handleRowClick(prcs)"
                    >
                      <td @click.stop>
                        <input
                          type="checkbox"
                          :checked="isSelected(prcs)"
                          @change="toggleSelection(prcs)"
                          class="form-check-input"
                        />
                      </td>
                      <td>{{ prcs.prcs_id }}</td>
                      <td>{{ prcs.prcs_nm }}</td>
                      <td>{{ prcs.eqm_grp_nm }}</td>
                      <td>{{ prcs.lead_tm }}</td>
                      <td>{{ prcs.mold_use_at }}</td>
                    </tr>
                    <tr v-if="!selectPrcs || selectPrcs.length === 0">
                      <td colspan="11" class="text-center text-muted py-4">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="choicePrcs"
                :disabled="selectedPrcs.length === 0"
              >
                선택 ({{ selectedPrcs.length }}건)
              </button>
              <button type="button" class="btn btn-secondary" @click="closeModal">취소</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
const selectPrcs = ref([])
const selectedPrcs = ref([])
const selectedInspection = ref(null)
const selectedInspectionNo = ref('')

// 검색 조건
const searchTerm = reactive({
  prcs_id: '',
  prcs_nm: '',
})

// 계산된 속성 : 즉, 전체선택
const allPrcs = computed(() => {
  return (
    prcsList.value.length > 0 &&
    prcsList.value.every((item) =>
      selectedPrcs.value.some(
        (s) =>
          s.prcs_id === prcs.prcs_id &&
          s.prcs_nm === prcs.prcs_nm &&
          s.eqm_grp_nm === prcs.eqm_grp_nm,
      ),
    )
  )
})

// 공정목록 검색 : Modal에서 공정목록 검색
const prcsSearch = async () => {
  try {
    const params = {
      prcs_id: searchTerm.prcs_id?.trim() || '',
      prcs_nm: searchTerm.prcs_nm?.trim() || '',
    }

    console.log('[prcsModal] 전송 파라미터:', params)

    // 공정목록 API 호출 (라우터 사용)

    const response = await axios.get('/api/prcs', { params })

    if (response.data?.length > 100) {
      console.warn('[inspectionModal] 조회 결과가 100건을 초과합니다!')
    }
    prcsList.value = response.data || []
    resetSelection()
  } catch (error) {
    console.error('[prcsModal] 공정목록 조회 실패:', error)
    console.error('[prcsModal] 에러 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    alert(`검사서 목록 조회 중 오류가 발생했습니다: ${error.message}`)
    prcsList.value = []
  }
}

// 검색 조건 초기화
const prcsReset = () => {
  searchTerm.prcs_id = ''
  searchTerm.prcs_nm = ''
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
const choiceReset = () => {
  selectedPrcs.value = []
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
const choicePrcs = () => {
  if (selectedPrcs.value.length === 0) {
    alert('공정을 선택해주세요.')
    return
  }

  console.log('[inspectionModal] 최종 선택된 검사서들:', selectedItems.value)
  emit('select', selectedItems.value)
  closeModal()
}

// 모달 닫기
const closeModal = () => {
  onReset()
  prcsList.value = []
  selectedPrcs.value = []
  emit('close')
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  console.log('[inspectionModal] 컴포넌트 마운트됨')
})
</script>

<style scoped></style>
ㄴ
