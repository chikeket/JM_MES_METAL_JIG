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
  arr.forEach((item) => {
    const code = item.rsc_id ?? item.code ?? item.RSC_ID ?? item.rscId ?? ''
    const name = item.rsc_nm ?? item.name ?? item.RSC_NM ?? item.rscNm ?? ''
    const spec = item.spec ?? item.SPEC ?? ''
    const unit = item.rsc_unit ?? item.unit ?? item.RSC_UNIT ?? ''
    if (!code) return
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
  })
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
