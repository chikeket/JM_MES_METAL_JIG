<template>
  <CContainer fluid class="p-3">
    <!-- 상단 버튼 그룹 -->
    <div class="d-flex align-items-center mb-3 gap-2">
      <div>
        <!-- 선택된 버튼은 짙은 회색(btn-secondary), 선택안된 버튼은 outline 회색 -->
        <CButton :class="mode === 'in' ? 'btn-secondary' : 'btn-outline-secondary'" size="sm" @click="mode = 'in'">입고</CButton>
        <CButton :class="mode === 'out' ? 'btn-secondary' : 'btn-outline-secondary'" size="sm" @click="mode = 'out'">출고</CButton>
      </div>
      <div class="ms-auto d-flex gap-2">
        <CButton color="secondary" size="sm" @click="onReset">초기화</CButton>
        <CButton color="secondary" size="sm" @click="openInspectionSearch">검사서 조회</CButton>
      </div>
    </div>

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
              <CTableDataCell colspan="7" class="text-center text-muted">데이터 없음</CTableDataCell>
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

      <div class="card-body" style="overflow:auto; max-height:60vh;">
        <CTable hover bordered small class="mb-0 align-middle">
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell scope="col" class="text-center" style="width:56px">
                <CFormCheck :checked="allSelected" @change="toggleAll($event)" />
              </CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width:90px">수불 ID</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width:120px">품목 유형</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width:120px">품목 코드</CTableHeaderCell>
              <CTableHeaderCell class="text-center">품목 이름</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width:100px">규격</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width:80px">단위</CTableHeaderCell>
              <CTableHeaderCell class="text-center" style="width:100px">수량</CTableHeaderCell>
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
              <CTableDataCell colspan="8" class="text-center text-muted">행을 추가하세요</CTableDataCell>
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
  CContainer
} from '@coreui/vue'

// 상태
const mode = ref('in') // 'in' | 'out'
const summaryRows = ref([])

// 메인 그리드 rows
const rows = ref([])

// 선택 관리
const selectedIds = ref([])

const isSelected = (id) => {
  if (id == null) return false
  return selectedIds.value.includes(id)
}

const toggleRow = (id, ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : !selectedIds.value.includes(id)
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

const allSelected = computed(() => {
  const ids = rows.value.map(r => r.id)
  if (ids.length === 0) return false
  return ids.every(id => selectedIds.value.includes(id))
})

const toggleAll = (ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : !allSelected.value
  const ids = rows.value.map(r => r.id)
  if (checked) {
    for (const id of ids) if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
  }
}

// 행 추가 / 삭제 / 초기화 / 저장
const addRow = () => {
  const id = Date.now().toString(36) + Math.floor(Math.random() * 1000)
  rows.value.push({ id, txn_id: '', type: '', code: '', name: '', spec: '', unit: '', qty: 0 })
}

const deleteSelectedRows = () => {
  if (!selectedIds.value.length) return
  rows.value = rows.value.filter(r => !selectedIds.value.includes(r.id))
  selectedIds.value = []
}

const onReset = () => {
  summaryRows.value = []
  rows.value = []
  selectedIds.value = []
  mode.value = 'in'
}

const openInspectionSearch = () => {
  console.log('open inspection search')
}

const onSave = async () => {
  try {
    const payload = {
      mode: mode.value,
      master: { /* 필요 필드 추가 */ },
      detailList: rows.value.map(r => ({ code: r.code, name: r.name, spec: r.spec, unit: r.unit, qty: r.qty })),
    }
    console.log('[wrhousdlvr] save payload', payload)
    alert('저장 요청 (콘솔 로그 확인)')
  } catch (err) {
    console.error(err)
    alert('저장 실패')
  }
}
</script>