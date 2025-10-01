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

          <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
            <CButton color="secondary" class="me-md-2">신규</CButton>
            <CButton color="secondary" class="me-md-2">저장</CButton>
            <CButton color="danger">삭제</CButton>
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

            <CCol md="4">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-1">자재 발주서 등록 일자</CInputGroupText>
                <CFormInput type="date" id="publication_date" />
              </CInputGroup>
            </CCol>

            <CCol md="4">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-2">공급 업체 명</CInputGroupText>
                <CFormInput
                  v-model="ordrName2"
                  placeholder="공급 업체 명"
                  aria-label="Rsc-ordr-name-1"
                  aria-describedby="addon-ordr-name-1"
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

          <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
            <CButton color="primary" class="me-md-2" @click="goToRsc()">자재 조회</CButton>
            <RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />
            <CButton color="danger">삭제</CButton>
          </div>

          <CTable striped hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col" class="text-center">
                  <CFormCheck id="allCheck" :checked="allChecked" @change="toggleAll($event)" />
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
                <CTableHeaderCell class="text-center">
                  <CFormCheck :checked="isSelected(row.id)" @change="toggleRow(row.id, $event)" />
                </CTableHeaderCell>
                <CTableDataCell class="text-end">{{ row.id }}</CTableDataCell>
                <CTableDataCell @dblclick="startEdit(row, 'name')">
                  <template v-if="isEditing(row, 'name')">
                    <CFormInput
                      v-model="editDraft"
                      size="sm"
                      @keyup.enter="commitEdit(row, 'name')"
                      @keyup.esc="cancelEdit"
                      @blur="commitEdit(row, 'name')"
                      placeholder="자재 코드 입력"
                    />
                  </template>

                  <template v-else>
                    {{ row.name || '—' }}
                  </template>
                </CTableDataCell>
                <CTableDataCell @dblclick="startEdit(row, 'option')">
                  <template v-if="isEditing(row, 'option')">
                    <CFormInput
                      v-model="editDraft"
                      size="sm"
                      @keyup.enter="commitEdit(row, 'option')"
                      @keyup.esc="cancelEdit"
                      @blur="commitEdit(row, 'option')"
                      placeholder="자재 이름 입력"
                    />
                  </template>

                  <template v-else>
                    {{ row.name || '—' }}
                  </template>
                </CTableDataCell>
                <CTableDataCell @dblclick="startEdit(row, 'spec')">
                  <template v-if="isEditing(row, 'spec')">
                    <CFormInput
                      v-model="editDraft"
                      size="sm"
                      @keyup.enter="commitEdit(row, 'spec')"
                      @keyup.esc="cancelEdit"
                      @blur="commitEdit(row, 'spec')"
                      placeholder="예: 20g"
                    />
                  </template>
                  <template v-else>{{ row.spec || '—' }}</template>
                </CTableDataCell>
                <CTableDataCell @dblclick="startEdit(row, 'unit')">
                  <template v-if="isEditing(row, 'unit')">
                    <CFormSelect
                      v-model="editDraft"
                      size="sm"
                      @change="commitEdit(row, 'unit')"
                      @blur="commitEdit(row, 'unit')"
                    >
                      <option value="EA">EA</option>
                      <option value="BOX">BOX</option>
                      <option value="SET">SET</option>
                    </CFormSelect>
                  </template>
                  <template v-else>{{ row.unit || 'EA' }}</template>
                </CTableDataCell>
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
                      size="sm"
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

import RscModal from '../modal/rscModal.vue'

const isRscModalVisible = ref(false)

const goToRsc = () => {
  isRscModalVisible.value = true
}

const closeRscModal = () => {
  isRscModalVisible.value = false
}

const rows = ref({
  ordrName1: '',
  regDate: '',
  startDate: '',
  endDate: '',
  remark: '',
})

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

function commitEdit(row, field) {
  let v = editDraft.value
  if (field === 'qty') {
    const n = Number(v)
    row.qty = Number.isFinite(n) ? n : 0
  } else if (field === 'producible') {
    row.producible = v === 'true' || v === true
  } else if (field === 'unit') {
    row.unit = String(v || 'EA')
  } else {
    row[field] = (v ?? '').toString()
  }
  cancelEdit()
}

function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}

const fmtQty = (n) => (n ?? 0).toLocaleString()

const selected = ref(new Set())

const isSelected = (id) => selected.value.has(id)

const allChecked = computed(() =>
  rows.value.length > 0 && selected.value.size === rows.value.length
)

function toggleAll(e) {
  if (e.target.checked) {
    selected.value = new Set(rows.value.map(r => r.id))
  } else {
    selected.value = new Set()
  }
}

function toggleRow(id, e) {
  if (e.target.checked) selected.value.add(id)
  else selected.value.delete(id)
}
</script>
