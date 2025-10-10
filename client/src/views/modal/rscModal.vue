<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader><CModalTitle>자재 검색</CModalTitle></CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height:400px; overflow-y:auto">
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width:150px" v-model="pickValue">
            <option value="rsc_id">자재 코드</option>
            <option value="rsc_ty">자재 분류</option>
            <option value="rsc_nm">자재 명</option>
            <option value="spec">규격</option>
            <option value="rsc_unit">단위</option>
          </select>
          <input type="text" class="form-control" v-model="searchKeyword" @keyup.enter="rscSearch" placeholder="검색어 입력" />
          <button class="btn btn-secondary" @click="rscSearch">검색</button>
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
  pickValue.value = 'rsc_nm'
  searchKeyword.value = ''
  rscList.value = []
  emit('close')
}

const rscSearch = async () => {
  try {
    const params = { rsc_id:'', rsc_ty:'', rsc_nm:'', spec:'', rsc_unit:'' }
    params[pickValue.value] = searchKeyword.value || ''
    console.log('[rscModal] request params:', params)
    // prdtModal과 동일한 형태로 서버 호출 (app.js에 '/api'로 mount 했다면 '/api/rscs')
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
    rsc_clsf_id: r?.rsc_clsf_id ?? r?.rsc_ty ?? r?.RSC_CLSF_ID ?? '',
    rsc_nm: r?.rsc_nm ?? r?.RSC_NM ?? r?.rscNm ?? '',
    spec: r?.spec ?? r?.SPEC ?? '',
    rsc_unit: r?.rsc_unit ?? r?.unit ?? r?.RSC_UNIT ?? '',
    rsc_ordr_deta_id: r?.rsc_ordr_deta_id ?? null
  }
  console.log('[rscModal] emit select payload:', item)
  emit('select', item)
  close()
}
</script>

<!-- RscOrdr.vue -->
<RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />
