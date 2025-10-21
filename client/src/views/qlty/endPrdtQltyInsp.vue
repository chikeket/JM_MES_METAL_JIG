<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3 page-container">
    <!-- 상단 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2 button-group">
      <CButton color="secondary" size="sm" @click="newFunc" class="btn-action">신규</CButton>
      <CButton color="secondary" size="sm" @click="openWaitingFinishedPrdtModal" class="btn-action">
        생산실적조회
      </CButton>
      <waitingFinishedPrdtModal
        :visible="isWaitingFinishedPrdtModalVisible"
        @close="closeWaitingFinishedPrdtModal"
        @select="selectOrdr"
      />
      <CButton color="secondary" size="sm" @click="saveInspection" class="btn-action">저장</CButton>
      <CButton color="secondary" size="sm" @click="update" class="btn-action">수정</CButton>
      <CButton color="danger" size="sm" @click="deleteFunc" class="btn-action">삭제</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4 fade-in-up" style="animation-delay: 0.1s">
      <CRow class="g-3">
        <CCol :md="3">
          <CFormLabel class="form-label">검사자</CFormLabel>
          <CFormInput v-model="form.emp_nm" class="form-input-enhanced" placeholder="검사자 이름" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">완제품명</CFormLabel>
          <CFormInput v-model="form.prdt_nm" class="form-input-enhanced" readonly />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">옵션명</CFormLabel>
          <CFormInput v-model="form.opt_nm" class="form-input-enhanced" readonly />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">실적 수량</CFormLabel>
          <CFormInput v-model.number="form.qy" type="number" min="0" class="form-input-enhanced" readonly />
        </CCol>
      </CRow>

      <CRow class="g-3 mt-1">
        <CCol :md="3">
          <CFormLabel class="form-label">검수 수량</CFormLabel>
          <CFormInput v-model.number="form.insp_qy" type="number" min="0" class="form-input-enhanced" />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">합격 수량</CFormLabel>
          <CFormInput :value="pass_qy" type="number" min="0" class="form-input-enhanced" readonly />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">불량 수량</CFormLabel>
          <CFormInput :value="defectQty" type="number" class="form-input-enhanced" readonly />
        </CCol>
        <CCol :md="3">
          <CFormLabel class="form-label">검사 일자</CFormLabel>
          <div class="date-input-wrapper">
            <CFormInput
              v-model="form.insp_dt"
              type="text"
              class="form-input-enhanced"
              readonly
              @click="toggleCalendar"
              placeholder="YYYY-MM-DD"
            />
            <div class="calendar-icon" @click="toggleCalendar">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </button>
                <div class="calendar-title">{{ calendarTitle }}</div>
                <button type="button" @click="nextMonth" class="calendar-nav-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
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
                  :class="['calendar-day', {
                    'other-month': !day.isCurrentMonth,
                    'today': day.isToday,
                    'selected': day.isSelected
                  }]"
                  @click="selectDate(day)"
                >
                  {{ day.date }}
                </div>
              </div>
            </div>
          </div>
        </CCol>
      </CRow>

      <CRow class="g-3 mt-1">
        <CCol :md="12">
          <CFormLabel class="form-label">비고</CFormLabel>
          <CFormTextarea v-model="form.rm" rows="2" class="form-input-enhanced" placeholder="필요 시 기재" />
        </CCol>
      </CRow>
    </div>

    <!-- 검사 항목 조회 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="openEndPrdtQltyInspModal" class="btn-action">
        완제품 품질조회
      </CButton>
      <endPrdtQltyInspModal
        :visible="isEndPrdtQltyInspModalVisible"
        @close="closeEndPrdtQltyInspModal"
        @select="selectOrdr"
      />
    </div>

    <!-- 검사 항목 테이블 -->
    <CRow class="flex-grow-1 overflow-hidden g-2 fade-in-up" style="animation-delay: 0.2s">
      <CCol :md="12" class="d-flex flex-column overflow-hidden">
        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 200px">검사항목</CTableHeaderCell>
                  <CTableHeaderCell style="width: 140px">기준치</CTableHeaderCell>
                  <CTableHeaderCell style="width: 140px">오차범위</CTableHeaderCell>
                  <CTableHeaderCell style="width: 140px">불량수량</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="(item, idx) in inspectItems" :key="idx" class="data-row">
                  <CTableDataCell class="text-start">{{ item.insp_item_nm }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.basi_val }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.eror_scope_min + '~' + item.eror_scope_max }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <input
                      v-model="item.infer_qy"
                      class="form-control form-control-sm"
                      placeholder="불량수량기입"
                    />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
                  <CTableDataCell colspan="4">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import waitingFinishedPrdtModal from '../modal/waitingFinishedPrdtModal.vue'
import endPrdtQltyInspModal from '../modal/endPrdtQltyInspModal.vue'
import userDateUtils from '@/utils/useDates.js'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.js'

const PAGE_ROWS = 7
const emptyRowCount = computed(() => Math.max(0, PAGE_ROWS - inspectItems.value.length))
const auth = useAuthStore()

const isWaitingFinishedPrdtModalVisible = ref(false)
const openWaitingFinishedPrdtModal = () => {
  isWaitingFinishedPrdtModalVisible.value = true
}
const closeWaitingFinishedPrdtModal = () => {
  isWaitingFinishedPrdtModalVisible.value = false
}

const isEndPrdtQltyInspModalVisible = ref(false)
const openEndPrdtQltyInspModal = () => {
  isEndPrdtQltyInspModalVisible.value = true
}
const closeEndPrdtQltyInspModal = () => {
  isEndPrdtQltyInspModalVisible.value = false
}

// 달력 관련 상태
const showCalendar = ref(false)
const calendarRef = ref(null)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

const form = ref({
  emp_id: auth.user?.emp_id || 'EMP001',
  emp_nm: auth.user?.emp_nm || '홍길동',
  prdt_nm: '',
  opt_nm: '',
  qy: '',
  insp_qy: '',
  insp_dt: userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd'),
  rm: '',
  prcs_ctrl_id: '',
  end_prdt_qlty_insp_id: '',
})

const inspectItems = ref([])
const defectQty = ref(0)

// 달력 제목
const calendarTitle = computed(() => {
  return `${currentYear.value}년 ${currentMonth.value + 1}월`
})

// 달력 날짜 생성
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0)

  const firstDayOfWeek = firstDay.getDay()
  const lastDate = lastDay.getDate()
  const prevLastDate = prevLastDay.getDate()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

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
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      date: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: form.value.insp_dt === dateStr,
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

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
  if (showCalendar.value && form.value.insp_dt) {
    const [year, month] = form.value.insp_dt.split('-')
    currentYear.value = parseInt(year)
    currentMonth.value = parseInt(month) - 1
  }
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day) => {
  if (!day.isCurrentMonth) return
  form.value.insp_dt = day.fullDate
  showCalendar.value = false
}

const handleClickOutside = (event) => {
  if (calendarRef.value && !calendarRef.value.contains(event.target)) {
    const dateWrapper = event.target.closest('.date-input-wrapper')
    if (!dateWrapper) {
      showCalendar.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  inspectItems,
  (newItems) => {
    let total = 0
    for (const item of newItems) {
      const value = Number(item.infer_qy)
      if (!isNaN(value)) {
        total += value
      }
    }
    defectQty.value = total
  },
  { deep: true },
)

const pass_qy = computed(() => {
  const order = Number(form.value.insp_qy) || 0
  const received = Number(defectQty.value) || 0
  return order - received
})

watch(
  () => form.value.insp_qy,
  (newVal) => {
    const order = Number(form.value.qy) || 0
    const received = Number(newVal)
    if (isNaN(received) || received < 0) {
      alert('검수 수량은 0 이상의 숫자만 입력 가능합니다.')
      form.value.pass_qy = 0
      return
    }
    if (received > order) {
      alert('검수 수량이 실적 수량보다 많을 수 없습니다.')
      form.value.pass_qy = 0
    }
  },
)

const selectOrdr = (prdts) => {
  inspectItems.value = []
  form.value.prdt_nm = prdts.searchParams.prdt_nm
  form.value.opt_nm = prdts.searchParams.opt_nm
  form.value.qy = Math.floor(prdts.searchParams.bePass_qy)
  form.value.insp_qy = Math.floor(prdts.searchParams.insp_qy) || 0
  form.value.pass_qy = Math.floor(prdts.searchParams.pass_qy) || 0
  form.value.rm = !prdts.searchParams.rm ? '' : prdts.searchParams.rm
  form.value.prcs_ctrl_id = prdts.searchParams.prcs_ctrl_id
  form.value.end_prdt_qlty_insp_id = prdts.searchParams.end_prdt_qlty_insp_id

  for (const prdt of prdts.detailData)
    inspectItems.value.push({
      insp_item_nm: prdt.insp_item_nm,
      basi_val: prdt.basi_val,
      eror_scope_min: prdt.eror_scope_min,
      eror_scope_max: prdt.eror_scope_max,
      infer_qy: prdt.infer_qy || 0,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
      end_prdt_qlty_insp_id: prdt.end_prdt_qlty_insp_id,
    })
  console.log(form.value)
}

const saveInspection = async () => {
  let inferData = []
  for (const prdt of inspectItems.value)
    inferData.push({
      infer_qy: prdt.infer_qy,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
    })
  const payload = {
    master: {
      rm: form.value.rm,
      prcs_ctrl_id: form.value.prcs_ctrl_id,
      emp_id: form.value.emp_id,
      infer_qy: defectQty.value,
      pass_qy: pass_qy.value,
      insp_qy: form.value.insp_qy,
      insp_dt: form.value.insp_dt,
    },
    infer: inferData,
  }
  console.log(payload)
  let result = await axios
    .post('/api/endPrdtQltyInspInsert', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('완제품 검수가 등록되었습니다.')
  } else {
    console.log('완제품 검수에 실패했습니다.')
  }
}

const update = async () => {
  let inferData = []
  for (const prdt of inspectItems.value)
    inferData.push({
      infer_qy: prdt.infer_qy,
      qlty_item_mng_id: prdt.qlty_item_mng_id,
      end_prdt_qlty_insp_id: prdt.end_prdt_qlty_insp_id,
    })
  const payload = {
    master: {
      rm: form.value.rm,
      prcs_ctrl_id: form.value.prcs_ctrl_id,
      emp_id: form.value.emp_id,
      infer_qy: defectQty.value,
      pass_qy: form.value.pass_qy,
      insp_qy: form.value.insp_qy,
      insp_dt: form.value.insp_dt,
      end_prdt_qlty_insp_id: form.value.end_prdt_qlty_insp_id,
    },
    infer: inferData,
  }
  let result = await axios
    .post('/api/endPrdtQltyInspUpdate', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('완제품 검수 수정이 등록되었습니다.')
  } else {
    console.log('완제품 검수 수정에 실패했습니다.')
  }
}

const deleteFunc = async () => {
  const payload = {
    end_prdt_qlty_insp_id: form.value.end_prdt_qlty_insp_id,
  }
  let result = await axios
    .post('/api/endPrdtQltyInspDelete', payload)
    .catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('완제품 검수 삭제가 성공되었습니다.')
  } else {
    console.log('완제품 검수 삭제가 실패했습니다.')
  }
}

const newFunc = async () => {
  form.value.prdt_nm = ''
  form.value.opt_nm = ''
  form.value.qy = 0
  form.value.insp_qy = 0
  form.value.insp_dt = userDateUtils.dateFormat(new Date(), 'yyyy-MM-dd')
  form.value.rm = ''
  form.value.prcs_ctrl_id = ''
  form.value.end_prdt_qlty_insp_id = ''
  inspectItems.value = []
}
</script>

<style scoped>
/* 페이지 진입 애니메이션 */
.page-container {
  animation: pageLoad 0.5s ease-out;
}

@keyframes pageLoad {
  from { opacity: 0; }
  to { opacity: 1; }
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

:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
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

.search-filter-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 100;
}

.grid-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-height: calc(46px + 7 * 46px + 2px);
}

:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

:deep(.btn-secondary) {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: #fff !important;
}

:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: 0 4px 8px rgba(71, 85, 105, 0.3);
  transform: translateY(-1px);
}

:deep(.btn-danger) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff !important;
}

:deep(.btn-danger:hover) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
  transform: translateY(-1px);
}

:deep(.btn:active) {
  transform: scale(0.98);
}

:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

.form-input-enhanced {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
}

.form-input-enhanced:focus {
  border-color: #6b7280;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  background-color: #ffffff;
  outline: none;
}

.form-input-enhanced:disabled,
.form-input-enhanced[readonly] {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.form-input-enhanced::placeholder {
  display: none;
}

/* 달력 관련 스타일 */
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.date-input-wrapper .form-input-enhanced {
  padding-right: 35px;
  cursor: pointer;
}

.calendar-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: all;
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
  z-index: 99999;
  padding: 10px;
  min-width: 280px;
  animation: calendarFadeIn 0.2s ease;
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
  position: relative;
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

/* 테이블 래퍼 */
.table-wrapper {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  scrollbar-gutter: stable;
}

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
  box-shadow: 
    0 3px 10px rgba(71, 85, 105, 0.25),
    inset 0 1px 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-color: #e2e8f0;
  box-shadow: 
    0 5px 15px rgba(71, 85, 105, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scaleX(1.15);
}

.table-wrapper::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  border-width: 2px;
  box-shadow: 
    0 2px 8px rgba(30, 41, 59, 0.5),
    inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

.table-wrapper::-webkit-scrollbar-button {
  display: none;
}

.table-wrapper {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
}

:deep(.data-table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  cursor: default;
  font-size: 13px;
  width: 100%;
  display: table;
  table-layout: fixed;
}

:deep(.data-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
  display: table-header-group;
}

:deep(.data-table tbody) {
  display: table-row-group;
}

:deep(.data-table th) {
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.85rem 0.75rem;
  border: none;
  letter-spacing: -0.2px;
  position: relative;
}

:deep(.data-table th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.data-table th:last-child) {
  border-top-right-radius: 12px;
}

:deep(.data-table td) {
  font-size: 13px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  height: 46px;
}

:deep(.data-table tbody tr.data-row) {
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: #ffffff;
}

:deep(.data-table tbody tr.data-row:hover) {
  background-color: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

/* 테이블 내부 입력 필드 */
:deep(.data-table input.form-control-sm) {
  font-size: 12px;
  padding: 0.4rem 0.6rem;
  height: 32px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  width: 100%;
  transition: all 0.2s ease;
}

:deep(.data-table input.form-control-sm:focus) {
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  outline: none;
}

:deep(.text-end) {
  text-align: right;
}

:deep(.text-start) {
  text-align: left;
}

:deep(.text-center) {
  text-align: center;
}

:deep(.g-3) {
  --bs-gutter-y: 0.75rem;
  --bs-gutter-x: 1rem;
}

:deep(.gap-2) {
  gap: 0.5rem;
}

:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

:deep(.mb-4) {
  margin-bottom: 1rem !important;
}

:deep(.mt-1) {
  margin-top: 0.5rem !important;
}
</style>