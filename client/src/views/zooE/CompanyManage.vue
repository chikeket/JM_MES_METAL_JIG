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
/* 페이지 진입 애니메이션 */
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

.grid-box,
.form-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-height: calc(46px + 10 * 46px + 2px);
}

.form-box {
  display: flex;
  flex-direction: column;
  z-index: 1;
  overflow: visible !important;
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
  min-width: 200px;
  animation: calendarFadeIn 0.2s ease;
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

.form-row-horizontal {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: flex-start;
  margin-bottom: 1.1rem;
}

.form-label-inline {
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0;
  letter-spacing: -0.2px;
  min-width: 80px;
  white-space: nowrap;
  text-align: right;
}

.form-input-compact {
  font-size: 11px;
  font-weight: 400;
  padding: 0.3rem 0.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 28px;
  width: 75px;
  max-width: 75px;
}

.form-input-compact:focus {
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  background-color: #ffffff;
  outline: none;
}

.form-input-compact:disabled {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.form-input-compact::placeholder {
  display: none;
}

.radio-group-horizontal {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-direction: row;
}

.radio-item-inline {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

:deep(.radio-item-inline .form-check-input) {
  margin-right: 0.4rem;
  cursor: pointer;
}

:deep(.radio-item-inline .form-check-label) {
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 0;
}

:deep(.form-label) {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  letter-spacing: -0.2px;
}

:deep(.form-control),
:deep(.form-select) {
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

:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #6b7280;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  background-color: #ffffff;
  outline: none;
}

:deep(.form-control:disabled) {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

:deep(.form-control)::placeholder {
  display: none;
}

.form-input-enhanced {
  font-size: 13px;
  font-weight: 400;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  height: 38px;
  width: 180px;
  max-width: 180px;
}

.form-input-enhanced:focus {
  border-color: #828282;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: #ffffff;
  outline: none;
}

.custom-select-wrapper {
  position: relative;
  width: 100%;
  z-index: 50;
}

.custom-select {
  font-size: 13px;
  font-weight: 400;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #334155;
}

.custom-select:hover {
  border-color: #94a3b8;
}

.custom-select span {
  flex: 1;
}

.custom-select svg {
  flex-shrink: 0;
}

.custom-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-option {
  padding: 0.75rem 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #334155;
  font-size: 13px;
  border-radius: 8px;
  margin: 6px 8px;
}

.custom-option:first-child {
  margin-top: 8px;
}

.custom-option:last-child {
  margin-bottom: 8px;
}

.custom-option:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #1e293b;
  transform: translateX(2px);
}

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

:deep(.selected-row) {
  background: #e5e7eb !important;
  font-weight: 600;
  box-shadow: inset 4px 0 0 0 #6b7280, 0 4px 12px rgba(107, 114, 128, 0.3) !important;
}

:deep(.selected-row td) {
  border-bottom: 1px solid #d1d5db !important;
  color: #1f2937 !important;
}

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.form-check-input:checked) {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
}

:deep(.form-check-input:checked:hover) {
  background-color: #b91c1c !important;
  border-color: #b91c1c !important;
}

:deep(.form-check-input:focus) {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.25) !important;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 230px;
}

.date-input-wrapper .form-input-compact {
  padding-right: 26px;
  cursor: pointer;
  width: 230px;
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
  top: 50%;
  left: calc(100% + 8px);
  transform: translateY(-50%);
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  padding: 10px;
  min-width: 200px;
  animation: calendarFadeIn 0.2s ease;
}

@keyframes calendarFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
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
  min-height: 24px;
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
  min-width: 70px;
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;
}

.search-row-container .custom-select-wrapper,
.search-row-container .form-input-search {
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
</style>
