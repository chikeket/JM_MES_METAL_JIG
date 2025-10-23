<template>
  <!-- 상단 글로벌 툴바 (rcvord 스타일) -->
  <div class="global-toolbar vars-scope">
    <div class="toolbar-buttons">
      <button class="btn btn-sm btn-outline-secondary" @click="handleReset">초기화</button>
      <button class="btn btn-sm btn-outline-secondary" @click="handleSearch">조회</button>
    </div>

    <!-- 제품/자재 모달: 위치는 상관없지만 페이지 상단에 둬 안정적으로 표시 -->
    <rcvordModalTwo
      :visible="isProductModalVisible"
      @close="isProductModalVisible = false"
      @select="onProductSelect"
    />
    <rscModal
      :visible="isMaterialModalVisible"
      @close="isMaterialModalVisible = false"
      @select="onMaterialSelect"
    />
  </div>

  <div class="bom-page vars-scope">
    <!-- 검색 폼 (rcvord의 card-like + form-grid) -->
    <div class="card-like">
      <div class="form-grid form-grid-3">
        <div class="field">
          <label>제품명</label>
          <input
            type="text"
            v-model="searchFilters.productName"
            class="form-input"
            placeholder="제품명 입력"
          />
        </div>
        <div class="field">
          <label>옵션명</label>
          <input
            type="text"
            v-model="searchFilters.optionName"
            class="form-input"
            placeholder="옵션명 입력"
          />
        </div>
        <div class="field">
          <label>상태</label>
          <select v-model="searchFilters.status" class="form-input">
            <option value="">전체</option>
            <option value="P1">사용</option>
            <option value="P2">미사용</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 좌/우 그리드 영역 -->
    <div class="split-grid">
      <!-- 좌측: BOM 마스터 -->
      <div class="panel panel-left">
        <!-- 좌측 버튼 -->
        <div class="sub-toolbar">
          <div class="sub-toolbar-buttons">
            <button class="btn btn-sm btn-outline-secondary" @click="handleLeftProductSearch">
              제품 조회
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="handleLeftSave">저장</button>
            <button class="btn btn-sm btn-outline-danger" @click="handleLeftDelete">
              선택삭제
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-grid">
            <thead>
              <tr>
                <th class="chk-col">
                  <input type="checkbox" :checked="allLeftChecked" @change="toggleAllLeftCheck" />
                </th>
                <th class="no-col">No</th>
                <th class="bomid-col">BOM ID</th>
                <th class="product-col">제품명</th>
                <th class="option-col">옵션명</th>
                <th class="bomver-col">BOM 버전</th>
                <th class="date-col">유효 시작일자</th>
                <th class="date-col">유효 종료일자</th>
                <th class="st-col">상태</th>
                <th class="remark-col">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in leftDisplayData"
                :key="'l-' + index"
                :class="{ 'row-selected': selectedLeftIndex === index }"
                @click="selectLeftProduct(item, index)"
              >
                <td class="text-center">
                  <input type="checkbox" v-model="item.selected" @click.stop />
                </td>
                <td class="cell-no">{{ index + 1 }}</td>

                <!-- 읽기 필드는 input-like로, 수정 필드는 editor-input로 통일 -->
                <td class="cell-left">
                  <span class="cell-text" :title="item.bom_id">{{ item.bom_id || '' }}</span>
                </td>
                <td class="cell-left">
                  <span class="cell-text" :title="item.prdt_nm">{{ item.prdt_nm || '' }}</span>
                </td>
                <td class="cell-left">
                  <span class="cell-text" :title="item.opt_nm">{{ item.opt_nm || '' }}</span>
                </td>
                <td class="cell-left">
                  <span class="cell-text" :title="item.bom_ver">{{ item.bom_ver || '' }}</span>
                </td>

                <td class="cell-left" @click.stop>
                  <input type="date" v-model="item.valid_fr_dt" class="editor-input" />
                </td>
                <td class="cell-left" @click.stop>
                  <input type="date" v-model="item.valid_to_dt" class="editor-input" />
                </td>
                <td class="cell-left" @click.stop>
                  <select v-model="item.st" class="editor-input" @change="item._stChanged = true">
                    <option value="P1">사용</option>
                    <option value="P2">미사용</option>
                  </select>
                </td>
                <td class="cell-left" @click.stop>
                  <input v-model="item.rm" class="editor-input" placeholder="비고 입력" />
                </td>
              </tr>

              <tr v-for="i in leftEmptyRows" :key="'l-empty-' + i" class="empty-row">
                <td colspan="10">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 우측: BOM 상세(자재) -->
      <div class="panel panel-right">
        <!-- 우측 버튼 -->
        <div class="sub-toolbar">
          <div class="sub-toolbar-buttons">
            <button class="btn btn-sm btn-outline-secondary" @click="handleRightMaterialSearch">
              자재 조회
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="handleRightSave">저장</button>
            <button class="btn btn-sm btn-outline-danger" @click="handleRightDelete">
              선택삭제
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-grid">
            <thead>
              <tr>
                <th class="chk-col">
                  <input type="checkbox" :checked="allRightChecked" @change="toggleAllRightCheck" />
                </th>
                <th class="no-col">No</th>
                <th class="material-col">자재명</th>
                <th class="spec-col">규격</th>
                <th class="unit-col">단위</th>
                <th class="qty-col">BOM 수량</th>
                <th class="remark-col">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in rightDisplayData"
                :key="'r-' + index"
                :class="{ 'row-selected': selectedRightIndex === index }"
                @click="selectRightOption(item, index)"
              >
                <td class="text-center">
                  <input type="checkbox" v-model="item.selected" @click.stop />
                </td>
                <td class="cell-no">{{ index + 1 }}</td>

                <td class="cell-left" @click.stop>
                  <input v-model="item.rsc_nm" class="editor-input" placeholder="자재명" />
                </td>
                <td class="cell-left" @click.stop>
                  <input v-model="item.spec" class="editor-input" placeholder="규격" />
                </td>
                <td class="cell-left" @click.stop>
                  <input v-model="item.unit" class="editor-input" placeholder="단위" />
                </td>
                <td class="cell-number" @click.stop>
                  <input
                    v-model="item.rec_qy"
                    class="editor-input text-end"
                    type="number"
                    step="0.01"
                    @blur="item.rec_qy = formatNumber(item.rec_qy)"
                    placeholder="0"
                  />
                </td>
                <td class="cell-left" @click.stop>
                  <input v-model="item.rm" class="editor-input" placeholder="비고 입력" />
                </td>
              </tr>

              <tr v-for="i in rightEmptyRows" :key="'r-empty-' + i" class="empty-row">
                <td colspan="7">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import axios from 'axios'
import useDates from '@/utils/useDates.js'
import rcvordModalTwo from '@/views/modal/rcvordModalTwo.vue'
import rscModal from '@/views/modal/rscModal.vue'
// 모달 표시 상태 (rcvord.vue 스타일)
const isProductModalVisible = ref(false)
const isMaterialModalVisible = ref(false)
// 제품 조회 버튼 클릭 시 모달 오픈
const handleLeftProductSearch = () => {
  isProductModalVisible.value = true
}

// 소수점 이하 불필요한 0 없이 표시
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return ''
  const num = Number(val)
  if (isNaN(num)) return val
  return num % 1 === 0
    ? num.toString()
    : num
        .toString()
        .replace(/(?:\.\d*?[1-9])0+$/, '')
        .replace(/\.$/, '')
}

// 자재 조회 버튼 클릭 시 모달 오픈
const handleRightMaterialSearch = () => {
  isMaterialModalVisible.value = true
}
// 제품 모달에서 더블클릭(선택) 시 좌측 그리드에 신규행 추가 및 값 입력
function onProductSelect(row) {
  if (!row) return
  const today = new Date().toISOString().slice(0, 10)
  const newBom = {
    // bom_id는 DB에서 생성
    prdt_id: row.prdt_id || '',
    prdt_nm: row.prdt_nm || '',
    prdt_opt_id: row.prdt_opt_id || row.opt_id || '',
    opt_nm: row.opt_nm || '',
    bom_ver: '', // 항상 빈값으로 세팅하여 버전 자동생성
    valid_fr_dt: today,
    valid_to_dt: '',
    st: 'P1', // 신규 저장 시 기본값 '사용'
    rm: '',
    selected: true, // 기본 체크
    isNew: true,
  }
  console.log('[제품 모달 선택] prdt_id:', newBom.prdt_id, 'prdt_opt_id:', newBom.prdt_opt_id)
  leftGridData.value.unshift(newBom)
  selectedLeftIndex.value = 0
  selectedLeftBomId.value = null
  isProductModalVisible.value = false
}

// 자재 모달에서 여러 행 선택 시 우측 그리드에 모두 추가 (row: array or object)
function onMaterialSelect(row) {
  if (!row || !selectedLeftBomId.value) return
  const rows = Array.isArray(row) ? row : [row]
  const newDetails = rows.map((item) => ({
    bom_deta_id: '',
    bom_id: selectedLeftBomId.value,
    rsc_id: item.rsc_id || '',
    rsc_nm: item.rsc_nm || '',
    spec: item.spec || '',
    unit: item.unit || '',
    rec_qy: '',
    rm: item.rm || '',
    selected: false,
    isNew: true,
  }))
  // 중복 자재ID는 추가하지 않음
  const existIds = rightGridData.value.map((d) => d.rsc_id)
  newDetails.forEach((detail) => {
    if (!existIds.includes(detail.rsc_id)) {
      rightGridData.value.unshift(detail)
    }
  })
  selectedRightIndex.value = 0
  selectedRightBomDetaId.value = null
  isMaterialModalVisible.value = false
}

const searchFilters = reactive({
  productName: '',
  optionName: '',
  status: '',
})

// 좌측 그리드 관련
const leftGridData = ref([])
const selectedLeftIndex = ref(null)
const selectedLeftBomId = ref(null)

// 우측 그리드 관련
const rightGridData = ref([])
const selectedRightIndex = ref(null)
const selectedRightBomDetaId = ref(null)

const leftDisplayData = computed(() => leftGridData.value.slice(0, 100))
const leftEmptyRows = computed(() => Math.max(0, 100 - leftDisplayData.value.length))

const rightDisplayData = computed(() => rightGridData.value.slice(0, 100))
const rightEmptyRows = computed(() => Math.max(0, 100 - rightDisplayData.value.length))

// 날짜값이 들어올 때 자동 변환 (yyyy-MM-dd)
watch(
  leftGridData,
  (arr) => {
    arr.forEach((item) => {
      if (item && item.valid_fr_dt)
        item.valid_fr_dt = useDates.dateFormat(item.valid_fr_dt, 'yyyy-MM-dd')
      if (item && item.valid_to_dt)
        item.valid_to_dt = useDates.dateFormat(item.valid_to_dt, 'yyyy-MM-dd')
    })
  },
  { deep: true },
)

const allLeftChecked = computed(() => {
  return leftDisplayData.value.length > 0 && leftDisplayData.value.every((item) => item.selected)
})

const allRightChecked = computed(() => {
  return rightDisplayData.value.length > 0 && rightDisplayData.value.every((item) => item.selected)
})

const toggleAllLeftCheck = () => {
  const newValue = !allLeftChecked.value
  leftDisplayData.value.forEach((item) => {
    item.selected = newValue
  })
}

const toggleAllRightCheck = () => {
  const newValue = !allRightChecked.value
  rightDisplayData.value.forEach((item) => {
    item.selected = newValue
  })
}

const selectLeftProduct = (item, index) => {
  selectedLeftIndex.value = index
  selectedLeftBomId.value = item.bom_id
  console.log('좌측 BOM 선택:', item.bom_id)
  // BOM ID가 있으면 우측 그리드에 디테일 로드
  if (item.bom_id) {
    loadRightDetails(item.bom_id)
  }
}

const selectRightOption = (item, index) => {
  selectedRightIndex.value = index
  selectedRightBomDetaId.value = item.bom_deta_id
  console.log('우측 BOM 디테일 선택:', item.bom_deta_id)
}

// 우측 BOM 디테일 로드 함수
const loadRightDetails = async (bomId) => {
  try {
    console.log('📋 우측 BOM 디테일 조회:', bomId)
    const response = await axios.get('/api/bom/detail', { params: { bom_id: bomId } })
    const list = Array.isArray(response.data) ? response.data : response.data.data || []
    rightGridData.value = list.map((item) => ({
      ...item,
      rec_qy: formatNumber(item.rec_qy),
      selected: true,
    }))
    console.log('✅ 우측 BOM 디테일 조회 완료:', rightGridData.value.length, '건')
    selectedRightIndex.value = null
    selectedRightBomDetaId.value = null
  } catch (error) {
    console.error('❌ 우측 BOM 디테일 조회 오류:', error)
    rightGridData.value = []
  }
}

// 상단 조회 - 좌측 그리드만 조회
const handleSearch = async () => {
  try {
    const params = {
      productName: searchFilters.productName || '',
      optionName: searchFilters.optionName || '',
      status: searchFilters.status || '',
    }
    console.log('📋 BOM 마스터 조회 파라미터:', params)
    const response = await axios.get('/api/bom/master', { params })
    const list = Array.isArray(response.data) ? response.data : response.data.data || []
    leftGridData.value = list.map((item) => ({ ...item, selected: false }))
    // prdt_id, prdt_opt_id 값 콘솔 출력
    leftGridData.value.forEach((row, idx) => {
      console.log(`[조회결과] row${idx} prdt_id:`, row.prdt_id, 'prdt_opt_id:', row.prdt_opt_id)
    })
    console.log('✅ 좌측 BOM 마스터 조회 완료:', leftGridData.value.length, '건')
    selectedLeftIndex.value = null
    selectedLeftBomId.value = null
    rightGridData.value = []
  } catch (error) {
    console.error('❌ 좌측 BOM 마스터 조회 오류:', error)
    leftGridData.value = []
    rightGridData.value = []
  }
}

// 상단 초기화
const handleReset = () => {
  searchFilters.productName = ''
  searchFilters.optionName = ''
  searchFilters.status = ''
  selectedLeftIndex.value = null
  selectedLeftBomId.value = null
  selectedRightIndex.value = null
  selectedRightBomDetaId.value = null
  leftGridData.value = []
  rightGridData.value = []
  console.log('🔄 초기화 완료')
}

// ============================================
// 좌측 그리드 핸들러
// ============================================

// 좌측 - 신규 등록
const handleLeftNew = async () => {
  const newBom = {
    bom_id: '',
    prdt_id: '',
    prdt_opt_id: '',
    bom_ver: '',
    valid_fr_dt: '',
    valid_to_dt: '',
    st: '',
    rm: '',
    selected: false,
    isNew: true,
  }
  leftGridData.value.unshift(newBom)
  selectedLeftIndex.value = 0
  selectedLeftBomId.value = null
  console.log('➕ 좌측 BOM 신규 행 추가')
}

// 좌측 - 저장
const handleLeftSave = async () => {
  // bom_id가 있으면 update, 없으면 insert
  const itemsToSave = leftGridData.value.filter((item) => item.selected)
  if (itemsToSave.length === 0) {
    alert('저장할 BOM 항목이 없습니다.')
    return
  }
  try {
    for (const item of itemsToSave) {
      if (!item.prdt_id || !item.prdt_opt_id) {
        alert('제품/옵션 ID가 없습니다. 제품/옵션을 먼저 선택해주세요.')
        continue
      }
      if (!item.valid_to_dt) {
        alert('유효 종료 일자를 선택해주세요.')
        return
      }
      // 오늘 날짜 (yyyy-MM-dd)
      const today = new Date().toISOString().slice(0, 10)
      const payload = {
        prdt_id: item.prdt_id,
        prdt_opt_id: item.prdt_opt_id,
        bom_ver: item.bom_ver || '',
        valid_fr_dt: today,
        valid_to_dt: item.valid_to_dt || '',
        st: item.st || '',
        rm: item.rmrk || '',
      }
      if (item.bom_id) {
        // update
        console.log('✏️ BOM 마스터 수정 payload:', JSON.stringify(payload, null, 2))
        await axios.put(`/api/bom/master/${item.bom_id}`, payload)
        item._stChanged = false
      } else {
        // insert
        console.log('➕ BOM 마스터 신규 등록 payload:', JSON.stringify(payload, null, 2))
        await axios.post('/api/bom/master', payload)
      }
    }
    alert('저장 완료')
    await handleSearch()
  } catch (error) {
    console.error('❌ BOM 마스터 저장 오류:', error)
    alert('저장 중 오류가 발생했습니다.')
  }
}

// 좌측 - 선택 삭제
const handleLeftDelete = async () => {
  const selected = leftGridData.value.filter((item) => item.selected)
  if (selected.length === 0) {
    alert('삭제할 BOM 항목을 선택해주세요.')
    return
  }
  if (!confirm(`${selected.length}개 BOM 항목을 삭제하시겠습니까?`)) return
  try {
    for (const item of selected) {
      if (!item.isNew && item.bom_id) {
        // BOM_DETA에 값이 있는지 확인
        const detailRes = await axios.get('/api/bom/detail', { params: { bom_id: item.bom_id } })
        const detailList = Array.isArray(detailRes.data)
          ? detailRes.data
          : detailRes.data.data || []
        if (detailList.length > 0) {
          alert('BOM 상세 정보를 먼저 삭제해 주세요.')
          return
        }
        await axios.delete(`/api/bom/master/${item.bom_id}`)
      }
    }
    leftGridData.value = leftGridData.value.filter((item) => !item.selected)
    alert('삭제되었습니다.')
    selectedLeftIndex.value = null
    selectedLeftBomId.value = null
  } catch (error) {
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// ============================================
// 우측 그리드 핸들러
// ============================================

// 우측 - 신규
const handleRightNew = () => {
  if (!selectedLeftBomId.value) {
    alert('좌측에서 BOM을 먼저 선택해주세요.')
    return
  }
  const newDetail = {
    bom_deta_id: '',
    bom_id: selectedLeftBomId.value,
    rsc_id: '',
    rsc_nm: '',
    unit: '',
    bom_qty: '',
    rmrk: '',
    selected: false,
    isNew: true,
  }
  rightGridData.value.unshift(newDetail)
  selectedRightIndex.value = 0
  selectedRightBomDetaId.value = null
  console.log('➕ 우측 BOM 디테일 신규 행 추가 (BOM ID:', selectedLeftBomId.value, ')')
}

// 우측 - 저장
const handleRightSave = async () => {
  if (!selectedLeftBomId.value) {
    alert('좌측에서 BOM을 먼저 선택해주세요.')
    return
  }
  const itemsToSave = rightGridData.value.filter((item) => item.isNew || item.selected)
  if (itemsToSave.length === 0) {
    alert('저장할 BOM 디테일 항목이 없습니다.')
    return
  }
  try {
    for (const item of itemsToSave) {
      if (!item.rsc_nm) {
        alert('자재명을 입력해주세요.')
        continue
      }
      // rec_qy(수량) 값이 비어있으면 null 또는 0으로 변환
      let rec_qy = item.rec_qy
      if (rec_qy === '' || rec_qy === undefined || rec_qy === null) rec_qy = 0
      const payload = {
        bom_id: selectedLeftBomId.value,
        rsc_id: item.rsc_id,
        rec_qy: rec_qy,
        rm: item.rm || '',
      }
      if (item.isNew) {
        await axios.post('/api/bom/detail', payload)
      } else {
        payload.bom_comp_id = item.bom_comp_id
        await axios.put(`/api/bom/detail/${item.bom_comp_id}`, payload)
      }
    }
    alert('저장 완료')
    await loadRightDetails(selectedLeftBomId.value)
  } catch (error) {
    alert('저장 중 오류가 발생했습니다.')
  }
}

// 우측 - 선택 삭제 (중복 선언 제거, 하나만 유지)

// 우측 - 선택 삭제
const handleRightDelete = async () => {
  const selected = rightGridData.value.filter((item) => item.selected)
  if (selected.length === 0) {
    alert('삭제할 BOM 디테일 항목을 선택해주세요.')
    return
  }
  if (!confirm(`${selected.length}개 BOM 디테일 항목을 삭제하시겠습니까?`)) return
  try {
    for (const item of selected) {
      if (!item.isNew && item.bom_comp_id) {
        await axios.delete(`/api/bom/detail/${item.bom_comp_id}`)
      }
    }
    rightGridData.value = rightGridData.value.filter((item) => !item.selected)
    alert('삭제되었습니다.')
    selectedRightIndex.value = null
    selectedRightBomDetaId.value = null
  } catch (error) {
    alert('삭제 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped>
/* ===== 공통 베이스 (rcvord 스타일) ===== */
:deep(*) {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
}

/* 변수 스코프 */
.vars-scope {
  --radius-sm: 4px;
  --radius-md: 6px;
  --color-btn-gray: #6e7b85;
  --color-btn-gray-hover: #5d6871;
  --color-btn-danger: #c53030;
  --color-btn-danger-hover: #a82323;
  --color-btn-text: #fff;
  --table-visible-rows: 16;
  --row-h: 34px;
  --thead-h: 34px;
  --row-vpad: 6px;
  --cell-inner-h: calc(var(--row-h) - (var(--row-vpad) * 2));

  /* === 조절 가능한 컬럼 폭 변수 === */
  --col-chk: 35px;
  --col-no: 40px;

  /* 좌측 그리드 (BOM 마스터) */
  --left-col-bomid: 115px;
  --left-col-product: 120px;
  --left-col-option: 100px;
  --left-col-bomver: 100px;
  --left-col-date: 120px;
  --left-col-status: 80px;
  --left-col-remark: 140px;

  /* 우측 그리드 (BOM 상세) */
  --right-col-material: 100px;
  --right-col-spec: 70px;
  --right-col-unit: 70px;
  --right-col-qty: 70px;
  --right-col-remark: 100px;
}

/* 페이지 래퍼 */
.bom-page {
  font-size: 13px;
  padding: 0 12px;
}

/* 카드 모양 박스 */
.card-like {
  border: 1px solid #ccc;
  background: #ffffff;
  padding: 12px 14px 16px;
  margin-bottom: 16px;
  position: relative;
  border-radius: var(--radius-md);
}

/* 상단 툴바 */
.global-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0 14px;
  margin-bottom: 8px;
}
.global-toolbar .toolbar-buttons {
  display: flex;
  gap: 6px;
}

/* 하위 툴바(버튼 그룹) */
.sub-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: -4px 0 8px;
}
.sub-toolbar-buttons {
  display: flex;
  gap: 6px;
}

/* 버튼 */
.btn {
  cursor: pointer;
  border-radius: 8px;
  border: none;
  color: var(--color-btn-text);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.3px;
  transition: all 0.3s ease;
  line-height: 1.5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.btn-sm {
  height: auto;
  padding: 0.5rem 1.2rem;
  font-size: 13px;
}
.btn-outline-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: var(--color-btn-text);
}
.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
.btn-outline-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: var(--color-btn-text);
}
.btn-outline-danger:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

/* 폼 그리드 */
.form-grid {
  display: grid;
  gap: 10px 18px;
  margin-top: 0;
}
.form-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.field {
  display: flex;
  flex-direction: column;
}
.field label {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
  color: #2c3e50;
  letter-spacing: -0.2px;
}
.form-input,
.field input[type='text'],
.field select {
  font-size: 12px;
  font-weight: 400;
  padding: 0.4rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  height: 34px;
}
.field input[type='text']:focus,
.field select:focus {
  border-color: #6c757d;
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
  background-color: #ffffff;
}

/* 좌우 분할 레이아웃 */
.split-grid {
  display: grid;
  grid-template-columns: 7fr 5fr; /* 좌:우 비율 */
  gap: 12px;
}

/* 테이블 래퍼/스크롤바 */
.table-wrapper {
  height: calc(var(--row-h) * var(--table-visible-rows) + var(--thead-h));
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #bcbcbc;
  border-radius: var(--radius-md);
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
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

/* 데이터 그리드 (rcvord 버전) */
.data-grid {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 12px;
}
.data-grid thead th {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: #fff;
  z-index: 10;
  border: none;
  padding: 0.65rem 0.5rem;
  font-weight: 700;
  text-align: center;
  height: var(--thead-h);
}
.data-grid thead th:first-child {
  border-top-left-radius: var(--radius-sm);
}
.data-grid thead th:last-child {
  border-top-right-radius: var(--radius-sm);
}
.data-grid tbody td {
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-right: 2px solid #e9ecef;
  padding: 0.55rem 0.5rem;
  background: #fff;
  height: var(--row-h);
  vertical-align: middle;
  overflow: hidden;
}
.data-grid tbody td:last-child {
  border-right: none;
}
.data-grid tbody tr {
  height: var(--row-h);
  transition: all 0.2s ease;
  background-color: #ffffff;
}
.data-grid tbody tr:hover:not(.empty-row),
.data-grid tbody tr:hover:not(.empty-row) td,
.data-grid tbody tr:hover:not(.empty-row) .input-like {
  background-color: var(
    --cui-table-hover-bg,
    var(--bs-table-hover-bg, rgba(33, 37, 41, 0.075))
  ) !important;
}

/* 셀 정렬 */
.cell-no {
  text-align: center;
}
.cell-number {
  text-align: right;
}
.cell-left {
  text-align: left;
}
.text-center {
  text-align: center;
}
.text-end {
  text-align: right;
}

/* 선택 행 강조 */
.row-selected,
.row-selected td,
.row-selected .input-like {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
}
.row-selected td {
  border-bottom: 1px solid #93c5fd;
  color: #1e40af;
}

/* 가짜 입력 상자 (읽기) */
.input-like {
  display: block;
  width: 100%;
  background-color: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  min-height: 26px;
  line-height: var(--cell-inner-h);
  height: var(--cell-inner-h);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.input-like--compact {
  padding: 0.2rem 0.5rem;
}
.input-like .value {
  display: inline-block;
  color: #2c3e50;
  line-height: 1.2;
  max-height: var(--cell-inner-h);
}
.placeholder-text {
  color: #b5b5b5;
  font-style: italic;
}
.empty-row td {
  background-color: #fafbfc;
}

/* 실제 입력 컨트롤(편집용) */
.editor-input {
  width: 100%;
  background: #fff !important;
  border: 1px solid #5b9dd9 !important;
  border-radius: var(--radius-sm);
  height: var(--cell-inner-h) !important;
  min-height: 0 !important;
  padding: 2px 6px;
  box-sizing: border-box;
  font-size: 12px;
}

/* 입력 불가 셀에 쓸 텍스트 전용 스타일 */
.data-grid .cell-text {
  display: block;
  padding: 2px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--cell-inner-h);
  max-height: var(--cell-inner-h);
}

/* 공통 체크/번호 컬럼 */
.chk-col {
  width: var(--col-chk);
}
.no-col {
  width: var(--col-no);
}

/* 좌측 그리드: panel-left 스코프 내에서 변수로 제어 */
.panel-left .bomid-col {
  width: var(--left-col-bomid);
}
.panel-left .product-col {
  width: var(--left-col-product);
}
.panel-left .option-col {
  width: var(--left-col-option);
}
.panel-left .bomver-col {
  width: var(--left-col-bomver);
}
.panel-left .date-col {
  width: var(--left-col-date);
}
.panel-left .st-col {
  width: var(--left-col-status);
}
.panel-left .remark-col {
  width: var(--left-col-remark);
}

/* 우측 그리드: panel-right 스코프 내에서 변수로 제어 */
.panel-right .material-col {
  width: var(--right-col-material);
}
.panel-right .spec-col {
  width: var(--right-col-spec);
}
.panel-right .unit-col {
  width: var(--right-col-unit);
}
.panel-right .qty-col {
  width: var(--right-col-qty);
}
.panel-right .remark-col {
  width: var(--right-col-remark);
}

/* 좌/우 패널에서 흰 카드 느낌 제거 */
.panel {
  background: transparent;
  border: 0;
  box-shadow: none;
  padding: 0;
}

/* 반응형 버튼/입력 크기 조정 */
@media (max-width: 1600px) {
  .btn {
    font-size: 11px !important;
    padding: 0.4rem 1rem;
  }
  .form-input {
    font-size: 12px !important;
    height: 32px !important;
  }
}
</style>
