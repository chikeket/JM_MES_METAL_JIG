<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="modal-backdrop"
      @click="closeModal"
    >
      <div
        class="modal-container"
        @click.stop
      >
        <div class="modal-header">
          <h5>검사서 목록</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
          ></button>
        </div>

        <div class="modal-body">
          <!-- 검색 조건 영역 -->
          <div class="search-area">
            <div class="row g-3">
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
              <div class="col-md-3">
                <label class="form-label">검사서 종류</label>
                <select
                  v-model="searchCondition.insp_type"
                  class="form-select"
                >
                  <option value="">전체</option>
                  <option value="delivery">납품서</option>
                  <option value="order">발주서</option>
                  <option value="instruction">지시서</option>
                  <option value="quality">품질검사서</option>
                </select>
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <button
                  type="button"
                  class="btn btn-primary me-2"
                  @click="onSearch"
                >
                  조회
                </button>
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="onReset"
                >
                  초기화
                </button>
              </div>
            </div>
          </div>

          <!-- 검사서 목록 테이블 -->
          <div class="table-area mt-3">
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
              <table class="table table-sm table-hover">
                <thead class="table-light">
                  <tr>
                    <th style="width: 50px;">선택</th>
                    <th style="width: 120px;">검사서번호</th>
                    <th style="width: 100px;">품목코드</th>
                    <th style="width: 150px;">품목명</th>
                    <th style="width: 80px;">검사수량</th>
                    <th style="width: 80px;">합격수량</th>
                    <th style="width: 80px;">불합격수량</th>
                    <th style="width: 80px;">검사상태</th>
                    <th style="width: 100px;">검사일자</th>
                    <th style="width: 100px;">검사자</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in inspectionList"
                    :key="item.insp_no"
                    @click="selectInspection(item)"
                    class="cursor-pointer"
                    :class="{ 'table-active': selectedInspection?.insp_no === item.insp_no }"
                  >
                    <td>
                      <input
                        type="radio"
                        :value="item.insp_no"
                        v-model="selectedInspectionNo"
                        @change="selectInspection(item)"
                      />
                    </td>
                    <td>{{ item.insp_no }}</td>
                    <td>{{ item.item_code }}</td>
                    <td>{{ item.item_name }}</td>
                    <td class="text-end">{{ Number(item.insp_qty || 0).toLocaleString() }}</td>
                    <td class="text-end">{{ Number(item.pass_qty || 0).toLocaleString() }}</td>
                    <td class="text-end">{{ Number(item.fail_qty || 0).toLocaleString() }}</td>
                    <td>
                      <span 
                        :class="{
                          'badge bg-success': item.insp_status === '완료',
                          'badge bg-warning': item.insp_status === '대기',
                          'badge bg-secondary': !item.insp_status
                        }"
                      >
                        {{ item.insp_status || '미정' }}
                      </span>
                    </td>
                    <td>{{ item.insp_date ? formatDate(item.insp_date) : '' }}</td>
                    <td>{{ item.insp_emp_name }}</td>
                  </tr>
                  <tr v-if="!inspectionList || inspectionList.length === 0">
                    <td colspan="10" class="text-center text-muted py-4">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            @click="onSelect"
            :disabled="!selectedInspection"
          >
            선택
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeModal"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import axios from 'axios'

// Props 정의
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emit 정의
const emit = defineEmits(['close', 'select'])

// 반응형 데이터
const inspectionList = ref([])
const selectedInspection = ref(null)
const selectedInspectionNo = ref('')

// 검색 조건
const searchCondition = reactive({
  item_code: '',
  item_name: '',
  insp_type: 'quality' // 기본값: 품질검사서
})

// 모달이 열릴 때 자동으로 데이터 조회
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    onSearch()
  } else {
    // 모달이 닫힐 때 선택 상태 초기화
    resetSelection()
  }
})

// 검사서 목록 조회
const onSearch = async () => {
  try {
    console.log('[inspectionModal] 검사서 조회 요청:', searchCondition)
    
    // 검사서 종류별로 다른 API 엔드포인트 호출
    let apiUrl = ''
    switch (searchCondition.insp_type) {
      case 'delivery':
        apiUrl = '/api/delivery/inspections'
        break
      case 'order':
        apiUrl = '/api/order/inspections' 
        break
      case 'instruction':
        apiUrl = '/api/instruction/inspections'
        break
      case 'quality':
      default:
        apiUrl = '/api/qltyInsp/list' // 기존 품질검사 API 사용
        break
    }
    
    console.log('[inspectionModal] API 호출 URL:', apiUrl)
    console.log('[inspectionModal] 요청 파라미터:', {
      item_code: searchCondition.item_code || '',
      item_name: searchCondition.item_name || '',
      insp_status: '완료'
    })
    
    const response = await axios.get(apiUrl, {
      params: {
        item_code: searchCondition.item_code || '',
        item_name: searchCondition.item_name || '',
        insp_status: '완료' // 완료된 검사서만 조회
      }
    })
    
    console.log('[inspectionModal] API 응답:', response)
    console.log('[inspectionModal] 응답 데이터:', response.data)
    
    inspectionList.value = response.data || []
    console.log('[inspectionModal] 검사서 조회 결과:', inspectionList.value.length + '건')
    
    // 검색 후 선택 상태 초기화
    resetSelection()
    
  } catch (error) {
    console.error('[inspectionModal] 검사서 조회 실패:', error)
    console.error('[inspectionModal] 에러 상세:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    })
    
    const errorMsg = error.response?.status === 404 
      ? '검사서 API를 찾을 수 없습니다. 서버 설정을 확인해주세요.'
      : `검사서 목록 조회 중 오류가 발생했습니다: ${error.message}`
    
    alert(errorMsg)
    inspectionList.value = []
  }
}

// 검색 조건 초기화
const onReset = () => {
  searchCondition.item_code = ''
  searchCondition.item_name = ''
  searchCondition.insp_type = 'quality'
  resetSelection()
}

// 검사서 선택
const selectInspection = (item) => {
  selectedInspection.value = { ...item }
  selectedInspectionNo.value = item.insp_no
  console.log('[inspectionModal] 검사서 선택:', selectedInspection.value)
}

// 선택 상태 초기화
const resetSelection = () => {
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
  if (!selectedInspection.value) {
    alert('검사서를 선택해주세요.')
    return
  }
  
  console.log('[inspectionModal] 최종 선택된 검사서:', selectedInspection.value)
  emit('select', selectedInspection.value)
  closeModal()
}

// 모달 닫기
const closeModal = () => {
  resetSelection()
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