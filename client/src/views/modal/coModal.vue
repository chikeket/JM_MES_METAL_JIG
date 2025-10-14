<template>
  <CModal :visible="visible" @close="close" size="xl" alignment="center">
    <CModalHeader>
      <CModalTitle>업체 검색</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: calc(100vh - 200px); overflow-y: auto; padding-right:8px;">
        <!-- 검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px" v-model="coTy">
            <option value="">전체유형</option>
            <option value="VENDOR">공급업체</option>
            <option value="CUSTOMER">납품업체</option>
          </select>
          <select class="form-select" style="width: 150px" v-model="pickValue">
            <option value="CO_NM">업체 이름</option>
            <option value="RPSTR_NM">대표자 이름</option>
            <option value="RPSTR_TEL">대표자 연락처</option>
          </select>
          <select class="form-select" style="width: 150px" v-model="st">
            <option value="">전체상태</option>
            <option value="ACT">활성</option>
            <option value="INA">비활성</option>
          </select>
          <input 
            type="text" 
            class="form-control" 
            placeholder="검색어 입력" 
            v-model="searchKeyword" 
            style="width: 250px;"
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

const coTy = ref('')
const pickValue = ref('CO_NM')
const st = ref('')
const searchKeyword = ref('')
const coList = shallowRef([])

// 상태값과 업체유형 변환 함수
const getStatusName = (st) => {
  const statusMap = {
    'ACT': '활성',
    'INA': '비활성'
  }
  return statusMap[st] || st
}

const getCoTypeName = (type) => {
  const typeMap = {
    'VENDOR': '공급업체',
    'CUSTOMER': '납품업체'
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
      co_ty_id: coTy.value || '',
      co_nm: '',
      rpstr_nm: '',
      rpstr_tel: '',
      st: st.value || ''
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
    
    const response = await axios.get('/api/cos', { params })
    console.log('[coModal] API 응답:', response.data)
    
    // 서비스에서 직접 배열을 반환하므로 response.data를 사용
    coList.value = Array.isArray(response.data) ? response.data : []
    console.log('[coModal] 검색 결과:', coList.value.length, '건')
    
  } catch (error) {
    console.error('[coModal] 업체 검색 중 오류 발생:', error)
    console.error('[coModal] 에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
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
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f8f9fa;
}
</style>