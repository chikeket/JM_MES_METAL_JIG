<template>
  <!-- 상단 버튼 -->
  <div class="global-toolbar vars-scope">
    <div class="toolbar-buttons">
      <button class="btn btn-sm btn-outline-secondary" @click="onNew">신규</button>
      <button class="btn btn-sm btn-outline-secondary" @click="onSearch">납품 조회</button>
      <button class="btn btn-sm btn-outline-secondary" @click="onSave">저장</button>
      <button class="btn btn-sm btn-outline-danger" @click="onDelete">삭제</button>
    </div>
    <!-- 납품 선택 모달 -->
    <DeliModalOne
      :visible="isDeliModalVisible"
      @close="isDeliModalVisible = false"
      @select="onSelectDeli"
    />
    <!-- 수주 선택 모달 -->
    <DeliModalTwo
      :visible="isRcvordModalVisible"
      @close="isRcvordModalVisible = false"
      @select="onSelectRcvord"
    />
  </div>

  <div class="rcvord-page vars-scope">
    <!-- 수주 마스터 폼 -->
    <div class="order-header card-like">
      <div class="form-grid">
        <div class="field">
          <label>납품 ID</label>
          <input type="text" v-model="header.orderId" readonly />
        </div>
        <div class="field">
          <label>납품 담당자</label>
          <input type="text" v-model="header.owner" required />
        </div>
        <div class="field">
          <label>납품 등록 일자</label>
          <input type="date" v-model="header.orderDate" />
        </div>
        <div class="field">
          <label>납품 상태</label>
          <input type="text" v-model="header.deliveryStatus" readonly />
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
        <button class="btn btn-sm btn-outline-secondary" @click="onResetLines">초기화</button>
        <button class="btn btn-sm btn-outline-secondary" @click="onAddRcvord">수주 추가</button>
        <button class="btn btn-sm btn-outline-danger" @click="onDeleteSelected">
          선택 수주 삭제
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
            <th class="ro-col">수주 ID</th>
            <th class="co-col">납품 업체 명</th>
            <th class="pr-col">제품 명</th>
            <th class="op-col">제품 옵션 명</th>
            <th class="spec-col">규격</th>
            <th class="unit-col">단위</th>
            <th class="trqy-col">총 요청 수량</th>
            <th class="dqy-col">기납품 수량</th>
            <th class="unqy-col">미납품 수량</th>
            <th class="tdqy-col">당회 총 납품 수량</th>
            <th class="st-col">출고 상태</th>
            <th class="rm-col">비고</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in lines"
            :key="row.frontTempId || idx"
            :class="{ editing: isEditing(row) }"
          >
            <td class="text-center">
              <input type="checkbox" v-model="row._selected" />
            </td>
            <td class="cell-no">{{ idx + 1 }}</td>
            <td class="cell-left">
              <span class="cell-text" :title="row.rcvord_id">{{ row.rcvord_id }}</span>
            </td>
            <td class="cell-left">
              <span class="cell-text" :title="row.co_nm">{{ row.co_nm }}</span>
            </td>
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
            <td class="cell-number">
              <span>{{ formatNumber(row.total_req_qty || 0) }}</span>
            </td>
            <td class="cell-number">
              <span>{{ formatNumber(row.delivered_qty || 0) }}</span>
            </td>
            <td class="cell-number">
              <span>{{ formatNumber(row.remaining_qty || 0) }}</span>
            </td>
            <td
              class="cell-number editable"
              @click="row.remaining_qty > 0 && startEdit(row, 'requestQty')"
            >
              <template v-if="row.remaining_qty === 0">
                <span>입력 불가</span>
              </template>
              <template v-else-if="isCellEditing(row, 'requestQty')">
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
                <div class="input-like input-like--compact input-like--number">
                  <span class="value" :class="{ 'placeholder-text': !row.requestQty }">
                    {{ row.requestQty ? formatNumber(row.requestQty) : '입력' }}
                  </span>
                </div>
              </template>
            </td>
            <td class="cell-left status-cell" :class="{ empty: !(row.statusName || '').trim() }">
              <span class="cell-text" :title="row.statusName || ''">{{
                row.statusName || ''
              }}</span>
            </td>
            <td class="cell-left editable" @click="startEdit(row, 'remark')">
              <template v-if="isCellEditing(row, 'remark')">
                <textarea
                  ref="remarkInputs"
                  v-model="editValue"
                  @keyup.enter="commitEdit"
                  @blur="commitEdit"
                  @keyup.esc="cancelEdit"
                  class="editor-textarea"
                  placeholder="입력"
                ></textarea>
              </template>
              <template v-else>
                <div class="input-like input-like--textarea">
                  <div class="ellipsis" :title="row.remark || ''">
                    <span class="value" :class="{ 'placeholder-text': !row.remark }">
                      {{ row.remark || '입력' }}
                    </span>
                  </div>
                </div>
              </template>
            </td>
          </tr>
          <tr v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
            <td colspan="14">&nbsp;</td>
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
import DeliModalOne from '../modal/deliModalOne.vue'
import DeliModalTwo from '../modal/deliModalTwo.vue'

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
  // 납품 상태(표시용): 기본 '진행 중', 모든 라인 deli_st 가 J3 일 때 '출고 완료'
  deliveryStatus: '',
  note: '',
})

// Lines state
let lineSeq = 1
const lines = ref([])
// 화면에 항상 보일 표준 행 수 (기본행)
// 기본값: 15 (필요 시 숫자를 변경해서 조절하세요. 예: 10, 12, 20 등)
const GRID_VISIBLE_ROWS = 15

function createLine(partial = {}) {
  return {
    // frontTempId: 프론트 임시 식별자 (백엔드 rcvord_deta_id와 구분)
    frontTempId: lineSeq++,
    // 기존 저장 라인 식별자(수정/업데이트 시 사용)
    deli_deta_id: null,
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
    // 출고 상태 (라인별): 코드와 명칭
    st: '',
    statusName: '',
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
    const raw = (editValue.value ?? '').toString().trim()
    const cleaned = raw.replace(/[\,\s]/g, '')
    const num = Number(cleaned)
    // 유효 숫자만 허용, 아니면 빈값 처리
    if (!Number.isFinite(num)) {
      editingRow.value.requestQty = ''
    } else {
      const remain = Number(editingRow.value.remaining_qty || 0)
      if (num > remain) {
        alert('총 요청 수량을 초과하였습니다.')
        editingRow.value.requestQty = ''
      } else if (num < 0) {
        editingRow.value.requestQty = ''
      } else {
        editingRow.value.requestQty = num
      }
    }
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
// 표준 높이를 위한 최소 빈행 (행 수가 적을 때만 채움)
const emptyRowCount = computed(() => Math.max(0, GRID_VISIBLE_ROWS - lines.value.length))

// Formatting helper
function formatNumber(val) {
  if (val == null || val === '') return ''
  const num = Number(val)
  if (!Number.isFinite(num)) return val
  return num.toLocaleString()
}

// Line operations
function onAddRcvord() {
  isRcvordModalVisible.value = true
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

// 삭제: 현재 폼의 납품 ID(header.orderId) 기준으로 삭제
async function onDelete() {
  const id = (header.orderId || '').trim()
  if (!id) {
    alert('삭제할 납품 ID가 없습니다. 먼저 납품을 조회하세요.')
    return
  }
  const ok = confirm(`납품서 [${id}] 를 삭제하시겠습니까?`)
  if (!ok) return
  try {
    await axios.delete(`/api/delis/${encodeURIComponent(id)}`)
    alert('삭제되었습니다.')
    // 초기화
    onNew()
  } catch (err) {
    console.error('deli delete error', err)
    const msg = err?.response?.data?.message || '삭제 중 오류가 발생했습니다.'
    alert(msg)
  }
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
    deliveryStatus: '',
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
const isDeliModalVisible = ref(false)
const isRcvordModalVisible = ref(false)

function onSearch() {
  isDeliModalVisible.value = true
}

// 납품 선택 시 상세 호출하여 폼/그리드 매핑
async function onSelectDeli(row) {
  try {
    const id = row.deli_id
    if (!id) return
    const { data } = await axios.get(`/api/delis/${id}`)
    const { header: h, lines: ls } = data || {}
    // 폼
    header.orderId = h?.deli_id || ''
    header.owner = h?.emp_nm || h?.emp_id || ''
    header.empId = h?.emp_id || ''
    header.orderDate = h?.deli_dt ? formatDateStr(h.deli_dt) : ''
    header.note = h?.rm || ''
    // 그리드
    lines.value = Array.isArray(ls)
      ? ls.map((l) =>
          createLine({
            rcvord_deta_id: l.rcvord_deta_id || null,
            deli_deta_id: l.deli_deta_id || null,
            rcvord_id: l.rcvord_id || '',
            co_nm: l.co_nm || '',
            productName: l.prdt_nm || '',
            optionName: l.opt_nm || '',
            total_req_qty: l.total_req_qty || 0,
            delivered_qty: l.delivered_qty || 0,
            remaining_qty: l.remaining_qty || 0,
            spec: l.spec || '',
            unit: l.unit || '',
            // 당회 총 납품 수량: 현재 문서의 라인 수량을 표시
            requestQty: Number(l.doc_line_qty || l.doc_delivered_qty || 0),
            // 출고 상태 매핑 (서버에서 deli_st, deli_st_nm 제공 가정)
            st: l.deli_st || '',
            statusName: l.deli_st_nm || '',
            // 라인 비고만 사용 (문서 비고와 독립)
            remark: l.line_rm || '',
          }),
        )
      : []

    // 납품 상태 계산: 모든 라인의 deli_st 가 'J3' 이면 '출고 완료', 아니면 '진행 중'
    const allCompleted =
      Array.isArray(ls) &&
      ls.length > 0 &&
      ls.every((l) => {
        const code = (l?.deli_st || '').toString().trim()
        return code === 'J3'
      })
    header.deliveryStatus = allCompleted ? '출고 완료' : '진행 중'
  } catch (err) {
    console.error('deli detail fetch error', err)
    const msg =
      err?.response?.data?.message || err?.message || '납품 상세 조회 중 오류가 발생했습니다.'
    alert(msg)
  } finally {
    isDeliModalVisible.value = false
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

function buildCutoffDt(dateOnly) {
  try {
    const base = (dateOnly || '').trim()
    if (!base) return new Date().toISOString().slice(0, 19).replace('T', ' ')
    if (/^\d{4}-\d{2}-\d{2}$/.test(base)) {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      return `${base} ${hh}:${mm}:${ss}`
    }
    // 이미 시분초 포함된 경우 표준화
    const dt = new Date(base)
    if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 19).replace('T', ' ')
  } catch (e) {}
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}
async function onSave() {
  try {
    const payload = buildSavePayload()
    const { data } = await axios.post('/api/delis/save', payload)
    if (data?.ok) {
      // 저장 성공 시 신규 버튼과 동일하게 초기화
      alert('저장되었습니다.')
      onNew()
    } else {
      alert('저장 실패')
    }
  } catch (err) {
    console.error('deli save error', err)
    alert('저장 중 오류가 발생했습니다.')
  }
}

function buildSavePayload() {
  const hdr = {
    deli_id: header.orderId || '',
    emp_id: header.empId || null, // 서버에서 emp_nm으로도 역매핑 시도
    emp_nm: header.owner ? header.owner.trim() : '',
    deli_dt: header.orderDate || formatDateStr(new Date()),
    rm: header.note || null,
  }
  const ls = lines.value.map((l) => ({
    deli_deta_id: l.deli_deta_id || null,
    rcvord_deta_id: l.rcvord_deta_id || null,
    delivered_qty: Number(l.delivered_qty) || 0,
    requestQty: Number(l.requestQty) || 0,
    remark: l.remark || null,
  }))
  return { header: hdr, lines: ls }
}
// 수주 선택 시 (행 더블클릭) -> 해당 수주의 상세를 조회하여 라인들 추가
async function onSelectRcvord(rcvordRow) {
  try {
    const id = rcvordRow?.rcvord_id
    if (!id) return
    // 수주 헤더/라인 조회
    const { data } = await axios.get(`/api/rcvords/${id}`)
    const { header: h, lines: ls } = data || {}

    // 필요 시 헤더 일부 반영 (여기서는 비고만 덮어쓰기 예시)
    if (h) {
      header.note = h.rm || header.note
    }

    // 상세 라인을 그리드에 추가하고, 추가된 rcvord_deta_id들의 기납품 누계를 조회하여 즉시 반영
    if (Array.isArray(ls)) {
      const addedIds = []
      ls.forEach((l) => {
        if (lines.value.some((x) => x.rcvord_deta_id === l.rcvord_deta_id)) {
          return
        }
        const newLine = createLine({
          rcvord_deta_id: l.rcvord_deta_id,
          rcvord_id: id,
          co_nm: h?.co_nm || rcvordRow?.co_nm || '',
          prdt_id: l.prdt_id,
          prdt_opt_id: l.prdt_opt_id,
          productName: l.prdt_nm,
          optionName: l.opt_nm || '',
          spec: l.spec,
          unit: l.unit,
          producible: l.prdt_st_nm || l.prdt_st || '',
          total_req_qty: l.rcvord_qy || 0,
          delivered_qty: 0,
          remaining_qty: Number(l.rcvord_qy || 0),
          requestQty: 0,
          remark: l.rm || '',
        })
        lines.value.push(newLine)
        addedIds.push(l.rcvord_deta_id)
      })
      // 기납품 누계 조회 API 호출하여 방금 추가된 라인들에 반영
      if (addedIds.length) {
        try {
          const cutoffDt = buildCutoffDt(header.orderDate)
          let map = {}
          try {
            const { data: sumRes } = await axios.get(`/api/delis/delivered-sum-before`, {
              params: { ids: addedIds.join(','), cutoffDt },
            })
            map = sumRes?.data || {}
          } catch (e1) {
            console.warn('delivered-sum-before failed, fallback to total sum', e1)
          }
          // 폴백: 결과가 비어있으면 전체 누계 API 사용
          if (!map || Object.keys(map).length === 0) {
            try {
              const { data: sumRes2 } = await axios.get(`/api/delis/delivered-sum`, {
                params: { ids: addedIds.join(',') },
              })
              map = sumRes2?.data || {}
            } catch (e2) {
              console.error('delivered-sum fallback error', e2)
            }
          }
          lines.value = lines.value.map((row) => {
            if (addedIds.includes(row.rcvord_deta_id)) {
              const delivered = Number(map?.[row.rcvord_deta_id] || 0)
              const total = Number(row.total_req_qty || 0)
              const remaining = Math.max(total - delivered, 0)
              return { ...row, delivered_qty: delivered, remaining_qty: remaining }
            }
            return row
          })
        } catch (e) {
          console.error('delivered-sum fetch error', e)
        }
      }
    }
  } catch (err) {
    console.error('rcvord select error', err)
  } finally {
    isRcvordModalVisible.value = false
  }
}

// generateTempId 제거: 서버 ID 자동 생성 사용
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
  --table-visible-rows: 10;
  --row-h: 34px;
  --thead-h: 34px;
}

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
  border-radius: 8px;
  border: none;
  color: var(--color-btn-text);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  line-height: 1.5; /* rcvordSearch와 동일한 라인하이트로 높이 통일 */
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-sm,
.btn-xs {
  height: auto;
  padding: 0.5rem 1.2rem;
  font-size: 13px;
}
.btn-outline-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: var(--color-btn-text);
}
.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
.btn-outline-danger,
.btn.btn-outline-danger,
.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: var(--color-btn-text);
}
.btn-outline-danger:hover,
.btn-danger:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}
.btn.btn-sm,
.btn.btn-xs {
  line-height: 1.5; /* rcvordSearch 상속값에 맞춤 */
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
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
  color: #2c3e50;
  letter-spacing: -0.2px;
}
.field input[type='text'],
.field input[type='date'] {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}
.field textarea {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}
.field input[type='text']:focus,
.field input[type='date']:focus,
.field textarea:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}
.field input[type='date'] {
  font-size: 12px;
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
  overflow-x: hidden;
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
  table-layout: fixed;
  font-size: 12px;
}
.data-grid thead th {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  z-index: 10;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
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
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef; /* 열과 열 사이 세로 구분선 */
  padding: 0.55rem 0.5rem;
  background: #ffffff; /* hover 대비를 위해 명시 */
  height: var(--row-h);
}
.data-grid tbody td:last-child {
  border-right: none; /* 마지막 컬럼은 우측 선 제거 */
}
.data-grid tbody tr {
  height: var(--row-h);
  transition: all 0.2s ease;
  background-color: #ffffff;
}
/* 파일1(CTable)과 동일한 테이블 hover 색을 변수로 참조해서 사용 */
.data-grid tbody tr:hover:not(.empty-row),
.data-grid tbody tr:hover:not(.empty-row) td,
.data-grid tbody tr:hover:not(.empty-row) .input-like {
  /* CoreUI(또는 Bootstrap) 변수 → 없으면 기본값 rgba(33,37,41,.075) */
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
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
.pr-col {
  width: 100px;
}
.op-col {
  width: 110px;
}
.trqy-col {
  width: 110px;
}
.tdqy-col {
  width: 160px;
}
.st-col {
  width: 110px;
}
.dqy-col {
  width: 110px;
}
.unqy-col {
  width: 110px;
}
.ro-col {
  width: 120px;
}
.co-col {
  width: 140px;
}
.spec-col {
  width: 80px;
}
.unit-col {
  width: 80px;
}
.rm-col {
  width: 320px;
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
.status-cell.empty {
  background: #e9e9e9;
}
.empty {
  text-align: center;
  padding: 24px 0;
  color: #777;
  font-size: 13px;
}
.empty-row td {
  background: #fafbfc;
}
.cell-text {
  display: block;
  padding: 2px 2px;
  white-space: nowrap;
}
.data-grid td:not(.editable) {
  cursor: default;
}
.input-like {
  display: block;
  width: 100%;
  background-color: #ffffff; /* 기본은 흰색으로 두고 */
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  min-height: 28px;
  line-height: 1.2;
}
.input-like--compact {
  padding: 0.2rem 0.5rem;
  min-height: 26px;
}
.input-like--number {
  text-align: right;
}
.input-like--textarea {
  padding-top: 0.35rem;
  padding-bottom: 0.35rem;
}
.input-like .value {
  display: inline-block;
  color: #2c3e50;
}
.input-like .placeholder-text {
  color: #b5b5b5;
}
.table-wrapper {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
/* rcvordSearch와 동일한 버튼 크기 반응형 규칙 */
@media (max-width: 1600px) {
  .btn {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
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

/* ===== 행 높이 고정 패치 (공통) ===== */
.vars-scope {
  /* 이미 선언돼 있으면 그대로 사용됩니다. */
  --row-h: 34px;
  --row-vpad: 6px; /* td 위/아래 패딩 */
  --cell-inner-h: calc(var(--row-h) - (var(--row-vpad) * 2));
}

/* td 자체 패딩을 고정값으로 줄여서 내부요소가 넘치지 않게 */
.data-grid tbody td {
  padding-top: var(--row-vpad);
  padding-bottom: var(--row-vpad);
  vertical-align: middle; /* 텍스트/컨트롤 수직 중앙 */
  overflow: hidden; /* 내부 컨트롤이 커도 tr을 밀지 않게 */
}

/* 표시용 블록은 한 줄 높이로 */
.data-grid .cell-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--cell-inner-h);
  max-height: var(--cell-inner-h);
}

/* input-like(읽기 모양의 박스)도 고정 높이로 */
.data-grid .input-like {
  min-height: 0; /* 기존 26~28px 규칙 무력화 */
  height: var(--cell-inner-h);
  padding-top: 2px;
  padding-bottom: 2px;
  display: flex;
  align-items: center; /* 수직 중앙 정렬 */
  box-sizing: border-box;
}

/* 숫자/텍스트 영역 placeholder도 같은 라인 높이 */
.data-grid .input-like .value {
  line-height: 1.2;
  max-height: var(--cell-inner-h);
}

/* 편집 입력창(텍스트/날짜)은 tr 높이 안에 맞춤 */
.data-grid .editor-input {
  height: var(--cell-inner-h) !important;
  min-height: 0 !important;
  padding-top: 2px;
  padding-bottom: 2px;
  box-sizing: border-box;
}

/* 편집 textarea는 스크롤로 처리(행 확장 금지) */
.data-grid .editor-textarea {
  height: var(--cell-inner-h) !important;
  min-height: 0 !important;
  max-height: var(--cell-inner-h) !important;
  overflow-y: auto !important;
  box-sizing: border-box;
}

/* 긴 remark 입력도 tr을 밀지 않도록 ellipsis/스크롤 유지 */
.data-grid .input-like--textarea {
  height: var(--cell-inner-h);
  min-height: 0;
  overflow: hidden;
}

/* (옵션) hover 시 내부 표시박스 배경도 같이 바뀌도록 유지 */
.data-grid tbody tr:hover:not(.empty-row) .input-like {
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
}
</style>
