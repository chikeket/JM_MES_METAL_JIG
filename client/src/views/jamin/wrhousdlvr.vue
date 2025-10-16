<template>
  <CContainer fluid class="p-3">
    <!-- 상단 버튼 그룹 -->
    <div class="d-flex align-items-center mb-3 gap-2">
      <div>
        <!-- 선택된 버튼은 짙은 회색(btn-secondary), 선택안된 버튼은 outline 회색 -->
        <CButton
          :class="mode === 'in' ? 'btn-secondary' : 'btn-outline-secondary'"
          size="sm"
          @click="changeMode('in')"
          >입고</CButton
        >
        <CButton
          :class="mode === 'out' ? 'btn-secondary' : 'btn-outline-secondary'"
          size="sm"
          @click="changeMode('out')"
          >출고</CButton
        >
      </div>
      <div class="ms-auto d-flex gap-2">
        <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
        <CButton v-if="mode === 'in'" color="secondary" size="sm" @click="openInspectionSearch">
          입고서 조회
        </CButton>
        <CButton v-else color="secondary" size="sm" @click="openDeliverySearch">
          출고서 조회
        </CButton>
        <CButton color="secondary" size="sm" @click="onSave">저장</CButton>
        <CButton color="danger" size="sm">삭제</CButton>
      </div>
    </div>

    <!-- 입고서 선택 모달 -->
    <InspectionModal
      :isOpen="isInspectionModalOpen"
      @close="closeInspectionModal"
      @select="onSelectInspection"
    />

    <!-- 출고서 선택 모달 -->
    <DeliveryModal
      :isOpen="isDeliveryModalOpen"
      @close="closeDeliveryModal"
      @select="onSelectDelivery"
    />

    <!-- 요약(상단 소형 테이블) -->
    <div class="card mb-1" style="height: 35vh">
      <div class="card-header py-2">
        <h6 class="mb-0">입출고 상세 정보 (디테일)</h6>
      </div>
      <div class="card-body p-0" style="overflow: auto; height: calc(35vh - 60px)">
        <CTable hover bordered small class="mb-0">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell scope="col" class="text-center" style="width: 60px">
                <CFormCheck :checked="allSummarySelected" @change="toggleAllSummary($event)" />
              </CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px"
                >수불 담당자 명</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 120px"
                >검사서 ID</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 100px"
                >품목 유형</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >품목 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 200px">품목 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 130px"
                >옵션 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 150px">옵션 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 70px">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(r, i) in summaryRows" :key="r.id || i">
              <CTableDataCell class="text-center">
                <CFormCheck
                  :checked="isSummarySelected(r.id)"
                  @change="toggleSummaryRow(r.id, $event)"
                />
              </CTableDataCell>
              <CTableDataCell class="text-center">{{ r.emp_nm ?? '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.inspect_id || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.type || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.code || '' }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ r.name || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.opt_code || '-' }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ r.opt_name || '-' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.spec || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.unit || '' }}</CTableDataCell>
              <CTableDataCell class="text-end">
                <CFormInput
                  v-model.number="r.qty"
                  size="sm"
                  type="number"
                  min="0"
                  step="1"
                  @input="updateDetailTotals"
                />
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput v-model="r.remark" size="sm" placeholder="디테일 비고" />
              </CTableDataCell>
            </CTableRow>
            <CTableRow v-if="summaryRows.length === 0">
              <CTableDataCell colspan="12" class="text-center text-muted"
                >데이터 없음</CTableDataCell
              >
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>

    <!-- 메인 그리드 -->
    <div class="card" style="height: 35vh">
      <div class="card-header d-flex justify-content-between align-items-center py-2">
        <div class="fw-bold">입출고 상세 (선택된 품목별 총 수량)</div>
        <div class="text-muted small">
          선택된 항목: {{ selectedSummaryIds.length }} / {{ summaryRows.length }}
        </div>
      </div>

      <div class="card-body p-0" style="overflow: auto; height: calc(35vh - 60px)">
        <CTable hover bordered small class="mb-0 align-middle">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 70px">LOT</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">창고</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">로케이션</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 100px"
                >품목 유형</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >품목 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 200px">품목 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 130px"
                >옵션 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 150px">옵션 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 70px">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">총 수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            <CTableRow v-for="row in consolidatedRows" :key="row.id">
              <CTableDataCell class="text-center">
                {{ getLotDisplay(row) }}
              </CTableDataCell>
              <CTableDataCell class="text-center">{{ row.warehouse_name || '-' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.location_name || '-' }}</CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.type }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.code }} </CTableDataCell>
              <CTableDataCell class="text-start"> {{ row.name }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.opt_code || '-' }} </CTableDataCell>
              <CTableDataCell class="text-start"> {{ row.opt_name || '-' }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.spec }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.unit }} </CTableDataCell>
              <CTableDataCell class="text-end"> {{ row.total_qty }} </CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput
                  v-model="row.master_remark"
                  size="sm"
                  placeholder="마스터 비고"
                  style="min-width: 120px"
                />
              </CTableDataCell>
            </CTableRow>

            <CTableRow v-if="consolidatedRows.length === 0">
              <CTableDataCell colspan="12" class="text-center text-muted">
                {{ summaryRows.length === 0 ? '데이터 없음' : '선택된 항목이 없습니다' }}
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </CContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import InspectionModal from '../modal/inspectionModal.vue'
import DeliveryModal from '../modal/deliveryModal.vue'
import { useAuthStore } from '@/stores/auth.js'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CContainer,
} from '@coreui/vue'

const auth = useAuthStore()

// 상태
const mode = ref('in') // 'in' | 'out'
const summaryRows = ref([])

// 상단 그리드 선택 관리
const selectedSummaryIds = ref([])

// 로그인 사용자 → 담당자 표시 (RscOrdr.vue와 동일한 방식)
const ownerName = ref('')
const ownerEmpId = ref('')
watch(
  () => auth.user,
  (u) => {
    if (!u) {
      ownerName.value = ''
      ownerEmpId.value = ''
      return
    }
    ownerName.value = u.emp_nm ?? u.name ?? ''
    ownerEmpId.value = u.emp_id ?? u.id ?? ''
  },
  { immediate: true },
)

// 하단 그리드용 품목별 통합 데이터 (체크된 행만 표시)
const consolidatedRows = computed(() => {
  const consolidated = {}

  // 체크된 행만 필터링
  const checkedRows = summaryRows.value.filter((row) => selectedSummaryIds.value.includes(row.id))

  checkedRows.forEach((row) => {
    const key = `${row.code}_${row.opt_code || 'NO_OPT'}_${row.type}`

    if (consolidated[key]) {
      consolidated[key].total_qty += Number(row.qty) || 0
    } else {
      consolidated[key] = {
        id: row.id,
        lot: row.lot || '',
        warehouse_id: row.warehouse_id,
        warehouse_name: row.warehouse_name || '',
        location_id: row.location_id,
        location_name: row.location_name || '',
        type: row.type,
        code: row.code,
        name: row.name,
        opt_code: row.opt_code,
        opt_name: row.opt_name,
        spec: row.spec,
        unit: row.unit,
        total_qty: Number(row.qty) || 0,
        master_remark: `${mode.value === 'in' ? '입고' : '출고'} 처리 - ${row.name}`, // 마스터 비고 (하단 그리드 전용)
      }
    }
  })

  const result = Object.values(consolidated)
  console.log('[wrhousdlvr] consolidatedRows 계산됨 (체크된 행만):', result)
  return result
})

// LOT 표시 로직 (입고: -, 출고: 값 있으면 출력)
const getLotDisplay = (row) => {
  if (mode.value === 'in') {
    return '-' // 입고 시에는 항상 -
  } else {
    return row.lot || '-' // 출고 시에는 값이 있으면 출력, 없으면 -
  }
}

// 상단 그리드 선택 관리 함수들
const isSummarySelected = (id) => {
  return selectedSummaryIds.value.includes(id)
}

const toggleSummaryRow = (id, ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : !selectedSummaryIds.value.includes(id)
  if (checked) {
    if (!selectedSummaryIds.value.includes(id)) selectedSummaryIds.value.push(id)
  } else {
    selectedSummaryIds.value = selectedSummaryIds.value.filter((x) => x !== id)
  }
}

const allSummarySelected = computed(() => {
  if (summaryRows.value.length === 0) return false
  return summaryRows.value.every((row) => selectedSummaryIds.value.includes(row.id))
})

const toggleAllSummary = (ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : !allSummarySelected.value
  if (checked) {
    selectedSummaryIds.value = summaryRows.value.map((row) => row.id)
  } else {
    selectedSummaryIds.value = []
  }
}

// 모드 변경 시 데이터 초기화
const changeMode = (newMode) => {
  if (mode.value !== newMode) {
    mode.value = newMode
    summaryRows.value = []
    selectedSummaryIds.value = []
    console.log(`[wrhousdlvr] 모드 변경: ${newMode}`)
  }
}

// 메인 그리드 rows (현재 사용안함 - 마스터/디테일 구조로 변경)
// const rows = ref([])

// 선택 관리 (현재 사용안함 - 행 선택 기능 제거)
// const selectedIds = ref([])

// 모달 상태
const isInspectionModalOpen = ref(false)
const isDeliveryModalOpen = ref(false)

// ===== 사용하지 않는 함수들 (행 선택 관련) =====
// const isSelected = (id) => {
//   if (id == null) return false
//   return selectedIds.value.includes(id)
// }

// const toggleRow = (id, ev) => {
//   const checked = ev && ev.target ? !!ev.target.checked : !selectedIds.value.includes(id)
//   if (checked) {
//     if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
//   } else {
//     selectedIds.value = selectedIds.value.filter((x) => x !== id)
//   }
// }

// const allSelected = computed(() => {
//   const ids = rows.value.map((r) => r.id)
//   if (ids.length === 0) return false
//   return ids.every((id) => selectedIds.value.includes(id))
// })

// const toggleAll = (ev) => {
//   const checked = ev && ev.target ? !!ev.target.checked : !allSelected.value
//   const ids = rows.value.map((r) => r.id)
//   if (checked) {
//     for (const id of ids) if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
//   } else {
//     selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id))
//   }
// }

// 창고 및 로케이션 데이터
const warehouseList = ref([])
const locationList = ref([])

// 컴포넌트 마운트 시 전체 창고/로케이션 목록 로드
onMounted(async () => {
  console.log('[wrhousdlvr] 컴포넌트 마운트됨')
  await loadAllWarehouses()
  await loadAllLocations()
})

// 전체 창고 목록 조회
const loadAllWarehouses = async () => {
  try {
    console.log('[wrhousdlvr] 전체 창고 목록 조회 시작')
    const response = await axios.get('/api/warehouses/all')
    warehouseList.value = response.data || []
    console.log('[wrhousdlvr] 창고 목록 로드:', warehouseList.value.length, '건')
    console.log('[wrhousdlvr] 창고 데이터:', warehouseList.value)
  } catch (error) {
    console.error('[wrhousdlvr] 창고 목록 로드 실패:', error)
    console.error('[wrhousdlvr] 에러 상세:', error.response?.data || error.message)
    warehouseList.value = []
    // 에러가 발생해도 페이지는 정상적으로 로드되도록 함
  }
}

// 전체 로케이션 목록 조회
const loadAllLocations = async () => {
  try {
    const response = await axios.get('/api/locations/all')
    locationList.value = response.data || []
    console.log('[wrhousdlvr] 로케이션 목록 로드:', locationList.value.length, '건')
    console.log('[wrhousdlvr] 로케이션 데이터:', locationList.value)
  } catch (error) {
    console.error('[wrhousdlvr] 로케이션 목록 로드 실패:', error)
    locationList.value = []
  }
}

// 품목 유형별 창고 조회
const getWarehousesByItemType = async (itemType) => {
  try {
    console.log('[wrhousdlvr] 품목 유형별 창고 조회 시작')
    console.log('[wrhousdlvr] 요청 품목 유형:', itemType)
    console.log('[wrhousdlvr] 요청 URL:', '/api/warehouses/all')
    console.log('[wrhousdlvr] 요청 파라미터:', { item_type: itemType })

    const response = await axios.get('/api/warehouses/all', {
      params: { item_type: itemType },
    })

    console.log('[wrhousdlvr] 응답 전체:', response)
    console.log('[wrhousdlvr] 응답 상태:', response.status)
    console.log('[wrhousdlvr] 응답 데이터:', response.data)

    const warehouses = response.data || []
    console.log('[wrhousdlvr] 최종 창고 배열:', warehouses)
    console.log('[wrhousdlvr] 창고 개수:', warehouses.length)

    return warehouses
  } catch (error) {
    console.error('[wrhousdlvr] 품목 유형별 창고 조회 실패:', error)
    console.error('[wrhousdlvr] 에러 상세:', error.response?.data || error.message)
    return []
  }
}

// 품목 유형별 로케이션 조회
const getLocationsByItemType = async (itemType, warehouseId = null) => {
  try {
    console.log('[wrhousdlvr] 품목 유형별 로케이션 조회:', itemType, warehouseId)
    const params = { item_type: itemType }
    if (warehouseId) {
      params.warehouse_id = warehouseId
    }
    const response = await axios.get('/api/locations/all', { params })
    const locations = response.data || []
    console.log('[wrhousdlvr] 품목 유형별 로케이션 결과:', locations)
    return locations
  } catch (error) {
    console.error('[wrhousdlvr] 품목 유형별 로케이션 조회 실패:', error)
    return []
  }
}

// 상단 그리드 수량 변경 시 하단 그리드 총계 업데이트
const updateDetailTotals = () => {
  // consolidatedRows는 computed 속성이므로 자동으로 업데이트됨
  console.log('[wrhousdlvr] 하단 그리드 총계 업데이트됨 (체크된 행 기준)')
}

const onReset = () => {
  // 모든 상태 초기화
  summaryRows.value = []
  selectedSummaryIds.value = []
  mode.value = 'in'
  console.log('[wrhousdlvr] 전체 초기화 완료')
}

// 입고서 모달 관련 함수들
const openInspectionSearch = () => {
  console.log('[wrhousdlvr] 검사서 조회 모달 열기')
  isInspectionModalOpen.value = true
}

const closeInspectionModal = () => {
  console.log('[wrhousdlvr] 검사서 조회 모달 닫기')
  isInspectionModalOpen.value = false
}

// 검사서 종류에 따른 품목 유형 반환
const getItemTypeByInspType = (inspType) => {
  switch (inspType) {
    case 'materialQuality':
    case 'materialWithdrawal':
      return '자재'
    case 'semiQuality':
      return '반제품'
    case 'finishedQuality':
    case 'deliveryDetail':
      return '완제품'
    default:
      return '자재'
  }
}

const onSelectInspection = async (inspectionList) => {
  console.log('[wrhousdlvr] 검사서 선택됨:', inspectionList)
  console.log(`[wrhousdlvr] 선택된 검사서 수: ${inspectionList.length}`)

  if (!Array.isArray(inspectionList) || inspectionList.length === 0) {
    alert('선택된 검사서가 없습니다.')
    return
  }

  // 검사서 종류에 따라 입고 모드 설정
  const firstInspection = inspectionList[0]
  const inspType = firstInspection.insp_type

  // 입고: 자재품질검사, 반제품품질검사, 완제품품질검사
  if (['materialQuality', 'semiQuality', 'finishedQuality'].includes(inspType)) {
    mode.value = 'in'
  }

  // 요약 테이블에 선택된 검사서들 정보 누적 추가 (기존 데이터 유지)
  const newSummaryRows = inspectionList.map((inspection) => ({
    id: inspection.insp_no + '_' + Date.now(), // 고유 ID 생성
    inspect_id: inspection.insp_no,
    type: inspection.item_type || getItemTypeByInspType(inspection.insp_type),
    code: inspection.item_code || inspection.rsc_id,
    name: inspection.item_name || inspection.rsc_nm,
    opt_code: inspection.opt_code || '',
    opt_name: inspection.opt_name || '',
    spec: inspection.item_spec || inspection.rsc_spec || '',
    unit: inspection.item_unit || inspection.rsc_unit || '',
    qty: inspection.pass_qty || inspection.insp_qty || 0,
    emp_nm: ownerName.value, // 로그인 사용자명 사용
    remark: `${mode.value === 'in' ? '입고' : '출고'} 처리`,
    // 창고/로케이션 정보 추가 필요
    warehouse_id: '',
    warehouse_name: '',
    location_id: '',
    location_name: '',
  }))

  console.log(`[wrhousdlvr] 요약 테이블에 추가할 행 수: ${newSummaryRows.length}`)

  // 중복 검사서 제거 후 누적 (inspect_id + item_code + opt_code 조합으로 체크)
  const existingKeys = summaryRows.value.map(
    (row) => `${row.inspect_id}_${row.code}_${row.opt_code || 'NO_OPT'}`,
  )
  console.log(`[wrhousdlvr] 기존 요약 테이블 키들:`, existingKeys)

  const uniqueNewRows = newSummaryRows.filter((row) => {
    const key = `${row.inspect_id}_${row.code}_${row.opt_code || 'NO_OPT'}`
    return !existingKeys.includes(key)
  })
  console.log(`[wrhousdlvr] 중복 제거 후 요약 테이블 추가 행 수: ${uniqueNewRows.length}`)

  summaryRows.value.push(...uniqueNewRows)

  // 새로 추가된 행들을 모두 기본 선택 상태로 설정
  const newIds = uniqueNewRows.map((row) => row.id)
  selectedSummaryIds.value.push(...newIds)

  // 창고/로케이션 정보 즉시 업데이트 (UI 반응성 개선)
  await updateWarehouseLocationInfo(uniqueNewRows)

  // alert 표시
  alert(`${uniqueNewRows.length}건의 입고서 품목이 추가되었습니다.`)
}

// 창고/로케이션 정보 업데이트 함수 (공통)
const updateWarehouseLocationInfo = async (rows) => {
  console.log('[wrhousdlvr] 창고/로케이션 정보 업데이트 시작:', rows.length, '건')

  const promises = rows.map(async (row) => {
    const itemType = row.type
    console.log(`[wrhousdlvr] 행 ${row.id} 처리 중, 품목 유형: ${itemType}`)

    try {
      const availableWarehouses = await getWarehousesByItemType(itemType)
      console.log(`[wrhousdlvr] 사용 가능한 창고:`, availableWarehouses)

      if (availableWarehouses.length > 0) {
        const defaultWarehouse = availableWarehouses[0]
        row.warehouse_id = defaultWarehouse.warehouse_id
        row.warehouse_name = defaultWarehouse.warehouse_name
        console.log(`[wrhousdlvr] 창고 설정 완료: ${defaultWarehouse.warehouse_name}`)

        const availableLocations = await getLocationsByItemType(
          itemType,
          defaultWarehouse.warehouse_id,
        )
        console.log(`[wrhousdlvr] 사용 가능한 로케이션:`, availableLocations)

        if (availableLocations.length > 0) {
          const defaultLocation = availableLocations[0]
          row.location_id = defaultLocation.location_id
          row.location_name = defaultLocation.location_name
          console.log(`[wrhousdlvr] 로케이션 설정 완료: ${defaultLocation.location_name}`)
        }
      }
    } catch (error) {
      console.error('[wrhousdlvr] 창고/로케이션 조회 중 오류:', error)
    }
  })

  // 모든 업데이트가 완료될 때까지 대기
  await Promise.all(promises)

  console.log('[wrhousdlvr] 창고/로케이션 정보 업데이트 완료')

  // Vue의 반응성 시스템 강제 업데이트
  summaryRows.value = [...summaryRows.value]
}

// 출고서 모달 관련 함수들
const openDeliverySearch = () => {
  console.log('[wrhousdlvr] 출고서 조회 모달 열기')
  isDeliveryModalOpen.value = true
}

const closeDeliveryModal = () => {
  console.log('[wrhousdlvr] 출고서 조회 모달 닫기')
  isDeliveryModalOpen.value = false
}

const onSelectDelivery = async (deliveryList) => {
  console.log('[wrhousdlvr] 출고서 선택됨:', deliveryList)

  if (!Array.isArray(deliveryList) || deliveryList.length === 0) {
    alert('선택된 출고서가 없습니다.')
    return
  }

  // 출고서 종류에 따라 출고 모드 설정
  const firstDelivery = deliveryList[0]
  const inspType = firstDelivery.insp_type

  // 출고: 자재불출, 완제품납품
  if (['materialWithdrawal', 'deliveryDetail'].includes(inspType)) {
    mode.value = 'out'
  }

  // 자재 불출의 경우 생산지시 기반으로 BOM 자재 조회
  if (inspType === 'materialWithdrawal') {
    await handleMaterialWithdrawal(deliveryList)
  } else {
    // 기존 로직 (완제품 납품 등)
    await handleRegularDelivery(deliveryList)
  }
}

// 자재 불출 처리 (생산지시 → BOM 자재 조회)
const handleMaterialWithdrawal = async (deliveryList) => {
  console.log('[wrhousdlvr] 자재 불출 처리 시작:', deliveryList)

  try {
    // 선택된 생산지시들에 대해 BOM 자재 조회
    const allMaterials = []

    for (const delivery of deliveryList) {
      console.log(`[wrhousdlvr] 생산지시 ${delivery.insp_no}의 BOM 자재 조회`)

      const response = await axios.get(`/api/production/orders/${delivery.insp_no}/materials`)
      const materials = response.data || []

      console.log(`[wrhousdlvr] 조회된 자재 수:`, materials.length)

      // 각 자재를 summaryRows 형태로 변환
      const materialRows = materials.map((material) => ({
        id: delivery.insp_no + '_' + material.item_code + '_' + Date.now(),
        inspect_id: delivery.insp_no, // 생산지시 ID
        type: '자재',
        code: material.item_code || material.rsc_id,
        name: material.item_name || material.rsc_nm,
        opt_code: '',
        opt_name: '',
        spec: material.item_spec || material.rsc_spec || '',
        unit: material.item_unit || material.rsc_unit || 'EA',
        qty: material.required_qty || material.rec_qy || 0,
        emp_nm: ownerName.value,
        remark: `자재 불출 - ${delivery.item_name}`,
        warehouse_id: '',
        warehouse_name: '',
        location_id: '',
        location_name: '',
        // 추가 정보
        production_order_id: delivery.insp_no,
        production_item_name: delivery.item_name,
        bom_qty: material.rec_qy || 0,
        stock_qty: material.stock_qty || 0,
      }))

      allMaterials.push(...materialRows)
    }

    console.log(`[wrhousdlvr] 총 변환된 자재 수:`, allMaterials.length)

    // 중복 자재 제거 (생산지시ID + 자재코드 조합으로 체크)
    const existingKeys = summaryRows.value.map((row) => `${row.inspect_id}_${row.code}`)

    const uniqueNewRows = allMaterials.filter((row) => {
      const key = `${row.inspect_id}_${row.code}`
      return !existingKeys.includes(key)
    })

    console.log(`[wrhousdlvr] 중복 제거 후 추가할 자재 수:`, uniqueNewRows.length)

    summaryRows.value.push(...uniqueNewRows)

    // 새로 추가된 행들을 모두 기본 선택 상태로 설정
    const newIds = uniqueNewRows.map((row) => row.id)
    selectedSummaryIds.value.push(...newIds)

    // 창고/로케이션 정보 즉시 업데이트
    await updateWarehouseLocationInfo(uniqueNewRows)

    alert(`${uniqueNewRows.length}건의 자재가 추가되었습니다.`)
  } catch (error) {
    console.error('[wrhousdlvr] 자재 불출 처리 중 오류:', error)
    alert('BOM 자재 조회에 실패했습니다: ' + (error.response?.data?.error || error.message))
  }
}

// 일반 출고 처리 (완제품 납품 등)
const handleRegularDelivery = async (deliveryList) => {
  console.log('[wrhousdlvr] 일반 출고 처리:', deliveryList)

  // 요약 테이블에 선택된 출고서들 정보 누적 추가
  const newSummaryRows = deliveryList.map((delivery) => ({
    id: delivery.insp_no + '_' + Date.now(),
    inspect_id: delivery.insp_no,
    type: delivery.item_type || getItemTypeByInspType(delivery.insp_type),
    code: delivery.item_code || delivery.rsc_id,
    name: delivery.item_name || delivery.rsc_nm,
    opt_code: delivery.opt_code || '',
    opt_name: delivery.opt_name || '',
    spec: delivery.item_spec || delivery.rsc_spec || '',
    unit: delivery.item_unit || delivery.rsc_unit || 'EA',
    qty: delivery.pass_qty || delivery.insp_qty || 0,
    emp_nm: ownerName.value,
    remark: `${mode.value === 'in' ? '입고' : '출고'} 처리`,
    warehouse_id: '',
    warehouse_name: '',
    location_id: '',
    location_name: '',
  }))

  // 중복 검사서 제거 후 누적
  const existingKeys = summaryRows.value.map(
    (row) => `${row.inspect_id}_${row.code}_${row.opt_code || 'NO_OPT'}`,
  )

  const uniqueNewRows = newSummaryRows.filter((row) => {
    const key = `${row.inspect_id}_${row.code}_${row.opt_code || 'NO_OPT'}`
    return !existingKeys.includes(key)
  })

  summaryRows.value.push(...uniqueNewRows)

  // 새로 추가된 행들을 모두 기본 선택 상태로 설정
  const newIds = uniqueNewRows.map((row) => row.id)
  selectedSummaryIds.value.push(...newIds)

  // 창고/로케이션 정보 즉시 업데이트 (UI 반응성 개선)
  await updateWarehouseLocationInfo(uniqueNewRows)

  alert(`${uniqueNewRows.length}건의 출고서 품목이 추가되었습니다.`)
}

const onSave = async () => {
  try {
    console.log('[wrhousdlvr] 저장 함수 시작')

    // 체크된 항목이 없으면 저장 불가
    if (selectedSummaryIds.value.length === 0) {
      alert('저장할 항목을 선택해주세요.')
      return
    }

    console.log('[wrhousdlvr] 저장 전 선택된 데이터:', selectedSummaryIds.value.length, '건')

    // 선택된 행만 필터링
    const selectedRows = summaryRows.value.filter((row) =>
      selectedSummaryIds.value.includes(row.id),
    )

    // 디테일 테이블에 값이 없으면 저장 불가
    if (selectedRows.length === 0) {
      alert('디테일 테이블에 저장할 데이터가 없습니다.')
      return
    }

    // 유효성 검사
    const invalidRows = selectedRows.filter((row, index) => {
      const isValid = row.code && row.name && row.qty > 0 && row.warehouse_id && row.location_id
      if (!isValid) {
        console.log(`[wrhousdlvr] 유효하지 않은 행 ${index}:`, {
          code: row.code,
          name: row.name,
          qty: row.qty,
          warehouse_id: row.warehouse_id,
          location_id: row.location_id,
        })
      }
      return !isValid
    })

    if (invalidRows.length > 0) {
      alert(
        `품목 정보, 수량, 창고, 로케이션을 모두 입력해주세요.\n유효하지 않은 행: ${invalidRows.length}개`,
      )
      return
    }

    // 하단 그리드 데이터 (마스터 테이블용) - 체크된 항목만 기준
    const masterTransactions = consolidatedRows.value.map((item) => {
      // 품목 유형 코드 매핑
      let itemTypeCode = 'E3' // 기본값: 완제품
      if (item.type === '자재') itemTypeCode = 'E1'
      else if (item.type === '반제품') itemTypeCode = 'E2'
      else if (item.type === '완제품') itemTypeCode = 'E3'

      return {
        rcvpay_ty: mode.value === 'in' ? 'S1' : 'S2', // 입고: S1, 출고: S2
        item_type: itemTypeCode,
        item_code: item.code,
        item_name: item.name,
        item_opt_code: item.opt_code || '',
        item_opt_name: item.opt_name || '',
        item_spec: item.spec || '',
        item_unit: item.unit || 'EA',
        warehouse_id: item.warehouse_id,
        zone_id: item.location_id,
        total_qty: Number(item.total_qty) || 0,
        emp_id: ownerEmpId.value,
        emp_name: ownerName.value,
        rcvpay_dt: new Date().toISOString().split('T')[0],
        remark: item.master_remark || `${mode.value === 'in' ? '입고' : '출고'} 처리`, // 마스터 테이블 비고
      }
    })

    // 마스터 테이블에도 데이터가 없으면 저장 불가
    if (masterTransactions.length === 0) {
      alert('마스터 테이블에 저장할 데이터가 없습니다. 항목을 선택해주세요.')
      return
    }

    // 상단 그리드 선택된 데이터 (디테일 테이블용)
    const detailTransactions = selectedRows.map((row) => {
      // 품목 유형 코드 매핑
      let itemTypeCode = 'E3' // 기본값: 완제품
      if (row.type === '자재') itemTypeCode = 'E1'
      else if (row.type === '반제품') itemTypeCode = 'E2'
      else if (row.type === '완제품') itemTypeCode = 'E3'

      return {
        rcvpay_ty: mode.value === 'in' ? 'S1' : 'S2', // 입고: S1, 출고: S2
        item_type: itemTypeCode,
        item_code: row.code,
        item_name: row.name,
        item_opt_code: row.opt_code || '',
        item_opt_name: row.opt_name || '',
        item_spec: row.spec || '',
        item_unit: row.unit || 'EA',
        warehouse_id: row.warehouse_id,
        zone_id: row.location_id,
        qty: Number(row.qty) || 0,
        inspect_id: row.inspect_id,
        emp_id: ownerEmpId.value,
        emp_name: ownerName.value,
        rcvpay_dt: new Date().toISOString().split('T')[0],
        remark: row.remark || `${mode.value === 'in' ? '입고' : '출고'} 처리`, // 디테일 테이블 비고
      }
    })

    const payload = {
      mode: mode.value,
      masterTransactions,
      detailTransactions,
    }

    console.log('[wrhousdlvr] 저장 요청 데이터:', payload)
    console.log(
      `[wrhousdlvr] 마스터 거래: ${masterTransactions.length}건, 디테일 거래: ${detailTransactions.length}건`,
    )

    const response = await axios.post('/api/warehouse/transactions', payload)

    console.log('[wrhousdlvr] 저장 응답:', response.data)

    if (response.data?.success) {
      alert(
        `${mode.value === 'in' ? '입고' : '출고'} 처리가 완료되었습니다.\n마스터: ${
          masterTransactions.length
        }건\n디테일: ${detailTransactions.length}건`,
      )
      onReset()
    } else {
      console.error('[wrhousdlvr] 저장 실패 상세:', response.data)
      alert('저장 실패: ' + (response.data?.error || '알 수 없는 오류'))
    }
  } catch (err) {
    console.error('[wrhousdlvr] 저장 오류 상세:', err)
    alert('저장 중 오류가 발생했습니다: ' + (err.response?.data?.error || err.message))
  }
}
</script>
