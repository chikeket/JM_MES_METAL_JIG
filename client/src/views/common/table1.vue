<script setup>
import { ref, reactive } from 'vue'

const rows = ref([
  {
    id: 1,
    name: '모델A_20',
    option: '홀로그랭스티..',
    qty: 5000,
    spec: '20g',
    unit: 'EA',
    producible: true,
    note: '배송지 정보',
  },
  {
    id: 2,
    name: '모델B_30',
    option: '홀로그랭스티..',
    qty: 5000,
    spec: '30g',
    unit: 'EA',
    producible: true,
    note: '배송지 정보',
  },
  {
    id: 3,
    name: '모델C_10',
    option: '옵션C',
    qty: 1200,
    spec: '10g',
    unit: 'EA',
    producible: false,
    note: '-',
  },
  {
    id: 4,
    name: '모델D_50',
    option: '옵션D',
    qty: 300,
    spec: '50g',
    unit: 'BOX',
    producible: true,
    note: '특이사항 없음',
  },
])

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
</script>

<template>
  <CTable hover bordered small class="align-middle">
    <CTableHead color="dark">
      <CTableRow>
        <CTableHeaderCell scope="col" class="text-center" style="width: 56px">No</CTableHeaderCell>
        <CTableHeaderCell scope="col">제품 명</CTableHeaderCell>
        <CTableHeaderCell scope="col">제품 옵션 명</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-end" style="width: 140px"
          >요청 수량</CTableHeaderCell
        >
        <CTableHeaderCell scope="col" style="width: 120px">규격</CTableHeaderCell>
        <CTableHeaderCell scope="col" style="width: 90px">단위</CTableHeaderCell>
        <CTableHeaderCell scope="col" style="width: 140px">생산 가능 여부</CTableHeaderCell>
        <CTableHeaderCell scope="col">비고</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      <CTableRow v-for="(row, idx) in rows" :key="row.id ?? idx">
        <CTableHeaderCell scope="row" class="text-center">{{ idx + 1 }}</CTableHeaderCell>

        <!-- 제품 명 -->
        <CTableDataCell @dblclick="startEdit(row, 'name')">
          <template v-if="isEditing(row, 'name')">
            <CFormInput
              v-model="editDraft"
              size="sm"
              @keyup.enter="commitEdit(row, 'name')"
              @keyup.esc="cancelEdit"
              @blur="commitEdit(row, 'name')"
              placeholder="제품 명 입력"
            />
          </template>
          <template v-else>
            {{ row.name || '—' }}
          </template>
        </CTableDataCell>

        <!-- 제품 옵션 명 -->
        <CTableDataCell @dblclick="startEdit(row, 'option')">
          <template v-if="isEditing(row, 'option')">
            <CFormInput
              v-model="editDraft"
              size="sm"
              @keyup.enter="commitEdit(row, 'option')"
              @keyup.esc="cancelEdit"
              @blur="commitEdit(row, 'option')"
              placeholder="옵션 입력"
            />
          </template>
          <template v-else>{{ row.option || '—' }}</template>
        </CTableDataCell>

        <!-- 요청 수량 -->
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

        <!-- 규격 -->
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

        <!-- 단위 -->
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

        <!-- 생산 가능 여부 -->
        <CTableDataCell @dblclick="startEdit(row, 'producible')">
          <template v-if="isEditing(row, 'producible')">
            <CFormSelect
              v-model="editDraft"
              size="sm"
              @change="commitEdit(row, 'producible')"
              @blur="commitEdit(row, 'producible')"
            >
              <option value="true">Y</option>
              <option value="false">N</option>
            </CFormSelect>
          </template>
          <template v-else>{{ row.producible ? 'Y' : 'N' }}</template>
        </CTableDataCell>

        <!-- 비고 -->
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

      <CTableRow v-if="!rows || rows.length === 0">
        <CTableDataCell colspan="8" class="text-center text-muted py-5"
          >행이 없습니다.</CTableDataCell
        >
      </CTableRow>
    </CTableBody>
  </CTable>
</template>
