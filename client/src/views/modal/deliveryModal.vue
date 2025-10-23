<template>
  <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5>출고서 목록</h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>

      <div class="modal-body">
        <!-- 검색 조건 영역 -->
        <div class="search-area">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">출고서 종류</label>
              <select v-model="searchCondition.insp_type" class="form-select">
                <option value="">전체</option>
                <option value="materialWithdrawal">자재 불출</option>
                <option value="deliveryDetail">완제품 납품</option>
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
              <label class="form-label">품목 명</label>
              <input
                v-model="searchCondition.item_name"
                type="text"
                class="form-control"
                placeholder="품목 명 입력"
                @keyup.enter="onSearch"
              />
            </div>
            <div class="col-md-3 d-flex align-items-end">
              <button type="button" class="btn btn-secondary me-2" @click="onSearch">조회</button>
              <button type="button" class="btn btn-secondary" @click="onReset">초기화</button>
            </div>
          </div>
        </div>

        <!-- 자재 불출의 경우 생산지시 상세 목록만 표시 -->
        <div v-if="searchCondition.insp_type === 'materialWithdrawal'" class="table-area mt-3">
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
                  <th style="width: 120px">검사서 ID</th>
                  <th style="width: 80px">품목 유형</th>
                  <th style="width: 100px">품목 코드</th>
                  <th style="width: 150px">품목 명</th>
                  <th style="width: 100px">옵션 코드</th>
                  <th style="width: 150px">옵션 명</th>
                  <th style="width: 80px">규격</th>
                  <th style="width: 60px">단위</th>
                  <th style="width: 80px">수량</th>
                  <th style="width: 100px">담당자 명</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in productionOrderList"
                  :key="item.withdrawal_id"
                  class="cursor-pointer"
                  :class="{
                    'table-active': selectedItems.some((s) => s.insp_no === item.withdrawal_id),
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
                  <td>{{ item.withdrawal_id }}</td>
                  <td>{{ item.item_type }}</td>
                  <td>{{ item.item_code }}</td>
                  <td>{{ item.item_name }}</td>
                  <td>{{ item.opt_code || '-' }}</td>
                  <td>{{ item.opt_name || '-' }}</td>
                  <td>{{ item.item_spec || '-' }}</td>
                  <td>{{ item.item_unit || '-' }}</td>
                  <td class="text-end">{{ Number(item.order_qty ?? item.drct_qy ?? item.DRCT_QY ?? item.required_qty ?? item.qty ?? 0).toLocaleString() }}</td>
                  <td>{{ item.emp_name }}</td>
                </tr>
                <tr v-if="!productionOrderList || productionOrderList.length === 0">
                  <td colspan="11" class="text-center text-muted py-4">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 기존 단일 그리드 (완제품 납품 등) -->
        <div v-else class="table-area mt-3">
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
                  <th style="width: 120px">출고서 코드</th>
                  <th style="width: 100px">품목 코드</th>
                  <th style="width: 150px">품목 명</th>
                  <th style="width: 100px">옵션 코드</th>
                  <th style="width: 150px">옵션 명</th>
                  <th style="width: 80px">출고 예정 수량</th>
                  <th style="width: 80px">출고 상태</th>
                  <th style="width: 100px">검사 일자</th>
                  <th style="width: 100px">검사자</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in inspectionList"
                  :key="item.insp_no"
                  class="cursor-pointer"
                  :class="{ 'table-active': selectedItems.some((s) => s.insp_no === item.insp_no) }"
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
                  <td class="text-end">{{ Number(item.pass_qty || 0).toLocaleString() }}</td>
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
                  <td colspan="9" class="text-center text-muted py-4">검색 결과가 없습니다.</td>
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

// 자재 불출용 추가 데이터
const productionOrderList = ref([])
const materialList = ref([])
const selectedProductionOrder = ref(null)

// 검색 조건
const searchCondition = reactive({
  item_code: '',
  item_name: '',
  insp_type: 'deliveryDetail', // 기본값: 완제품 품질 검사
})

// 계산된 속성
const allSelected = computed(() => {
  if (searchCondition.insp_type === 'materialWithdrawal') {
    // 자재 불출의 경우 productionOrderList 확인
    return (
      productionOrderList.value.length > 0 &&
      productionOrderList.value.every((item) => {
        const itemKey = item.withdrawal_id
        return selectedItems.value.some((s) => s.insp_no === itemKey)
      })
    )
  } else {
    return (
      inspectionList.value.length > 0 &&
      inspectionList.value.every((item) =>
        selectedItems.value.some((s) => s.insp_no === item.insp_no),
      )
    )
  }
})

// 검사서 목록 조회
const onSearch = async () => {
  try {
    const params = {
      item_code: searchCondition.item_code?.trim() || '',
      item_name: searchCondition.item_name?.trim() || '',
      insp_status: '완료', // 기본적으로 완료된 검사서만 조회
    }

    console.log('[deliveryModal] 전송 파라미터:', params)
    console.log('[deliveryModal] 검사서 종류:', searchCondition.insp_type)

    if (searchCondition.insp_type === 'materialWithdrawal') {
      // 자재 불출의 경우 생산지시 상세 목록 조회
      await loadProductionOrders(params)
    } else {
      // 기존 로직 (완제품 납품 등)
      await loadDeliveryProducts(params)
    }
  } catch (error) {
    console.error('[deliveryModal] 조회 실패:', error)
    alert('데이터 조회에 실패했습니다.')
  }
}

// 생산지시 상세 목록 조회 (자재 불출용)
const loadProductionOrders = async (params) => {
  const apiParams = {
    product_code: params.item_code || '',
    product_name: params.item_name || '',
  }

  console.log('[deliveryModal] 생산지시 조회 API 호출:', apiParams)

  const response = await axios.get('/api/production/orders/details', { params: apiParams })

  console.log('[deliveryModal] 생산지시 응답:', response.data)

  // 중복 제거: withdrawal_id + item_code + opt_code 조합으로 한 번만 출력
  const uniqueList = []
  const seen = new Set()
  for (const item of (response.data || [])) {
    const key = `${item.withdrawal_id}_${item.item_code}_${item.opt_code || ''}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueList.push(item)
    }
  }
  productionOrderList.value = uniqueList
  materialList.value = []
  selectedProductionOrder.value = null
  resetSelection()
}

// 기존 완제품 납품 목록 조회
const loadDeliveryProducts = async (params) => {
  // 검사서 종류에 따라 다른 API 호출 (wrhousdlvr 라우터 사용)
  let apiUrl = '/delivery/products/list'

  // 검사서 종류를 params에 추가
  params.insp_type = searchCondition.insp_type

  switch (searchCondition.insp_type) {
    case 'deliveryDetail':
      // 완제품 납품 (출고) - 납품상세 기반 완제품 목록
      apiUrl = '/delivery/products/list'
      break

    default:
      // 전체 조회 (완제품 품질검사 기본)
      apiUrl = '/delivery/products/list'
      break
  }

  console.log('[deliveryModal] 호출 API:', apiUrl)

  const response = await axios.get(`/api${apiUrl}`, { params })

  console.log('[deliveryModal] API 응답:', response)
  console.log('[deliveryModal] 응답 데이터:', response.data)
  console.log('[deliveryModal] 응답 건수:', response.data?.length)
  console.log('[deliveryModal] 첫 번째 데이터 상세:', JSON.stringify(response.data?.[0], null, 2))

  if (response.data?.length > 100) {
    console.warn('[deliveryModal] 조회 결과가 100건을 초과합니다!')
  }

  // 중복 제거: insp_no + item_code + opt_code 조합으로 한 번만 출력
  const uniqueList = []
  const seen = new Set()
  for (const item of (response.data || [])) {
    const key = `${item.insp_no}_${item.item_code}_${item.opt_code || ''}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueList.push(item)
    }
  }
  inspectionList.value = uniqueList
  resetSelection()
}

// 검색 조건 초기화
const onReset = () => {
  searchCondition.item_code = ''
  searchCondition.item_name = ''
  searchCondition.insp_type = 'deliveryDetail'
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
  console.log('[deliveryModal] 단일 검사서 선택:', selectedInspection.value)
}

// 체크박스 선택/해제
const toggleSelection = (item) => {
  let itemKey
  if (searchCondition.insp_type === 'materialWithdrawal') {
    // 자재 불출의 경우 생산지시 ID 사용
    itemKey = item.withdrawal_id
  } else {
    itemKey = item.insp_no
  }

  const index = selectedItems.value.findIndex((s) => s.insp_no === itemKey)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      // 자재 불출의 경우 생산지시 정보로 저장
      if (searchCondition.insp_type === 'materialWithdrawal') {
        // API가 다양한 이름으로 수량 필드를 보낼 수 있으므로 안전하게 여러 키를 취합해서 전달
        const drctQy = item.drct_qy ?? item.DRCT_QY ?? item.required_qty ?? 0
        const possibleQty = item.possible_qty ?? item.can_qty ?? item.available_qty ?? 0
        selectedItems.value.push({
          insp_no: itemKey,
          insp_type: searchCondition.insp_type,
          item_type: item.item_type,
          item_code: item.item_code,
          item_name: item.item_name,
          opt_code: item.opt_code,
          opt_name: item.opt_name,
          item_spec: item.item_spec,
          item_unit: item.item_unit,
          // 보존용: 여러 필드로 전달하여 부모 컴포넌트가 어떤 필드를 사용하는지 상관없이 접근 가능
          required_qty: item.required_qty,
          drct_qy: drctQy,
          possible_qty: possibleQty,
          emp_name: item.emp_name,
          originalItem: { ...item },
        })
      } else {
        selectedItems.value.push({
          ...item,
          insp_no: itemKey,
          insp_type: searchCondition.insp_type,
        })
      }
  }
  console.log('[deliveryModal] 선택된 검사서들:', selectedItems.value)
}

// 전체 선택/해제
const toggleAll = (event) => {
    if (event.target.checked) {
      if (searchCondition.insp_type === 'materialWithdrawal') {
        // 자재 불출의 경우 생산지시 정보로 저장 (선택 항목에 가능한 수량/원본 항목 포함)
        selectedItems.value = productionOrderList.value.map((item) => {
          const drctQy = item.drct_qy ?? item.DRCT_QY ?? item.required_qty ?? 0
          const possibleQty = item.possible_qty ?? item.can_qty ?? item.available_qty ?? 0
          return {
            insp_no: item.withdrawal_id,
            insp_type: searchCondition.insp_type,
            item_type: item.item_type,
            item_code: item.item_code,
            item_name: item.item_name,
            opt_code: item.opt_code,
            opt_name: item.opt_name,
            item_spec: item.item_spec,
            item_unit: item.item_unit,
            required_qty: item.required_qty,
            drct_qy: drctQy,
            possible_qty: possibleQty,
            emp_name: item.emp_name,
            originalItem: { ...item },
          }
        })
      } else {
        selectedItems.value = inspectionList.value.map((item) => ({
          ...item,
          insp_type: searchCondition.insp_type,
        }))
      }
  } else {
    selectedItems.value = []
  }
}

// 선택 여부 확인
const isSelected = (item) => {
  let itemKey
  if (searchCondition.insp_type === 'materialWithdrawal') {
    itemKey = item.withdrawal_id
  } else {
    itemKey = item.insp_no
  }
  return selectedItems.value.some((s) => s.insp_no === itemKey)
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

  // 부모 컴포넌트가 일관된 키로 사용할 수 있도록 선택 데이터를 정규화해서 전달
  const normalized = selectedItems.value.map((item) => {
    // include order_qty (API may provide different field names)
    const planned_qty = item.order_qty ?? item.orderQy ?? item.drct_qy ?? item.DRCT_QY ?? item.required_qty ?? item.qty ?? 0
    const available_qty = item.available_qty ?? item.possible_qty ?? item.can_qty ?? item.remaining_qty ?? 0
    return {
      ...item,
      planned_qty,
      available_qty,
    }
  })

  console.log('[deliveryModal] 최종 선택된 검사서들 (원본):', selectedItems.value)
  console.log('[deliveryModal] 정규화된 선택 항목 (emit):', normalized)
  emit('select', normalized)
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
  console.log('[deliveryModal] 컴포넌트 마운트됨')
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
