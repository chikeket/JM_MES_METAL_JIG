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
          <CButton color="secondary" size="sm" @click="handleNew" class="btn-action">신규</CButton>
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

.grid-box, .form-box {
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

.form-textarea-compact {
  font-size: 11px;
  font-weight: 400;
  padding: 0.4rem 0.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;
  background-color: #ffffff;
  width: calc(100% - 96px);
  max-width: calc(100% - 96px);
  resize: vertical;
  line-height: 1.5;
}

.form-textarea-compact:focus {
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
  background-color: #ffffff;
  outline: none;
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

:deep(.form-control:disabled) {
  background-color: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
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

.custom-select-wrapper-compact {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.custom-select-compact {
  font-size: 11px;
  font-weight: 400;
  padding: 0.3rem 0.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  background-color: #ffffff;
  height: 42px;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: #334155;
  transition: all 0.2s ease;
}

.custom-select-compact:hover {
  border-color: #94a3b8;
}

.custom-select-compact span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  color: #334155;
}

.custom-select-compact svg {
  flex-shrink: 0;
  margin-left: 0.25rem;
}

.custom-dropdown-compact {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 9999;
  max-height: 150px;
  overflow-y: auto;
  animation: dropdownFadeIn 0.2s ease;
}

/* 드롭다운 스크롤바 스타일 - 좌측 그리드와 동일하게 */
.custom-dropdown-compact::-webkit-scrollbar {
  width: 16px;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.custom-dropdown-compact::-webkit-scrollbar-track {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 6px 0;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.05);
}

.custom-dropdown-compact::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
  border-radius: 12px;
  border: 3px solid #f1f5f9;
  box-shadow: 
    0 3px 10px rgba(71, 85, 105, 0.25),
    inset 0 1px 3px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-dropdown-compact::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-color: #e2e8f0;
  box-shadow: 
    0 5px 15px rgba(71, 85, 105, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.4);
  transform: scaleX(1.15);
}

.custom-dropdown-compact::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  border-width: 2px;
  box-shadow: 
    0 2px 8px rgba(30, 41, 59, 0.5),
    inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

.custom-dropdown-compact::-webkit-scrollbar-button {
  display: none;
}

.custom-dropdown-compact {
  scrollbar-width: auto;
  scrollbar-color: #64748b #f1f5f9;
}

.custom-option-compact {
  padding: 0.5rem 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #334155;
  font-size: 11px;
  border-radius: 6px;
  margin: 4px 6px;
  height: 28px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.custom-option-compact:first-child {
  margin-top: 6px;
}

.custom-option-compact:last-child {
  margin-bottom: 6px;
}

.custom-option-compact:hover {
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
  padding: 0.4rem 0.5rem;
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

:deep(.text-end) {
  text-align: right;
}

:deep(.text-start) {
  text-align: left;
}

:deep(.text-center) {
  text-align: center;
}

:deep(.text-primary) {
  color: #6b7280 !important;
  font-weight: 600 !important;
}

.cell-input {
  width: 100%;
  border: 1.5px solid #e2e8f0;
  background: transparent;
  padding: 0.35rem 0.5rem;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s ease;
  height: 32px;
  box-sizing: border-box;
}

.cell-input:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 4px rgba(107, 114, 128, 0.12);
  background: #ffffff;
}

select.cell-input {
  cursor: pointer;
  background-color: #ffffff;
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