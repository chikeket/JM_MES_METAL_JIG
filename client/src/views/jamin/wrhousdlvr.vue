<template>
  <CContainer fluid class="p-3">
    <!-- 상단 버튼 그룹 -->
    <div class="d-flex align-items-center mb-3 gap-2">
      <div>
        <!-- 선택된 버튼은 짙은 회색(btn-secondary), 선택안된 버튼은 outline 회색 -->
        <CButton
          :class="mode === 'in' ? 'btn-secondary' : 'btn-outline-secondary'"
          size="sm"
          @click="mode = 'in'"
          >입고</CButton
        >
        <CButton
          :class="mode === 'out' ? 'btn-secondary' : 'btn-outline-secondary'"
          size="sm"
          @click="mode = 'out'"
          >출고</CButton
        >
      </div>
      <div class="ms-auto d-flex gap-2">
        <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
        <CButton color="secondary" size="sm" @click="openInspectionSearch">검사서 조회</CButton>
      </div>
    </div>

    <!-- 검사서 선택 모달 -->
    <InspectionModal
      :isOpen="isInspectionModalOpen"
      @close="closeInspectionModal"
      @select="onSelectInspection"
    />

    <!-- 요약(상단 소형 테이블) -->
    <div class="card mb-3">
      <div class="card-body p-3">
        <CTable hover bordered small class="mb-0">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell class="text-center">검사서 ID</CTableHeaderCell>
              <CTableHeaderCell class="text-center">품목 유형</CTableHeaderCell>
              <CTableHeaderCell class="text-center">품목 코드</CTableHeaderCell>
              <CTableHeaderCell class="text-center">품목 이름</CTableHeaderCell>
              <CTableHeaderCell class="text-center">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center">수량</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow v-for="(r, i) in summaryRows" :key="r.id || i">
              <CTableDataCell class="text-center">{{ r.inspect_id || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.type || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.code || '' }}</CTableDataCell>
              <CTableDataCell class="text-start">{{ r.name || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.spec || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">{{ r.unit || '' }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ r.qty ?? '' }}</CTableDataCell>
            </CTableRow>
            <CTableRow v-if="summaryRows.length === 0">
              <CTableDataCell colspan="7" class="text-center text-muted"
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
              <CTableHeaderCell scope="col" class="text-center" style="width: 56px">
                <CFormCheck :checked="allSelected" @change="toggleAll($event)" />
              </CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 90px">수불 명</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 120px"
                >품목 유형</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center" style="width: 120px"
                >품목 코드</CTableHeaderCell
              >
              <CTableHeaderCell class="text-center">품목 이름</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 100px">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 80px">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width: 100px">수량</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            <CTableRow v-for="row in rows" :key="row.id">
              <CTableDataCell class="text-center">
                <CFormCheck :checked="isSelected(row.id)" @change="toggleRow(row.id, $event)" />
              </CTableDataCell>
              <CTableDataCell class="text-center">{{ row.txn_id || '' }}</CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput v-model="row.type" size="sm" />
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput v-model="row.code" size="sm" />
              </CTableDataCell>
              <CTableDataCell class="text-start">
                <CFormInput v-model="row.name" size="sm" />
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput v-model="row.spec" size="sm" />
              </CTableDataCell>
              <CTableDataCell class="text-center">
                <CFormInput v-model="row.unit" size="sm" />
              </CTableDataCell>
              <CTableDataCell class="text-end">
                <CFormInput v-model.number="row.qty" size="sm" type="number" />
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
import { ref, computed } from 'vue'
import axios from 'axios'
import InspectionModal from '../modal/inspectionModal.vue'
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
  CContainer,
} from '@coreui/vue'

// 상태
const mode = ref('in') // 'in' | 'out'
const summaryRows = ref([])

// 메인 그리드 rows
const rows = ref([])

// 선택 관리
const selectedIds = ref([])

// 모달 상태
const isInspectionModalOpen = ref(false)

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

// 행 추가 / 삭제 / 초기화 / 저장
const addRow = () => {
  const id = Date.now().toString(36) + Math.floor(Math.random() * 1000)
  rows.value.push({ id, txn_id: '', type: '', code: '', name: '', spec: '', unit: '', qty: 0 })
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

// 검사서 모달 관련 함수들
const openInspectionSearch = () => {
  console.log('[wrhousdlvr] 검사서 조회 모달 열기')
  isInspectionModalOpen.value = true
}

const closeInspectionModal = () => {
  console.log('[wrhousdlvr] 검사서 조회 모달 닫기')
  isInspectionModalOpen.value = false
}

const onSelectInspection = (inspectionList) => {
  console.log('[wrhousdlvr] 검사서 선택됨:', inspectionList)

  if (!Array.isArray(inspectionList) || inspectionList.length === 0) {
    alert('선택된 검사서가 없습니다.')
    return
  }

  // 검사서 종류에 따라 입고/출고 모드 자동 설정
  const firstInspection = inspectionList[0]
  const inspType = firstInspection.insp_type

  // 입고: 자재품질검사, 반제품품질검사, 완제품품질검사
  // 출고: 자재불출, 완제품납품
  if (['materialQuality', 'semiQuality', 'finishedQuality'].includes(inspType)) {
    mode.value = 'in'
  } else if (['materialWithdrawal', 'deliveryDetail'].includes(inspType)) {
    mode.value = 'out'
  }

  // 요약 테이블에 선택된 검사서들 정보 표시
  summaryRows.value = inspectionList.map((inspection) => ({
    id: inspection.insp_no,
    inspect_id: inspection.insp_no,
    type: getItemTypeByInspType(inspection.insp_type),
    code: inspection.item_code,
    name: inspection.item_name,
    spec: inspection.item_spec,
    unit: inspection.item_unit,
    qty: inspection.pass_qty || inspection.insp_qty || 0,
  }))

  // 메인 그리드에 새 행들 추가 (검사서 정보 기반)
  const newRows = inspectionList.map((inspection) => ({
    id: Date.now().toString(36) + Math.floor(Math.random() * 1000),
    txn_id: '', // 자동 생성될 ID
    type: getItemTypeByInspType(inspection.insp_type),
    code: inspection.item_code,
    name: inspection.item_name,
    spec: inspection.item_spec || '',
    unit: inspection.item_unit || 'EA',
    qty: mode.value === 'in' ? inspection.pass_qty || inspection.insp_qty || 0 : 0,
    // 검사서 관련 정보 저장 (백엔드 저장 시 사용)
    insp_no: inspection.insp_no,
    insp_date: inspection.insp_date,
    insp_type: inspection.insp_type,
  }))

  rows.value.push(...newRows)

  alert(`${inspectionList.length}건의 검사서 품목이 추가되었습니다.`)
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

const onSave = async () => {
  try {
    if (rows.value.length === 0) {
      alert('저장할 데이터가 없습니다.')
      return
    }

    // 거래 유형별 데이터 변환
    const transactionList = rows.value.map((row) => ({
      txn_type: mode.value, // 'in' 또는 'out'
      item_type: row.type, // 자재/반제품/완제품
      item_code: row.code,
      item_name: row.name,
      item_spec: row.spec || '',
      item_unit: row.unit || 'EA',
      qty: Number(row.qty) || 0,
      insp_no: row.insp_no || null, // 검사서 번호
      insp_type: row.insp_type || null, // 검사서 종류 (LOT 번호 생성용)
      txn_date: new Date().toISOString().split('T')[0], // 오늘 날짜
      remark: `${mode.value === 'in' ? '입고' : '출고'} 처리`,
    }))

    const payload = {
      transactionList,
      emp_id: 'current_user', // 실제로는 로그인 세션에서 가져와야 함
    }

    console.log('[wrhousdlvr] 저장 요청 데이터:', payload)

    const response = await axios.post('/api/wrhousdlvr/transactions', payload)

    if (response.data?.isSuccessed) {
      alert(`${mode.value === 'in' ? '입고' : '출고'} 처리가 완료되었습니다.`)
      // 저장 성공 시 초기화
      onReset()
    } else {
      alert('저장 실패: ' + (response.data?.error || '알 수 없는 오류'))
    }
  } catch (err) {
    console.error('[wrhousdlvr] 저장 오류:', err)
    alert('저장 중 오류가 발생했습니다.')
  }
}
</script>
