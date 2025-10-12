<template>
  <CContainer fluid>
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="masterReset()">초기화</CButton>
      <CButton color="secondary" @click="goToRscOrdrModal()">자재 발주서 조회</CButton>
      <RscOrdrModal :visible="isRscOrdrModalVisible" @close="closeRscOrdrModal" @select="onSelectRscOrdr" />
      <CButton color="secondary" @click="insertRowsToDB">등록</CButton>
      <CButton color="secondary" @click="updateRowsToDB">수정</CButton>
      <CButton color="danger" @click="deleteRowsToDB()">삭제</CButton>
    </div>

    <CContainer fluid>
      <CRow class="g-3 mb-3">
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-1">자재 발주서 명</CInputGroupText>
            <CFormInput v-model="Info.ordrName1" placeholder="자재 발주서 명" />
          </CInputGroup>
        </CCol>
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-2">등록 일자</CInputGroupText>
            <CFormInput type="date" v-model="Info.regDate" />
          </CInputGroup>
        </CCol>
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-2">공급 업체 명</CInputGroupText>
            <CFormInput v-model="Info.co_nm" placeholder="공급 업체 명" />
            <CIcon :icon="cilMagnifyingGlass" size="xl" @click="goToCo()" />
            <CoModal :visible="isCoModalVisible" @close="closeCoModal" @select="selectedCo" />
          </CInputGroup>
        </CCol>
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText id="addon-ordr-name-1">담당자</CInputGroupText>
            <CFormInput type="text" v-model="ownerName" disabled tabindex="-1" aria-readonly="true" />
          </CInputGroup>
        </CCol>
      </CRow>
    </CContainer>

    <CFormTextarea v-model="Info.remark" label="비고" rows="3" text="필요 시 기재" class="mb-3" />

    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="goToRsc()">자재 조회</CButton>
      <RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />
      <CButton color="danger" @click="deleteSelectedRows">삭제</CButton>
    </div>

    <CTable hover bordered small class="align-middle">
      <CTableHead color="dark">
        <CTableRow>
          <CTableHeaderCell scope="col" class="text-center" style="width:56px">
            <CFormCheck :checked="allSelected" @change="toggleAll($event)" />
          </CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center" style="width:56px">No</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">자재 코드</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">자재 명</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">규격</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center" style="width:120px">단위</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center" style="width:140px">수량</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="(row, idx) in displayRows" :key="row.__empty ? 'empty-' + idx : row.id" :class="row.__empty ? 'table-secondary' : ''">
          <CTableDataCell class="text-center">
            <template v-if="!row.__empty">
              <CFormCheck :checked="isSelected(row.id)" @change="toggleRow(row.id, $event)" />
            </template>
          </CTableDataCell>
          <CTableDataCell class="text-end">{{ row.__empty ? '' : row.id }}</CTableDataCell>
          <CTableDataCell>{{ row.code || '' }}</CTableDataCell>
          <CTableDataCell>{{ row.name || '' }}</CTableDataCell>
          <CTableDataCell>{{ row.spec || '' }}</CTableDataCell>
          <CTableDataCell class="text-center">{{ row.unit || '' }}</CTableDataCell>
          <CTableDataCell class="text-end" v-if="!row.__empty" @dblclick="startEdit(row, 'qty')">
            <template v-if="isEditing(row, 'qty')">
              <CFormInput v-model.number="editDraft" type="number" min="0" size="sm" class="text-end" @keydown.enter.prevent="commitAndBlur(row, 'qty', $event)" @keyup.esc="cancelEdit" @blur="commitEdit(row, 'qty')" placeholder="0" />
            </template>
            <template v-else>{{ fmtQty(row.qty) }}</template>
          </CTableDataCell>
          <CTableDataCell class="text-end" v-else>&nbsp;</CTableDataCell>
          <CTableDataCell v-if="!row.__empty" @dblclick="startEdit(row, 'note')">
            <template v-if="isEditing(row, 'note')">
              <CFormInput v-model="editDraft" type="text" size="sm" @keydown.enter.prevent="commitAndBlur(row, 'note', $event)" @keyup.esc="cancelEdit" @blur="commitEdit(row, 'note')" placeholder="비고 입력" />
            </template>
            <template v-else>{{ row.note || '' }}</template>
          </CTableDataCell>
          <CTableDataCell v-else>&nbsp;</CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import axios from 'axios'

import { CIcon } from '@coreui/icons-vue'
import { cilMagnifyingGlass } from '@coreui/icons'

import RscModal from '../modal/rscModal.vue'
import CoModal from '../modal/coModal.vue'
import RscOrdrModal from '../modal/rscOrdrModal.vue'

import { useAuthStore } from '@/stores/auth.js'
const auth = useAuthStore()

const Info = ref({
  ordrName1: '',
  regDate: new Date().toISOString().slice(0, 10),
  co_nm: '',
  remark: '',
})

// 로그인 세션 기반 담당자
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
  { immediate: true }
)

// 연결 키 / 상태
const currentOrdrId = ref(null)
const selectedCoId = ref(null)

// 모달 상태
const isRscModalVisible = ref(false)
const isCoModalVisible = ref(false)
const isRscOrdrModalVisible = ref(false)

const goToRsc = () => { isRscModalVisible.value = true }
const closeRscModal = () => { isRscModalVisible.value = false }

const goToCo = () => { isCoModalVisible.value = true }
const closeCoModal = () => { isCoModalVisible.value = false }

const goToRscOrdrModal = () => { isRscOrdrModalVisible.value = true }
const closeRscOrdrModal = () => { isRscOrdrModalVisible.value = false }

// 상세 행 데이터
const rows = ref([])

// 체크 선택 상태
const selectedIds = ref([])
const isSelected = (id) => {
  if (id === '' || id == null) return false
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

// 전체 선택 상태
const allSelected = computed({
  get() {
    return rows.value.length > 0 && selectedIds.value.length > 0 && rows.value.every(r => !r.__empty && selectedIds.value.includes(r.id))
  },
  set(checked) {
    if (checked) {
      selectedIds.value = rows.value.filter(r => !r.__empty).map(r => r.id)
    } else {
      selectedIds.value = []
    }
  }
})
const toggleAll = (ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : false
  allSelected.value = checked
}

// 모달 선택 핸들러
const selectedRsc = (r) => {
  if (!r) return
  const code = r.rsc_id ?? r.code ?? r.RSC_ID ?? r.rscId ?? ''
  const name = r.rsc_nm ?? r.name ?? r.RSC_NM ?? r.rscNm ?? ''
  const spec = r.spec ?? r.SPEC ?? ''
  const unit = r.rsc_unit ?? r.unit ?? r.RSC_UNIT ?? ''
  if (!code) return
  const newId = rows.value.length > 0 ? Math.max(...rows.value.map(x => x.id || 0)) + 1 : 1
  rows.value.push({
    id: newId,
    rsc_ordr_deta_id: r.rsc_ordr_deta_id ?? null,
    code: String(code),
    name,
    spec,
    unit,
    qty: 0,
    note: ''
  })
}

const selectedCo = (co) => {
  if (!co) return
  Info.value.co_nm = co.co_nm || ''
  selectedCoId.value = co.co_id || null
}

// 자재 발주서 조회 모달에서 더블클릭 선택 시 채우기
const onSelectRscOrdr = (ordr) => {
  if (!ordr) return
  currentOrdrId.value = ordr.master?.rsc_ordr_id ?? null
  Info.value.ordrName1 = ordr.master?.rsc_ordr_nm ?? Info.value.ordrName1
  Info.value.co_nm = ordr.master?.co_nm ?? Info.value.co_nm
  if (ordr.master?.reg_dt) {
    Info.value.regDate = String(ordr.master.reg_dt).slice(0, 10)
  }
  // 담당자는 세션 유지
  const detail = Array.isArray(ordr.detailList) ? ordr.detailList : []
  console.log('[RscOrdr] detail length:', detail.length, detail)
  rows.value = detail.map((d, i) => ({
    id: i + 1,
    code: d.rsc_id ?? d.RSC_ID ?? '',
    name: d.rsc_nm ?? d.RSC_NM ?? '',
    spec: d.spec ?? d.SPEC ?? '',
    unit: d.rsc_unit ?? d.unit ?? d.RSC_UNIT ?? d.UNIT ?? '',
    qty: Number((d.qy ?? d.QY ?? 0) || 0),
    note: d.rm ?? d.RM ?? '',
    rsc_ordr_deta_id: d.rsc_ordr_deta_id ?? d.RSC_ORDR_DETA_ID ?? null,
  }))
  selectedCoId.value = ordr.master?.co_id ?? selectedCoId.value
  closeRscOrdrModal()
}

// 표 편집 상태
const editing = reactive({ id: null, field: null })
const editDraft = ref(null)
const isEditing = (row, field) => editing.id === row.id && editing.field === field
function startEdit(row, field) {
  if (!row || row.__empty) return
  editing.id = row.id
  editing.field = field
  if (field === 'qty') editDraft.value = row.qty ?? 0
  else if (field === 'note') editDraft.value = row.note ?? ''
}
function commitEdit(row, field) {
  if (!row) return
  const idx = rows.value.findIndex(x => x.id === row.id)
  if (field === 'qty') {
    const v = parseQty(editDraft.value)
    const val = Number.isFinite(v) ? v : 0
    if (idx >= 0) rows.value[idx].qty = val
    row.qty = val
  } else if (field === 'note') {
    if (idx >= 0) rows.value[idx].note = editDraft.value ?? ''
    row.note = editDraft.value ?? ''
  }
  cancelEdit()
}
function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}
// qty 파싱 및 현재 편집값 우선 반영을 위한 유틸
function parseQty(val) {
  if (val == null) return NaN
  if (typeof val === 'number') return val
  const n = Number(String(val).replace(/,/g, '').trim())
  return n
}
function effectiveQty(row) {
  if (!row || row.__empty) return NaN
  if (isEditing(row, 'qty')) return parseQty(editDraft.value)
  return parseQty(row.qty)
}
const fmtQty = (n) => (n ?? 0).toLocaleString()

// 표시 최소 빈행
const MIN_DISPLAY_ROWS = 10
const displayRows = computed(() => {
  const arr = (rows.value || []).slice()
  while (arr.length < MIN_DISPLAY_ROWS) {
    arr.push({ __empty: true, id: '', code: '', name: '', spec: '', unit: '', qty: null, note: '' })
  }
  return arr
})

// 저장: 등록/수정(업서트)
// 저장(업서트) - 기존 ID가 있으면 수정, 없으면 생성
const insertRowsToDB = async () => { await saveRscOrdr() }
const updateRowsToDB = async () => { await saveRscOrdr() }

const saveRscOrdr = async () => {
  try {
    // 편집 중인 셀이 있으면 우선 반영
    if (editing.id && editing.field) {
      const row = rows.value.find(r => r.id === editing.id)
      if (row) commitEdit(row, editing.field)
    }
    // 수량 유효성 검사 및 전송 대상 행 구성
    const candidateRows = rows.value.filter(r => !r.__empty)
    if (!candidateRows.length) { alert('저장할 행이 없습니다.'); return }
    const qtyCheck = candidateRows.map(r => ({ id: r.id, code: r.code, raw: r.qty, eff: effectiveQty(r) }))
    console.log('[RscOrdr] qty check:', qtyCheck)
    // 0 또는 비정상 수량 행은 전송에서 제외
    const validRows = candidateRows.filter(r => Number.isFinite(effectiveQty(r)) && effectiveQty(r) > 0 && !!r.code)
    if (!validRows.length) { alert('수량이 0입니다. 수량을 입력하세요.'); return }
    const master = {
      co_id: selectedCoId.value || null,
      emp_id: ownerEmpId.value || null,
      reg_dt: Info.value.regDate || new Date().toISOString().slice(0,10),
      rm: Info.value.remark || null,
      rsc_ordr_nm: Info.value.ordrName1 || '',
    }
    const detailList = validRows
      .map(r => {
        const q = effectiveQty(r)
        return ({
          rsc_id: r.code,
          qy: Number.isFinite(q) ? q : 0,
          rm: r.note ?? '',
          rsc_ordr_deta_id: r.rsc_ordr_deta_id ?? null,
        })
      })

    const payload = { master, detailList, rsc_ordr_id: currentOrdrId.value || null }
    console.log('[RscOrdr] save payload master:', master)
    console.log('[RscOrdr] save payload detailList:', detailList)
    const res = await axios.post('/api/rscOrdr', payload)
    if (res.data?.isSuccessed) {
      alert('저장되었습니다.')
      if (res.data.id) currentOrdrId.value = res.data.id
      await reloadDetails()
    } else {
      alert('저장 실패')
    }
  } catch (err) {
    console.error(err)
    alert('저장 중 오류')
  }
}

// 마스터 삭제
const deleteRowsToDB = async () => { await deleteRscOrdr() }
const deleteRscOrdr = async () => {
  if (!currentOrdrId.value) { alert('삭제할 발주서를 먼저 선택하세요.'); return }
  if (!confirm('선택한 자재 발주서를 삭제하시겠습니까?')) return
  try {
    const res = await axios.delete(`/api/rscOrdr/${encodeURIComponent(currentOrdrId.value)}`)
    if (res.data?.isSuccessed) {
      alert('삭제되었습니다.')
      currentOrdrId.value = null
      rows.value = []
      Info.value.ordrName1 = ''
      Info.value.co_nm = ''
      Info.value.remark = ''
    } else {
      alert('삭제 실패')
    }
  } catch (err) {
    console.error(err)
    alert('삭제 중 오류')
  }
}

// 상세 선택 삭제
function deleteSelectedRows() {
  if (!selectedIds.value.length) { alert('삭제할 행을 선택하세요.'); return }
  if (!confirm('선택된 상세 행을 삭제하시겠습니까?')) return

  const toDeleteUiIds = new Set(selectedIds.value)
  const idsForDb = rows.value
    .filter(r => !r.__empty && toDeleteUiIds.has(r.id) && r.rsc_ordr_deta_id)
    .map(r => r.rsc_ordr_deta_id)

  const removeLocally = () => {
    rows.value = rows.value.filter(r => !(toDeleteUiIds.has(r.id)))
    selectedIds.value = []
  }

  if (idsForDb.length && currentOrdrId.value) {
    axios.post('/api/rscOrdr/deta/delete', { ids: idsForDb })
      .then(() => { removeLocally() })
      .catch((err) => { console.error(err); alert('상세 삭제 중 오류') })
  } else {
    removeLocally()
  }
}

// 상세 재조회
async function reloadDetails() {
  if (!currentOrdrId.value) return
  try {
    const res = await axios.get('/api/rscOrdrDeta', { params: { rsc_ordr_id: currentOrdrId.value } })
    const detail = Array.isArray(res.data) ? res.data : []
    rows.value = detail.map((d, i) => ({
      id: i + 1,
      code: d.rsc_id,
      name: d.rsc_nm ?? '',
      spec: d.spec ?? '',
      unit: d.rsc_unit ?? d.unit ?? '',
      qty: Number(d.qy ?? 0),
      note: d.rm ?? '',
      rsc_ordr_deta_id: d.rsc_ordr_deta_id ?? null,
    }))
  } catch (err) {
    console.error(err)
  }
}

// 초기화
const masterReset = () => {
  Info.value.ordrName1 = ''
  Info.value.co_nm = ''
  Info.value.remark = ''
  Info.value.regDate = new Date().toISOString().slice(0, 10)

  // 그리드 및 선택 상태 초기화 추가
  rows.value = []
  selectedIds.value = []
  currentOrdrId.value = null
  selectedCoId.value = null
}
const reset = () => { rows.value = [] }
</script>
