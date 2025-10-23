<template>
  <CModal :visible="visible" @close="close" size="xl" alignment="center">
    <CModalHeader>
      <CModalTitle>업체 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div
        class="modal-body"
        style="max-height: calc(100vh - 200px); overflow-y: auto; padding-right: 8px"
      >
        <!-- 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px" v-model="pickValue">
            <option value="CO_NM">업체 이름</option>
            <option value="RPSTR_NM">대표자 이름</option>
            <option value="RPSTR_TEL">대표자 연락처</option>
          </select>
          <select class="form-select" style="width: 150px" v-model="st">
            <option value="">전체상태</option>
            <option value="M1">활성</option>
            <option value="M2">비활성</option>
          </select>
          <input
            type="text"
            class="form-control"
            placeholder="검색어 입력"
            v-model="searchKeyword"
            style="width: 250px"
            @keyup.enter="coSearch"
          />
          <div class="ms-auto d-flex gap-2">
            <button class="btn btn-secondary" @click="coSearch()">검색</button>
            <button class="btn btn-secondary" @click="resetSearch()">초기화</button>
          </div>
        </div>

        <!-- 결과 테이블 -->
        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>업체 ID</th>
              <th>업체 이름</th>
              <th>업체 유형</th>
              <th>대표자 이름</th>
              <th>대표자 연락처</th>
              <th>사업자 등록 번호</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(cos, i) in coList"
              :key="i"
              @dblclick="selectCo(cos)"
              class="cursor-pointer"
            >
              <td>{{ cos.co_id }}</td>
              <td>{{ cos.co_nm }}</td>
              <td>{{ getCoTypeName(cos.co_ty_id) }}</td>
              <td>{{ cos.rpstr_nm }}</td>
              <td>{{ cos.rpstr_tel }}</td>
              <td>{{ cos.bizr_reg_no }}</td>
              <td>{{ getStatusName(cos.st) }}</td>
            </tr>
            <tr v-if="coList.length === 0">
              <td colspan="7" class="text-center text-muted py-3">
                검색 결과가 없습니다. 다른 조건으로 검색해보세요.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="close">닫기</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const coTy = ref('G2') // 기본값을 G2(공급업체)로 설정
const pickValue = ref('CO_NM')
const st = ref('')
const searchKeyword = ref('')
const coList = shallowRef([])

// 상태값과 업체유형 변환 함수
const getStatusName = (st) => {
  const statusMap = {
    M1: '활성',
    M2: '비활성',
  }
  return statusMap[st] || st
}

const getCoTypeName = (type) => {
  const typeMap = {
    G2: '공급업체',
    G1: '납품업체',
  }
  return typeMap[type] || type
}

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  console.log('[coModal] 검색 조건 초기화')
  coTy.value = ''
  pickValue.value = 'CO_NM'
  st.value = ''
  searchKeyword.value = ''
  coList.value = []
}

const coSearch = async () => {
  try {
    console.log('[coModal] 검색 시작')

    const params = {
      co_ty_id: 'G2' || '',
      co_nm: '',
      rpstr_nm: '',
      rpstr_tel: '',
      st: st.value || '',
    }

    // 검색어를 해당 필드에 설정
    if (pickValue.value === 'CO_NM') {
      params.co_nm = searchKeyword.value || ''
    } else if (pickValue.value === 'RPSTR_NM') {
      params.rpstr_nm = searchKeyword.value || ''
    } else if (pickValue.value === 'RPSTR_TEL') {
      params.rpstr_tel = searchKeyword.value || ''
    }

    console.log('[coModal] 검색 파라미터:', params)

    const response = await axios.get('/api/cos/forG2', { params })
    console.log('[coModal] API 응답:', response.data)

    // 서비스에서 직접 배열을 반환하므로 response.data를 사용
    coList.value = Array.isArray(response.data) ? response.data : []
    console.log('[coModal] 검색 결과:', coList.value.length, '건')
  } catch (error) {
    console.error('[coModal] 업체 검색 중 오류 발생:', error)
    console.error('[coModal] 에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    coList.value = []

    if (error.response?.status === 404) {
      alert('업체 검색 API를 찾을 수 없습니다. 서버 설정을 확인해주세요.')
    } else {
      alert('업체 검색 중 오류가 발생했습니다.')
    }
  }
}

const selectCo = (cos) => {
  emit('select', cos)
  close()
}
</script>

<style scoped>
/* ============================================
   모달 전역 스타일
   ============================================ */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

/* ============================================
   모달 헤더
   ============================================ */
:deep(.modal-header) {
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  padding: 1rem 1.5rem;
  border-bottom: none;
}
:deep(.modal-title) {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
:deep(.btn-close) {
  filter: brightness(0) invert(1);
}

/* ============================================
   모달 바디
   ============================================ */
:deep(.modal-body) {
  padding: 1.5rem;
}
.modal-body {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
.modal-body::-webkit-scrollbar {
  width: 6px;
}
.modal-body::-webkit-scrollbar-track {
  background: rgba(240, 240, 240, 0.6);
  border-radius: 10px;
}
.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #bfc2c7, #9ea2a8);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(2px);
  transition: all 0.2s ease;
}
.modal-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a4a8ae, #7e838a);
}
.modal-body {
  scrollbar-width: thin;
  scrollbar-color: #9ea2a8 rgba(240, 240, 240, 0.6);
}

/* ============================================
   모달 푸터
   ============================================ */
:deep(.modal-footer) {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

/* ============================================
   버튼 스타일
   ============================================ */
.btn,
:deep(.btn) {
  font-size: 13px;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
:deep(.btn-secondary) {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: #fff !important;
}
:deep(.btn-secondary:hover) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
:deep(.btn:active) {
  transform: translateY(0);
}

/* 버튼 간격 */
.gap-2 {
  gap: 0.5rem;
}

/* ============================================
   폼 요소 스타일
   ============================================ */
:deep(.form-control),
:deep(.form-select) {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}
:deep(.form-control:focus),
:deep(.form-select:focus) {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}
:deep(.form-control::placeholder) {
  color: #adb5bd;
  font-size: 12px;
}

/* ============================================
   테이블 스타일
   ============================================ */
:deep(.table) {
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
}
:deep(.table thead th) {
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #ffffff;
  text-align: center;
  padding: 0.75rem 0.5rem;
  border: none;
  letter-spacing: -0.2px;
  white-space: nowrap;
  vertical-align: middle;
  position: sticky;
  top: 0;
  z-index: 10;
}
:deep(.table thead th:first-child) {
  border-top-left-radius: 10px;
}
:deep(.table thead th:last-child) {
  border-top-right-radius: 10px;
}
:deep(.table tbody td) {
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  color: #2c3e50;
  background-color: #ffffff;
}
:deep(.table tbody td:last-child) {
  border-right: none;
}
:deep(.table tbody tr) {
  transition: all 0.2s ease;
  background-color: #ffffff;
  cursor: pointer;
}
:deep(.table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.075) !important;
}
:deep(.table tbody tr:hover td) {
  background-color: rgba(0, 0, 0, 0.075) !important;
}

/* 커서 포인터 */
.cursor-pointer {
  cursor: pointer;
}

/* 빈 결과 메시지 */
:deep(.text-muted) {
  color: #6c757d !important;
}
:deep(.text-center) {
  text-align: center !important;
}

/* ============================================
   반응형 축소 시 폰트 크기 조정
   ============================================ */
@media (max-width: 1600px) {
  :deep(.modal-title) {
    font-size: 14px;
  }
  :deep(.form-control),
  :deep(.form-select),
  :deep(.btn),
  :deep(.table thead th),
  :deep(.table tbody td) {
    font-size: 11px !important;
  }
  :deep(.btn) {
    padding: 0.4rem 1rem;
  }
}
</style>
