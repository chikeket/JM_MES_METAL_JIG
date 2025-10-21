<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3 page-container">
    <!-- 수정 후 -->
    <div class="d-flex justify-content-end mb-2 gap-2 button-group">
      <CButton color="secondary" size="sm" @click="handleSearch" class="btn-search">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset" class="btn-reset">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4 fade-in-up" style="animation-delay: 0.1s">
      <CRow class="g-3 align-items-center">
        <CCol :md="4">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">업체유형</CFormLabel>
            <div class="custom-select-wrapper">
              <div class="custom-select" @click="toggleTypeDropdown" ref="typeSelect">
                <span>{{ getTypeDisplayText(searchFilters.type) }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                  <path fill="#495057" d="M6 9L1 4h10z" />
                </svg>
              </div>
              <div v-if="showTypeDropdown" class="custom-dropdown">
                <div class="custom-option" @click="selectType('')">전체</div>
                <div class="custom-option" @click="selectType('VENDOR')">공급업체</div>
                <div class="custom-option" @click="selectType('CUSTOMER')">고객사</div>
              </div>
            </div>
          </div>
        </CCol>

        <CCol :md="4">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">업체명</CFormLabel>
            <CFormInput v-model="searchFilters.name" size="sm" class="form-input-search" />
          </div>
        </CCol>

        <CCol :md="4">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">상태</CFormLabel>
            <div class="custom-select-wrapper">
              <div class="custom-select" @click="toggleStatusDropdown" ref="statusSelect">
                <span>{{ getStatusDisplayText(searchFilters.status) }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                  <path fill="#495057" d="M6 9L1 4h10z" />
                </svg>
              </div>
              <div v-if="showStatusDropdown" class="custom-dropdown">
                <div class="custom-option" @click="selectStatus('')">전체</div>
                <div class="custom-option" @click="selectStatus('ACT')">활성</div>
                <div class="custom-option" @click="selectStatus('INA')">비활성</div>
              </div>
            </div>
          </div>
        </CCol>
      </CRow>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2 fade-in-up" style="animation-delay: 0.2s">
      <!-- 좌측: 데이터 그리드 -->
      <CCol :md="7" class="d-flex flex-column overflow-hidden pe-1">
        <div class="d-flex gap-2 mb-2">
          <CButton color="secondary" size="sm" class="btn-hidden" style="visibility: hidden"
            >숨김</CButton
          >
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 12%">업체 ID</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">업체유형</CTableHeaderCell>
                  <CTableHeaderCell style="width: 35%">업체명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 18%">대표자명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 20%">담당자명</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in displayedData"
                  :key="index"
                  @click="handleRowSelect(item, index)"
                  :class="{ 'selected-row': selectedRowIndex === index }"
                  class="data-row"
                >
                  <CTableDataCell class="text-center">{{ item.id }}</CTableDataCell>
                  <CTableDataCell>{{ getTypeLabel(item.type) }}</CTableDataCell>
                  <CTableDataCell>{{ item.name }}</CTableDataCell>
                  <CTableDataCell>{{ item.ceo }}</CTableDataCell>
                  <CTableDataCell>{{ item.managerName }}</CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="5">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 -->
      <CCol :md="5" class="d-flex flex-column overflow-hidden ps-1">
        <div class="d-flex gap-2 justify-content-end mb-2" style="z-index: 100; position: relative">
          <CButton color="secondary" size="sm" @click="handleNew" class="btn-action">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleSave" class="btn-action">저장</CButton>
          <CButton color="danger" size="sm" @click="handleDelete" class="btn-action">삭제</CButton>
        </div>
        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div
            class="p-3 flex-grow-1"
            style="overflow: visible !important; padding-top: 2rem !important"
          >
            <CRow class="g-2" style="width: 100%; margin-top: 0">
              <!-- 좌측 1열 -->
              <CCol :md="6">
                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">업체 ID</CFormLabel>
                  <CFormInput v-model="formData.id" size="sm" disabled class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">사업자등록번호</CFormLabel>
                  <CFormInput v-model="formData.businessNo" size="sm" class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">대표자명</CFormLabel>
                  <CFormInput v-model="formData.ceo" size="sm" class="form-input-compact" />
                </div>

                <!-- 등록일자 with 커스텀 달력 -->
                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">등록일자</CFormLabel>
                  <div class="date-input-wrapper">
                    <CFormInput
                      v-model="formData.regDate"
                      type="text"
                      size="sm"
                      class="form-input-compact"
                      readonly
                      @click="toggleCalendar"
                      placeholder="YYYY-MM-DD"
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

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">담당자명</CFormLabel>
                  <CFormInput v-model="formData.managerName" size="sm" class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3" style="align-items: flex-start">
                  <CFormLabel class="form-label-inline" style="padding-top: 0.5rem; min-width: 80px"
                    >업체유형</CFormLabel
                  >
                  <div class="radio-group-horizontal">
                    <CFormCheck
                      type="radio"
                      name="type"
                      label="고객사"
                      value="customer"
                      v-model="formData.type"
                      class="radio-item-inline"
                    />
                    <CFormCheck
                      type="radio"
                      name="type"
                      label="공급업체"
                      value="supplier"
                      v-model="formData.type"
                      class="radio-item-inline"
                    />
                  </div>
                </div>
              </CCol>

              <!-- 우측 2열 -->
              <CCol :md="6">
                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">업체명</CFormLabel>
                  <CFormInput v-model="formData.name" size="sm" class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3" style="visibility: hidden">
                  <CFormLabel class="form-label-inline">-</CFormLabel>
                  <CFormInput size="sm" class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">대표 연락처</CFormLabel>
                  <CFormInput v-model="formData.ceoPhone" size="sm" class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3" style="visibility: hidden">
                  <CFormLabel class="form-label-inline">-</CFormLabel>
                  <CFormInput size="sm" class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">담당자 연락처</CFormLabel>
                  <CFormInput
                    v-model="formData.managerPhone"
                    size="sm"
                    class="form-input-compact"
                  />
                </div>

                <div
                  class="form-row-horizontal mb-3"
                  style="align-items: flex-start; justify-content: flex-start"
                >
                  <CFormLabel class="form-label-inline" style="padding-top: 0.5rem; min-width: 80px"
                    >상태</CFormLabel
                  >
                  <div class="radio-group-horizontal">
                    <CFormCheck
                      type="radio"
                      name="status"
                      label="활성"
                      value="active"
                      v-model="formData.status"
                      class="radio-item-inline"
                    />
                    <CFormCheck
                      type="radio"
                      name="status"
                      label="비활성"
                      value="inactive"
                      v-model="formData.status"
                      class="radio-item-inline"
                    />
                  </div>
                </div>
              </CCol>
            </CRow>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
  <!-- 이 태그가 있는지 확인! -->
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

const searchFilters = reactive({
  type: '',
  name: '',
  status: '',
})

const showTypeDropdown = ref(false)
const showStatusDropdown = ref(false)
const typeSelect = ref(null)
const statusSelect = ref(null)
const lastSavedId = ref('CO2510000')

// 달력 관련 상태
const showCalendar = ref(false)
const calendarRef = ref(null)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

const formData = reactive({
  id: '',
  businessNo: '',
  name: '',
  ceo: '',
  email: '',
  ceoPhone: '',
  regDate: '',
  managerName: '',
  managerPhone: '',
  type: 'customer',
  status: 'active',
})

const gridData = ref([])
const selectedRowIndex = ref(null)
const originalId = ref('')

const displayedData = computed(() => {
  return gridData.value
})

const emptyRowCount = computed(() => {
  const dataCount = gridData.value.length
  return dataCount < 10 ? 10 - dataCount : 0
})

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
      isSelected: formData.regDate === dateStr,
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
  if (showCalendar.value && formData.regDate) {
    const [year, month] = formData.regDate.split('-')
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
  formData.regDate = day.fullDate
  showCalendar.value = false
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await handleSearch()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleTypeDropdown = () => {
  showTypeDropdown.value = !showTypeDropdown.value
  showStatusDropdown.value = false
}

const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value
  showTypeDropdown.value = false
}

const selectType = (value) => {
  searchFilters.type = value
  showTypeDropdown.value = false
}

const selectStatus = (value) => {
  searchFilters.status = value
  showStatusDropdown.value = false
}

const getTypeDisplayText = (value) => {
  if (value === 'VENDOR') return '공급업체'
  if (value === 'CUSTOMER') return '고객사'
  return '전체'
}

const getStatusDisplayText = (value) => {
  if (value === 'ACT') return '활성'
  if (value === 'INA') return '비활성'
  return '전체'
}

const handleClickOutside = (event) => {
  if (typeSelect.value && !typeSelect.value.contains(event.target)) {
    showTypeDropdown.value = false
  }
  if (statusSelect.value && !statusSelect.value.contains(event.target)) {
    showStatusDropdown.value = false
  }
  if (calendarRef.value && !calendarRef.value.contains(event.target)) {
    const dateWrapper = event.target.closest('.date-input-wrapper')
    if (!dateWrapper) {
      showCalendar.value = false
    }
  }
}

const handleSearch = async () => {
  const params = {
    type: searchFilters.type || '',
    name: searchFilters.name || '',
    status: searchFilters.status || '',
  }

  try {
    let result = await axios.get('/api/co_list_view', { params })
    gridData.value = (result.data || []).sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, '')) || 0
      const numB = parseInt(b.id.replace(/\D/g, '')) || 0
      return numA - numB
    })

    if (gridData.value.length > 0) {
      lastSavedId.value = gridData.value[gridData.value.length - 1].id
    }

    selectedRowIndex.value = null
  } catch (error) {
    console.error('조회 오류:', error)
    gridData.value = []
  }
}

const handleReset = () => {
  searchFilters.type = ''
  searchFilters.name = ''
  searchFilters.status = ''
  selectedRowIndex.value = null
  gridData.value = []
}

const resetFormData = () => {
  Object.assign(formData, {
    id: '',
    businessNo: '',
    name: '',
    ceo: '',
    email: '',
    ceoPhone: '',
    regDate: '',
    managerName: '',
    managerPhone: '',
    type: 'customer',
    status: 'active',
  })
  originalId.value = ''
  selectedRowIndex.value = null
}

const getNextId = () => {
  const prefix = 'CO25'
  const match = lastSavedId.value.match(/^CO25(\d+)$/)

  if (match) {
    const lastNumber = parseInt(match[1])
    const nextNumber = lastNumber + 1
    return `${prefix}${String(nextNumber).padStart(4, '0')}`
  }
  return `${prefix}0001`
}

const handleRowSelect = (item, index) => {
  formData.id = item.id
  formData.businessNo = item.businessNo
  formData.name = item.name
  formData.ceo = item.ceo
  formData.ceoPhone = item.ceoPhone
  formData.type = item.type === 'CUSTOMER' ? 'customer' : 'supplier'
  formData.status = item.status === 'ACT' ? 'active' : 'inactive'

  originalId.value = item.id
  selectedRowIndex.value = index
}

const handleNew = () => {
  resetFormData()
  formData.id = getNextId()
}

const handleSave = async () => {
  if (!formData.name || !formData.ceo) {
    alert('업체명과 대표자명은 필수 입력 항목입니다.')
    return
  }

  try {
    const sendData = {
      bizr_reg_no: formData.businessNo,
      co_nm: formData.name,
      rpstr_nm: formData.ceo,
      rpstr_tel: formData.ceoPhone,
      co_ty_id: formData.type === 'customer' ? 'CUSTOMER' : 'VENDOR',
      st: formData.status === 'active' ? 'ACT' : 'INA',
    }

    let response
    if (originalId.value) {
      sendData.co_id = formData.id
      sendData.original_co_id = originalId.value
      response = await axios.post('/api/coUpdate', sendData)
    } else {
      response = await axios.post('/api/coInsert', sendData)
    }

    if (response.data.isSuccessed) {
      alert(response.data.message)
      await handleSearch()
      resetFormData()
    } else {
      alert(response.data.message)
    }
  } catch (error) {
    console.error('저장 오류:', error)
    alert('저장 중 오류가 발생했습니다.')
  }
}

const handleDelete = async () => {
  if (!formData.id) {
    alert('삭제할 데이터를 선택해주세요.')
    return
  }

  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    const response = await axios.post('/api/coDelete', { co_id: formData.id })

    if (response.data.isSuccessed) {
      alert(response.data.message)
      await handleSearch()
      resetFormData()
    }
  } catch (error) {
    console.error('삭제 오류:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const getTypeLabel = (type) => {
  return type === 'CUSTOMER' ? '고객사' : '공급업체'
}
</script>

<style scoped>
/* 페이지 컨테이너 */
.page-container {
  background: #f5f7fa;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

/* 검색 필터 박스 */
.search-filter-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.search-row-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-label-fixed {
  min-width: 80px;
  font-weight: 600;
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 0;
}

.form-input-search {
  flex: 1;
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
}

/* 커스텀 셀렉트 */
.custom-select-wrapper {
  flex: 1;
  position: relative;
}

.custom-select {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.custom-select:hover {
  border-color: #cbd5e0;
}

.custom-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.custom-option {
  padding: 0.5rem 0.75rem;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.custom-option:hover {
  background: #f8f9fa;
}

/* 그리드 박스 */
.grid-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

/* 폼 박스 */
.form-box {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.form-row-horizontal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-label-inline {
  min-width: 100px;
  font-weight: 600;
  font-size: 12px;
  color: #2c3e50;
  margin-bottom: 0;
}

.form-input-compact {
  flex: 1;
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.form-input-compact:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

/* 라디오 그룹 */
.radio-group-horizontal {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.radio-item-inline {
  margin-bottom: 0;
}

/* 날짜 입력 래퍼 */
.date-input-wrapper {
  flex: 1;
  position: relative;
}

.calendar-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
  pointer-events: all;
}

/* 커스텀 달력 */
.custom-calendar {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 1rem;
  min-width: 280px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #495057;
  transition: color 0.2s;
}

.calendar-nav-btn:hover {
  color: #212529;
}

.calendar-title {
  font-weight: 600;
  font-size: 14px;
  color: #212529;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  padding: 0.25rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.other-month {
  color: #adb5bd;
}

.calendar-day.today {
  background: #e7f1ff;
  color: #0b5ed7;
  font-weight: 600;
}

.calendar-day.selected {
  background: #0b5ed7;
  color: #fff;
  font-weight: 600;
}

/* 테이블 래퍼 */
.table-wrapper {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #bcbcbc;
  border-radius: 8px;
  scrollbar-gutter: stable;
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

/* 데이터 테이블 */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 12px;
  margin-bottom: 0;
}

.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table thead th {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: 34px;
}

.data-table thead th:first-child {
  border-top-left-radius: 4px;
}

.data-table thead th:last-child {
  border-top-right-radius: 4px;
}

.data-table tbody td {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: 34px;
  vertical-align: middle;
}

.data-table tbody td:last-child {
  border-right: none;
}

.data-table tbody tr {
  height: 34px;
  transition: all 0.2s ease;
  background: #fff;
  cursor: pointer;
}

.data-table tbody tr.data-row:hover td {
  background-color: rgba(33, 37, 41, 0.075) !important;
}

.data-table tbody tr.selected-row td {
  background-color: #e7f1ff !important;
}

.data-table tbody tr.empty-row {
  cursor: default;
}

.data-table tbody tr.empty-row:hover td {
  background: #fff !important;
}

/* 버튼 스타일 */
.btn-search,
.btn-reset,
.btn-action {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
}

.btn-search:hover,
.btn-reset:hover,
.btn-action:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* Danger 버튼 */
:deep(.btn-action[color="danger"]) {
  background: linear-gradient(135deg, #c53030 0%, #a82323 100%);
}

:deep(.btn-action[color="danger"]:hover) {
  background: linear-gradient(135deg, #a82323 0%, #8b1a1a 100%);
  box-shadow: 0 4px 12px rgba(197, 48, 48, 0.3);
}

/* 애니메이션 */
.fade-in-up {
  animation: fadeInUp 0.4s ease-out;
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

/* 반응형 */
@media (max-width: 1600px) {
  .btn-search,
  .btn-reset,
  .btn-action {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
}

@media (max-height: 900px) {
  .table-wrapper {
    max-height: 350px;
  }
}

@media (max-height: 780px) {
  .table-wrapper {
    max-height: 300px;
  }
}

@media (max-height: 700px) {
  .table-wrapper {
    max-height: 250px;
  }
}
</style>