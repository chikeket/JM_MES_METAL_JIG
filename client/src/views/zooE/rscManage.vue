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
            <CFormLabel class="search-label-fixed">자재명</CFormLabel>
            <CFormInput v-model="searchFilters.materialName" size="sm" class="form-input-search" />
          </div>
        </CCol>

        <CCol :md="4">
          <div class="search-row-container">
            <CFormLabel class="search-label-fixed">자재분류타입</CFormLabel>
            <div class="custom-select-wrapper">
              <div class="custom-select" @click="toggleTypeDropdown" ref="typeSelect">
                <span>{{ getTypeDisplayText(searchFilters.materialType) }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                  <path fill="#495057" d="M6 9L1 4h10z" />
                </svg>
              </div>
              <div v-if="showTypeDropdown" class="custom-dropdown">
                <div class="custom-option" @click="selectType('')">전체</div>
                <div class="custom-option" @click="selectType('H1')">H1</div>
                <div class="custom-option" @click="selectType('H2')">H2</div>
                <div class="custom-option" @click="selectType('H3')">H3</div>
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
          <CButton color="secondary" size="sm" class="btn-hidden" style="visibility: hidden">숨김</CButton>
        </div>

        <div class="grid-box flex-grow-1 overflow-hidden d-flex flex-column">
          <div class="table-wrapper">
            <CTable bordered hover class="data-table">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style="width: 12%">자재코드</CTableHeaderCell>
                  <CTableHeaderCell style="width: 15%">자재분류타입</CTableHeaderCell>
                  <CTableHeaderCell style="width: 18%">자재명</CTableHeaderCell>
                  <CTableHeaderCell style="width: 13%">규격</CTableHeaderCell>
                  <CTableHeaderCell style="width: 10%">수량단위</CTableHeaderCell>
                  <CTableHeaderCell style="width: 32%">비고</CTableHeaderCell>
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
                  <CTableDataCell class="text-center">{{ item.rsc_id }}</CTableDataCell>
                  <CTableDataCell class="text-center">{{ item.rsc_clsf_id }}</CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.rsc_nm" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.spec" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell class="text-center">
                    <input v-model="item.unit" class="cell-input" @click.stop />
                  </CTableDataCell>
                  <CTableDataCell>
                    <input v-model="item.rmrk" class="cell-input" @click.stop />
                  </CTableDataCell>
                </CTableRow>
                <CTableRow v-for="i in emptyRowCount" :key="'empty-' + i" class="empty-row">
                  <CTableDataCell colspan="6">&nbsp;</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </div>
      </CCol>

      <!-- 우측: 상세 입력 폼 -->
      <CCol :md="5" class="d-flex flex-column overflow-hidden ps-1">
        <div class="d-flex gap-2 justify-content-end mb-2" style="z-index: 100; position: relative">
          <CButton color="secondary" size="sm":ㅇ @click="handleNew" class="btn-action">신규</CButton>
          <CButton color="secondary" size="sm" @click="handleSave" class="btn-action">저장</CButton>
          <CButton color="danger" size="sm" @click="handleDelete" class="btn-action">삭제</CButton>
        </div>

        <div class="form-box flex-grow-1 d-flex flex-column overflow-hidden">
          <div class="p-3 flex-grow-1" style="overflow: visible !important; padding-top: 2rem !important">
            <CRow class="g-2" style="width: 100%; margin-top: 0">
              <!-- 좌측 1열 -->
              <CCol :md="6">
                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">자재코드</CFormLabel>
                  <CFormInput v-model="formData.materialCode" size="sm" disabled class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">자재명</CFormLabel>
                  <CFormInput v-model="formData.materialName" size="sm" class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">수량단위</CFormLabel>
                  <CFormInput v-model="formData.unit" size="sm" class="form-input-compact" />
                </div>
              </CCol>

              <!-- 우측 2열 -->
              <CCol :md="6">
                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">자재분류</CFormLabel>
                  <div class="custom-select-wrapper-compact">
                    <div class="custom-select-compact" @click="toggleFormTypeDropdown" ref="formTypeSelect">
                      <span>{{ getFormTypeDisplayText(formData.materialType) }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
                        <path fill="#495057" d="M6 9L1 4h10z" />
                      </svg>
                    </div>
                    <div v-if="showFormTypeDropdown" class="custom-dropdown-compact">
                      <div class="custom-option-compact" @click="selectFormType('')">선택&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                      <div class="custom-option-compact" @click="selectFormType('H1')">H1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                      <div class="custom-option-compact" @click="selectFormType('H2')">H2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                      <div class="custom-option-compact" @click="selectFormType('H3')">H3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    </div>
                  </div>
                </div>

                <div class="form-row-horizontal mb-3">
                  <CFormLabel class="form-label-inline">규격</CFormLabel>
                  <CFormInput v-model="formData.spec" size="sm" class="form-input-compact" />
                </div>

                <div class="form-row-horizontal mb-3" style="visibility: hidden">
                  <CFormLabel class="form-label-inline">-</CFormLabel>
                  <CFormInput size="sm" class="form-input-compact" />
                </div>
              </CCol>

              <!-- 비고는 1열 라인에 맞춰서 배치 -->
              <CCol :md="12">
                <div class="form-row-horizontal mb-3" style="align-items: flex-start">
                  <CFormLabel class="form-label-inline" style="padding-top: 0.35rem">비고</CFormLabel>
                  <CFormTextarea
                    v-model="formData.remark"
                    size="sm"
                    rows="3"
                    class="form-textarea-compact"
                  />
                </div>
              </CCol>
            </CRow>
          </div>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";

const getTypeDisplayText = (value) => {
  if (value === "H1") return "H1";
  if (value === "H2") return "H2";
  if (value === "H3") return "H3";
  return "전체";
};

const lastSavedId = ref("MAT2510000");

const getNextId = () => {
  const prefix = "MAT25";
  const match = lastSavedId.value.match(/^MAT25(\d+)$/);

  if (match) {
    const lastNumber = parseInt(match[1]);
    const nextNumber = lastNumber + 1;
    return `${prefix}${String(nextNumber).padStart(4, "0")}`;
  }
  return `${prefix}0001`;
};

const showFormTypeDropdown = ref(false);
const formTypeSelect = ref(null);
const showTypeDropdown = ref(false);
const typeSelect = ref(null);

const toggleFormTypeDropdown = () => {
  showFormTypeDropdown.value = !showFormTypeDropdown.value;
};

const toggleTypeDropdown = () => {
  showTypeDropdown.value = !showTypeDropdown.value;
};

const selectFormType = (value) => {
  formData.materialType = value;
  showFormTypeDropdown.value = false;
};

const selectType = (value) => {
  searchFilters.materialType = value;
  showTypeDropdown.value = false;
};

const getFormTypeDisplayText = (value) => {
  if (value === "H1") return "H1\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
  if (value === "H2") return "H2\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
  if (value === "H3") return "H3\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
  return "선택\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event) => {
  if (typeSelect.value && !typeSelect.value.contains(event.target)) {
    showTypeDropdown.value = false;
  }
  if (formTypeSelect.value && !formTypeSelect.value.contains(event.target)) {
    showFormTypeDropdown.value = false;
  }
};

const searchFilters = reactive({
  materialName: "",
  materialType: "",
});

const formData = reactive({
  materialCode: "",
  materialType: "",
  materialName: "",
  spec: "",
  unit: "",
  remark: "",
});

const handleReset = () => {
  searchFilters.materialName = "";
  searchFilters.materialType = "";
  selectedRowIndex.value = null;
  selectedRscId.value = null;
  gridData.value = [];
  resetFormData();
};

const gridData = ref([]);
const selectedRowIndex = ref(null);
const selectedRscId = ref(null);
const originalCode = ref("");

const displayedData = computed(() => {
  return gridData.value;
});

const emptyRowCount = computed(() => {
  const dataCount = gridData.value.length;
  return dataCount < 10 ? Math.max(0, 10 - dataCount) : 0;
});

const handleRowSelect = (item, index) => {
  selectedRowIndex.value = index;
  selectedRscId.value = item.rsc_id;

  formData.materialCode = item.rsc_id;
  formData.materialType = item.rsc_clsf_id;
  formData.materialName = item.rsc_nm;
  formData.spec = item.spec;
  formData.unit = item.unit;
  formData.remark = item.rm;

  originalCode.value = item.rsc_id;
};

const handleSearch = async () => {
  const params = {
    rsc_nm: searchFilters.materialName || "",
    rsc_clsf_id: searchFilters.materialType || "",
  };

  console.log('📋 조회 파라미터:', params);

  try {
    let response = await axios.get("/api/rsc_list_view", { params });
    console.log("📡 조회 응답:", response.data);

    if (Array.isArray(response.data)) {
      gridData.value = response.data.sort((a, b) => {
        const numA = parseInt(a.rsc_id.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.rsc_id.replace(/\D/g, "")) || 0;
        return numA - numB;
      });

      if (gridData.value.length > 0) {
        lastSavedId.value = gridData.value[gridData.value.length - 1].rsc_id;
        console.log('💾 마지막 ID 업데이트:', lastSavedId.value);
      }
    } else {
      gridData.value = [];
    }

    console.log("✅ 조회 완료:", gridData.value.length, "건");
    
    selectedRowIndex.value = null;
    selectedRscId.value = null;
    
  } catch (error) {
    console.error("❌ 조회 실패:", error);
    alert("데이터 조회에 실패했습니다.");
    gridData.value = [];
  }
};

const handleSave = async () => {
  if (!formData.materialName) {
    alert("자재명을 입력해주세요.");
    return;
  }
  
  if (!formData.materialType) {
    alert("자재분류를 선택해주세요.");
    return;
  }

  try {
    const sendData = {
      rsc_clsf_id: formData.materialType || "",
      rsc_nm: formData.materialName,
      spec: formData.spec || "",
      unit: formData.unit || "",
      rm: formData.remark || "",
    };

    console.log('💾 저장 데이터:', sendData);

    let response;
    if (selectedRscId.value) {
      sendData.rsc_id = formData.materialCode;
      sendData.original_rsc_id = originalCode.value;
      console.log('✏️ 수정 모드');
      response = await axios.post("/api/rscUpdate", sendData);
    } else {
      sendData.rsc_id = formData.materialCode;
      console.log('➕ 신규 모드');
      response = await axios.post("/api/rscInsert", sendData);
    }

    console.log('📡 서버 응답:', response.data);

    lastSavedId.value = formData.materialCode;

    alert(selectedRscId.value ? '수정되었습니다.' : '저장되었습니다.');
    
    console.log('🔄 재조회 시작');
    await handleSearch();
    
    resetFormData();
    
  } catch (error) {
    console.error('❌ 저장 실패:', error);
    
    const errorMsg = error.response?.data?.error || 
                     error.response?.data?.message || 
                     '저장에 실패했습니다.';
    alert(errorMsg);
  }
};

const handleDelete = async () => {
  if (!selectedRscId.value) {
    alert("삭제할 항목을 선택해주세요.");
    return;
  }

  if (!confirm("선택한 항목을 삭제하시겠습니까?")) {
    return;
  }

  try {
    console.log('🗑️ 삭제 시작:', selectedRscId.value);
    
    const response = await axios.post("/api/rscDelete", { 
      rsc_id: selectedRscId.value 
    });
    
    console.log('📡 삭제 응답:', response.data);

    alert('삭제되었습니다.');
    
    console.log('🔄 재조회 시작');
    await handleSearch();
    
    resetFormData();
    
  } catch (error) {
    console.error('❌ 삭제 실패:', error);
    
    const errorMsg = error.response?.data?.error || 
                     error.response?.data?.message || 
                     '삭제에 실패했습니다.';
    alert(errorMsg);
  }
};

const resetFormData = () => {
  Object.assign(formData, {
    materialCode: "",
    materialType: "",
    materialName: "",
    spec: "",
    unit: "",
    remark: "",
  });
  originalCode.value = "";
  selectedRowIndex.value = null;
  selectedRscId.value = null;
};

const handleNew = () => {
  resetFormData();
  formData.materialCode = getNextId();
};
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
  min-width: 100px;
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

/* 커스텀 셀렉트 (검색 영역) */
.custom-select-wrapper {
  flex: 1;
  position: relative;
}

.custom-select {
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.custom-select:hover {
  border-color: #dee2e6;
  background-color: #fff;
}

.custom-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.custom-option {
  padding: 0.5rem 0.75rem;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
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

/* 테이블 래퍼 */
.table-wrapper {
  max-height: 500px;
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

:deep(.data-table thead th) {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: 34px;
}

:deep(.data-table thead th:first-child) {
  border-top-left-radius: 4px;
}

:deep(.data-table thead th:last-child) {
  border-top-right-radius: 4px;
}

:deep(.data-table tbody td) {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: 34px;
  vertical-align: middle;
}

:deep(.data-table tbody td:last-child) {
  border-right: none;
}

:deep(.data-table tbody tr) {
  height: 34px;
  transition: all 0.2s ease;
  background: #fff;
  cursor: pointer;
}

:deep(.data-table tbody tr.data-row:hover td) {
  background-color: rgba(33, 37, 41, 0.075) !important;
}

:deep(.data-table tbody tr.selected-row td) {
  background-color: #e7f1ff !important;
}

:deep(.data-table tbody tr.empty-row) {
  cursor: default;
}

:deep(.data-table tbody tr.empty-row:hover td) {
  background: #fff !important;
}

/* 셀 내부 입력 필드 */
.cell-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.25rem 0.5rem;
  font-size: 12px;
  color: #2c3e50;
  outline: none;
}

.cell-input:focus {
  background: #f8f9fa;
  border-radius: 4px;
}

.cell-input:hover {
  background: #f8f9fa;
  border-radius: 4px;
}

/* 폼 라벨 및 입력 (우측 상세) */
.form-row-horizontal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-label-inline {
  min-width: 80px;
  font-weight: 600;
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 0;
  flex-shrink: 0;
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

.form-textarea-compact {
  flex: 1;
  font-size: 12px;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  resize: none;
}

/* 커스텀 셀렉트 (폼 영역 - 컴팩트) */
.custom-select-wrapper-compact {
  flex: 1;
  position: relative;
}

.custom-select-compact {
  height: 34px;
  font-size: 12px;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.custom-select-compact:hover {
  border-color: #dee2e6;
  background-color: #fff;
}

.custom-dropdown-compact {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 150px;
  overflow-y: auto;
}

.custom-option-compact {
  padding: 0.45rem 0.75rem;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.custom-option-compact:hover {
  background: #f8f9fa;
}

/* 버튼 스타일 */
.btn-search,
.btn-reset,
.btn-action,
.btn-hidden {
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

/* Danger 버튼 - CoreUI 컬러 속성 오버라이드 */
:deep(.btn[color="danger"]),
.btn-action[color="danger"] {
  background: linear-gradient(135deg, #c53030 0%, #a82323 100%) !important;
}

:deep(.btn[color="danger"]:hover),
.btn-action[color="danger"]:hover {
  background: linear-gradient(135deg, #a82323 0%, #8b1a1a 100%) !important;
  box-shadow: 0 4px 12px rgba(197, 48, 48, 0.3) !important;
  transform: translateY(-2px);
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

/* 텍스트 정렬 유틸리티 */
.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
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
    max-height: 400px;
  }
}

@media (max-height: 780px) {
  .table-wrapper {
    max-height: 350px;
  }
}

@media (max-height: 700px) {
  .table-wrapper {
    max-height: 300px;
  }
}
</style>