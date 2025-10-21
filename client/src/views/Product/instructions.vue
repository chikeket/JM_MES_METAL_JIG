<template>
  <div class="container-fluid h-100 d-flex flex-column p-3 page-container">
    <!-- 상단 버튼 그룹 -->
    <div class="d-flex justify-content-end mb-2 gap-2 button-group">
      <button class="btn btn-secondary btn-sm" @click="masterReset()">신규</button>
      <button class="btn btn-secondary btn-sm" @click="goToDrctPlan()">생산지시서 조회</button>
      <ProdDrctModal
        :visible="isProdDrctModalVisible"
        @close="closeProdDrctModal"
        @select="selectedPrdt"
      />
      <button class="btn btn-secondary btn-sm" @click="insertRowsToDB">저장</button>
      <button class="btn btn-secondary btn-sm" @click="updateRowsToDB">수정</button>
      <button class="btn btn-danger btn-sm" @click="deleteRowsToDB()">삭제</button>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-4 fade-in-up" style="animation-delay: 0.1s">
      <div class="row g-3">
        <div class="col-12 col-md-3">
          <label class="form-label">생산지시서 명</label>
          <input v-model="Info.ordrName1" type="text" class="form-control" />
        </div>

        <div class="col-12 col-md-3">
          <label class="form-label">등록 일자</label>
          <div class="date-input-wrapper">
            <input 
              v-model="Info.regDate" 
              type="text" 
              class="form-control"
              @click="toggleCalendar('regDate')"
            />
            <div class="calendar-icon" @click="toggleCalendar('regDate')">
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
            <div v-if="showCalendar === 'regDate'" class="custom-calendar" ref="calendarRef">
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
                    today: day.isToday,
                    selected: day.isSelected,
                  }]"
                  @click="selectDate(day, 'regDate')"
                >
                  {{ day.date }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-3">
          <label class="form-label">시작 일자</label>
          <div class="date-input-wrapper">
            <input 
              v-model="Info.startDate" 
              type="text" 
              class="form-control"
              @click="toggleCalendar('startDate')"
            />
            <div class="calendar-icon" @click="toggleCalendar('startDate')">
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
            <div v-if="showCalendar === 'startDate'" class="custom-calendar" ref="calendarRef2">
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
                    today: day.isToday,
                    selected: day.isSelected,
                  }]"
                  @click="selectDate(day, 'startDate')"
                >
                  {{ day.date }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-3">
          <label class="form-label">종료 일자</label>
          <div class="date-input-wrapper">
            <input 
              v-model="Info.endDate" 
              type="text" 
              class="form-control"
              @click="toggleCalendar('endDate')"
            />
            <div class="calendar-icon" @click="toggleCalendar('endDate')">
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
            <div v-if="showCalendar === 'endDate'" class="custom-calendar" ref="calendarRef3">
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
                    today: day.isToday,
                    selected: day.isSelected,
                  }]"
                  @click="selectDate(day, 'endDate')"
                >
                  {{ day.date }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-2">
        <div class="col-12">
          <label class="form-label">비고</label>
          <textarea v-model="Info.remark" class="form-control" rows="3"></textarea>
        </div>
      </div>
    </div>

    <!-- 테이블 상단 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2 fade-in-up" style="animation-delay: 0.15s">
      <button class="btn btn-secondary btn-sm" @click="goToPrdtModal()">제품 조회</button>
      <PrdtModal :visible="isPrdtModalVisible" @close="closePrdtModal" @select="selectedPrdt" />

      <button class="btn btn-secondary btn-sm" @click="goToProdPlan()">생산계획서 조회</button>
      <ProdPlanModal
        :visible="isProdPlanModalVisible"
        @close="closeProdPlanModal"
        @select="selectedPrdt"
      />

      <button class="btn btn-secondary btn-sm" @click="reset()">초기화</button>
    </div>

    <!-- 데이터 그리드 -->
    <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column fade-in-up" style="animation-delay: 0.2s">
      <div class="table-wrapper">
        <table class="data-table w-100">
          <colgroup>
            <col style="width: 80px" />
            <col style="width: 140px" />
            <col style="width: 140px" />
            <col style="width: 100px" />
            <col style="width: 120px" />
            <col style="width: 120px" />
            <col style="width: 120px" />
            <col style="width: 120px" />
            <col style="width: 100px" />
            <col style="width: auto" />
          </colgroup>
          <thead>
            <tr>
              <th class="text-center">코드</th>
              <th class="text-center">제품명</th>
              <th class="text-center">규격</th>
              <th class="text-center">단위</th>
              <th class="text-center">계획수량</th>
              <th class="text-center">기지시수량</th>
              <th class="text-center">미지시수량</th>
              <th class="text-center">지시수량</th>
              <th class="text-center">우선순위</th>
              <th class="text-center">비고</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, idx) in rows" :key="row.id ?? idx" class="data-row">
              <td class="text-center">{{ row.prdt_id }}</td>
              <td class="text-start">{{ row.prdt_nm }}</td>
              <td class="text-start">{{ row.spec }}</td>
              <td class="text-center">{{ row.unit }}</td>
              <td class="text-end">{{ fmtQty(row.plan_qy) }}</td>
              <td class="text-end">{{ fmtQty(row.base_quantity) }}</td>
              <td class="text-end">{{ fmtQty(row.unspecified_quantity) }}</td>

              <!-- 지시수량 (편집 가능) -->
              <td class="text-end" @dblclick="startEdit(row, 'drct_qy')">
                <template v-if="isEditing(row, 'drct_qy')">
                  <input
                    v-model.number="editDraft"
                    type="number"
                    min="0"
                    class="form-control form-control-sm text-end inline-edit"
                    @keyup.enter="commitEdit(row, 'drct_qy')"
                    @keyup.esc="cancelEdit"
                    @blur="commitEdit(row, 'drct_qy')"
                  />
                </template>
                <template v-else>{{ fmtQty(row.drct_qy) }}</template>
              </td>

              <!-- 우선순위 (편집 가능) -->
              <td class="text-end" @dblclick="startEdit(row, 'priort')">
                <template v-if="isEditing(row, 'priort')">
                  <input
                    v-model.number="editDraft"
                    type="number"
                    min="0"
                    class="form-control form-control-sm text-end inline-edit"
                    @keyup.enter="commitEdit(row, 'priort')"
                    @keyup.esc="cancelEdit"
                    @blur="commitEdit(row, 'priort')"
                  />
                </template>
                <template v-else>{{ fmtQty(row.priort) }}</template>
              </td>

              <!-- 비고 (편집 가능) -->
              <td @dblclick="startEdit(row, 'rm')">
                <template v-if="isEditing(row, 'rm')">
                  <input
                    v-model="editDraft"
                    class="form-control form-control-sm inline-edit"
                    @keyup.enter="commitEdit(row, 'rm')"
                    @keyup.esc="cancelEdit"
                    @blur="commitEdit(row, 'rm')"
                  />
                </template>
                <template v-else>{{ row.rm || '—' }}</template>
              </td>
            </tr>

            <!-- 빈 행 -->
            <tr v-for="n in emptyRowCount" :key="'empty-' + n" class="empty-row">
              <td colspan="10">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 모달들 -->
    <teleport to="body">
      <PrdtModal :visible="isPrdtModalVisible" @close="closePrdtModal" @select="selectedPrdt" />
      <ProdPlanModal
        :visible="isProdPlanModalVisible"
        @close="closeProdPlanModal"
        @select="selectedPrdt"
      />
      <ProdDrctModal
        :visible="isProdDrctModalVisible"
        @close="closeProdDrctModal"
        @select="selectedPrdt"
      />
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import PrdtModal from '../modal/prdtModal.vue'
import ProdPlanModal from '../modal/prodPlanModal.vue'
import ProdDrctModal from '../modal/prodDrctModal.vue'
import { useAuthStore } from '@/stores/auth.js'

const auth = useAuthStore()

// 달력 관련 상태
const showCalendar = ref(null)
const calendarRef = ref(null)
const calendarRef2 = ref(null)
const calendarRef3 = ref(null)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

// 모달 상태
const isPrdtModalVisible = ref(false)
const goToPrdtModal = () => {
  isPrdtModalVisible.value = true
}
const closePrdtModal = () => {
  isPrdtModalVisible.value = false
}

const isProdPlanModalVisible = ref(false)
const goToProdPlan = () => {
  isProdPlanModalVisible.value = true
}
const closeProdPlanModal = () => {
  isProdPlanModalVisible.value = false
}

const isProdDrctModalVisible = ref(false)
const goToDrctPlan = () => {
  isProdDrctModalVisible.value = true
}
const closeProdDrctModal = () => {
  isProdDrctModalVisible.value = false
}

let empId = auth.user?.emp_id || 'EMP001'

const Info = ref({
  ordrName1: '',
  prod_drct_id: '',
  regDate: new Date().toISOString().slice(0, 10),
  startDate: new Date().toISOString().slice(0, 10),
  endDate: null,
  remark: '',
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
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  let selectedDate = ''
  if (showCalendar.value === 'regDate') selectedDate = Info.value.regDate
  else if (showCalendar.value === 'startDate') selectedDate = Info.value.startDate
  else if (showCalendar.value === 'endDate') selectedDate = Info.value.endDate

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevLastDate - i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      key: `prev-${prevLastDate - i}`,
    })
  }

  for (let i = 1; i <= lastDate; i++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      date: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: selectedDate === dateStr,
      key: `current-${i}`,
      fullDate: dateStr,
    })
  }

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

const toggleCalendar = (field) => {
  if (showCalendar.value === field) {
    showCalendar.value = null
  } else {
    showCalendar.value = field
    let dateValue = Info.value[field]
    if (dateValue) {
      const [year, month] = dateValue.split('-')
      currentYear.value = parseInt(year)
      currentMonth.value = parseInt(month) - 1
    }
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

const selectDate = (day, field) => {
  if (!day.isCurrentMonth) return
  Info.value[field] = day.fullDate
  showCalendar.value = null
}

const handleClickOutside = (event) => {
  if (calendarRef.value && !calendarRef.value.contains(event.target)) {
    const dateWrapper = event.target.closest('.date-input-wrapper')
    if (!dateWrapper) {
      showCalendar.value = null
    }
  }
  if (calendarRef2.value && !calendarRef2.value.contains(event.target)) {
    const dateWrapper = event.target.closest('.date-input-wrapper')
    if (!dateWrapper) {
      showCalendar.value = null
    }
  }
  if (calendarRef3.value && !calendarRef3.value.contains(event.target)) {
    const dateWrapper = event.target.closest('.date-input-wrapper')
    if (!dateWrapper) {
      showCalendar.value = null
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const insertRowsToDB = async () => {
  const master = {
    rm: Info.value.remark,
    prod_drct_nm: Info.value.ordrName1,
    emp_id: empId,
    prod_drct_fr_dt: Info.value.startDate,
    prod_drct_to_dt: Info.value.endDate,
    reg_dt: Info.value.regDate,
  }

  const detail = rows.value.map((row) => ({
    rm: row.rm,
    prod_drct_deta_id: row.prod_drct_deta_id,
    prod_plan_deta_id: row.prod_plan_deta_id,
    prdt_id: row.prdt_id,
    prdt_opt_id: row.prdt_opt_id,
    drct_qy: row.drct_qy,
    priort: row.priort,
  }))

  const payload = {
    masterInfo: master,
    detailList: detail,
  }
  console.log(payload)
  let result = await axios.post('/api/instruction', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산지시가 등록되었습니다.')
  } else {
    console.log('생산지시에 실패했습니다.')
  }
}

const updateRowsToDB = async () => {
  const master = {
    rm: Info.value.remark,
    prod_drct_nm: Info.value.ordrName1,
    emp_id: empId,
    prod_drct_fr_dt: Info.value.startDate,
    prod_drct_to_dt: Info.value.endDate,
    reg_dt: Info.value.regDate,
  }

  const detail = rows.value.map((row) => ({
    rm: row.rm,
    prod_drct_deta_id: row.prod_drct_deta_id,
    prod_plan_deta_id: row.prod_plan_deta_id,
    prdt_id: row.prdt_id,
    prdt_opt_id: row.prdt_opt_id,
    drct_qy: row.drct_qy,
    priort: row.priort,
  }))

  const editProdDrctId = { prod_drct_id: Info.value.prod_drct_id }
  const payload = {
    masterInfo: master,
    detailList: detail,
    editProdDrctId: editProdDrctId,
  }
  console.log(payload)
  let result = await axios.post('/api/updateInstruction', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산지시수정이 등록되었습니다.')
  } else {
    console.log('생산지시수정이 실패했습니다.')
  }
}

const deleteRowsToDB = async () => {
  const payload = { prod_drct_id: Info.value.prod_drct_id }
  let result = await axios.post('/api/deleteInstruction', payload).catch((err) => console.log(err))
  let addRes = result.data
  if (addRes.isSuccessed) {
    console.log('생산지시삭제가 성공되었습니다.')
  } else {
    console.log('생산지시삭제가 실패했습니다.')
  }
}

const rows = ref([])

const PAGE_ROWS = 6
const emptyRowCount = computed(() => Math.max(0, PAGE_ROWS - rows.value.length))

const selectedPrdt = (prdts) => {
  console.log(prdts)
  Info.value.prod_drct_id = !prdts.searchParams.prod_drct_id
    ? Info.value.prod_drct_id
    : prdts.searchParams.prod_drct_id
  Info.value.ordrName1 = !prdts.searchParams.prod_drct_nm
    ? Info.value.ordrName1
    : prdts.searchParams.prod_drct_nm
  Info.value.startDate = !prdts.searchParams.prod_expc_fr_dt
    ? Info.value.startDate
    : prdts.searchParams.prod_expc_fr_dt
  Info.value.endDate = !prdts.searchParams.prod_expc_to_dt
    ? Info.value.endDate
    : prdts.searchParams.prod_expc_to_dt
  Info.value.regDate = !prdts.searchParams.reg_dt ? Info.value.regDate : prdts.searchParams.reg_dt
  Info.value.remark = !prdts.searchParams.rm ? Info.value.remark : prdts.searchParams.rm
  let new_id = rows.value.length > 0 ? Math.max(...rows.value.map((r) => r.id ?? 0)) + 1 : 1
  if (Array.isArray(prdts.detailData)) {
    rows.value = []
    for (const prdt of prdts.detailData)
      rows.value.push({
        id: new_id++,
        prod_drct_deta_id: prdt.prod_drct_deta_id,
        prod_plan_deta_id: prdt.prod_plan_deta_id,
        prdt_id: prdt.prdt_id,
        prdt_nm: prdt.prdt_nm,
        prdt_opt_id: prdt.prdt_opt_id,
        spec: prdt.spec,
        unit: prdt.unit,
        plan_qy: prdt.plan_qy || 0,
        drct_qy: prdt.drct_qy ?? 0,
        base_quantity: prdt.base_quantity ?? 0,
        unspecified_quantity: !prdt.drct_qy ? prdt.plan_qy : prdt.plan_qy - prdt.base_quantity,
        priort: prdt.priort,
        rm: prdt.rm,
      })
  } else {
    console.log('제품조회할때')
    console.log(prdts)
    rows.value.push({
      id: new_id,
      prod_plan_deta_id: 'none',
      prdt_id: prdts.detailData.prdt_id,
      prdt_nm: prdts.detailData.prdt_nm,
      prdt_opt_id: prdts.detailData.prdt_opt_id,
      spec: prdts.detailData.spec,
      unit: prdts.detailData.unit,
      plan_qy: 0,
      drct_qy: 0,
      base_quantity: 0,
      unspecified_quantity: 0,
      priort: 0,
      rm: '',
    })
  }

  console.log(rows.value)
}

const masterReset = () => {
  Info.value.ordrName1 = ''
  Info.value.startDate = new Date().toISOString().slice(0, 10)
  Info.value.endDate = null
  Info.value.regDate = new Date().toISOString().slice(0, 10)
  Info.value.remark = ''
  rows.value = []
}

const reset = () => {
  rows.value = []
}

const editing = reactive({ id: null, field: null })
const editDraft = ref(null)

const isEditing = (row, field) => editing.id === row.id && editing.field === field

function startEdit(row, field) {
  editing.id = row.id
  editing.field = field
  const cur = row[field]
  editDraft.value = field === 'producible' ? String(!!cur) : cur
}

function commitEdit(row, field) {
  let v = editDraft.value
  if (field === 'drct_qy') {
    const n = Number(v)
    const validQty = Number.isFinite(n) ? n : 0
    const total = validQty
    if (!row.plan_qy) {
    } else {
      if (row.plan_qy < total) {
        alert('계획수량을 초과할 수 없습니다.')
        cancelEdit()
        return
      }
    }
    row.drct_qy = validQty
  } else if (field === 'producible') {
    row.producible = v === 'true' || v === true
  } else if (field === 'unit') {
    row.unit = String(v || 'EA')
  } else {
    row[field] = (v ?? '').toString()
  }
  cancelEdit()
}

watch(
  rows,
  (newRows) => {
    for (const row of newRows) {
      const order = Number(row.base_quantity) || 0
      const received = Number(row.plan_qy) || 0
      const unspecified = received - order
      row.unspecified_quantity = unspecified < 0 ? 0 : unspecified
    }
  },
  { deep: true },
)

function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}

const fmtQty = (n) => (n ?? 0).toLocaleString()
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
  max-height: calc(46px + 6 * 46px + 2px);
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

:deep(.form-control), :deep(.form-select) {
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

:deep(.form-control:focus), :deep(.form-select:focus) {
  border-color: #6b7280;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  background-color: #ffffff;
  outline: none;
}

:deep(.form-control:disabled),
:deep(.form-control[readonly]) {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

:deep(.form-control)::placeholder {
  display: none;
}

textarea.form-control {
  height: auto !important;
  min-height: 80px !important;
  resize: vertical;
}

/* 달력 관련 */
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.date-input-wrapper .form-control {
  padding-right: 40px;
  cursor: pointer;
}

.calendar-icon {
  position: absolute;
  right: 12px;
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
  color: #6b7280;
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
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  color: #6b7280;
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

.table-wrapper {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  scrollbar-gutter: stable;
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
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

.empty-row td {
  height: 46px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.inline-edit {
  font-size: 12px !important;
  padding: 0.4rem 0.5rem !important;
  height: 32px !important;
  border: 1.5px solid #6b7280 !important;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1) !important;
  border-radius: 6px !important;
}

.inline-edit:focus {
  border-color: #6b7280 !important;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.15) !important;
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
  --bs-gutter-y: 1rem;
  --bs-gutter-x: 1rem;
}

:deep(.mb-2) {
  margin-bottom: 0.5rem !important;
}

:deep(.mb-4) {
  margin-bottom: 1rem !important;
}

:deep(.mt-2) {
  margin-top: 0.5rem !important;
}

:deep(.gap-2) {
  gap: 0.5rem !important;
}

/* 반응형 디자인 */
@media (max-width: 1600px) {
  :deep(.form-label) {
    font-size: 12px !important;
  }

  :deep(.form-control),
  :deep(.form-select) {
    font-size: 12px !important;
    height: 38px !important;
    padding: 0.55rem 0.75rem !important;
  }

  :deep(.btn) {
    font-size: 12px !important;
    padding: 0.5rem 1.1rem !important;
  }

  :deep(.data-table th),
  :deep(.data-table td) {
    font-size: 12px !important;
  }

  :deep(.data-table td) {
    height: 42px !important;
  }

  .empty-row td {
    height: 42px !important;
  }

  .grid-box {
    max-height: calc(42px + 6 * 42px + 2px) !important;
  }

  textarea.form-control {
    height: 70px !important;
    min-height: 70px !important;
  }
}
</style>