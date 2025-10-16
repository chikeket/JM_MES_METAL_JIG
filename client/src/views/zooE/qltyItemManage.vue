<template>
  <CContainer fluid class="h-100 d-flex flex-column p-3">
    <!-- 상단 조회/초기화 버튼 -->
    <div class="d-flex justify-content-end mb-2 gap-2">
      <CButton color="secondary" size="sm" @click="handleSearch">조회</CButton>
      <CButton color="secondary" size="sm" @click="handleReset">초기화</CButton>
    </div>

    <!-- 검색 필터 영역 -->
    <div class="search-filter-box mb-2">
      <CRow class="g-3">
        <CCol :md="4">
          <CFormLabel class="form-label">항목코드</CFormLabel>
          <CFormInput v-model="searchFilters.itemCode" size="sm" placeholder="입력해주세요" />
        </CCol>
        <CCol :md="4">
          <CFormLabel class="form-label">항목명</CFormLabel>
          <CFormInput v-model="searchFilters.itemName" size="sm" placeholder="입력해주세요" />
        </CCol>
        <CCol :md="4">
          <CFormLabel class="form-label">타입</CFormLabel>
          <CFormSelect v-model="searchFilters.type" size="sm">
            <option value="">전체</option>
            <option value="정량">정량</option>
            <option value="정성">정성</option>
          </CFormSelect>
        </CCol>
      </CRow>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <CRow class="flex-grow-1 overflow-hidden g-2">
      <!-- 좌측: 데이터 그리드 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden">
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="danger" size="sm" @click="handleLeftDelete">선택삭제</CButton>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 30px">
                    <CFormCheck :checked="allChecked" @change="toggleAllCheck" />
                  </CTableHeaderCell>
                  <CTableHeaderCell style="width: 40px">No</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px">항목코드</CTableHeaderCell>
                  <CTableHeaderCell style="width: 120px">항목명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 80px">타입</CTableHeaderCell>
                  <CTableHeaderCell style="width: 60px">버전</CTableHeaderCell>
                  <CTableHeaderCell style="width: 80px">상태</CTableHeaderCell>
                  <CTableHeaderCell style="width: 80px">기준치</CTableHeaderCell>
                  <CTableHeaderCell style="width: 100px">규격</CTableHeaderCell>
                  <CTableHeaderCell style="width: 60px">단위</CTableHeaderCell>
                  <CTableHeaderCell>비고</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                <CTableRow
                  v-for="(item, index) in leftDisplayData"
                  :key="index"
                  :class="{ 'selected-row': selectedItemId === item.qlty_item_mng_id }"
                  @click="selectItem(item)"
                >
                  <CTableDataCell class="text-center">
                    <CFormCheck v-model="item.selected" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-end">{{ index + 1 }}</CTableDataCell>
                  <CTableDataCell class="text-end text-primary">{{
                    item.qlty_item_mng_id
                  }}</CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.insp_item_nm" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.ty" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.ver" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <select v-model="item.st" class="cell-input" @click.stop>
                      <option value="ACT">사용</option>
                      <option value="INACT">미사용</option>
                    </select>
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.basi_val" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.spec" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.unit" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.rmrk" class="cell-input" @click.stop />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in leftEmptyRows" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="11">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 -->
      <CCol :md="6" class="d-flex flex-column overflow-hidden">
        <div class="d-flex justify-content-end gap-2 mb-2">
          <CButton color="secondary" size="sm" @click="handleNew">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleSave">저장</CButton>
          <CButton color="danger" size="sm" @click="handleDelete">삭제</CButton>
        </div>

        <div class="form-box flex-grow-1 overflow-hidden">
          <div class="p-3 overflow-auto">
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">항목코드</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.itemCode" size="sm" disabled />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">항목명</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.itemName" size="sm" />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">타입</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.type" size="sm" />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">버전</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.version" size="sm" />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">상태</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormSelect v-model="formData.status" size="sm">
                  <option value="ACT">사용</option>
                  <option value="INACT">미사용</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">기준치</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.standard" size="sm" />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">규격</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.spec" size="sm" />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">단위</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.unit" size="sm" />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">오차범위(최소)</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.errorMin" size="sm" type="number" />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">오차범위(최대)</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.errorMax" size="sm" type="number" />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1"
                  >등록일 <span style="color: red">*</span></CFormLabel
                >
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormInput v-model="formData.regDate" size="sm" type="date" required />
              </CCol>
            </CRow>
            <CRow class="mb-2">
              <CCol :md="3" class="text-end pe-2">
                <CFormLabel class="form-label pt-1">비고</CFormLabel>
              </CCol>
              <CCol :md="9" class="ps-2">
                <CFormTextarea v-model="formData.remark" size="sm" rows="3" />
              </CCol>
            </CRow>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'

// ============================================
// 데이터 정의
// ============================================

// 검색 필터
const searchFilters = reactive({
  itemCode: '',
  itemName: '',
  type: '',
})

// 우측 폼 데이터
const formData = reactive({
  itemCode: '',
  itemName: '',
  type: '',
  version: '',
  status: 'ACT',
  standard: '',
  spec: '',
  unit: '',
  errorMin: '',
  errorMax: '',
  regDate: '',
  remark: '',
})

// 좌측 그리드 데이터
const leftGridData = ref([])
const selectedItemId = ref(null)

// ============================================
// Computed
// ============================================

const leftDisplayData = computed(() => leftGridData.value.slice(0, 15))
const leftEmptyRows = computed(() => Math.max(0, 15 - leftDisplayData.value.length))

const allChecked = computed(() => {
  return leftGridData.value.length > 0 && leftGridData.value.every((item) => item.selected)
})

// ============================================
// 메서드
// ============================================

// 조회
const handleSearch = async () => {
  try {
    const params = {
      qlty_item_mng_id: searchFilters.itemCode || '',
      insp_item_nm: searchFilters.itemName || '',
      ty: searchFilters.type || '',
    }

    console.log('📋 조회 파라미터:', params)
    const res = await axios.get('/api/qlty_item_list_view', { params })

    leftGridData.value = (res.data || []).map((item) => ({
      ...item,
      selected: false,
    }))

    console.log('✅ 조회 완료:', leftGridData.value.length, '건')
    selectedItemId.value = null
  } catch (error) {
    console.error('❌ 조회 오류:', error)
    leftGridData.value = []
  }
}

// 초기화
const handleReset = () => {
  searchFilters.itemCode = ''
  searchFilters.itemName = ''
  searchFilters.type = ''
  resetFormData()
}

// 행 선택
const selectItem = (item) => {
  selectedItemId.value = item.qlty_item_mng_id
  formData.itemCode = item.qlty_item_mng_id
  formData.itemName = item.insp_item_nm
  formData.type = item.ty
  formData.version = item.ver
  formData.status = item.st
  formData.standard = item.basi_val
  formData.spec = item.spec
  formData.unit = item.unit
  formData.errorMin = item.eror_scope_min
  formData.errorMax = item.eror_scope_max
  formData.regDate = item.reg_dt
  formData.remark = item.rmrk || ''
}

// 폼 초기화
const resetFormData = () => {
  Object.assign(formData, {
    itemCode: '',
    itemName: '',
    type: '',
    version: '',
    status: 'ACT',
    standard: '',
    spec: '',
    unit: '',
    errorMin: '',
    errorMax: '',
    regDate: '',
    remark: '',
  })
  selectedItemId.value = null
}

// 신규
const handleNew = async () => {
  if (!formData.itemName) {
    alert('항목명을 입력해주세요.')
    return
  }

  const regDate = formData.regDate || new Date().toISOString().split('T')[0];

  try {
    const payload = {
      insp_item_nm: formData.itemName,
      ty: formData.type || '',
      ver: formData.version || '',
      st: formData.status || 'ACT',  // ← 기본값 'ACT'
      basi_val: formData.standard || '',
      spec: formData.spec || '',
      unit: formData.unit || 'F1',  // ← 기본값 'F1' (또는 다른 유효한 값)
      eror_scope_min: formData.errorMin || '',
      eror_scope_max: formData.errorMax || '',
      reg_dt: regDate,
      rm: formData.remark || '',
    }

    console.log('➕ 신규 등록:', payload)
    const response = await axios.post('/api/qltyItemInsert', payload)
    console.log('응답:', response.data)
    alert('등록 완료')
    await handleSearch()
    resetFormData()
  } catch (error) {
    console.error('❌ 등록 오류:', error)
    alert('등록 중 오류가 발생했습니다.')
  }
}

// 저장 (수정)
const handleSave = async () => {
  if (!selectedItemId.value) {
    alert('수정할 항목을 선택해주세요.')
    return
  }

  try {
    const payload = {
      qlty_item_mng_id: selectedItemId.value, // ← 우측 formData의 itemCode 사용
      insp_item_nm: formData.itemName, // ← 우측 폼에서 가져오기
      ty: formData.type,
      ver: formData.version,
      st: formData.status,
      basi_val: formData.standard,
      spec: formData.spec,
      unit: formData.unit,
      eror_scope_min: formData.errorMin,
      eror_scope_max: formData.errorMax,
      reg_dt: formData.regDate,
      rm: formData.remark,
      original_qlty_item_mng_id: selectedItemId.value,
    }

    console.log('✏️ 수정 저장:', payload)
    await axios.post('/api/qltyItemUpdate', payload)
    alert('수정 완료')
    await handleSearch()
  } catch (error) {
    console.error('❌ 수정 오류:', error)
    alert('수정 중 오류가 발생했습니다.')
  }
}
// 삭제
const handleDelete = async () => {
  if (!selectedItemId.value) {
    alert('삭제할 항목을 선택해주세요.')
    return
  }

  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await axios.post('/api/qltyItemDelete', { qlty_item_mng_id: selectedItemId.value })
    alert('삭제 완료')
    await handleSearch()
    resetFormData()
  } catch (error) {
    console.error('❌ 삭제 오류:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 전체 선택/해제
const toggleAllCheck = () => {
  const newValue = !allChecked.value
  leftGridData.value.forEach((item) => (item.selected = newValue))
}

// 선택 항목 삭제
const handleLeftDelete = async () => {
  const selectedItems = leftGridData.value.filter((item) => item.selected)

  if (selectedItems.length === 0) {
    alert('삭제할 항목을 선택해주세요.')
    return
  }

  if (!confirm(`${selectedItems.length}개 항목을 삭제하시겠습니까?`)) return

  try {
    for (const item of selectedItems) {
      await axios.post('/api/qltyItemDelete', { qlty_item_mng_id: item.qlty_item_mng_id })
    }
    alert('삭제 완료')
    await handleSearch()
  } catch (error) {
    console.error('❌ 삭제 오류:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
.search-filter-box {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.grid-box {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
}

.form-box {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
}

.table-wrapper {
  height: 100%;
  overflow: auto;
}

.data-table {
  margin-bottom: 0;
  font-size: 0.875rem;
}

.data-table th {
  background-color: #e9ecef;
  font-weight: 600;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  vertical-align: middle;
}

.empty-row {
  height: 38px;
}

.empty-row td {
  background-color: #fafafa;
}

.selected-row {
  background-color: #e7f3ff !important;
}

.cell-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 2px 4px;
  font-size: 0.875rem;
}

.cell-input:focus {
  outline: 1px solid #0d6efd;
  background: #fff;
}

select.cell-input {
  cursor: pointer;
}
</style>
