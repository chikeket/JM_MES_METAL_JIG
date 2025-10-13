<template>
  <!-- 상단 버튼 -->
  <div class="global-toolbar vars-scope">
    <div class="toolbar-buttons">
      <button class="btn btn-sm btn-outline-secondary" @click="onNew">신규</button>
      <button class="btn btn-sm btn-outline-secondary" @click="onSearch">수주 조회</button>
      <button class="btn btn-sm btn-outline-secondary" @click="onSave">저장</button>
      <button class="btn btn-sm btn-outline-danger" @click="onDelete">삭제</button>
    </div>
    <!-- 수주 조회 모달 -->
    <RcvordModalOne
      :visible="isRcvordModalVisible"
      @close="isRcvordModalVisible = false"
      @select="onSelectOrder"
    />
    <!-- 제품 선택 모달 -->
    <RcvordModalTwo
      :visible="isProductModalVisible"
      @close="isProductModalVisible = false"
      @select="onSelectProduct"
    />
  </div>

  <div class="rcvord-page vars-scope">
    <!-- 수주 마스터 폼 -->
    <div class="order-header card-like">
      <div class="form-grid">
        <div class="field">
          <label>수주 ID</label>
          <input type="text" v-model="header.orderId" readonly />
        </div>
        <div class="field">
          <label>납품업체 명</label>
          <input type="text" v-model="header.vendorName" required />
        </div>
        <div class="field">
          <label>수주 담당자</label>
          <input type="text" v-model="header.owner" required />
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
          <label>총 요청 수량</label>
          <input type="text" :value="formattedTotalQty" readonly />
        </div>
        <div class="field field-col-span">
          <label>비고</label>
          <textarea v-model="header.note"></textarea>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="sub-toolbar">
      <div class="sub-toolbar-buttons">
        <button class="btn btn-xs btn-outline-secondary" @click="onResetLines">초기화</button>
        <button class="btn btn-xs btn-outline-primary" @click="onAddLine">제품 추가</button>
        <button class="btn btn-xs btn-outline-danger" @click="onDeleteSelected">
          선택 제품 삭제
        </button>
      </div>
    </div>

    <!-- 마스터 수주에 포함되는 제품 목록 -->
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
            <th class="spec-col">규격</th>
            <th class="unit-col">단위</th>
            <th class="qty-col">요청 수량</th>
            <th class="producible-col">생산 가능 여부</th>
            <th class="due-date-col">납품 예정 일자</th>
            <th class="remark-col">비고</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in lines"
            :key="row.rcvord_deta_id || row.frontTempId"
            :class="{ editing: isEditing(row) }"
          >
            <td class="text-center">
              <input type="checkbox" v-model="row._selected" />
            </td>
            <td class="cell-no">{{ idx + 1 }}</td>
            <td class="cell-left">
              <span class="cell-text" :title="row.productName">{{ row.productName }}</span>
            </td>
            <td class="cell-left">
              <span class="cell-text" :title="row.optionName">{{ row.optionName }}</span>
            </td>
            <td class="cell-left">
              <span class="cell-text" :title="row.spec">{{ row.spec }}</span>
            </td>
            <td class="cell-left">
              <span class="cell-text" :title="row.unit">{{ row.unit }}</span>
            </td>
            <td class="cell-number editable" @dblclick="startEdit(row, 'requestQty')">
              <template v-if="isCellEditing(row, 'requestQty')">
                <input
                  ref="qtyInputs"
                  type="text"
                  v-model="editValue"
                  @keyup.enter="commitEdit"
                  @blur="commitEdit"
                  @keyup.esc="cancelEdit"
                  class="editor-input text-end"
                  placeholder="입력"
                />
              </template>
              <template v-else>
                <span :class="{ 'placeholder-text': !row.requestQty }">
                  {{ row.requestQty ? formatNumber(row.requestQty) : '입력' }}
                </span>
              </template>
            </td>
            <td class="cell-left">
              <span class="cell-text" :title="row.producible">{{ row.producible }}</span>
            </td>
            <td class="cell-left editable" @dblclick="startEdit(row, 'paprd_dt')">
              <template v-if="isCellEditing(row, 'paprd_dt')">
                <input
                  ref="dueDateInputs"
                  type="date"
                  v-model="editValue"
                  @keyup.enter="commitEdit"
                  @blur="commitEdit"
                  @keyup.esc="cancelEdit"
                  class="editor-input"
                  placeholder="입력"
                />
              </template>
              <template v-else>
                <span
                  class="cell-text"
                  :class="{ 'placeholder-text': !row.paprd_dt }"
                  :title="row.paprd_dt || ''"
                >
                  {{ row.paprd_dt || '입력' }}
                </span>
              </template>
            </td>
            <td class="cell-left editable" @dblclick="startEdit(row, 'remark')">
              <template v-if="isCellEditing(row, 'remark')">
                <textarea
                  ref="remarkInputs"
                  v-model="editValue"
                  @keyup.enter.exact.prevent="commitEdit"
                  @blur="commitEdit"
                  @keyup.esc="cancelEdit"
                  class="editor-textarea"
                  placeholder="입력"
                ></textarea>
              </template>
              <template v-else>
                <div
                  class="ellipsis"
                  :class="{ 'placeholder-text': !row.remark }"
                  :title="row.remark || ''"
                >
                  {{ row.remark || '입력' }}
                </div>
              </template>
            </td>
          </tr>
          <tr v-if="!lines.length">
            <td colspan="10" class="empty">데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'
import RcvordModalOne from '../modal/rcvordModalOne.vue'
import RcvordModalTwo from '../modal/rcvordModalTwo.vue'

// Auth store (로그인 사용자 정보 활용)
const auth = useAuthStore()

// Header state
const header = reactive({
  orderId: '',
  vendorName: '',
  owner: '', // 수주 담당자 (사원명)
  empId: '', // 내부 전송용 (선택적으로 사용)
  // status(표시용 명칭), statusCode(저장용 코드) 분리
  status: '',
  statusCode: '',
  orderDate: '',
  note: '',
})

// Lines state
let lineSeq = 1
const lines = ref([])

function createLine(partial = {}) {
  return {
    // frontTempId: 프론트 임시 식별자 (백엔드 rcvord_deta_id와 구분)
    frontTempId: lineSeq++,
    rcvord_deta_id: null,
    prdt_id: null,
    prdt_opt_id: null,
    productName: '',
    optionName: '',
    requestQty: 0,
    spec: '',
    unit: '',
    producible: '',
    paprd_dt: '',
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
const dueDateInputs = ref([])

function startEdit(row, field) {
  // 편집 허용 필드
  if (!['requestQty', 'remark', 'paprd_dt'].includes(field)) return
  editingRow.value = row
  editingField.value = field
  if (field === 'requestQty') editValue.value = String(row.requestQty)
  else if (field === 'remark') editValue.value = row.remark
  else if (field === 'paprd_dt') editValue.value = row.paprd_dt || ''
  nextTick(() => {
    // focus
    if (field === 'requestQty' && qtyInputs.value?.length) {
      const el = qtyInputs.value[qtyInputs.value.length - 1]
      el && el.focus()
    } else if (field === 'remark' && remarkInputs.value?.length) {
      const el = remarkInputs.value[remarkInputs.value.length - 1]
      el && el.focus()
    } else if (field === 'paprd_dt' && dueDateInputs.value?.length) {
      const el = dueDateInputs.value[dueDateInputs.value.length - 1]
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
  } else if (editingField.value === 'paprd_dt') {
    editingRow.value.paprd_dt = editValue.value || ''
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
  isProductModalVisible.value = true
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
function applyDefaultOwnerIfEmpty() {
  // 신규 상태: orderId 없음
  if (!header.orderId) {
    // 담당자 기본 세팅
    if (!header.owner && auth.user) {
      header.owner = auth.user.emp_nm || ''
      header.empId = auth.user.emp_id || ''
    }
    // 등록일자 기본 오늘 날짜
    if (!header.orderDate) {
      header.orderDate = new Date().toISOString().slice(0, 10)
    }
  }
}

function onNew() {
  Object.assign(header, {
    orderId: '',
    vendorName: '',
    owner: '',
    empId: '',
    status: '',
    statusCode: '',
    orderDate: new Date().toISOString().slice(0, 10),
    note: '',
  })
  applyDefaultOwnerIfEmpty()
  onResetLines()
}

// 로그인 사용자 정보가 나중에 도착하는 경우에도 기본 담당자 자동 세팅
watch(
  () => auth.user,
  () => {
    applyDefaultOwnerIfEmpty()
  },
  { immediate: true },
)
// 모달 표시 상태
const isRcvordModalVisible = ref(false)
const isProductModalVisible = ref(false)

function onSearch() {
  isRcvordModalVisible.value = true
}

// 수주 선택 시 상세 호출하여 헤더/라인 매핑
async function onSelectOrder(row) {
  try {
    const id = row.rcvord_id
    if (!id) return
    const { data } = await axios.get(`/api/rcvords/${id}`)
    const { header: h, lines: ls } = data || {}
    header.orderId = h?.rcvord_id || ''
    header.vendorName = h?.co_nm || ''
    header.owner = h?.emp_nm || h?.emp_id || ''
    header.empId = h?.emp_id || ''
    header.status = h?.status || '' // 서비스에서 st_nm 매핑되어 status로 전달
    header.statusCode = h?.st || '' // 원본 코드 별도 보관 (쿼리 결과에 st 포함 가정)
    header.orderDate = h?.reg_dt ? formatDateStr(h.reg_dt) : ''
    header.note = h?.rm || ''
    lines.value = Array.isArray(ls)
      ? ls.map((l) =>
          createLine({
            rcvord_deta_id: l.rcvord_deta_id || null,
            prdt_id: l.prdt_id || null,
            prdt_opt_id: l.prdt_opt_id || null,
            productName: l.prdt_nm || l.prdt_id || '',
            optionName: l.opt_nm && l.opt_nm.trim() ? l.opt_nm : l.prdt_opt_id || '-',
            requestQty: l.rcvord_qy || 0,
            spec: l.spec || '',
            unit: l.unit || '',
            producible: l.prdt_st_nm || l.prdt_st || '',
            paprd_dt: l.paprd_dt ? formatDateStr(l.paprd_dt) : '',
            remark: l.rm || '',
          }),
        )
      : []
  } catch (err) {
    console.error('order detail fetch error', err)
  } finally {
    isRcvordModalVisible.value = false
  }
}

function formatDateStr(d) {
  if (!d) return ''
  try {
    // 이미 'YYYY-MM-DD' 형식이면 그대로
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    const date = new Date(d)
    if (isNaN(date.getTime())) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}
function onSave() {
  const payload = buildSavePayload()
  axios
    .post('/api/rcvords/save', payload)
    .then((res) => {
      const newId = res?.data?.rcvord_id
      if (newId) {
        header.orderId = newId
      }
      alert('저장 성공')
      // 저장 후 전체 초기화 요청에 따라 초기화
      onNew()
    })
    .catch((err) => {
      console.error('저장 실패', err)
      alert('저장 실패: ' + (err?.response?.data?.error || err.message))
    })
}
function onDelete() {
  if (!header.orderId) {
    alert('삭제할 수주가 없습니다.')
    return
  }
  if (!confirm(`수주 ${header.orderId} 를 삭제할까요?`)) return
  axios
    .delete(`/api/rcvords/${header.orderId}`)
    .then(() => {
      alert('삭제 성공')
      onNew()
    })
    .catch((err) => {
      console.error('삭제 실패', err)
      alert('삭제 실패: ' + (err?.response?.data?.error || err.message))
    })
}

function buildSavePayload() {
  const hdr = {
    rcvord_id: header.orderId || '',
    // 현재는 이름만 입력받고 있으므로 서버가 co_nm/emp_nm으로 ID 역매핑 하도록 전송
    co_id: null,
    emp_id: null,
    co_nm: header.vendorName ? header.vendorName.trim() : '',
    emp_nm: header.owner ? header.owner.trim() : '',
    reg_dt: header.orderDate || formatDateStr(new Date()),
    // 표시용 status 는 명칭이므로, 저장 시에는 코드(statusCode)가 있으면 우선, 없으면 기본 'J2'
    st: header.statusCode || 'J2',
    rm: header.note || null,
  }
  const ls = lines.value.map((l) => ({
    rcvord_deta_id: l.rcvord_deta_id || null,
    prdt_id: l.prdt_id || null,
    prdt_opt_id: l.prdt_opt_id || null,
    rcvord_qy: Number(l.requestQty) || 0,
    paprd_dt: l.paprd_dt || null,
    rm: l.remark || null,
  }))
  return { header: hdr, lines: ls }
}

// 제품 선택 시 라인 추가
async function onSelectProduct(product) {
  try {
    const newLine = createLine({
      prdt_id: product.prdt_id,
      prdt_opt_id: product.prdt_opt_id,
      productName: product.prdt_nm,
      optionName: product.opt_nm || '',
      spec: product.spec,
      unit: product.unit,
      // 생산 가능 여부: 명칭(prdt_st_nm) 우선, 없으면 코드(prdt_st)
      producible: product.prdt_st_nm || product.prdt_st,
      requestQty: 0, // 기본 수량 0
      paprd_dt: '',
      remark: product.rm || '',
    })
    lines.value.push(newLine)
  } catch (err) {
    console.error('product select error', err)
  } finally {
    isProductModalVisible.value = false
  }
}

// generateTempId 제거: 서버 ID 자동 생성 사용
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
  text-align: center; /* 헤더 가운데 */
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
.due-date-col {
  width: 110px; /* 납기 예정일: compact */
}
.remark-col {
  width: 450px; /* 비고: 확대 */
}
.cell-no {
  text-align: center;
}
.cell-number {
  text-align: right;
}
.cell-left {
  text-align: left;
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
.placeholder-text {
  color: #b5b5b5;
  font-style: italic;
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
