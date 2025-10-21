<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 버튼 -->
    <div class="global-toolbar vars-scope" style="margin-bottom: 0.5rem">
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
      <div class="order-header card-like" style="margin-bottom: 2rem">
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
            <div class="date-input-wrapper">
              <input
                type="text"
                v-model="header.orderDate"
                @click="toggleCalendar"
                placeholder="YYYY-MM-DD"
                class="date-input-custom"
              />
              <div class="calendar-icon" @click="toggleCalendar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <!-- 커스텀 달력 팝업 -->
              <div v-if="showCalendar" class="custom-calendar" ref="calendarRef">
                <div class="calendar-header">
                  <button type="button" @click="prevMonth" class="calendar-nav-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <div class="calendar-title">{{ calendarTitle }}</div>
                  <button type="button" @click="nextMonth" class="calendar-nav-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div class="calendar-weekdays">
                  <div class="weekday">일</div>
                  <div class="weekday">월</div>
                  <div class="weekday">화</div>
                  <div class="weekday">수</div>
                  <div class="weekday">목</div>
                  <div class="weekday">금</div>
                  <div class="weekday">토</div>
                </div>
                <div class="calendar-days">
                  <div
                    v-for="day in calendarDays"
                    :key="day.key"
                    :class="[
                      'calendar-day',
                      {
                        'other-month': !day.isCurrentMonth,
                        today: day.isToday,
                        selected: day.isSelected,
                      },
                    ]"
                    @click="selectDate(day)"
                  >
                    {{ day.date }}
                  </div>
                </div>
              </div>
            </div>
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
      <div class="sub-toolbar" style="margin-bottom: 0.5rem">
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
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'
import DeliModalOne from '../modal/deliModalOne.vue'
import DeliModalTwo from '../modal/deliModalTwo.vue'

// 달력 관련 상태 추가
const showCalendar = ref(false)
const calendarRef = ref(null)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

// 달력 계산
const calendarTitle = computed(() => {
  return `${currentYear.value}년 ${currentMonth.value + 1}월`
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0)

  const firstDayOfWeek = firstDay.getDay()
  const lastDate = lastDay.getDate()
  const prevLastDate = prevLastDay.getDate()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(today.getDate()).padStart(2, '0')}`

  // 이전 달 날짜
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevLastDate - i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      key: `prev-${prevLastDate - i}`,
    })
  }

  // 현재 달 날짜
  for (let i = 1; i <= lastDate; i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(
      2,
      '0',
    )}-${String(i).padStart(2, '0')}`
    days.push({
      date: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: header.orderDate === dateStr,
      key: `current-${i}`,
      fullDate: dateStr,
    })
  }

  // 다음 달 날짜
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      key: `next-${i}`,
    })
  }

  return days
})

function toggleCalendar() {
  showCalendar.value = !showCalendar.value
  if (showCalendar.value && header.orderDate) {
    const [year, month] = header.orderDate.split('-')
    currentYear.value = parseInt(year)
    currentMonth.value = parseInt(month) - 1
  }
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function selectDate(day) {
  if (!day.isCurrentMonth) return
  header.orderDate = day.fullDate  // fullDate 그대로 사용 (이미 YYYY-MM-DD 형식)
  showCalendar.value = false
}

function handleClickOutsideCalendar(event) {
  if (calendarRef.value && !calendarRef.value.contains(event.target)) {
    const dateWrapper = event.target.closest('.date-input-wrapper')
    if (!dateWrapper) {
      showCalendar.value = false
    }
  }
}

// onMounted에 추가
onMounted(() => {
  document.addEventListener('click', handleClickOutsideCalendar)
})

// onBeforeUnmount에 추가
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsideCalendar)
})

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
const GRID_VISIBLE_ROWS = 7

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
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split('-')
      return `${y}-${day}-${m}` // DD와 MM 위치 변경
    }
    const date = new Date(d)
    if (isNaN(date.getTime())) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${day}-${m}` // DD와 MM 위치 변경
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
    // 클라이언트 선체크: 제품/옵션별 요청합이 재고보다 큰지 확인
    const stockOk = await validateStockBeforeSave()
    if (!stockOk) {
      alert('재고가 부족합니다.')
      onNew()
      return
    }
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
    const msg = err?.response?.data?.message || err?.message || '저장 중 오류가 발생했습니다.'
    if (String(msg).includes('재고가 부족')) {
      alert('재고가 부족합니다.')
      onNew()
      return
    }
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

// 재고 선검증: 라인들의 rcvord_deta_id → prdt_id/opt_id 매핑을 서버가 알고 있으므로, 서버에 일괄 질의하거나
// 간단히 서버 저장단에서 막도록 위임. 여기서는 간단히 서버 측 검증에 의존하되,
// 사용자가 명백히 0 이하 입력 또는 빈 입력만 있는 경우는 통과.
async function validateStockBeforeSave() {
  try {
    // 요청합이 0이면 굳이 검증하지 않음
    const total = lines.value.reduce((s, l) => s + (Number(l.requestQty) || 0), 0)
    if (total <= 0) return true
    // 서버에서 최종 검증을 수행하므로 여기서는 true 반환
    // 추후 필요 시, 전용 재고 확인 API를 만들어 품목별 재고와 비교하도록 확장
    return true
  } catch (e) {
    console.warn('재고 선검증 실패(무시하고 서버 검증에 위임):', e)
    return true
  }
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
/* ============================================
   페이지 진입 애니메이션
   ============================================ */
.page-container {
  animation: pageLoad 0.5s ease-out;
}

@keyframes pageLoad {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.button-group {
  animation: fadeInDown 0.4s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   기본 설정
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.6;
  box-sizing: border-box;
}

:deep(.container-fluid) {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  padding: 1.5rem !important;
  min-height: 100vh;
  overflow: auto;
  width: 100%;
}

.vars-scope {
  --radius-sm: 8px;
  --radius-md: 12px;
  --color-btn-text: #fff;
  --table-visible-rows: 7;
  --row-h: 46px;
  --thead-h: 46px;
  --row-vpad: 6px;
  --cell-inner-h: calc(var(--row-h) - (var(--row-vpad) * 2));
}

/* ============================================
   툴바
   ============================================ */
.global-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0;
  animation: fadeInDown 0.4s ease-out;
}

.global-toolbar .toolbar-buttons {
  display: flex;
  gap: 0.5rem;
}

.sub-toolbar {
  display: flex;
  justify-content: flex-end;
  animation: fadeInUp 0.5s ease-out;
}

.sub-toolbar-buttons {
  display: flex;
  gap: 0.5rem;
}

.rcvord-page {
  font-size: 13px;
  padding: 0;
}

/* ============================================
   카드 스타일
   ============================================ */
.card-like {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
  animation: fadeInUp 0.5s ease-out;
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

/* ============================================
   버튼 스타일
   ============================================ */
.btn {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: var(--color-btn-text);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.2s ease;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 4px;
  padding: 0.55rem 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

.btn-sm,
.btn-xs {
  height: auto;
  padding: 0.55rem 1.2rem;
  font-size: 13px;
}

.btn-outline-secondary {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: var(--color-btn-text);
}

.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
}

.btn-outline-danger,
.btn.btn-outline-danger,
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: var(--color-btn-text);
}

.btn-outline-danger:hover,
.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.btn:active {
  transform: scale(0.98);
}

/* ============================================
   폼 그리드
   ============================================ */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 2rem;
  margin-top: 0;
}

.field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
}

.field-col-span {
  grid-column: 1 / -1;
}

.field-col-span label {
  align-self: flex-start;
  padding-top: 0.65rem;
}

.field label {
  font-weight: 600;
  margin-bottom: 0;
  font-size: 13px;
  color: #334155;
  letter-spacing: -0.2px;
  min-width: 120px;
  text-align: right;
  flex-shrink: 0;
}

.field input[type='text'],
.field input[type='date'] {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  flex: 1;
}

.field textarea {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  min-height: 80px;
  resize: vertical;
  flex: 1;
}

.field input[type='text']:focus,
.field input[type='date']:focus,
.field textarea:focus {
  border-color: #6b7280 !important;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12) !important;
  background-color: #ffffff !important;
  outline: none !important;
}

.field input[readonly],
.field input[readonly='readonly'] {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

/* ============================================
   테이블 래퍼
   ============================================ */
.table-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  max-height: calc(46px + 6 * 46px + 2px);
  animation: fadeInUp 0.5s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.table-wrapper-expanded {
  margin-top: 0;
  background: #ffffff;
  padding: 0;
}

/* ============================================
   커스텀 스크롤바
   ============================================ */
.table-wrapper::-webkit-scrollbar {
  width: 16px;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.table-wrapper::-webkit-scrollbar-track {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 6px 0;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.05);
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  border-radius: 12px;
  border: 3px solid #f1f5f9;
  box-shadow: 0 3px 10px rgba(71, 85, 105, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-color: #e2e8f0;
  box-shadow: 0 5px 15px rgba(71, 85, 105, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scaleX(1.15);
}

.table-wrapper::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  border-width: 2px;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.5), inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

.table-wrapper::-webkit-scrollbar-button {
  display: none;
}

.table-wrapper {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
}

/* ============================================
   데이터 테이블
   ============================================ */
.data-grid {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 13px;
  margin-bottom: 0;
  user-select: none;
  cursor: default;
  display: table;
  border-radius: 12px;
  overflow: hidden;
  min-height: calc(var(--row-h) * 6 + var(--thead-h));
}

.data-grid thead {
  position: sticky;
  top: 0;
  z-index: 10;
  display: table-header-group;
}

.data-grid thead th {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #ffffff;
  z-index: 10;
  border: none;
  padding: 0.85rem 0.75rem;
  font-weight: 700;
  text-align: center;
  height: var(--thead-h);
  font-size: 13px;
  letter-spacing: -0.2px;
}

.data-grid thead th:first-child {
  border-top-left-radius: 12px;
}

.data-grid thead th:last-child {
  border-top-right-radius: 12px;
}

.data-grid tbody {
  display: table-row-group;
}

.data-grid tbody td {
  border: none;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #f1f5f9;
  padding-top: var(--row-vpad);
  padding-bottom: var(--row-vpad);
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  background: #ffffff;
  height: var(--row-h);
  font-size: 13px;
  font-weight: 400;
  vertical-align: middle;
  overflow: hidden;
  color: #334155;
}

.data-grid tbody td:last-child {
  border-right: none;
}

.data-grid tbody tr {
  height: var(--row-h);
  transition: all 0.15s ease;
  background-color: #ffffff;
}

.data-grid tbody tr:hover:not(.empty-row) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.data-grid tbody tr:hover:not(.empty-row) td {
  background-color: #f8fafc;
}

.data-grid tbody tr:hover:not(.empty-row) .input-like {
  background-color: #f8fafc !important;
}

.data-grid tbody tr.editing {
  background: #fffef0;
}

.empty-row td {
  height: var(--row-h);
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* ============================================
   테이블 내부 요소
   ============================================ */
.data-grid input,
.data-grid select,
.data-grid textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  background: transparent;
  padding: 2px 4px;
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.data-grid input[readonly],
.data-grid input[readonly='readonly'] {
  background: #f8fafc;
  color: #94a3b8;
}

.data-grid input:focus,
.data-grid select:focus,
.data-grid textarea:focus {
  outline: none;
  border-color: #6b7280 !important;
  background: #fff !important;
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.1) !important;
}

/* 컬럼 너비 */
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

/* 셀 정렬 */
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

/* 편집 가능 셀 */
.editable {
  cursor: pointer;
}

.editor-input,
.editor-textarea {
  background: #fff !important;
  border: 1.5px solid #6b7280 !important;
  border-radius: var(--radius-sm);
}

.editor-input {
  height: var(--cell-inner-h) !important;
  min-height: 0 !important;
  padding-top: 2px;
  padding-bottom: 2px;
  box-sizing: border-box;
}

.editor-textarea {
  width: 100%;
  min-height: 48px;
  resize: vertical;
  font-family: inherit;
  height: var(--cell-inner-h) !important;
  min-height: 0 !important;
  max-height: var(--cell-inner-h) !important;
  overflow-y: auto !important;
  box-sizing: border-box;
}

/* 셀 텍스트 */
.cell-text {
  display: block;
  padding: 2px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--cell-inner-h);
  max-height: var(--cell-inner-h);
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
  background: #f8fafc;
}

.data-grid td:not(.editable) {
  cursor: default;
}

/* Input-like */
.input-like {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  min-height: 0;
  height: var(--cell-inner-h);
  padding-top: 2px;
  padding-bottom: 2px;
  line-height: 1.2;
  box-sizing: border-box;
}

.input-like--compact {
  padding: 0.2rem 0.5rem;
  min-height: 26px;
}

.input-like--number {
  text-align: right;
}

.input-like--textarea {
  height: var(--cell-inner-h);
  min-height: 0;
  overflow: hidden;
}

.input-like .value {
  display: inline-block;
  color: #334155;
  line-height: 1.2;
  max-height: var(--cell-inner-h);
}

.input-like .placeholder-text {
  color: #b5b5b5;
}

/* ============================================
   반응형
   ============================================ */
@media (max-width: 1600px) {
  .btn {
    font-size: 12px !important;
    padding: 0.5rem 1.1rem !important;
  }

  .data-grid thead th,
  .data-grid tbody td {
    font-size: 12px !important;
  }

  .data-grid tbody td {
    padding: 0.35rem 0.45rem !important;
    height: 42px !important;
  }

  .empty-row td {
    height: 42px !important;
  }

  .vars-scope {
    --row-h: 42px;
  }

  .table-wrapper {
    max-height: calc(42px + 6 * 42px + 2px) !important;
  }
}

/* 날짜 입력 래퍼 */
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.date-input-custom {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  padding-right: 35px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
  cursor: pointer;
}

.date-input-custom:focus {
  border-color: #6b7280 !important;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12) !important;
  outline: none !important;
}

/* 달력 아이콘 */
.calendar-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-icon:hover {
  color: #828282;
  transform: translateY(-50%) scale(1.1);
}

.custom-calendar {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100000; /* z-index 더 높게 설정 */
  padding: 10px;
  min-width: 280px;
  animation: calendarFadeIn 0.2s ease;
}

.order-header {
  position: relative;
  z-index: 50; /* 달력이 표시될 수 있도록 충분한 z-index */
}

@keyframes calendarFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid #f1f5f9;
}

.calendar-title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.3px;
}

.calendar-nav-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-nav-btn:hover {
  background: #f1f5f9;
  color: #828282;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 9px;
  font-weight: 700;
  color: #64748b;
  padding: 4px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-height: 32px;
}

.calendar-day:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.calendar-day.other-month {
  color: #cbd5e1;
  cursor: default;
}

.calendar-day.other-month:hover {
  background: transparent;
}

.calendar-day.today {
  background: #e5e7eb;
  color: #1f2937;
  font-weight: 700;
}

.calendar-day.today:hover {
  background: #d1d5db;
}

.calendar-day.selected {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

.calendar-day.selected:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
}
</style>
