<template>
  <CModal :visible="visible" @close="close" size="xl">
    <CModalHeader><CModalTitle>자재 검색</CModalTitle></CModalHeader>
    <CModalBody>
      <div class="modal-body" style="max-height: 500px; overflow-y: auto">
        <div class="d-flex gap-2 mb-3 align-items-center flex-wrap">
          <select class="form-select" style="width: 150px; flex-shrink: 0" v-model="pickValue">
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
            style="width: 300px; flex-shrink: 0"
          />
          <div class="ms-auto d-flex gap-2">
            <button class="btn btn-secondary" @click="rscSearch">검색</button>
            <button class="btn btn-secondary" @click="resetSearch">초기화</button>
          </div>
        </div>

        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th style="width: 40px">
                <input type="checkbox" :checked="allSelected" @change="toggleAll($event)" />
              </th>
              <th>자재 코드</th>
              <th>분류</th>
              <th>자재 명</th>
              <th>규격</th>
              <th>단위</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rscList" :key="r.rsc_id || i" @click="toggleSelection(r)">
              <td @click.stop>
                <input type="checkbox" :checked="isSelected(r)" @change="toggleSelection(r)" />
              </td>
              <td>{{ r.rsc_id }}</td>
              <td>{{ r.rsc_clsf_id || r.rsc_ty }}</td>
              <td>{{ r.rsc_nm }}</td>
              <td>{{ r.spec }}</td>
              <td>{{ r.rsc_unit || r.unit }}</td>
            </tr>
            <tr v-if="rscList.length === 0">
              <td colspan="6" class="text-center text-muted">검색결과가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="emitSelected">선택 ({{ selectedItems.length }}건)</CButton>
      <CButton color="secondary" @click="close">닫기</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, shallowRef, computed } from 'vue'
import axios from 'axios'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'select'])

const pickValue = ref('rsc_nm')
const searchKeyword = ref('')
const rscList = shallowRef([])

// 선택 관련 상태
const selectedItems = ref([])
const allSelected = computed(() => rscList.value.length > 0 && rscList.value.every(isSelected))

function isSelected(item) {
  return selectedItems.value.some((s) => s.rsc_id === (item.rsc_id || item.RSC_ID || item.rscId))
}

function toggleSelection(item) {
  const id = item.rsc_id || item.RSC_ID || item.rscId
  const idx = selectedItems.value.findIndex((s) => s.rsc_id === id)
  if (idx > -1) selectedItems.value.splice(idx, 1)
  else selectedItems.value.push({ ...item })
}

function toggleAll(event) {
  if (event.target.checked) {
    selectedItems.value = rscList.value.map((r) => ({ ...r }))
  } else {
    selectedItems.value = []
  }
}

const close = () => {
  resetSearch()
  emit('close')
}

const resetSearch = () => {
  pickValue.value = 'rsc_nm'
  searchKeyword.value = ''
  rscList.value = []
  selectedItems.value = []
}

const rscSearch = async () => {
  try {
    const params = { rsc_id: '', rsc_clsf_id: '', rsc_nm: '', spec: '', unit: '' }
    if (pickValue.value === 'rsc_id') params.rsc_id = searchKeyword.value || ''
    else if (pickValue.value === 'rsc_clsf_id') params.rsc_clsf_id = searchKeyword.value || ''
    else if (pickValue.value === 'rsc_nm') params.rsc_nm = searchKeyword.value || ''
    else if (pickValue.value === 'spec') params.spec = searchKeyword.value || ''
    else if (pickValue.value === 'unit') params.unit = searchKeyword.value || ''
    const res = await axios.get('/api/rscs', { params }).catch((err) => {
      throw err
    })
    const data = res?.data
    if (Array.isArray(data)) {
      rscList.value = data
    } else {
      rscList.value = []
    }
    selectedItems.value = []
  } catch (err) {
    rscList.value = []
    selectedItems.value = []
  }
}

// 선택된 자재 emit (여러개)
function emitSelected() {
  if (selectedItems.value.length === 0) {
    alert('자재를 선택해주세요.')
    return
  }
  // 정규화된 페이로드로 emit
  const items = selectedItems.value.map((r) => ({
    rsc_id: r?.rsc_id ?? r?.RSC_ID ?? r?.rscId ?? '',
    rsc_clsf_id: r?.rsc_clsf_id ?? r?.rsc_ty ?? '',
    rsc_nm: r?.rsc_nm ?? r?.RSC_NM ?? r?.rscNm ?? '',
    spec: r?.spec ?? r?.SPEC ?? '',
    unit: r?.unit ?? r?.rsc_unit ?? '',
    rsc_ordr_deta_id: r?.rsc_ordr_deta_id ?? null,
  }))
  emit('select', items)
  close()
}
</script>

<!-- RscOrdr.vue -->
<RscModal :visible="isRscModalVisible" @close="closeRscModal" @select="selectedRsc" />
