<template>
  <CContainer fluid>
    <!-- 상단 버튼: 초기화 / 자재 발주서 조회 / 저장/삭제 -->
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="masterReset()">초기화</CButton>
      <CButton color="secondary" @click="goToRscOrdrModal()">자재 발주서 조회</CButton>
      <RscOrdrModal
        :visible="isRscOrdrModalVisible"
        @close="closeRscOrdrModal"
        @select="onSelectRscOrdr"
      />
      <CButton color="secondary" @click="saveRscOrdr">저장</CButton>
      <CButton color="danger" @click="deleteRowsToDB()">삭제</CButton>
    </div>

    <!-- 마스터 입력 영역 (발주명/등록일/공급업체/담당자) -->
    <CContainer fluid>
      <CRow class="g-3 mb-3">
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText>자재 발주서 명</CInputGroupText>
            <CFormInput v-model="Info.ordrName1" placeholder="자재 발주서 명" />
          </CInputGroup>
        </CCol>
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText>등록 일자</CInputGroupText>
            <CFormInput type="date" v-model="Info.regDate" />
          </CInputGroup>
        </CCol>
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText>공급 업체</CInputGroupText>
            <CFormInput v-model="Info.co_nm" placeholder="공급 업체" />
            <CIcon :icon="cilMagnifyingGlass" size="xl" @click="goToCo()" />
            <CoModal :visible="isCoModalVisible" @close="closeCoModal" @select="selectedCo" />
          </CInputGroup>
        </CCol>
        <CCol md="3">
          <CInputGroup>
            <CInputGroupText>담당자</CInputGroupText>
            <CFormInput
              type="text"
              v-model="ownerName"
              disabled
              tabindex="-1"
              aria-readonly="true"
            />
          </CInputGroup>
        </CCol>
      </CRow>
    </CContainer>

    <CFormTextarea v-model="Info.remark" label="비고" rows="3" text="필요 시 기재" class="mb-3" />

    <!-- 하단 버튼: 자재 조회 / 상세 삭제 -->
    <div class="d-flex justify-content-end gap-2 mb-3">
      <CButton color="secondary" @click="goToRsc()">자재 조회</CButton>
      <RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />
      <CButton color="danger" @click="deleteSelectedRows">삭제</CButton>
    </div>

    <!-- 상세 테이블 -->
    <CTable hover bordered small class="align-middle">
      <CTableHead color="dark">
        <CTableRow>
          <CTableHeaderCell scope="col" class="text-center" style="width: 56px">
            <CFormCheck :checked="allSelected" @change="toggleAll($event)" />
          </CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center" style="width: 56px"
            >No</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center">자재 코드</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">자재 명</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center">규격</CTableHeaderCell>
          <CTableHeaderCell scope="col" class="text-center" style="width: 120px"
            >단위</CTableHeaderCell
          >
          <CTableHeaderCell scope="col" class="text-center" style="width: 140px"
            >수량</CTableHeaderCell
          >

          <CTableHeaderCell scope="col" class="text-center" style="width: 140px"
            >납품 예정 일</CTableHeaderCell
          >

          <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow
          v-for="(row, idx) in displayRows"
          :key="row.__empty ? 'empty-' + idx : row.id"
          :class="row.__empty ? 'table-secondary' : ''"
        >
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
              <CFormInput
                v-model.number="editDraft"
                type="number"
                min="0"
                size="sm"
                class="text-end"
                @keydown.enter.prevent="commitAndBlur(row, 'qty', $event)"
                @keyup.esc="cancelEdit"
                @blur="commitEdit(row, 'qty')"
                placeholder="0"
              />
            </template>
            <template v-else>{{ fmtQty(row.qty) }}</template>
          </CTableDataCell>
          <CTableDataCell class="text-end" v-else>&nbsp;</CTableDataCell>

          <CTableDataCell v-if="!row.__empty" @dblclick="startEdit(row, 'deli_dt')">
            <template v-if="isEditing(row, 'deli_dt')">
              <CFormInput
                v-model="editDraft"
                type="date"
                size="sm"
                @keydown.enter.prevent="commitAndBlur(row, 'deli_dt', $event)"
                @keyup.esc="cancelEdit"
                @blur="commitEdit(row, 'deli_dt')"
                placeholder="납품 예정 일 입력"
              />
            </template>
            <template v-else>{{ row.deli_dt || '' }}</template>
          </CTableDataCell>
          <CTableDataCell v-else>&nbsp;</CTableDataCell>

          <CTableDataCell v-if="!row.__empty" @dblclick="startEdit(row, 'note')">
            <template v-if="isEditing(row, 'note')">
              <CFormInput
                v-model="editDraft"
                type="text"
                size="sm"
                @keydown.enter.prevent="commitAndBlur(row, 'note', $event)"
                @keyup.esc="cancelEdit"
                @blur="commitEdit(row, 'note')"
                placeholder="비고 입력"
              />
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
// 초보자용: 이 화면은 자재 발주서(마스터)와 자재 상세(디테일)를 관리합니다.
import { ref, reactive, computed, watch } from 'vue'
import axios from 'axios'
import { CIcon } from '@coreui/icons-vue'
import { cilMagnifyingGlass } from '@coreui/icons'
import RscModal from '../modal/rscModal.vue'
import CoModal from '../modal/coModal.vue'
import RscOrdrModal from '../modal/rscOrdrModal.vue'
import { useAuthStore } from '@/stores/auth.js'
import useDates from '@/utils/useDates.js'
import { CTableDataCell } from '@coreui/vue'

const { dateFormat } = useDates
const auth = useAuthStore()

// 상단 입력값(마스터)
const Info = ref({
  ordrName1: '',
  regDate: dateFormat(null, 'yyyy-MM-dd'),
  co_nm: '',
  remark: '',
})

// 로그인 사용자 → 담당자 표시
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

// 현재 선택된 발주 ID / 공급업체 ID
const currentOrdrId = ref(null)
const selectedCoId = ref(null)

// 모달 표시 상태
const isRscModalVisible = ref(false)
const isCoModalVisible = ref(false)
const isRscOrdrModalVisible = ref(false)
const goToRsc = () => {
  isRscModalVisible.value = true
}
const closeRscModal = () => {
  isRscModalVisible.value = false
}
const goToCo = () => {
  isCoModalVisible.value = true
}
const closeCoModal = () => {
  isCoModalVisible.value = false
}
const goToRscOrdrModal = () => {
  isRscOrdrModalVisible.value = true
}
const closeRscOrdrModal = () => {
  isRscOrdrModalVisible.value = false
}

// 상세 행
const rows = ref([])

// 체크박스 선택 상태
const selectedIds = ref([])
const isSelected = (id) => id != null && selectedIds.value.includes(id)
const toggleRow = (id, ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : !selectedIds.value.includes(id)
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
}
const allSelected = computed({
  get() {
    return (
      rows.value.length > 0 &&
      selectedIds.value.length > 0 &&
      rows.value.every((r) => !r.__empty && selectedIds.value.includes(r.id))
    )
  },
  set(checked) {
    selectedIds.value = checked ? rows.value.filter((r) => !r.__empty).map((r) => r.id) : []
  },
})
const toggleAll = (ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : false
  allSelected.value = checked
}

// 자재 모달 선택 시 상세 행 추가 (여러 개도 지원)
const selectedRsc = (r) => {
  if (!r) return
  const arr = Array.isArray(r) ? r : [r]
  // 기본 납품 예정일을 7일 후로 설정
  const defaultDeliDt = new Date()
  defaultDeliDt.setDate(defaultDeliDt.getDate() + 7)
  const deliDtStr = defaultDeliDt.toISOString().slice(0, 10)
  // 중복 방지: 이미 rows에 동일한 code가 있으면 추가하지 않음
  const skipped = []
  for (const item of arr) {
    const code = item.rsc_id ?? item.code ?? item.RSC_ID ?? item.rscId ?? ''
    const name = item.rsc_nm ?? item.name ?? item.RSC_NM ?? item.rscNm ?? ''
    const spec = item.spec ?? item.SPEC ?? ''
    const unit = item.rsc_unit ?? item.unit ?? item.RSC_UNIT ?? ''
    if (!code) continue
    const exists = rows.value.some((row) => !row.__empty && String(row.code) === String(code))
    if (exists) {
      skipped.push(code)
      continue
    }
    const newId = rows.value.length > 0 ? Math.max(...rows.value.map((x) => x.id || 0)) + 1 : 1
    rows.value.push({
      id: newId,
      rsc_ordr_deta_id: item.rsc_ordr_deta_id ?? null,
      code: String(code),
      name,
      spec,
      unit,
      qty: 0,
      deli_dt: deliDtStr,
      note: '',
    })
    // 새로 추가된 행은 자동으로 선택 상태로 만듦
    if (!selectedIds.value.includes(newId)) selectedIds.value.push(newId)
  }
  if (skipped.length) {
    const uniqueSkipped = Array.from(new Set(skipped))
    alert(`다음 자재는 이미 존재하여 추가되지 않았습니다: ${uniqueSkipped.join(', ')}`)
  }
}

// 공급업체 모달 선택
const selectedCo = (co) => {
  if (!co) return
  console.log('[RscOrdr] 업체 선택:', co)
  Info.value.co_nm = co.co_nm || ''
  selectedCoId.value = co.co_id || null
  console.log('[RscOrdr] 선택된 업체 ID:', selectedCoId.value)
  closeCoModal()
}

// 발주서 조회 모달 선택(상세가 비면 폴백 재조회)
const onSelectRscOrdr = async (ordr) => {
  if (!ordr) return

  console.log('[RscOrdr] onSelectRscOrdr received:', ordr)

  console.log('[RscOrdr] master data:', ordr.master)

  // 마스터 정보 설정
  currentOrdrId.value = ordr.master?.rsc_ordr_id ?? null
  Info.value.ordrName1 = ordr.master?.rsc_ordr_nm ?? Info.value.ordrName1
  Info.value.co_nm = ordr.master?.co_nm ?? Info.value.co_nm
  Info.value.remark = ordr.master?.rm ?? ordr.master?.remark ?? Info.value.remark

  console.log('[RscOrdr] mapped remark:', Info.value.remark)
  console.log('[RscOrdr] source rm:', ordr.master?.rm)

  if (ordr.master?.reg_dt) {
    const v = ordr.master.reg_dt
    Info.value.regDate = typeof v === 'string' ? v.slice(0, 10) : dateFormat(v, 'yyyy-MM-dd')
  }

  // 공급업체 ID 설정
  selectedCoId.value = ordr.master?.co_id ?? selectedCoId.value

  const detail = Array.isArray(ordr.detailList) ? ordr.detailList : []
  console.log('[RscOrdr] detail list length:', detail.length)

  if (detail.length === 0 && currentOrdrId.value) {
    // 상세가 없으면 서버에서 다시 조회
    try {
      console.log('[RscOrdr] fetching detail from server for ID:', currentOrdrId.value)
      const { data } = await axios.get('/api/rscOrdrDeta', {
        params: { rsc_ordr_id: currentOrdrId.value },
      })
      const list = Array.isArray(data) ? data : []
      console.log('[RscOrdr] fetched detail list:', list)

      rows.value = list.map((d, i) => ({
        id: i + 1,
        code: d.rsc_id ?? '',
        name: d.rsc_nm ?? '',
        spec: d.spec ?? '',
        unit: d.rsc_unit ?? d.unit ?? '',
        qty: Number(d.qy ?? 0),
        note: d.rm ?? '',

        deli_dt:
          d.deli_dt &&
          (typeof d.deli_dt === 'string'
            ? d.deli_dt.slice(0, 10)
            : dateFormat(d.deli_dt, 'yyyy-MM-dd')),

        rsc_ordr_deta_id: d.rsc_ordr_deta_id ?? null,
      }))
    } catch (e) {
      console.error('[RscOrdr] Error fetching detail:', e)
      rows.value = []
    }
  } else {
    // 상세 데이터 매핑
    rows.value = detail.map((d, i) => {
      console.log('[RscOrdr] mapping detail item:', d)
      return {
        id: i + 1,
        code: d.rsc_id ?? d.RSC_ID ?? '',
        name: d.rsc_nm ?? d.RSC_NM ?? '',
        spec: d.spec ?? d.SPEC ?? '',
        unit: d.rsc_unit ?? d.unit ?? d.RSC_UNIT ?? d.UNIT ?? '',
        qty: Number((d.qy ?? d.QY ?? 0) || 0),
        deli_dt:
          d.deli_dt &&
          (typeof d.deli_dt === 'string'
            ? d.deli_dt.slice(0, 10)
            : dateFormat(d.deli_dt, 'yyyy-MM-dd')),
        note: d.rm ?? d.RM ?? '',
        rsc_ordr_deta_id: d.rsc_ordr_deta_id ?? d.RSC_ORDR_DETA_ID ?? null,
      }
    })
  }

  console.log('[RscOrdr] Final rows:', rows.value)
  closeRscOrdrModal()
}

// 인라인 편집(수량/비고)
const editing = reactive({ id: null, field: null })
const editDraft = ref(null)
const isEditing = (row, field) => editing.id === row.id && editing.field === field
function startEdit(row, field) {
  if (!row || row.__empty) return
  editing.id = row.id
  editing.field = field

  if (field === 'qty') {
    editDraft.value = row.qty ?? 0
  } else if (field === 'deli_dt') {
    editDraft.value = row.deli_dt ?? ''
  } else if (field === 'note') {
    editDraft.value = row.note ?? ''
  }
}
function commitEdit(row, field) {
  if (!row) return
  const idx = rows.value.findIndex((x) => x.id === row.id)
  if (field === 'qty') {
    const v = Number(editDraft.value)
    const val = Number.isFinite(v) ? v : 0
    if (idx >= 0) rows.value[idx].qty = val
    row.qty = val
  } else if (field === 'deli_dt') {
    const dateVal = editDraft.value ?? ''
    if (idx >= 0) rows.value[idx].deli_dt = dateVal
    row.deli_dt = dateVal
  } else if (field === 'note') {
    if (idx >= 0) rows.value[idx].note = editDraft.value ?? ''
    row.note = editDraft.value ?? ''
  }
  cancelEdit()
}
function commitAndBlur(row, field, ev) {
  try {
    commitEdit(row, field)
  } finally {
    if (ev && ev.target && typeof ev.target.blur === 'function') ev.target.blur()
  }
}
function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}
const fmtQty = (n) => (n ?? 0).toLocaleString()

// 보기 좋게 빈 행 채우기
const MIN_DISPLAY_ROWS = 10
const displayRows = computed(() => {
  const arr = (rows.value || []).slice()
  while (arr.length < MIN_DISPLAY_ROWS)
    arr.push({
      __empty: true,
      id: '',
      code: '',
      name: '',
      spec: '',
      unit: '',
      qty: null,
      deli_dt: '',
      note: '',
    })

  return arr
})

// 저장/수정 통합 처리 (upsert)
const saveRscOrdr = async () => {
  try {
    if (editing.id && editing.field) {
      const row = rows.value.find((r) => r.id === editing.id)
      if (row) commitEdit(row, editing.field)
    }

    // 입력 검증: 행 존재 & 수량 > 0
    const candidateRows = rows.value.filter((r) => !r.__empty)
    if (!candidateRows.length) {
      alert('저장할 행이 없습니다.')
      return
    }

    const invalidQtyRows = candidateRows.filter((r) => {
      const n = Number(
        String(r.qty ?? '')
          .toString()
          .replace(/,/g, '')
          .trim(),
      )
      return !Number.isFinite(n) || n <= 0
    })
    if (invalidQtyRows.length) {
      alert('수량이 0입니다. 수량을 입력하세요.')
      return
    }

    // 납품 예정일 검증 추가
    const invalidDeliDtRows = candidateRows.filter((r) => {
      return !r.deli_dt || String(r.deli_dt).trim() === ''
    })
    if (invalidDeliDtRows.length) {
      alert('납품 예정일을 입력하세요.')
      return
    }

    if (!Info.value.ordrName1 || !Info.value.ordrName1.trim()) {
      alert('자재 발주서 명을 입력하세요.')
      return
    }
    if (!Info.value.regDate) {
      alert('등록 일자를 입력하세요.')
      return
    }
    if (!selectedCoId.value) {
      alert('공급 업체를 선택하세요.')
      return
    }

    // 마스터/상세 구성(디테일은 여러 건 가능)
    const master = {
      rsc_ordr_nm: Info.value.ordrName1 || '',
      co_id: selectedCoId.value || null,
      emp_id: ownerEmpId.value || null,
      reg_dt:
        (Info.value.regDate && String(Info.value.regDate).slice(0, 10)) ||
        (!currentOrdrId.value ? dateFormat(null, 'yyyy-MM-dd') : null),
      rm: Info.value.remark || null,
    }

    const detailList = candidateRows
      .filter((r) => r.code)
      .map((r) => ({
        rsc_id: r.code,
        qy: Number(r.qty ?? 0),

        deli_dt: r.deli_dt && String(r.deli_dt).trim() ? String(r.deli_dt).slice(0, 10) : null,

        rm: r.note ?? '',
        rsc_ordr_deta_id: r.rsc_ordr_deta_id ?? null,
      }))

    const payload = { master, detailList, rsc_ordr_id: currentOrdrId.value || null }

    // 서버에 저장 요청
    const res = await axios.post('/api/rscOrdr', payload)

    if (res.data?.isSuccessed) {
      const actionText = currentOrdrId.value ? '수정' : '저장'
      alert(`${actionText}되었습니다.`)

      // 저장 성공 시 초기화
      masterReset()
    } else {
      alert('저장 실패')
    }
  } catch (err) {
    console.error(err)
    alert('저장 오류')
  }
}

// 마스터 삭제(발주서 + 상세 모두 삭제)
const deleteRowsToDB = async () => {
  await deleteRscOrdr()
}
const deleteRscOrdr = async () => {
  if (!currentOrdrId.value) {
    alert('자재 발주서를 먼저 선택해주세요')
    return
  }
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
    alert('삭제 오류')
  }
}

// 상세 선택 삭제
function deleteSelectedRows() {
  if (!selectedIds.value.length) {
    alert('선택된 행이 없습니다.')
    return
  }
  if (!confirm('선택한 상세 행을 삭제하시겠습니까?')) return
  const toDeleteUiIds = new Set(selectedIds.value)
  const idsForDb = rows.value
    .filter((r) => !r.__empty && toDeleteUiIds.has(r.id) && r.rsc_ordr_deta_id)
    .map((r) => r.rsc_ordr_deta_id)
  const removeLocally = () => {
    rows.value = rows.value.filter((r) => !toDeleteUiIds.has(r.id))
    selectedIds.value = []
  }
  if (idsForDb.length && currentOrdrId.value) {
    axios
      .post('/api/rscOrdr/deta/delete', { ids: idsForDb })
      .then(() => {
        removeLocally()
      })
      .catch((err) => {
        console.error(err)
        alert('상세 삭제 오류')
      })
  } else {
    removeLocally()
  }
}

// 상세 재조회(저장/수정 후 반영)
async function reloadDetails() {
  if (!currentOrdrId.value) return
  try {
    const res = await axios.get('/api/rscOrdrDeta', {
      params: { rsc_ordr_id: currentOrdrId.value },
    })
    const detail = Array.isArray(res.data) ? res.data : []
    rows.value = detail.map((d, i) => ({
      id: i + 1,
      code: d.rsc_id,
      name: d.rsc_nm ?? '',
      spec: d.spec ?? '',
      unit: d.rsc_unit ?? d.unit ?? '',
      qty: Number(d.qy ?? 0),

      deli_dt: d.deli_dt
        ? typeof d.deli_dt === 'string'
          ? d.deli_dt.slice(0, 10)
          : dateFormat(d.deli_dt, 'yyyy-MM-dd')
        : '',

      note: d.rm ?? '',
      rsc_ordr_deta_id: d.rsc_ordr_deta_id ?? null,
    }))
  } catch (err) {
    console.error(err)
  }
}

// 초기화(상단 입력/그리드/선택 상태 모두 비움)
const masterReset = () => {
  Info.value.ordrName1 = ''
  Info.value.co_nm = ''
  Info.value.remark = ''
  Info.value.regDate = dateFormat(null, 'yyyy-MM-dd')
  rows.value = []
  selectedIds.value = []
  currentOrdrId.value = null
  selectedCoId.value = null
}
const reset = () => {
  rows.value = []
}
</script>

<style scoped>
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

.vars-scope {
  --radius-sm: 4px;
  --radius-md: 6px;
  --color-btn-gray: #6e7b85;
  --color-btn-gray-hover: #5d6871;
  --color-btn-danger: #c53030;
  --color-btn-danger-hover: #a82323;
  --color-btn-text: #fff;
  --row-h: 34px;
  --thead-h: 34px;
  --row-vpad: 6px;
  --cell-inner-h: calc(var(--row-h) - (var(--row-vpad) * 2));
}

/* ========== 버튼 스타일 ========== */
:deep(.btn),
:deep(.btn-secondary),
:deep(.btn-danger) {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: #ffffff !important;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #ffffff !important;
}

:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  color: #ffffff !important;
}

:deep(.btn-danger) {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: #ffffff !important;
}

:deep(.btn-danger:hover) {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  color: #ffffff !important;
}

/* ========== Input & Form 스타일 ========== */
:deep(.form-control),
:deep(.form-select),
:deep(input[type='text']),
:deep(input[type='date']),
:deep(input[type='number']),
:deep(textarea) {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

:deep(.form-control:focus),
:deep(.form-select:focus),
:deep(input:focus),
:deep(textarea:focus) {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}

/* 이 컴포넌트에서만 체크박스은 기본 브라우저 스타일을 사용하도록 강제
   (다른 전역/심볼릭 스타일이 체크박스를 덮어쓰는 문제 방지) */
:deep(.form-check-input) {
  all: unset; /* 기존에 적용된 스타일을 초기화 */
  -webkit-appearance: checkbox;
  appearance: checkbox;
  display: inline-block;
  width: 16px;
  height: 16px;
  margin: 0;
  vertical-align: middle;
}

:deep(.form-check-input:focus) {
  outline: auto 1px -webkit-focus-ring-color;
}

:deep(.form-check-input[disabled]) {
  opacity: 0.6;
  cursor: not-allowed;
}

:deep(.form-control[disabled]),
:deep(.form-control[readonly]),
:deep(input[disabled]),
:deep(input[readonly]) {
  background: #e9e9e9;
  color: #222;
}

:deep(.form-label) {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
  color: #2c3e50;
  letter-spacing: -0.2px;
}

:deep(.input-group-text) {
  font-weight: 600;
  font-size: 12px;
  color: #2c3e50;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
}

:deep(textarea) {
  min-height: 78px;
  resize: vertical;
}

/* ========== 테이블 스타일 ========== */
:deep(.table) {
  font-size: 12px;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  border: 1px solid #bcbcbc;
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.table thead th) {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  font-weight: 700;
  text-align: center;
  padding: 0.65rem 0.5rem;
  border: none;
  height: var(--thead-h);
}

:deep(.table thead th:first-child) {
  border-top-left-radius: var(--radius-sm);
}

:deep(.table thead th:last-child) {
  border-top-right-radius: var(--radius-sm);
}

:deep(.table tbody td) {
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  padding-top: var(--row-vpad);
  padding-bottom: var(--row-vpad);
  vertical-align: middle;
  overflow: hidden;
  background: #ffffff;
  height: var(--row-h);
}

:deep(.table tbody td:last-child) {
  border-right: none;
}

:deep(.table tbody tr) {
  height: var(--row-h);
  transition: all 0.2s ease;
  background-color: #ffffff;
}

:deep(.table tbody tr:hover:not(.table-secondary)) {
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
}

:deep(.table tbody tr:hover:not(.table-secondary) td) {
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
}

/* 빈 행 스타일 */
:deep(.table-secondary) {
  background: #fafbfc !important;
}

:deep(.table-secondary td) {
  background: #fafbfc !important;
}

/* ========== 테이블 내부 input 스타일 ========== */
:deep(.table input),
:deep(.table select),
:deep(.table textarea) {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  background: transparent;
  padding: 2px 4px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  height: var(--cell-inner-h);
  min-height: 0;
}

:deep(.table input[readonly]),
:deep(.table input[disabled]) {
  background: #e9e9e9;
}

:deep(.table input:focus),
:deep(.table select:focus),
:deep(.table textarea:focus) {
  outline: none;
  border-color: #5b9dd9;
  background: #fff;
}

:deep(.table input.form-control) {
  height: var(--cell-inner-h) !important;
  padding-top: 2px;
  padding-bottom: 2px;
}

/* ========== 텍스트 정렬 ========== */
:deep(.text-center) {
  text-align: center;
}

:deep(.text-end) {
  text-align: right;
}

:deep(.text-start) {
  text-align: left;
}

/* ========== 간격 조정 (일관된 여백) ========== */
:deep(.container-fluid) {
  padding: 16px;
}

:deep(.mb-3) {
  margin-bottom: 16px !important;
}

:deep(.gap-2) {
  gap: 8px !important;
}

:deep(.gap-3) {
  gap: 16px !important;
}

:deep(.g-3) {
  --bs-gutter-x: 16px;
  --bs-gutter-y: 16px;
}

/* 상단/하단 버튼 영역 일관된 간격 */
:deep(.d-flex.justify-content-end) {
  padding: 0 16px;
  margin-bottom: 16px;
}

/* Input Group 간격 */
:deep(.input-group) {
  margin-bottom: 0;
}

:deep(.row) {
  margin-left: 0;
  margin-right: 0;
}

:deep(.col),
:deep([class*='col-']) {
  padding-left: 8px;
  padding-right: 8px;
}

/* ========== 아이콘 호버 효과 ========== */
:deep(.icon) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.icon:hover) {
  opacity: 0.7;
  transform: scale(1.1);
}

/* ========== 스크롤바 스타일 ========== */
:deep(*::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(*::-webkit-scrollbar-track) {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}

:deep(*::-webkit-scrollbar-thumb) {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}

/* ========== 반응형 ========== */
@media (max-width: 1600px) {
  :deep(.btn) {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}

@media (max-width: 768px) {
  :deep(.table) {
    font-size: 11px;
  }

  :deep(.table thead th),
  :deep(.table tbody td) {
    padding: 0.4rem 0.3rem;
  }
}
</style>
