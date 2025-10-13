<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader><CModalTitle>자재 검색</CModalTitle></CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height:500px; overflow-y:auto">
        <div class="d-flex gap-2 mb-3 align-items-center flex-wrap">
          <select class="form-select" style="width:150px; flex-shrink: 0;" v-model="pickValue">
            <option value="rsc_id">자재 코드</option>
            <option value="rsc_clsf_id">자재 분류</option>
            <option value="rsc_nm">자재 명</option>
            <option value="spec">규격</option>
            <option value="unit">단위</option>
          </select>
          <input 
            type="text" 
            class="form-control" 
            v-model="searchKeyword" 
            @keyup.enter="rscSearch" 
            placeholder="검색어 입력"
            style="width: 300px; flex-shrink: 0;"
          />
          <div class="d-flex gap-2" style="flex-shrink: 0;">
            <button class="btn btn-secondary" @click="resetSearch">초기화</button>
            <button class="btn btn-secondary" @click="rscSearch">검색</button>
          </div>
        </div>

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr><th>자재 코드</th><th>분류</th><th>명</th><th>규격</th><th>단위</th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rscList" :key="r.rsc_id || i" @dblclick="selectRsc(r)">
              <td>{{ r.rsc_id }}</td>
              <td>{{ r.rsc_clsf_id || r.rsc_ty }}</td>
              <td>{{ r.rsc_nm }}</td>
              <td>{{ r.spec }}</td>
              <td>{{ r.rsc_unit || r.unit }}</td>
            </tr>
            <tr v-if="rscList.length === 0"><td colspan="5" class="text-center text-muted">검색결과가 없습니다.</td></tr>
          </tbody>
        </table>
      </div>
    </CModalBody>
    <CModalFooter><CButton color="secondary" @click="close">닫기</CButton></CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, shallowRef } from 'vue'
import axios from 'axios'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const pickValue = ref('rsc_nm')
const searchKeyword = ref('')
const rscList = shallowRef([])

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  console.log('[rscModal] 검색 조건 초기화')
  pickValue.value = 'rsc_nm'
  searchKeyword.value = ''
  rscList.value = []
}

const rscSearch = async () => {
  try {
    const params = { rsc_id:'', rsc_clsf_id:'', rsc_nm:'', spec:'', unit:'' }
    
    // 선택된 검색 조건에 따라 파라미터 설정
    if (pickValue.value === 'rsc_id') params.rsc_id = searchKeyword.value || ''
    else if (pickValue.value === 'rsc_clsf_id') params.rsc_clsf_id = searchKeyword.value || ''
    else if (pickValue.value === 'rsc_nm') params.rsc_nm = searchKeyword.value || ''
    else if (pickValue.value === 'spec') params.spec = searchKeyword.value || ''
    else if (pickValue.value === 'unit') params.unit = searchKeyword.value || ''
    
    console.log('[rscModal] request params:', params)
    const res = await axios.get('/api/rscs', { params }).catch(err => { throw err })
    const data = res?.data
    console.log('[rscModal] raw response:', data)
    if (Array.isArray(data)) {
      rscList.value = data
    } else {
      console.warn('[rscModal] unexpected response, expected array. set empty list.')
      rscList.value = []
    }
  } catch (err) {
    console.error('[rscModal] rscSearch error', err)
    rscList.value = []
  }
}

const selectRsc = (r) => {
  // 정규화된 페이로드로 emit
  const item = {
    rsc_id: r?.rsc_id ?? r?.RSC_ID ?? r?.rscId ?? '',
    rsc_clsf_id: r?.rsc_clsf_id ?? r?.rsc_ty ?? '',
    rsc_nm: r?.rsc_nm ?? r?.RSC_NM ?? r?.rscNm ?? '',
    spec: r?.spec ?? r?.SPEC ?? '',
    unit: r?.unit ?? r?.rsc_unit ?? '',
    rsc_ordr_deta_id: r?.rsc_ordr_deta_id ?? null
  }
  console.log('[rscModal] emit select payload:', item)
  emit('select', item)
  close()
}
</script>

<!-- RscOrdr.vue -->
<RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />
