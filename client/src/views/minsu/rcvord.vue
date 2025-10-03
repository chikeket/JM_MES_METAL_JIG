<template>
  <!-- 상단 글로벌 버튼 바 (우측 여백 추가 + 색상 유지) -->
  <div class="global-toolbar vars-scope">
    <div class="toolbar-buttons">
      <button class="btn btn-sm btn-outline-secondary" @click="onNew">신규</button>
      <button class="btn btn-sm btn-outline-secondary" @click="onSearch">수주 조회</button>
      <button class="btn btn-sm btn-outline-secondary" @click="onSave">저장</button>
      <button class="btn btn-sm btn-outline-danger" @click="onDelete">삭제</button>
    </div>
  </div>

  <div class="rcvord-page vars-scope">
    <!-- 검색조건(헤더) 영역 -->
    <div class="order-header card-like">
      <div class="form-grid">
        <div class="field">
          <label>수주 ID</label>
          <input type="text" v-model="header.orderId" readonly />
        </div>
        <div class="field">
          <label>납품업체 명</label>
          <input type="text" v-model="header.vendorName" />
        </div>
        <div class="field">
          <label>수주 담당자</label>
          <input type="text" v-model="header.owner" />
        </div>
        <div class="field">
          <label>수주 상태</label>
          <input type="text" v-model="header.status" readonly />
        </div>
        <div class="field">
          <label>수주 등록 일자</label>
          <input type="date" v-model="header.orderDate" />
        </div>
        <div class="field">
          <label>납품 예정 일자</label>
          <input type="date" v-model="header.dueDate" />
        </div>
        <div class="field">
          <label>총 요청 수량</label>
          <input type="text" :value="formattedTotalQty" readonly />
        </div>
        <div class="field field-col-span">
          <label>비고</label>
          <textarea v-model="header.note" />
        </div>
      </div>
    </div>

    <!-- 하단 제품 목록 외부 버튼바 -->
    <div class="sub-toolbar">
      <div class="sub-toolbar-buttons">
        <button class="btn btn-xs btn-outline-secondary" @click="onResetLines">초기화</button>
        <button class="btn btn-xs btn-outline-primary" @click="onAddLine">제품 추가</button>
        <button class="btn btn-xs btn-outline-danger" @click="onDeleteSelected">
          선택 제품 삭제
        </button>
      </div>
    </div>

    <!-- 제품 목록 -->
    <div class="table-wrapper table-wrapper-expanded">
      <table class="data-grid">
        <thead>
          <tr>
            <th class="chk-col">
              <input type="checkbox" v-model="allSelected" @change="toggleAll" />
            </th>
            <th class="no-col">No</th>
            <th class="prod-col">제품 명</th>
            <th class="opt-col">제품 옵션 명</th>
            <th class="qty-col">요청 수량</th>
            <th class="spec-col">규격</th>
            <th class="unit-col">단위</th>
            <th class="producible-col">생산 가능 여부</th>
            <th class="remark-col">비고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in lines" :key="row.id" :class="{ editing: isEditing(row) }">
            <td class="text-center">
              <input type="checkbox" v-model="row._selected" />
            </td>
            <td class="text-center">{{ idx + 1 }}</td>
            <td>
              <span class="cell-text" :title="row.productName">{{ row.productName }}</span>
            </td>
            <td>
              <span class="cell-text" :title="row.optionName">{{ row.optionName }}</span>
            </td>
            <td class="text-end editable" @dblclick="startEdit(row, 'requestQty')">
              <template v-if="isCellEditing(row, 'requestQty')">
                <input
                  ref="qtyInputs"
                  type="text"
                  v-model="editValue"
                  @keyup.enter="commitEdit"
                  @blur="commitEdit"
                  @keyup.esc="cancelEdit"
                  class="editor-input text-end"
                />
              </template>
              <template v-else>
                {{ formatNumber(row.requestQty) }}
              </template>
            </td>
            <td>
              <span class="cell-text" :title="row.spec">{{ row.spec }}</span>
            </td>
            <td>
              <span class="cell-text" :title="row.unit">{{ row.unit }}</span>
            </td>
            <td>
              <span class="cell-text" :title="row.producible">{{ row.producible }}</span>
            </td>
            <td class="editable" @dblclick="startEdit(row, 'remark')">
              <template v-if="isCellEditing(row, 'remark')">
                <textarea
                  ref="remarkInputs"
                  v-model="editValue"
                  @keyup.enter.exact.prevent="commitEdit"
                  @blur="commitEdit"
                  @keyup.esc="cancelEdit"
                  class="editor-textarea"
                ></textarea>
              </template>
              <template v-else>
                <div class="ellipsis" :title="row.remark">{{ row.remark }}</div>
              </template>
            </td>
          </tr>
          <tr v-if="!lines.length">
            <td colspan="9" class="empty">행이 없습니다. 제품을 추가하세요.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'

// Header state
const header = reactive({
  orderId: '',
  vendorName: '',
  owner: '',
  status: '',
  orderDate: '',
  dueDate: '',
  note: '',
})

// Lines state
let lineSeq = 1
const lines = ref([
  // 초기 예시 데이터
  createLine({
    productName: '모델A_20',
    optionName: '홀로그램스티..',
    requestQty: 5000,
    spec: '20g',
    unit: 'EA',
    producible: 'Y',
    remark: '배송지 정보',
  }),
  createLine({
    productName: '모델B_30',
    optionName: '홀로그램스티..',
    requestQty: 5000,
    spec: '30g',
    unit: 'EA',
    producible: 'Y',
    remark: '배송지 정보',
  }),
])

function createLine(partial = {}) {
  return {
    id: lineSeq++,
    productName: '',
    optionName: '',
    requestQty: 0,
    spec: '',
    unit: '',
    producible: '',
    remark: '',
    _selected: false,
    ...partial,
  }
}

// Selection
const allSelected = ref(false)
function toggleAll() {
  lines.value.forEach((l) => (l._selected = allSelected.value))
}

// Editing state
const editingRow = ref(null) // row reference
const editingField = ref('')
const editValue = ref('')
const qtyInputs = ref([])
const remarkInputs = ref([])

function startEdit(row, field) {
  // Only requestQty or remark allowed
  if (!['requestQty', 'remark'].includes(field)) return
  editingRow.value = row
  editingField.value = field
  editValue.value = field === 'requestQty' ? String(row.requestQty) : row.remark
  nextTick(() => {
    // focus
    if (field === 'requestQty' && qtyInputs.value?.length) {
      const el = qtyInputs.value[qtyInputs.value.length - 1]
      el && el.focus()
    } else if (field === 'remark' && remarkInputs.value?.length) {
      const el = remarkInputs.value[remarkInputs.value.length - 1]
      el && el.focus()
    }
  })
}

function isEditing(row) {
  return editingRow.value === row
}
function isCellEditing(row, field) {
  return isEditing(row) && editingField.value === field
}

function commitEdit() {
  if (!editingRow.value) return
  if (editingField.value === 'requestQty') {
    const num = Number(editValue.value.replace(/[,\s]/g, ''))
    editingRow.value.requestQty = Number.isFinite(num) ? num : 0
  } else if (editingField.value === 'remark') {
    editingRow.value.remark = editValue.value.trim()
  }
  cancelEdit()
}
function cancelEdit() {
  editingRow.value = null
  editingField.value = ''
  editValue.value = ''
}

// Computed total
const totalQty = computed(() =>
  lines.value.reduce((sum, l) => sum + (Number(l.requestQty) || 0), 0),
)
const formattedTotalQty = computed(() => formatNumber(totalQty.value))

// Formatting helper
function formatNumber(val) {
  if (val == null || val === '') return ''
  const num = Number(val)
  if (!Number.isFinite(num)) return val
  return num.toLocaleString()
}

// Line operations
function onAddLine() {
  lines.value.push(createLine())
}
function onDeleteSelected() {
  lines.value = lines.value.filter((l) => !l._selected)
  allSelected.value = false
}
function onResetLines() {
  lines.value = []
  allSelected.value = false
  cancelEdit()
}

// Header button stubs
function onNew() {
  // TODO: 비즈니스 로직 연결
  Object.assign(header, {
    orderId: '',
    vendorName: '',
    owner: '',
    status: '',
    orderDate: '',
    dueDate: '',
    note: '',
  })
  onResetLines()
}
function onSearch() {
  // TODO: 검색 다이얼로그/조회 로직
  console.log('search clicked')
}
function onSave() {
  // TODO: 서버 저장 API 연동
  console.log('save', { header: { ...header }, lines: lines.value })
}
function onDelete() {
  // TODO: 삭제 로직 연동
  console.log('delete order')
}
</script>

<style scoped>
/* 변수 스코프를 위한 래퍼 클래스 (wrapper 제거 후) */
.vars-scope {
  --radius-sm: 4px;
  --radius-md: 6px;
  --color-btn-gray: #6e7b85;
  --color-btn-gray-hover: #5d6871;
  --color-btn-danger: #c53030;
  --color-btn-danger-hover: #a82323;
  --color-btn-text: #fff;
  --table-visible-rows: 10;
  --row-h: 34px;
  --thead-h: 34px;
}

/* 제거된 rcvord-wrapper 관련 스타일 삭제 */
.global-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0 14px 0 14px; /* 양쪽 패딩(오른쪽 띄우기) */
  margin-bottom: 8px;
}
.global-toolbar .toolbar-buttons {
  display: flex;
  gap: 6px;
}
.sub-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: -4px 0 8px;
}
.sub-toolbar-buttons {
  display: flex;
  gap: 6px;
}

.rcvord-page {
  font-size: 13px;
  /* 좌우가 너무 붙어있다는 요청 -> 약간의 패딩 추가 */
  padding: 0 12px;
}
.card-like {
  border: 1px solid #ccc;
  background: #ffffff;
  padding: 12px 14px 16px;
  margin-bottom: 16px;
  position: relative;
  border-radius: var(--radius-md);
}
.btn {
  cursor: pointer;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: var(--color-btn-gray);
  color: var(--color-btn-text);
  font-weight: 500;
  transition: background 0.15s, filter 0.15s;
  height: 32px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 14px;
  font-size: 13px;
}
.btn-sm,
.btn-xs {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
}
.btn-outline-secondary {
  background: var(--color-btn-gray);
  color: var(--color-btn-text);
  border-color: var(--color-btn-gray-hover);
}
.btn-outline-secondary:hover {
  background: var(--color-btn-gray-hover);
}
.btn-outline-danger,
.btn.btn-outline-danger,
.btn-danger {
  background: var(--color-btn-danger);
  color: var(--color-btn-text);
  border-color: var(--color-btn-danger-hover);
}
.btn-outline-danger:hover,
.btn-danger:hover {
  background: var(--color-btn-danger-hover);
}
.btn.btn-sm,
.btn.btn-xs {
  line-height: 1.2;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px 18px;
  margin-top: 0;
}
.field {
  display: flex;
  flex-direction: column;
}
.field-col-span {
  grid-column: 1 / -1;
}
.field label {
  font-weight: 500;
  margin-bottom: 4px;
}
.field input[type='text'],
.field input[type='date'],
.field textarea {
  border: 1px solid #bbb;
  border-radius: var(--radius-sm);
  padding: 4px 6px;
  background: #fff;
  font-size: 13px;
}
.field input[readonly],
.field input[readonly='readonly'] {
  background: #e9e9e9;
  color: #222;
}
.field textarea {
  min-height: 78px;
  resize: vertical;
}

.table-wrapper {
  height: calc(var(--row-h) * var(--table-visible-rows) + var(--thead-h));
  overflow-y: auto;
  border: 1px solid #bcbcbc;
  border-radius: var(--radius-md);
}
.table-wrapper-expanded {
  margin-top: 0;
  background: #ffffff;
  padding: 0;
}
.data-grid {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
  font-size: 12px;
}
.data-grid thead th {
  position: sticky;
  top: 0;
  background: #212631;
  color: #fff;
  z-index: 2;
  border: 1px solid #bcbcbc;
  padding: 4px;
  font-weight: 600;
  text-align: center;
  height: var(--thead-h);
}
.data-grid thead th:first-child {
  border-top-left-radius: var(--radius-sm);
}
.data-grid thead th:last-child {
  border-top-right-radius: var(--radius-sm);
}
.data-grid tbody td {
  border: 1px solid #d4d4d4;
  padding: 2px 4px;
  background: #fff;
  height: var(--row-h);
}
.data-grid tbody tr {
  height: var(--row-h);
}
.data-grid input,
.data-grid select,
.data-grid textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  background: transparent;
  padding: 2px 4px;
  font-size: 12px;
  border-radius: var(--radius-sm);
}
.data-grid input[readonly],
.data-grid input[readonly='readonly'] {
  background: #e9e9e9;
}
.data-grid input:focus,
.data-grid select:focus,
.data-grid textarea:focus {
  outline: none;
  border-color: #5b9dd9;
  background: #fff;
}
.data-grid tbody tr.editing {
  background: #fffef0;
}
.chk-col {
  width: 36px;
}
.no-col {
  width: 46px;
}
.qty-col {
  width: 90px;
}
.spec-col {
  width: 70px;
}
.unit-col {
  width: 55px;
}
.producible-col {
  width: 90px;
}
.prod-col {
  width: 120px;
}
.opt-col {
  width: 140px;
}
.remark-col {
  width: 360px;
}
.text-center {
  text-align: center;
}
.text-end {
  text-align: right;
}
.editable {
  cursor: pointer;
}
.editor-input,
.editor-textarea {
  background: #fff !important;
  border: 1px solid #5b9dd9 !important;
  border-radius: var(--radius-sm);
}
.editor-textarea {
  width: 100%;
  min-height: 48px;
  resize: vertical;
  font-family: inherit;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.empty {
  text-align: center;
  padding: 24px 0;
  color: #777;
  font-size: 13px;
}
.cell-text {
  display: block;
  padding: 2px 2px;
  white-space: nowrap;
}
.data-grid td:not(.editable) {
  cursor: default;
}
.table-wrapper::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: var(--radius-sm);
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: var(--radius-sm);
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
@media (max-height: 900px) {
  .table-wrapper {
    height: calc(var(--row-h) * 7 + var(--thead-h));
  }
}
@media (max-height: 780px) {
  .table-wrapper {
    height: calc(var(--row-h) * 6 + var(--thead-h));
  }
}
@media (max-height: 700px) {
  .table-wrapper {
    height: calc(var(--row-h) * 5 + var(--thead-h));
  }
}
</style>
