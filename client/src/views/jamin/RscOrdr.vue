<template>
  <CContainer fluid>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardBody class="p-4">
          <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
            <CButton color="secondary" class="me-md-2">자재 발주서 조회</CButton>
            <CButton color="secondary">초기화</CButton>
          </div>

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
            <CButton color="secondary" class="me-md-2">신규</CButton>
            <CButton color="secondary" class="me-md-2">저장</CButton>
            <CButton color="danger">삭제</CButton>
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
                <CFormInput type="text" id="login-session" />
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

          <CTable striped hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>
                  <CFormCheck :checked="allChecked" @change="toggleAll($event)" />
                </CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">No</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">자재 코드</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">자재 이름</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">규격</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">단위</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">수량</CTableHeaderCell>
                <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              <CTableRow v-for="row in rows" :key="row.id">
                <CTableDataCell>
                  <CFormCheck :checked="isSelected(row.id)" @change="toggleRow(row.id, $event)" />
                </CTableDataCell>

                <CTableDataCell class="text-end">{{ row.id }}</CTableDataCell>

                <CTableDataCell>{{ row.code }}</CTableDataCell>

                <CTableDataCell>{{ row.name }}</CTableDataCell>

                <CTableDataCell>{{ row.spec }}</CTableDataCell>

                <CTableDataCell>{{ row.unit }}</CTableDataCell>

                <CTableDataCell class="text-end" @dblclick="startEdit(row, 'qty')">
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

                <CTableDataCell @dblclick="startEdit(row, 'note')">
                  <template v-if="isEditing(row, 'note')">
                    <CFormInput
                      v-model="editDraft"
                      type="text"
                      size="sm"
                      class="text-end"
                      @keyup.enter="commitEdit(row, 'note')"
                      @keyup.esc="cancelEdit"
                      @blur="commitEdit(row, 'note')"
                      placeholder="비고 입력"
                    />
                  </template>
                  <template v-else>{{ row.note || '—' }}</template>
                </CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 돋보기 아이콘
import { CIcon } from '@coreui/icons-vue'
import { cilMagnifyingGlass } from '@coreui/icons'

// 모달 기능
import RscModal from '../modal/rscModal.vue'
import CoModal from '../modal/coModal.vue'

const isRscModalVisible = ref(false)
const isCoModalVisible = ref(false) // 추가

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

const rows = ref([]) // 배열로 변경

const selectedRsc = (rsc) => {
  const newId = rows.value.length > 0 ? Math.max(...rows.value.map((r) => r.id ?? 0)) + 1 : 1
  rows.value.push({
    id: newId,
    code: rsc.rsc_id,
    name: rsc.rsc_nm,
    spec: rsc.spec,
    unit: rsc.unit,
  })
}

const ordrName2 = ref('') // 공급 업체 명 변수 선언

const selectedCo = (co) => {
  ordrName2.value = co.co_nm // 선택한 공급업체명을 입력란에 할당
  closeCoModal() // 모달 닫기
}

// 그리드 기능
const editing = reactive({ id: null, field: null })
const editDraft = ref(null)

const isEditing = (row, field) => editing.id === row.id && editing.field === field

function startEdit(row, field) {
  editing.id = row.id
  editing.field = field
  const cur = row[field]
  // boolean 셀렉트 대비
  editDraft.value = field === 'producible' ? String(!!cur) : cur
}

let editLocked = false

function commitEdit(row, field) {
  if (editLocked) return
  editLocked = true

  let v = editDraft.value
  if (field === 'qty') {
    if (v !== null && v !== '') {
      const n = Number(v)
      row.qty = Number.isFinite(n) ? n : row.qty
    }
  } else if (field === 'note') {
    if (v !== null && v !== '') row.note = v
  }
  cancelEdit()
  setTimeout(() => {
    editLocked = false
  }, 0) // 다음 tick에 unlock
}

function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}

const fmtQty = (n) => (n ?? 0).toLocaleString()

// 삭제 기능

const selected = ref(new Set())

function isSelected(id) {
  return selected.value.has(id)
}

function toggleRow(id, e) {
  if (e.target.checked) selected.value.add(id)
  else selected.value.delete(id)
}

function toggleAll(e) {
  if (e.target.checked) {
    selected.value = new Set(rows.value.map((r) => r.id))
  } else {
    selected.value.clear()
  }
}

// 체크박스 기능
const allChecked = computed(
  () => rows.value.length > 0 && selected.value.size === rows.value.length,
)

function deleteSelectedRows() {
  rows.value = rows.value.filter((row) => !selected.value.has(row.id))
  selected.value.clear()
}
</script>
