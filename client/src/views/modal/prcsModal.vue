<template>
  <CModal :visible="visible" @close="close">
    <CModalHeader>
      <CModalTitle>공정 검색</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <div class="modal-body" style="max-height: 400px; overflow-y: auto">
        <!--  검색 영역 -->
        <div class="d-flex gap-2 mb-3">
          <select class="form-select" style="width: 150px" v-model="pickValue">
            <option value="prcs_id">공정코드</option>
            <option value="prcs_nm">공정명</option>
            <option value="eqm_grp_nm">설비그룹명</option>
          </select>

          <input
            type="text"
            class="form-control"
            style="width: 150px; margin-right: 8px"
            placeholder="검색어 입력"
            v-model="searchKeyword"
          />

          <button class="btn btn-secondary" @click="prcsSearch">검색</button>
        </div>

        <!-- 결과 테이블 -->
        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th style="width: 50px">
                <input
                  type="checkbox"
                  :checked="allPrcs"
                  @change="checkAll($event)"
                  class="form-check-input"
                />
              </th>
              <th>공정아이디</th>
              <th>공정명</th>
              <th>설비그룹명</th>
              <th>리드타임</th>
              <th>금형사용유무</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="prcs in prcsList"
              :key="prcs.prcs_id"
              class="cursor-pointer"
              :class="{
                'table-active': selectedPrcs.some(
                  (s) =>
                    s.prcs_id === prcs.prcs_id &&
                    s.prcs_nm === prcs.prcs_nm &&
                    s.eqm_grp_nm === prcs.eqm_grp_nm,
                  s.lead_tm === prcs.lead_tm && s.mold_use_at === prcs.mold_use_at,
                ),
              }"
              @click="handlingRowClick(prcs)"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  :checked="checkCheck(prcs)"
                  @change="checkSelection(prcs)"
                  class="form-check-input"
                />
              </td>
              <td>{{ prcs.prcs_id }}</td>
              <td>{{ prcs.prcs_nm }}</td>
              <td>{{ prcs.eqm_grp_nm }}</td>
              <td>{{ prcs.lead_tm }}</td>
              <td>{{ prcs.mold_use_at }}</td>
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
import { ref, shallowRef } from 'vue'
import axios from 'axios'

// props, emit 정의
const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'select'])

// 반응형 변수
const pickValue = ref('prcs_id') // 기본 검색항목
const searchKeyword = ref('')
const prcsList = shallowRef([])

//  검색 버튼 클릭 시
const prcsSearch = async () => {
  try {
    const params = { prcs_id: '', prcs_nm: '', eqm_grp_nm: '', lead_tm: '', mold_use_at: '' }

    if (pickValue.value === 'prcs_id') params.prcs_id = searchKeyword.value
    else if (pickValue.value === 'prcs_nm') params.prcs_nm = searchKeyword.value
    else if (pickValue.value === 'eqm_grp_nm') params.eqm_grp_nm = searchKeyword.value
    else if (pickValue.value === 'lead_tm') params.lead_tm = searchKeyword.value
    else if (pickValue.value === 'mold_use_at') params.mold_use_at = searchKeyword.value

    const result = await axios.get('/api/prcs', { params })
    prcsList.value = result.data
  } catch (err) {
    console.error('공정 검색 오류:', err)
    alert('검색 중 오류가 발생했습니다.')
  }
}

// 행 클릭 핸들러 (체크박스 토글)
const handlingRowClick = (prcs) => {
  checkSelection(prcs)
  selectSinglePrcs(prcs)
}

// 단일 검사서 선택 (행 클릭 시)
const selectSinglePrcs = (prcs) => {
  selectedPrcsRow.value = { ...prcs }
  selectedPrcsRowNo.value = prcs.prcs_id
}

// 체크박스 선택/해제
const checkSelection = (prcs) => {
  // 고유 식별자: 검사서번호 + 품목코드 + 옵션코드 조합
  const index = selectedItems.value.findIndex(
    (s) =>
      s.insp_no === item.insp_no && s.item_code === item.item_code && s.opt_code === item.opt_code,
  )
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push({ ...item, insp_type: searchCondition.insp_type })
  }
  console.log('[inspectionModal] 선택된 검사서들:', selectedItems.value)
}

// 전체 선택/해제
const toggleAll = (event) => {
  if (event.target.checked) {
    selectedItems.value = inspectionList.value.map((item) => ({
      ...item,
      insp_type: searchCondition.insp_type,
    }))
  } else {
    selectedItems.value = []
  }
}

// 선택 여부 확인
const isSelected = (item) => {
  return selectedItems.value.some(
    (s) =>
      s.insp_no === item.insp_no && s.item_code === item.item_code && s.opt_code === item.opt_code,
  )
}

// 선택 상태 초기화
const resetSelection = () => {
  selectedItems.value = []
  selectedInspection.value = null
  selectedInspectionNo.value = ''
}

// 날짜 포맷팅
const formatDate = (dateStr) => {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0] // YYYY-MM-DD 형식
  } catch (error) {
    return dateStr
  }
}

// 선택 확인
const onSelect = () => {
  if (selectedItems.value.length === 0) {
    alert('검사서를 선택해주세요.')
    return
  }

  console.log('[inspectionModal] 최종 선택된 검사서들:', selectedItems.value)
  emit('select', selectedItems.value)
  closeModal()
}

//  모달 닫기
const close = () => {
  prcsList.value = []
  emit('close')
}

// 컴포넌트 마운트 시 초기화
//onMounted(() => {
//  console.log('[inspectionModal] 컴포넌트 마운트됨')
//})

//  테이블 행 더블클릭 시 선택
const selectPrcs = (prcs) => {
  emit('select', prcs) // 선택된 데이터 부모로 전달
  close()
}
</script>
