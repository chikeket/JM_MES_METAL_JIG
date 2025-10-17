<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader>
      <CModalTitle>생산계획조회</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!-- 검색 영역 -->
        <div class="mb-3">
          <CInputGroup class="mb-2">
            <CInputGroupText id="addon-ordr-name-1">생산계획명</CInputGroupText>
            <CFormInput v-model="prod_plan_nm" placeholder="생산계획명" />
          </CInputGroup>

          <div class="d-flex gap-2 align-items-center">
            <select class="form-select" style="width: 200px" v-model="pickValue">
              <option value="singleDate">생산계획등록일</option>
              <option value="prod_expc_dt">생산계획일정조회</option>
            </select>

            <!-- 날짜 입력창 -->
            <template v-if="pickValue == 'singleDate'">
              <input type="date" class="form-control" v-model="reg_dt" />
            </template>

            <template v-else-if="pickValue == 'prod_expc_dt'">
              <input type="date" class="form-control" v-model="prod_expc_fr_dt" />
              <span>~</span>
              <input type="date" class="form-control" v-model="prod_expc_to_dt" />
            </template>

            <button class="btn btn-secondary" @click="prdtSearch()" style="width: 70px">
              검색
            </button>
          </div>
        </div>

        <!-- 결과 테이블 -->

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>생산계획명</th>
              <th>생산계획시작일</th>
              <th>생산계획종료일</th>
              <th>등록일</th>
            </tr>
          </thead>

          <tbody class="table table-bordered table-hover mb-0">
            <tr v-for="(prdts, i) in prdtList" :key="i" @dblclick="selectProduct(prdts)">
              <td>{{ prdts.prod_plan_nm }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.prod_expc_fr_dt, 'yyyy-MM-dd') }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.prod_expc_to_dt, 'yyyy-MM-dd') }}</td>
              <td>{{ userDateUtils.dateFormat(prdts.reg_dt, 'yyyy-MM-dd') }}</td>
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
import userDateUtils from '@/utils/useDates.js'
const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])
const close = () => {
  prdtList.value = []
  prod_plan_nm.value = ''
  reg_dt.value = ''
  prod_expc_fr_dt.value = ''
  prod_expc_to_dt.value = ''
  emit('close')
}

const pickValue = ref('singleDate') // 기본값: 코드
const prod_plan_nm = ref('')
const reg_dt = ref('')
const prod_expc_fr_dt = ref('')
const prod_expc_to_dt = ref('')

let prdtList = shallowRef([]) // <- 반응형 객체

const prdtSearch = async () => {
  const params = { prod_plan_nm: '', reg_dt: '', prod_expc_fr_dt: '', prod_expc_to_dt: '' }

  params.prod_plan_nm = prod_plan_nm.value
  if (pickValue.value == 'singleDate') {
    if (!reg_dt.value) {
      params.reg_dt = '1970-01-01'
    } else {
      params.reg_dt = reg_dt.value
    }
    params.prod_expc_fr_dt = '1970-01-01'
    params.prod_expc_to_dt = '2125-01-01'
  } else {
    params.reg_dt = '1970-01-01'
    if (prod_expc_fr_dt.value != null && !prod_expc_to_dt.value) {
      params.prod_expc_fr_dt = prod_expc_fr_dt.value
      params.prod_expc_to_dt = '2125-01-01'
    } else if (!prod_expc_fr_dt.value && prod_expc_to_dt.value != null) {
      params.prod_expc_fr_dt = '1970-01-01'
      params.prod_expc_to_dt = prod_expc_to_dt.value
    } else {
      params.prod_expc_fr_dt = prod_expc_fr_dt.value
      params.prod_expc_to_dt = prod_expc_to_dt.value
    }
  }
  console.log(params)
  let result = await axios
    .get('/api/prodPlanRealMasterSearch', { params })
    .catch((err) => console.log(err))
  console.log(result.data)
  prdtList.value = result.data
}

const selectProduct = async (prdts) => {
  console.log(prdts)
  const params = { prod_plan_id: '' }
  params.prod_plan_id = prdts.prod_plan_id
  let result = await axios
    .get('/api/prodPlanRealDetaSearch', { params })
    .catch((err) => console.log(err))
  emit('select', {
    detailData: result.data,
    searchParams: {
      emp_id: prdts.emp_id,
      prod_expc_fr_dt: userDateUtils.dateFormat(prdts.prod_expc_fr_dt, 'yyyy-MM-dd'),
      prod_expc_to_dt: userDateUtils.dateFormat(prdts.prod_expc_to_dt, 'yyyy-MM-dd'),
      prod_plan_id: prdts.prod_plan_id,
      prod_plan_nm: prdts.prod_plan_nm,
      rcvord_id: prdts.rcvord_id,
      reg_dt: userDateUtils.dateFormat(prdts.reg_dt, 'yyyy-MM-dd'),
      rm: prdts.rm,
    },
  }) // 부모에게 선택된 제품 전달
  close() // 모달 닫기
}
</script>
