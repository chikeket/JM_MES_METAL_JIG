<template>
  <CContainer fluid>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardBody class="p-4">
          <!-- 기존 상단 툴바 / 버튼 중 발주서 조회를 모달 열도록 변경 -->
          <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
            <CButton color="secondary" class="me-md-2" @click="goToRscOrdrModal">자재 발주서 조회</CButton>
            <CButton color="secondary" class="me-md-2" @click="resetForm">초기화</CButton>
          </div>

          <!-- 모달 컴포넌트 -->
          <RscOrdrModal :visible="isRscOrdrModalVisible" @close="closeRscOrdrModal" @select="onSelectRscOrdr" />

          <CRow class="g-3 mb-3">
            <CCol md="4">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-1">자재 발주서 명</CInputGroupText>
                <CFormInput
                  v-model="ordrName1"
                  placeholder="자재 발주서 명"
                  aria-label="Rsc-ordr-name-1"
                  aria-describedby="addon-ordr-name-1"
                />
              </CInputGroup>
            </CCol>

            <CCol md="6">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-2">자재 발주서 등록 일자</CInputGroupText>
                <CFormInput type="date" id="publication_date" />
                <CFormInput type="date" id="publication_date" />
              </CInputGroup>
            </CCol>
          </CRow>

          <hr />

          <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
            <CButton color="secondary" class="me-md-2" @click="resetForm()">신규</CButton>
            <CButton color="secondary" class="me-md-2" @click="saveRscOrdr()">저장</CButton>
            <CButton color="danger" @click="deleteRscOrdr()">삭제</CButton>
          </div>

          <CRow class="g-3 mb-3">
            <CCol md="3">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-1">자재 발주서 명</CInputGroupText>
                <CFormInput
                  v-model="ordrName1"
                  placeholder="자재 발주서 명"
                  aria-label="Rsc-ordr-name-1"
                  aria-describedby="addon-ordr-name-1"
                />
              </CInputGroup>
            </CCol>

            <CCol md="3">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-1">자재 발주서 등록 일자</CInputGroupText>
                <CFormInput type="date" id="publication_date" />
              </CInputGroup>
            </CCol>

            <CCol md="3">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-2">공급 업체 명</CInputGroupText>
                <CFormInput
                  v-model="ordrName2"
                  placeholder="공급 업체 명"
                  aria-label="co-ordr-name-1"
                  aria-describedby="addon-ordr-name-1"
                />
                <CIcon :icon="cilMagnifyingGlass" size="xl" @click="goToCo()" />
                <CoModal :visible="isCoModalVisible" @close="closeCoModal" @select="selectedCo" />
              </CInputGroup>
            </CCol>

            <CCol md="3">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-1">담당자 명</CInputGroupText>
                <CFormInput
                  type="text"
                  id="login-session"
                  v-model="ownerName"
                  disabled
                  tabindex="-1"
                  aria-label="owner-name"
                  aria-readonly="true"
                />
              </CInputGroup>
            </CCol>
          </CRow>

          <CFormTextarea
            id="exampleFormControlTextarea1"
            label="비고"
            rows="3"
            text="필요 시 기재"
            class="mb-3"
          ></CFormTextarea>

          <hr />

          <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
            <CButton color="secondary" class="me-md-2" @click="goToRsc()">자재 조회</CButton>
            <RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />
            <CButton color="danger" @click="deleteSelectedRows">삭제</CButton>
          </div>

          <CTable hover bordered small class="align-middle">
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell scope="col" class="text-center" style="width:56px"></CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center" style="width:56px">No</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">자재 코드</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">자재 이름</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">규격</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center" style="width:120px">단위</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center" style="width:140px">수량</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              <CTableRow v-for="(row, idx) in displayRows" :key="row.__empty ? 'empty-' + idx : row.id" :class="row.__empty ? 'table-secondary' : ''">
                <CTableDataCell>
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
                      @keyup.enter="commitEdit(row, 'qty')"
                      @keyup.esc="cancelEdit"
                      @blur="commitEdit(row, 'qty')"
                      placeholder="0"
                    />
                  </template>
                  <template v-else>{{ fmtQty(row.qty) }}</template>
                </CTableDataCell>
                <CTableDataCell class="text-end" v-else>&nbsp;</CTableDataCell>

                <CTableDataCell v-if="!row.__empty" @dblclick="startEdit(row, 'note')">
                  <template v-if="isEditing(row, 'note')">
                    <CFormInput
                      v-model="editDraft"
                      type="text"
                      size="sm"
                      @keyup.enter="commitEdit(row, 'note')"
                      @keyup.esc="cancelEdit"
                      @blur="commitEdit(row, 'note')"
                      placeholder="비고 입력"
                    />
                  </template>
                  <template v-else>{{ row.note || '—' }}</template>
                </CTableDataCell>
                <CTableDataCell v-else>&nbsp;</CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

// 돋보기 아이콘
import { CIcon } from '@coreui/icons-vue'
import { cilMagnifyingGlass } from '@coreui/icons'

// 모달 기능
import RscModal from '../modal/rscModal.vue'
import CoModal from '../modal/coModal.vue'
import RscOrdrModal from '../modal/rscOrdrModal.vue' // 추가
// 세션
import { useAuthStore } from '@/stores/auth.js'
import axios from 'axios' // 추가

const auth = useAuthStore()

const isRscModalVisible = ref(false)
const isCoModalVisible = ref(false) // 추가
const isRscOrdrModalVisible = ref(false) // 모달 (rscOrdr 조회용)
const currentOrdrId = ref(null) // 선택된 발주서 id (편집/삭제 시 사용)

const goToRsc = () => { isRscModalVisible.value = true }

const closeRscModal = () => { isRscModalVisible.value = false }

const goToCo = () => { isCoModalVisible.value = true }

const closeCoModal = () => { isCoModalVisible.value = false }

const goToRscOrdrModal = () => { isRscOrdrModalVisible.value = true }
const closeRscOrdrModal = () => { isRscOrdrModalVisible.value = false }

const rows = ref([]) // 배열로 변경

// 선택 상태 관리 추가
const selectedIds = ref([])

// id 단위로 선택 여부 확인 (템플릿에서 isSelected(row.id)로 사용)
const isSelected = (id) => {
  if (id === '' || id == null) return false
  return selectedIds.value.includes(id)
}

// 체크박스 변화에 따라 선택 토글 (템플릿에서 toggleRow(row.id, $event)로 사용)
const toggleRow = (id, ev) => {
  const checked = ev && ev.target ? !!ev.target.checked : !selectedIds.value.includes(id)
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

const selectedRsc = (r) => {
  console.log('[RscOrdr] selectedRsc payload:', r)
  if (!r) return
  // 정규화: modal에서 어떤 키로 와도 displayRows에 맞는 필드로 매핑
  const code = r.rsc_id ?? r.code ?? r.RSC_ID ?? r.rscId ?? ''
  const name = r.rsc_nm ?? r.name ?? r.RSC_NM ?? r.rscNm ?? ''
  const spec = r.spec ?? r.SPEC ?? ''
  const unit = r.rsc_unit ?? r.unit ?? r.RSC_UNIT ?? ''
  if (!code) {
    console.warn('[RscOrdr] selected payload has no code/rsc_id, ignore.')
    return
  }
  const newId = rows.value.length > 0 ? Math.max(...rows.value.map(x => x.id || 0)) + 1 : 1
  rows.value.push({
    id: newId,
    rsc_ordr_deta_id: r.rsc_ordr_deta_id ?? null,
    code: String(code),
    name: name,
    spec: spec,
    unit: unit,
    qty: 0,
    note: ''
  })
  // 모달은 자체에서 close emit 하므로 여기서는 추가만 수행
}

const ordrName1 = ref('') // 자재 발주서 명
const ordrName2 = ref('') // 공급 업체 명 변수 선언

const selectedCo = (co) => {
  // 모달에서 업체 선택
  if (!co) return
  ordrName2.value = co.co_nm
  // 필요하면 co_id 저장
  selectedCoId.value = co.co_id
}

const selectedCoId = ref(null)

// 모달에서 발주서 선택 시 호출: 마스터/라인 매핑
const onSelectRscOrdr = (ordr) => {
  if (!ordr) return
  currentOrdrId.value = ordr.master?.rsc_ordr_id ?? null
  ordrName1.value = ordr.master?.rsc_ordr_nm ?? ordrName1.value
  ordrName2.value = ordr.master?.co_nm ?? ordrName2.value
  ownerName.value = ordr.master?.emp_nm ?? ownerName.value

  rows.value = (ordr.detailList ?? []).map((d, i) => ({
    id: i + 1,
    code: d.rsc_id,
    name: d.rsc_nm ?? '',
    spec: d.spec ?? '',
    unit: d.unit ?? '',
    qty: Number(d.qy ?? 0),
    note: d.rm ?? '',
    rsc_ordr_deta_id: d.rsc_ordr_deta_id ?? null,
  }))

  closeRscOrdrModal()
}

// 로그인 세션 기반 담당자
const authStore = useAuthStore()
const ownerName = ref('')
const ownerEmpId = ref('')
watch(
  () => authStore.user,
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

// 그리드 편집 관련 (기존 로직 유지)
const editing = reactive({ id: null, field: null })
const editDraft = ref(null)
const isEditing = (row, field) => editing.id === row.id && editing.field === field

function startEdit(row, field) {
  if (!row || row.__empty) return
  editing.id = row.id
  editing.field = field
  // 필드별 초기값
  if (field === 'qty') editDraft.value = row.qty ?? 0
  else if (field === 'note') editDraft.value = row.note ?? ''
}

function commitEdit(row, field) {
  if (!row) return
  if (field === 'qty') {
    const v = Number(editDraft.value)
    row.qty = Number.isNaN(v) ? 0 : v
  } else if (field === 'note') {
    row.note = editDraft.value ?? ''
  }
  cancelEdit()
}

function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}

const fmtQty = (n) => (n ?? 0).toLocaleString()

// 기본으로 표시할 최소 빈행 수
const MIN_DISPLAY_ROWS = 10

// rows가 이미 선언되어 있어야 합니다: const rows = ref([])
const displayRows = computed(() => {
  const arr = (rows.value || []).map(r => ({ ...r, __empty: false }))
  while (arr.length < MIN_DISPLAY_ROWS) {
    arr.push({
      __empty: true,
      id: '',
      code: '',
      name: '',
      spec: '',
      unit: '',
      qty: null,
      note: '',
    })
  }
  return arr
})

// 저장(신규/수정)
const saveRscOrdr = async () => {
  try {
    const master = {
      co_id: selectedCoId.value || null,
      emp_id: ownerEmpId.value || null,
      reg_dt: new Date().toISOString().slice(0,10),
      rm: '', // 필요하면 바인딩
      rsc_ordr_nm: ordrName1.value || '',
    }
    const detailList = rows.value.filter(r => !r.__empty).map(r => ({
      rsc_id: r.code,
      qy: Number(r.qty ?? 0),
      rm: r.note ?? '',
      rsc_ordr_deta_id: r.rsc_ordr_deta_id ?? null,
    }))

    const payload = {
      master,
      detailList,
      rsc_ordr_id: currentOrdrId.value || null,
    }

    const res = await axios.post('/api/rscOrdr', payload)
    if (res.data?.isSuccessed) {
      alert('저장되었습니다.')
      if (res.data.id) currentOrdrId.value = res.data.id
    } else {
      alert('저장 실패')
    }
  } catch (err) {
    console.error(err)
    alert('저장 중 오류')
  }
}

// 삭제 (마스터 전체 삭제)
const deleteRscOrdr = async () => {
  if (!currentOrdrId.value) {
    alert('삭제할 발주서를 먼저 선택하세요.')
    return
  }
  if (!confirm('선택한 자재 발주서를 삭제하시겠습니까?')) return
  try {
    const res = await axios.delete(`/api/rscOrdr/${encodeURIComponent(currentOrdrId.value)}`)
    if (res.data?.isSuccessed) {
      alert('삭제되었습니다.')
      currentOrdrId.value = null
      rows.value = []
    } else {
      alert('삭제 실패')
    }
  } catch (err) {
    console.error(err)
    alert('삭제 중 오류')
  }
}

// form 초기화(신규 리셋)
const resetForm = () => {
  if (!confirm('초기화하면 현재 편집중인 내용이 모두 사라집니다. 계속하시겠습니까?')) return
  currentOrdrId.value = null
  ordrName1.value = ''
  ordrName2.value = ''
  selectedCoId.value = null
  rows.value = []
  // 추가 필드가 있다면 여기에 초기화 항목을 더 추가하세요.
}

// 아래 경고 해결용 빈 함수(선택된 행 삭제가 필요하면 로직 추가)
function deleteSelectedRows() {
  // 선택 로직이 없으면 전체 초기화 혹은 간단 알림
  // TODO: row selection 상태가 있으면 해당 row들을 삭제하도록 구현하세요.
  if (!confirm('선택된 행을 삭제하시겠습니까? (현재 선택 기능이 없으면 전체 초기화)')) return
  rows.value = []
}
</script>
