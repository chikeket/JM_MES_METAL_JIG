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
    <div class="card mb-3">
      <div class="card-body p-3">
        <CTable hover bordered small class="mb-0">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center" style="width: 120px"
                >검사서 ID</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 100px"
                >품목 유형</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >품목 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 200px"
                >품목 명</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >옵션 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 150px"
                >옵션 명</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 120px">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 70px">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px"
                >담당자 명</CTableHeaderCell
              >
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(r, i) in summaryRows" :key="r.id || i">
              <CTableDataCell class="text-center">{{ r.inspect_id || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.type || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.code || '' }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ r.name || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.opt_code || '' }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ r.opt_name || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.spec || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.unit || '' }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ r.qty ?? '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.emp_nm ?? '' }}</CTableDataCell>
            </CTableRow>
            <CTableRow v-if="summaryRows.length === 0">
              <CTableDataCell colspan="8" class="text-center text-muted"
                >데이터 없음</CTableDataCell
              >
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>

    <!-- 메인 그리드 -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div class="fw-bold">입출고 상세</div>
        <div class="d-flex gap-2">
          <CButton color="secondary" size="sm" @click="addRow">행 추가</CButton>
          <CButton color="danger" size="sm" @click="deleteSelectedRows">행 삭제</CButton>
          <CButton color="secondary" size="sm" @click="onSave">저장</CButton>
        </div>
      </div>

      <div class="card-body" style="overflow: auto; max-height: 60vh">
        <CTable hover bordered small class="mb-0 align-middle">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell scope="col" class="text-center" style="width: 60px">
                <CFormCheck :checked="allSelected" @change="toggleAll($event)" />
              </CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">창고</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">로케이션</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 100px"
                >품목 유형</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >품목 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 200px"
                >품목 명</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 130px"
                >옵션 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 150px"
                >옵션 명</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 120px">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 70px">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 70px">LOT</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">수량</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px">비고</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            <CTableRow v-for="row in rows" :key="row.id">
              <CTableDataCell class="text-center">
                <CFormCheck :checked="isSelected(row.id)" @change="toggleRow(row.id, $event)" />
              </CTableDataCell>
              <CTableDataCell class="text-center">{{ row.warehouse_id }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ row.location_id }}</CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.type }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.code }} </CTableDataCell>
              <CTableDataCell class="text-start"> {{ row.name }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.opt_code || '-' }} </CTableDataCell>
              <CTableDataCell class="text-start"> {{ row.opt_name || '-' }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.spec }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.unit }} </CTableDataCell>
              <CTableDataCell class="text-center"> {{ row.lot || '-' }} </CTableDataCell>
              <CTableDataCell class="text-end">
                <CFormInput v-model.number="row.qty" size="sm" type="number" />
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput v-model="row.remark" size="sm" placeholder="비고" />
              </CTableDataCell>
            </CTableRow>

            <CTableRow v-if="rows.length === 0">
              <CTableDataCell colspan="8" class="text-center text-muted"
                >행을 추가하세요</CTableDataCell
              >
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </div>
  </CContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import InspectionModal from '../modal/inspectionModal.vue'
import DeliveryModal from '../modal/deliveryModal.vue'
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

// 상태
const mode = ref('in') // 'in' | 'out'
const summaryRows = ref([])

// 모드 변경 시 데이터 초기화
const changeMode = (newMode) => {
  if (mode.value !== newMode) {
    mode.value = newMode
    summaryRows.value = []
    rows.value = []
    selectedIds.value = []
    console.log(`[wrhousdlvr] 모드 변경: ${newMode}`)
  }
}

// 메인 그리드 rows
const rows = ref([])

// 선택 관리
const selectedIds = ref([])

// 모달 상태
const isInspectionModalOpen = ref(false)
const isDeliveryModalOpen = ref(false)

const isSelected = (id) => {
  if (id == null) return false
  return selectedIds.value.includes(id)
}

const toggleRow = (id, ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : !selectedIds.value.includes(id)
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
}

const allSelected = computed(() => {
  const ids = rows.value.map((r) => r.id)
  if (ids.length === 0) return false
  return ids.every((id) => selectedIds.value.includes(id))
})

const toggleAll = (ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : !allSelected.value
  const ids = rows.value.map((r) => r.id)
  if (checked) {
    for (const id of ids) if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id))
  }
}

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

// 참고: 창고와 로케이션은 검사서 선택 시 품목 유형에 따라 DB에서 실시간 조회하여 자동으로 설정되며 readonly로 처리됩니다.

// 행 추가 / 삭제 / 초기화 / 저장
const addRow = () => {
  const id = Date.now().toString(36) + Math.floor(Math.random() * 1000) // 임시용
  rows.value.push({
    id,
    warehouse_id: '',
    warehouse_name: '',
    location_id: '',
    location_name: '',
    type: '',
    code: '',
    opt_code: '',
    opt_name: '',
    name: '',
    spec: '',
    unit: 'EA',
    qty: 0,
    remark: '',
  })
}

const deleteSelectedRows = () => {
  if (!selectedIds.value.length) return
  rows.value = rows.value.filter((r) => !selectedIds.value.includes(r.id))
  selectedIds.value = []
}

const onReset = () => {
  // 모든 상태 초기화
  summaryRows.value = []
  rows.value = []
  selectedIds.value = []
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
    id: inspection.insp_no,
    inspect_id: inspection.insp_no,
    type: inspection.item_type || getItemTypeByInspType(inspection.insp_type),
    code: inspection.item_code || inspection.rsc_id,
    name: inspection.item_name || inspection.rsc_nm,
    opt_code: inspection.opt_code || '',
    opt_name: inspection.opt_name || '',
    spec: inspection.item_spec || inspection.rsc_spec || '',
    unit: inspection.item_unit || inspection.rsc_unit || '',
    qty: inspection.pass_qty || inspection.insp_qty || 0,
    emp_nm: inspection.insp_emp_name || inspection.emp_name || '', // 담당자명 추가
  }))

  console.log(`[wrhousdlvr] 요약 테이블에 추가할 행 수: ${newSummaryRows.length}`)

  // 중복 검사서 제거 후 누적
  const existingIds = summaryRows.value.map((row) => row.id)
  console.log(`[wrhousdlvr] 기존 요약 테이블 ID들:`, existingIds)
  
  const uniqueNewRows = newSummaryRows.filter((row) => !existingIds.includes(row.id))
  console.log(`[wrhousdlvr] 중복 제거 후 요약 테이블 추가 행 수: ${uniqueNewRows.length}`)
  
  summaryRows.value.push(...uniqueNewRows)

  // 메인 그리드에 새 행들 추가 (검사서 정보 기반)
  const newRows = []

  for (const inspection of inspectionList) {
    // 중복 검사서 제거
    if (rows.value.some((row) => row.insp_no === inspection.insp_no)) {
      console.log(`[wrhousdlvr] 중복 검사서 건너뜀: ${inspection.insp_no}`)
      continue
    }

    console.log('[wrhousdlvr] 검사서 처리 중:', inspection.insp_no)

    // 품목 유형 결정 (검사서에서 직접 가져오거나 검사 유형으로 추정)
    const itemType = inspection.item_type || getItemTypeByInspType(inspection.insp_type)
    console.log('[wrhousdlvr] 결정된 품목 유형:', itemType)

    // 품목 유형에 따른 창고/로케이션 DB 조회 및 자동 할당
    let defaultWarehouse = null
    let defaultLocation = null

    try {
      // 해당 품목 유형의 창고를 DB에서 조회
      const availableWarehouses = await getWarehousesByItemType(itemType)
      if (availableWarehouses.length > 0) {
        defaultWarehouse = availableWarehouses[0] // 첫 번째 창고 선택
        console.log('[wrhousdlvr] 선택된 창고:', defaultWarehouse)

        // 해당 창고의 로케이션을 DB에서 조회
        const availableLocations = await getLocationsByItemType(
          itemType,
          defaultWarehouse.warehouse_id,
        )
        if (availableLocations.length > 0) {
          defaultLocation = availableLocations[0] // 첫 번째 로케이션 선택
          console.log('[wrhousdlvr] 선택된 로케이션:', defaultLocation)
        } else {
          console.warn(
            '[wrhousdlvr] 매칭되는 로케이션이 없습니다. 창고ID:',
            defaultWarehouse.warehouse_id,
            '품목유형:',
            itemType,
          )
        }
      } else {
        console.warn('[wrhousdlvr] 매칭되는 창고가 없습니다. 품목유형:', itemType)
      }
    } catch (error) {
      console.error('[wrhousdlvr] 창고/로케이션 조회 중 오류:', error)
    }

    const newRow = {
      id: Date.now().toString(36) + Math.floor(Math.random() * 1000),
      warehouse_id: defaultWarehouse?.warehouse_id || '',
      warehouse_name: defaultWarehouse?.warehouse_name || '',
      location_id: defaultLocation?.location_id || '',
      location_name: defaultLocation?.location_name || '',
      type: itemType,
      code: inspection.item_code || inspection.rsc_id,
      opt_code: inspection.opt_code || '',
      opt_name: inspection.opt_name || '',
      name: inspection.item_name || inspection.rsc_nm,
      spec: inspection.item_spec || inspection.rsc_spec || '',
      unit: inspection.item_unit || inspection.rsc_unit || 'EA',
      qty: inspection.pass_qty || inspection.insp_qty || 0,
      remark: '',
      // 검사서 관련 정보 저장 (백엔드 저장 시 사용)
      insp_no: inspection.insp_no || inspection.rsc_qlty_insp_id,
      insp_date: inspection.insp_date || inspection.insp_dt,
      insp_type: inspection.insp_type,
      emp_name: inspection.insp_emp_name || inspection.emp_name || '',
    }

    newRows.push(newRow)
  }

  rows.value.push(...newRows)
  alert(`${newRows.length}건의 입고서 품목이 추가되었습니다.`)
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
  console.log('[wrhousdlvr] 첫 번째 출고서 상세:', JSON.stringify(deliveryList[0], null, 2))

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

  // 자재 불출의 경우 특별 처리
  if (inspType === 'materialWithdrawal') {
    await handleMaterialWithdrawal(deliveryList)
    return
  }

  // 기존 완제품 납품 로직
  await handleDeliveryDetail(deliveryList)
}

// 자재 불출 처리 (생산지시 → BOM 자재)
const handleMaterialWithdrawal = async (productionOrders) => {
  console.log('[wrhousdlvr] 자재 불출 처리 시작:', productionOrders)

  // 요약 테이블에 생산지시 정보 추가
  const newSummaryRows = productionOrders.map((order) => ({
    id: order.insp_no,
    inspect_id: order.withdrawal_id,
    type: order.item_type,
    code: order.item_code,
    name: order.item_name,
    opt_code: order.opt_code || '',
    opt_name: order.opt_name || '',
    spec: order.item_spec || '',
    unit: order.item_unit || '',
    qty: order.required_qty || 0,
    emp_nm: order.emp_name || '',
  }))

  // 중복 제거 후 누적
  const existingIds = summaryRows.value.map((row) => row.id)
  const uniqueNewRows = newSummaryRows.filter((row) => !existingIds.includes(row.id))
  summaryRows.value.push(...uniqueNewRows)

  // 각 생산지시에 대해 BOM 자재 조회 및 메인 그리드에 추가
  const newRows = []

  for (const order of productionOrders) {
    console.log('[wrhousdlvr] 생산지시 처리:', order)

    try {
      // BOM 자재 목록 조회
      const response = await axios.get(`/api/production/orders/${order.withdrawal_id}/materials`)
      const materialList = response.data || []
      
      console.log('[wrhousdlvr] BOM 자재 목록:', materialList)

      // 각 자재에 대해 메인 그리드 행 생성
      for (const material of materialList) {
        // 중복 자재 제거
        const materialKey = `${order.withdrawal_id}_${material.item_code}`
        if (rows.value.some((row) => row.material_key === materialKey)) {
          continue
        }

        // 품목 유형에 따른 창고/로케이션 자동 할당
        let defaultWarehouse = null
        let defaultLocation = null

        try {
          const availableWarehouses = await getWarehousesByItemType(material.item_type)
          if (availableWarehouses.length > 0) {
            defaultWarehouse = availableWarehouses[0]
            
            const availableLocations = await getLocationsByItemType(
              material.item_type,
              defaultWarehouse.warehouse_id,
            )
            if (availableLocations.length > 0) {
              defaultLocation = availableLocations[0]
            }
          }
        } catch (error) {
          console.error('[wrhousdlvr] 창고/로케이션 조회 오류:', error)
        }

        const newRow = {
          id: Date.now().toString(36) + Math.floor(Math.random() * 1000),
          material_key: materialKey, // 중복 방지용 키
          warehouse_id: defaultWarehouse?.warehouse_id || '',
          warehouse_name: defaultWarehouse?.warehouse_name || '',
          location_id: defaultLocation?.location_id || '',
          location_name: defaultLocation?.location_name || '',
          type: material.item_type,
          code: material.item_code,
          name: material.item_name,
          opt_code: material.opt_code || '',
          opt_name: material.opt_name || '',
          spec: material.item_spec || '',
          unit: material.item_unit || 'EA',
          qty: material.required_qty || 0,
          remark: '',
          // 연결 정보
          production_order_id: order.withdrawal_id,
          insp_no: order.withdrawal_id,
          insp_type: 'materialWithdrawal',
          emp_name: order.emp_name || '',
        }

        newRows.push(newRow)
      }
    } catch (error) {
      console.error('[wrhousdlvr] BOM 자재 조회 실패:', error)
      alert(`생산지시 ${order.withdrawal_id}의 BOM 자재 조회에 실패했습니다.`)
    }
  }

  rows.value.push(...newRows)
  alert(`${productionOrders.length}건의 생산지시에서 ${newRows.length}건의 자재가 추가되었습니다.`)
}

// 완제품 납품 처리 (기존 로직)
const handleDeliveryDetail = async (deliveryList) => {
  // 요약 테이블에 선택된 출고서들 정보 누적 추가 (기존 데이터 유지)
  const newSummaryRows = deliveryList.map((delivery) => ({
    id: delivery.insp_no,
    inspect_id: delivery.insp_no,
    type: delivery.item_type || getItemTypeByInspType(delivery.insp_type),
    code: delivery.item_code || delivery.rsc_id,
    name: delivery.item_name || delivery.rsc_nm,
    opt_code: delivery.opt_code || '',
    opt_name: delivery.opt_name || '',
    spec: delivery.item_spec || delivery.rsc_spec || '',
    unit: delivery.item_unit || delivery.rsc_unit || 'EA',
    qty: delivery.pass_qty || delivery.insp_qty || 0,
    emp_nm: delivery.insp_emp_name || delivery.emp_name || '', // 담당자명 추가
  }))

  // 중복 검사서 제거 후 누적
  const existingIds = summaryRows.value.map((row) => row.id)
  const uniqueNewRows = newSummaryRows.filter((row) => !existingIds.includes(row.id))
  summaryRows.value.push(...uniqueNewRows)

  // 메인 그리드에 새 행들 추가 (출고서 정보 기반)
  const newRows = []

  for (const delivery of deliveryList) {
    // 중복 출고서 제거
    if (rows.value.some((row) => row.insp_no === delivery.insp_no)) {
      continue
    }

    console.log('[wrhousdlvr] 출고서 데이터:', delivery)

    // 품목 유형 결정
    const itemType = delivery.item_type || getItemTypeByInspType(delivery.insp_type)
    console.log('[wrhousdlvr] 결정된 품목 유형:', itemType)

    // 품목 유형에 따른 창고/로케이션 DB 조회 및 자동 할당
    let defaultWarehouse = null
    let defaultLocation = null

    try {
      // 해당 품목 유형의 창고를 DB에서 조회
      const availableWarehouses = await getWarehousesByItemType(itemType)
      if (availableWarehouses.length > 0) {
        defaultWarehouse = availableWarehouses[0] // 첫 번째 창고 선택
        console.log('[wrhousdlvr] 선택된 창고:', defaultWarehouse)

        // 해당 창고의 로케이션을 DB에서 조회
        const availableLocations = await getLocationsByItemType(
          itemType,
          defaultWarehouse.warehouse_id,
        )
        if (availableLocations.length > 0) {
          defaultLocation = availableLocations[0] // 첫 번째 로케이션 선택
          console.log('[wrhousdlvr] 선택된 로케이션:', defaultLocation)
        } else {
          console.warn(
            '[wrhousdlvr] 매칭되는 로케이션이 없습니다. 창고ID:',
            defaultWarehouse.warehouse_id,
            '품목유형:',
            itemType,
          )
        }
      } else {
        console.warn('[wrhousdlvr] 매칭되는 창고가 없습니다. 품목유형:', itemType)
      }
    } catch (error) {
      console.error('[wrhousdlvr] 창고/로케이션 조회 중 오류:', error)
    }

    const newRow = {
      id: Date.now().toString(36) + Math.floor(Math.random() * 1000),
      warehouse_id: defaultWarehouse?.warehouse_id || '',
      warehouse_name: defaultWarehouse?.warehouse_name || '',
      location_id: defaultLocation?.location_id || '',
      location_name: defaultLocation?.location_name || '',
      type: itemType,
      code: delivery.item_code || delivery.rsc_id,
      name: delivery.item_name || delivery.rsc_nm,
      opt_code: delivery.opt_code || '',
      opt_name: delivery.opt_name || '',
      spec: delivery.item_spec || delivery.rsc_spec || '',
      unit: delivery.item_unit || delivery.rsc_unit || 'EA',
      qty: delivery.pass_qty || delivery.insp_qty || 0, // 출고 시에도 납품수량 표시
      remark: '',
      // 출고서 관련 정보 저장 (백엔드 저장 시 사용)
      insp_no: delivery.insp_no || delivery.rsc_qlty_insp_id,
      insp_date: delivery.insp_date || delivery.insp_dt,
      insp_type: delivery.insp_type,
      emp_name: delivery.insp_emp_name || delivery.emp_name || '',
    }

    newRows.push(newRow)
  }

  rows.value.push(...newRows)
  alert(`${newRows.length}건의 출고서 품목이 추가되었습니다.`)
}

const onSave = async () => {
  try {
    console.log('[wrhousdlvr] 저장 함수 시작')
    
    if (rows.value.length === 0) {
      alert('저장할 데이터가 없습니다.')
      return
    }

    console.log('[wrhousdlvr] 저장 전 rows 데이터:', rows.value)

    // ====== 동일 품목 거래 통합 로직 ======
    const consolidatedRows = {}
    
    rows.value.forEach(row => {
      // 통합 키: 거래유형_품목코드_옵션코드_품목유형
      const key = `${mode.value}_${row.code}_${row.opt_code || 'NO_OPT'}_${row.type}`
      
      console.log(`[wrhousdlvr] 처리 중인 행:`, {
        key,
        code: row.code,
        name: row.name,
        opt_code: row.opt_code,
        type: row.type,
        qty: row.qty,
        warehouse_id: row.warehouse_id,
        location_id: row.location_id
      })
      
      if (consolidatedRows[key]) {
        // 기존 항목에 수량 합산
        const prevQty = consolidatedRows[key].qty;
        consolidatedRows[key].qty += Number(row.qty) || 0
        console.log(`[wrhousdlvr] 수량 합산: ${prevQty} + ${row.qty} = ${consolidatedRows[key].qty}`)
        
        // 검사서 번호 추가 (중복 제거)
        if (row.insp_no && !consolidatedRows[key].insp_nos.includes(row.insp_no)) {
          consolidatedRows[key].insp_nos.push(row.insp_no)
        }
        consolidatedRows[key].remark = `통합거래 - 검사서: ${consolidatedRows[key].insp_nos.join(', ')}`
        console.log(`[wrhousdlvr] 기존 항목에 추가됨: ${key}`)
      } else {
        // 새로운 통합 항목 생성
        consolidatedRows[key] = {
          ...row,
          qty: Number(row.qty) || 0,
          insp_nos: row.insp_no ? [row.insp_no] : [],
          remark: row.remark || `${mode.value === 'in' ? '입고' : '출고'} 처리`
        }
        console.log(`[wrhousdlvr] 새 통합 항목 생성: ${key}`)
      }
    })
    
    const finalRows = Object.values(consolidatedRows)
    console.log('[wrhousdlvr] 통합 후 데이터:', finalRows)
    console.log(`[wrhousdlvr] 거래 통합: ${rows.value.length}건 → ${finalRows.length}건`)
    
    // 통합 결과 상세 로그
    finalRows.forEach((row, index) => {
      console.log(`[wrhousdlvr] 통합 결과 ${index + 1}:`, {
        code: row.code,
        name: row.name,
        opt_code: row.opt_code,
        type: row.type,
        qty: row.qty,
        insp_nos: row.insp_nos
      })
    })

    // 유효성 검사
    const invalidRows = finalRows.filter((row, index) => {
      const isValid = row.warehouse_id && row.location_id && row.code && row.name && row.qty > 0
      if (!isValid) {
        console.log(`[wrhousdlvr] 유효하지 않은 행 ${index}:`, {
          warehouse_id: row.warehouse_id,
          location_id: row.location_id,
          code: row.code,
          name: row.name,
          qty: row.qty,
        })
      }
      return !isValid
    })

    if (invalidRows.length > 0) {
      alert(
        `창고, 로케이션, 품목 정보, 수량을 모두 입력해주세요.\n유효하지 않은 행: ${invalidRows.length}개`,
      )
      return
    }

    // 거래 유형별 데이터 변환 (통합된 데이터 사용)
    const transactionList = finalRows.map((row) => {
      // 품목 유형 코드 매핑 (한글 → 공통코드)
      let itemTypeCode = 'E3'; // 기본값: 완제품
      if (row.type === '자재' || row.type === 'materialQuality') {
        itemTypeCode = 'E1';
      } else if (row.type === '반제품' || row.type === 'semiQuality') {
        itemTypeCode = 'E2';
      } else if (row.type === '완제품' || row.type === 'finishedQuality') {
        itemTypeCode = 'E3';
      }
      
      console.log(`[wrhousdlvr] 품목 유형 매핑: ${row.type} → ${itemTypeCode}`);
      
      return {
        txn_type: mode.value, // 'in' 또는 'out'
        warehouse_id: row.warehouse_id,
        warehouse_name: row.warehouse_name,
        location_id: row.location_id,
        location_name: row.location_name,
        item_type: itemTypeCode, // 공통코드로 변환
        item_type_name: row.type, // 원본 한글명 (참고용)
        item_code: row.code,
        item_name: row.name,
        item_opt_code: row.opt_code || '',
        item_opt_name: row.opt_name || '',
        item_spec: row.spec || '',
        item_unit: row.unit || 'EA',
        qty: Number(row.qty) || 0,
        insp_no: row.insp_nos ? row.insp_nos[0] : (row.insp_no || null), // 첫 번째 검사서 번호
        insp_nos: row.insp_nos || (row.insp_no ? [row.insp_no] : []), // 모든 검사서 번호 배열
        insp_type: row.insp_type || null, // 검사서 종류 (LOT 번호 생성용)
        txn_date: new Date().toISOString().split('T')[0], // 오늘 날짜
        remark: row.remark || `${mode.value === 'in' ? '입고' : '출고'} 처리`,
        emp_name: row.emp_name || '', // 담당자명
      }
    })

    const payload = {
      transactionList,
      emp_id: 'current_user', // 실제로는 로그인 세션에서 가져와야 함
    }

    console.log('[wrhousdlvr] 저장 요청 데이터:', payload)
    console.log('[wrhousdlvr] API 호출 시작: /api/warehouse/transactions')

    const response = await axios.post('/api/warehouse/transactions', payload)

    console.log('[wrhousdlvr] 저장 응답:', response)
    console.log('[wrhousdlvr] 응답 데이터:', response.data)

    if (response.data?.isSuccessed) {
      alert(`${mode.value === 'in' ? '입고' : '출고'} 처리가 완료되었습니다.`)
      // 저장 성공 시 초기화
      onReset()
    } else {
      console.error('[wrhousdlvr] 저장 실패 상세:', response.data)
      alert('저장 실패: ' + (response.data?.error || '알 수 없는 오류'))
    }
  } catch (err) {
    console.error('[wrhousdlvr] 저장 오류 상세:', err)
    console.error('[wrhousdlvr] 응답 상세:', err.response)
    alert('저장 중 오류가 발생했습니다: ' + (err.response?.data?.error || err.message))
  }
}
</script>
