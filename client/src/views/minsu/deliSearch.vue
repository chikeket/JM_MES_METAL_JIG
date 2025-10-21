<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3 page-container">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2 button-group">
      <CButton color="secondary" size="sm" @click="onSearch" class="btn-search">조회</CButton>
      <CButton color="secondary" size="sm" @click="onReset" class="btn-reset">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4 fade-in-up" style="animation-delay: 0.1s">
      <CRow class="g-3 align-items-center">
        <CCol :md="3">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">납품 ID</CFormLabel>
            <CFormInput v-model="filters.deli_id" size="sm" class="form-input-search" />
          </div>
        </CCol>
        <CCol :md="3">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">납품 담당자</CFormLabel>
            <CFormInput v-model="filters.emp_nm" size="sm" class="form-input-search" />
          </div>
        </CCol>
        <CCol :md="6">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">납품 등록 일자</CFormLabel>
            <div class="date-range-wrapper-custom">
              <!-- 시작일 -->
              <div class="date-input-wrapper">
                <CFormInput
                  v-model="filters.deli_dt_from"
                  type="text"
                  size="sm"
                  class="form-input-search"
                  readonly
                  @click="toggleCalendar('from')"
                  placeholder="YYYY-MM-DD"
                />
                <div class="calendar-icon" @click="toggleCalendar('from')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <!-- 커스텀 달력 팝업 (시작일) -->
                <div v-if="showCalendarFrom" class="custom-calendar" ref="calendarRefFrom">
                  <div class="calendar-header">
                    <button type="button" @click="prevMonth('from')" class="calendar-nav-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      </svg>
                    </button>
                    <div class="calendar-title">{{ calendarTitleFrom }}</div>
                    <button type="button" @click="nextMonth('from')" class="calendar-nav-btn">
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
                      v-for="day in calendarDaysFrom"
                      :key="day.key"
                      :class="['calendar-day', {
                        'other-month': !day.isCurrentMonth,
                        'today': day.isToday,
                        'selected': day.isSelected
                      }]"
                      @click="selectDate('from', day)"
                    >
                      {{ day.date }}
                    </div>
                  </div>
                </div>
              </div>

              <span class="date-separator">~</span>

              <!-- 종료일 -->
              <div class="date-input-wrapper">
                <CFormInput
                  v-model="filters.deli_dt_to"
                  type="text"
                  size="sm"
                  class="form-input-search"
                  readonly
                  @click="toggleCalendar('to')"
                  placeholder="YYYY-MM-DD"
                />
                <div class="calendar-icon" @click="toggleCalendar('to')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <!-- 커스텀 달력 팝업 (종료일) -->
                <div v-if="showCalendarTo" class="custom-calendar" ref="calendarRefTo">
                  <div class="calendar-header">
                    <button type="button" @click="prevMonth('to')" class="calendar-nav-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      </svg>
                    </button>
                    <div class="calendar-title">{{ calendarTitleTo }}</div>
                    <button type="button" @click="nextMonth('to')" class="calendar-nav-btn">
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
                      v-for="day in calendarDaysTo"
                      :key="day.key"
                      :class="['calendar-day', {
                        'other-month': !day.isCurrentMonth,
                        'today': day.isToday,
                        'selected': day.isSelected
                      }]"
                      @click="selectDate('to', day)"
                    >
                      {{ day.date }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CCol>
      </CRow>
    </div>

    <!-- 결과 그리드 -->
    <CRow class="flex-grow-1 overflow-hidden g-2 fade-in-up" style="animation-delay: 0.2s">
      <CCol :md="12" class="d-flex flex-column overflow-hidden">
        <div class="d-flex gap-2 mb-2">
          <CButton color="secondary" size="sm" class="btn-hidden" style="visibility: hidden">숨김</CButton>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <colgroup>
                <col v-for="(w, i) in colWidths" :key="i" :style="{ width: w }" />
              </colgroup>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell class="th-resizable">
                    No<span class="col-resizer" @mousedown="onResizerDown(0, $event)"></span>
                  </CTableHeaderCell>
                  <CTableHeaderCell class="th-resizable">
                    납품 ID<span class="col-resizer" @mousedown="onResizerDown(1, $event)"></span>
                  </CTableHeaderCell>
                  <CTableHeaderCell class="th-resizable">
                    납품 담당자<span class="col-resizer" @mousedown="onResizerDown(2, $event)"></span>
                  </CTableHeaderCell>
                  <CTableHeaderCell class="th-resizable">
                    납품 등록 일자<span class="col-resizer" @mousedown="onResizerDown(3, $event)"></span>
                  </CTableHeaderCell>
                  <CTableHeaderCell class="th-resizable">
                    출고 상태<span class="col-resizer" @mousedown="onResizerDown(4, $event)"></span>
                  </CTableHeaderCell>
                  <CTableHeaderCell class="th-resizable">
                    비고<span class="col-resizer" @mousedown="onResizerDown(5, $event)"></span>
                  </CTableHeaderCell>
                  <CTableHeaderCell class="th-resizable">
                    납품 상세<span class="col-resizer" @mousedown="onResizerDown(6, $event)"></span>
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow v-for="(r, idx) in displayedRows" :key="idx" class="data-row">
                  <CTableDataCell class="text-center">{{ idx + 1 }}</CTableDataCell>
                  <CTableDataCell>{{ r.deli_id }}</CTableDataCell>
                  <CTableDataCell>{{ r.emp_nm || r.emp_id || '' }}</CTableDataCell>
                  <CTableDataCell>{{ formatDate(r.deli_dt) }}</CTableDataCell>
                  <CTableDataCell>{{ computeDeliStatus(r) }}</CTableDataCell>
                  <CTableDataCell>{{ r.rm || '' }}</CTableDataCell>
                  <CTableDataCell class="text-center">
                    <CButton color="secondary" size="sm" @click="openOrderList(r)">수주 리스트</CButton>
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
                  <CTableDataCell colspan="7">&nbsp;</CTableDataCell>
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
import { ref, reactive, computed, onBeforeUnmount, onMounted } from "vue";
import axios from "axios";

// 검색 필터
const filters = reactive({
  deli_id: "",
  emp_nm: "",
  deli_dt_from: "",
  deli_dt_to: "",
});

// 달력 관련 상태 (시작일)
const showCalendarFrom = ref(false);
const calendarRefFrom = ref(null);
const currentYearFrom = ref(new Date().getFullYear());
const currentMonthFrom = ref(new Date().getMonth());

// 달력 관련 상태 (종료일)
const showCalendarTo = ref(false);
const calendarRefTo = ref(null);
const currentYearTo = ref(new Date().getFullYear());
const currentMonthTo = ref(new Date().getMonth());

// 달력 계산 (시작일)
const calendarTitleFrom = computed(() => {
  return `${currentYearFrom.value}년 ${currentMonthFrom.value + 1}월`;
});

const calendarDaysFrom = computed(() => {
  return generateCalendarDays(currentYearFrom.value, currentMonthFrom.value, filters.deli_dt_from);
});

// 달력 계산 (종료일)
const calendarTitleTo = computed(() => {
  return `${currentYearTo.value}년 ${currentMonthTo.value + 1}월`;
});

const calendarDaysTo = computed(() => {
  return generateCalendarDays(currentYearTo.value, currentMonthTo.value, filters.deli_dt_to);
});

// 달력 생성 공통 함수
function generateCalendarDays(year, month, selectedDate) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // 이전 달 날짜
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevLastDate - i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      key: `prev-${prevLastDate - i}`,
    });
  }

  // 현재 달 날짜
  for (let i = 1; i <= lastDate; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      date: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: selectedDate === dateStr,
      key: `current-${i}`,
      fullDate: dateStr,
    });
  }

  // 다음 달 날짜
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      key: `next-${i}`,
    });
  }

  return days;
}

function toggleCalendar(type) {
  if (type === 'from') {
    showCalendarFrom.value = !showCalendarFrom.value;
    showCalendarTo.value = false;
    if (showCalendarFrom.value && filters.deli_dt_from) {
      const [year, month] = filters.deli_dt_from.split('-');
      currentYearFrom.value = parseInt(year);
      currentMonthFrom.value = parseInt(month) - 1;
    }
  } else {
    showCalendarTo.value = !showCalendarTo.value;
    showCalendarFrom.value = false;
    if (showCalendarTo.value && filters.deli_dt_to) {
      const [year, month] = filters.deli_dt_to.split('-');
      currentYearTo.value = parseInt(year);
      currentMonthTo.value = parseInt(month) - 1;
    }
  }
}

function prevMonth(type) {
  if (type === 'from') {
    if (currentMonthFrom.value === 0) {
      currentMonthFrom.value = 11;
      currentYearFrom.value--;
    } else {
      currentMonthFrom.value--;
    }
  } else {
    if (currentMonthTo.value === 0) {
      currentMonthTo.value = 11;
      currentYearTo.value--;
    } else {
      currentMonthTo.value--;
    }
  }
}

function nextMonth(type) {
  if (type === 'from') {
    if (currentMonthFrom.value === 11) {
      currentMonthFrom.value = 0;
      currentYearFrom.value++;
    } else {
      currentMonthFrom.value++;
    }
  } else {
    if (currentMonthTo.value === 11) {
      currentMonthTo.value = 0;
      currentYearTo.value++;
    } else {
      currentMonthTo.value++;
    }
  }
}

function selectDate(type, day) {
  if (!day.isCurrentMonth) return;
  if (type === 'from') {
    filters.deli_dt_from = day.fullDate;
    showCalendarFrom.value = false;
  } else {
    filters.deli_dt_to = day.fullDate;
    showCalendarTo.value = false;
  }
}

function handleClickOutside(event) {
  if (calendarRefFrom.value && !calendarRefFrom.value.contains(event.target)) {
    const dateWrapper = event.target.closest('.date-input-wrapper');
    if (!dateWrapper) {
      showCalendarFrom.value = false;
    }
  }
  if (calendarRefTo.value && !calendarRefTo.value.contains(event.target)) {
    const dateWrapper = event.target.closest('.date-input-wrapper');
    if (!dateWrapper) {
      showCalendarTo.value = false;
    }
  }
}

// 결과 데이터
const rows = ref([]);

// 모달 상태
const isDeliModalVisible = ref(false);
const selectedDeliId = ref('');

function openOrderList(row) {
  selectedDeliId.value = row?.deli_id || '';
  isDeliModalVisible.value = true;
}

// 초기 컬럼 폭
const colWidths = ref([
  "50px",   // No
  "140px",  // 납품 ID
  "140px",  // 납품 담당자
  "140px",  // 납품 등록 일자
  "110px",  // 출고 상태
  "300px",  // 비고
  "110px",  // 납품 상세
]);

// 컬럼 리사이즈
const resizing = reactive({ idx: -1, startX: 0, startW: 0 });

function onResizerDown(idx, e) {
  e.preventDefault();
  const w = parseInt(String(colWidths.value[idx] || "").replace(/px$/, "")) || 0;
  resizing.idx = idx;
  resizing.startX = e.clientX;
  resizing.startW = w;
  document.body.classList.add("resizing");
  document.addEventListener("mousemove", onResizerMove);
  document.addEventListener("mouseup", onResizerUp);
}

function onResizerMove(e) {
  if (resizing.idx < 0) return;
  const dx = e.clientX - resizing.startX;
  const min = 50;
  const max = 600;
  const next = Math.min(max, Math.max(min, resizing.startW + dx));
  colWidths.value[resizing.idx] = `${next}px`;
}

function onResizerUp() {
  resizing.idx = -1;
  document.body.classList.remove("resizing");
  document.removeEventListener("mousemove", onResizerMove);
  document.removeEventListener("mouseup", onResizerUp);
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onResizerMove);
  document.removeEventListener("mouseup", onResizerUp);
  document.removeEventListener('click', handleClickOutside);
});

// 화면에 보이는 표준 행 수
const PAGE_ROWS = 10;
const displayedRows = computed(() => rows.value);
const emptyRowCount = computed(() => Math.max(0, PAGE_ROWS - rows.value.length));

function formatNumber(val) {
  if (val == null || val === "") return "";
  const num = Number(val);
  return Number.isFinite(num) ? num.toLocaleString() : String(val);
}

function toDateStr(d) {
  if (!d) return "";
  try {
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

const formatDate = toDateStr;

function onReset() {
  filters.deli_id = "";
  filters.emp_nm = "";
  filters.deli_dt_from = "";
  filters.deli_dt_to = "";
  rows.value = [];
}

async function onSearch() {
  try {
    const params = { ...filters };
    const { data } = await axios.get("/api/deli-search", { params });
    rows.value = Array.isArray(data?.data) ? data.data : [];
  } catch (err) {
    console.error("검색 오류", err);
    alert("검색 중 오류가 발생했습니다.");
  }
}

// 출고 상태 계산
function computeDeliStatus(row) {
  try {
    if (typeof row?.status === 'string' && row.status.trim() !== '') return row.status;
    if (row?.deli_st_all_j3 === true) return '출고 완료';
    if (row?.deli_st_all_j3 === false) return '진행 중';
    if (Array.isArray(row?.deli_sts) && row.deli_sts.length > 0) {
      return row.deli_sts.every((s) => s === 'J3') ? '출고 완료' : '진행 중';
    }
    if (typeof row?.deli_st === 'string') {
      return row.deli_st === 'J3' ? '출고 완료' : '진행 중';
    }
    return '진행 중';
  } catch {
    return '진행 중';
  }
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
  max-height: calc(46px + 10 * 46px + 2px);
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

:deep(.btn:active) {
  transform: scale(0.98);
}

/* 검색 필터 스타일 */
.search-row-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.search-label-fixed {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0;
  letter-spacing: -0.2px;
  min-width: 90px;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}

.search-row-container .form-input-search,
.search-row-container .date-range-wrapper-custom {
  flex: 1;
  min-width: 0;
}

.form-input-search {
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

.form-input-search:focus {
  border-color: #6b7280;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  background-color: #ffffff;
  outline: none;
}

/* 날짜 범위 입력 */
.date-range-wrapper-custom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.date-input-wrapper .form-input-search {
  padding-right: 35px;
  cursor: pointer;
}

.date-separator {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  flex-shrink: 0;
  padding: 0 0.25rem;
}

/* 달력 아이콘 & 팝업 */
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

/* 컬럼 리사이즈 */
.th-resizable {
  position: relative;
  padding-right: 8px;
}

.col-resizer {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 2;
  background: transparent;
  transition: background 0.2s ease;
}

.col-resizer:hover {
  background: rgba(255, 255, 255, 0.2);
}

body.resizing {
  user-select: none;
  cursor: col-resize !important;
}

body.resizing * {
  cursor: col-resize !important;
}

:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

:deep(.form-control) {
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

:deep(.form-control:focus) {
  border-color: #6b7280;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  background-color: #ffffff;
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
</style>