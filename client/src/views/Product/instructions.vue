<script setup>
import { ref, reactive } from 'vue'



const Info = ref({
  ordrName1: "",
  regDate: "",
  startDate: "",
  endDate: "",
  remark: "",
  
});

  const insertRowsToDB = async () => {
  let obj = rows.value.map(row => ({
    ordrName: ordrName1.value,
    regDate: regDate.value,
    startDate: startDate.value,
    endDate: endDate.value,
    remark: remark.value,
    ...row, // row 객체의 모든 필드 포함
  }))

  let result = await axios
    .post("/api/books", obj)
    .catch((err) => console.log(err));
  let addRes = result.data;
  if (addRes.isSuccessed) {
    alert("도서가 등록되었습니다.");
    bookInfo.value.no = addRes.bookNo;
  } else {
    alert("도서 등록에 실패했습니다.");
  }
}

const rows = ref([
  {
    prdtId: 'a_red_030',
    prdtNm: '메탈지그A',
    spec: '30',
    unit: 'g',
    planQy: 0,
    drctQy: 0,
    baseQuantity: 0,
    unspecifiedQuantity: 0,
    priort: 1,
    rm: '정기생산',
  },
  {
    prdtId: 'b_red_030',
    prdtNm: '메탈지그B',
    spec: '30',
    unit: 'g',
    planQy: 0,
    drctQy: 0,
    baseQuantity: 0,
    unspecifiedQuantity: 0,
    priort: 1,
    rm: '돌발생산',
  },
])

const editing = reactive({ id: null, field: null })
const editDraft = ref(null)

const isEditing = (row, field) => editing.id === row.id && editing.field === field

function startEdit(row, field) {
  editing.id = row.id
  editing.field = field
  const cur = row[field]
  // boolean 셀렉트 대비
  editDraft.value = field === 'producible' ? String(!!cur) : cur
}

function commitEdit(row, field) {
  let v = editDraft.value
  if (field === 'drctQy') {
    const n = Number(v)
    row.drctQy = Number.isFinite(n) ? n : 0
    row.baseQuantity = row.baseQuantity + row.drctQy // 기존값에 더하기
  } else if (field === 'producible') {
    row.producible = v === 'true' || v === true
  } else if (field === 'unit') {
    row.unit = String(v || 'EA')
  } else {
    row[field] = (v ?? '').toString()
  }
  cancelEdit()
}

function cancelEdit() {
  editing.id = null
  editing.field = null
  editDraft.value = null
}

const fmtQty = (n) => (n ?? 0).toLocaleString()
</script>

<template>
  <div class="d-flex justify-content-end gap-2 mb-3">
<CButton color="secondary">신규</CButton>
<CButton color="secondary">생산지시서 조회</CButton>
<CButton color="secondary" @click="insertRowsToDB">저장</CButton>
<CButton color="secondary">수정</CButton>
<CButton color="danger">삭제</CButton>
  </div>
  
  <CContainer fluid>
    <CRow class="g-3 mb-3">
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText id="addon-ordr-name-1">자재 발주서 명</CInputGroupText>
          <CFormInput
            v-model="ordrName1"
            placeholder="자재 발주서 명"
            aria-label="Rsc-ordr-name-1"
            aria-describedby="addon-ordr-name-1"
          />
        </CInputGroup>
      </CCol>

      <CCol md="3">
        <CInputGroup>
          <CInputGroupText id="addon-ordr-name-2">등록 일자</CInputGroupText>
          <CFormInput type="date" v-model="regDate" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText id="addon-ordr-name-2">시작 일자</CInputGroupText>
          <CFormInput type="date" v-model="startDate" />
        </CInputGroup>
      </CCol>
      <CCol md="3">
        <CInputGroup>
          <CInputGroupText id="addon-ordr-name-2">종료 일자</CInputGroupText>
          <CFormInput type="date" v-model="endDate" />
        </CInputGroup>
      </CCol>
    </CRow>
  </CContainer>
  <CFormTextarea
    v-model="remark"
    label="비고"
    rows="3"
    text="필요 시 기재"
  ></CFormTextarea>

  <div class="d-flex justify-content-end gap-2 mb-3">
<CButton color="secondary">제품 조회</CButton>
<CButton color="secondary">생산계획서 조회</CButton>
<CButton color="secondary">초기화</CButton>
  </div>

  <CTable hover bordered small class="align-middle">
    <CTableHead color="dark">
      <CTableRow>
        <CTableHeaderCell scope="col" class="text-center" style="width: 56px"
          >코드</CTableHeaderCell
        >
        <CTableHeaderCell scope="col" class="text-center">제품명</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-center">규격</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-center" style="width: 140px">단위</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-center" style="width: 120px">계획수량</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-center" style="width: 90px">지시수량</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-center" style="width: 140px">기지시수량</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-center">미지시수량</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-center">우선순위</CTableHeaderCell>
        <CTableHeaderCell scope="col" class="text-center">비고</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      <CTableRow v-for="(row, idx) in rows" :key="row.id ?? idx">
        <!-- 코드 명 -->
        <CTableHeaderCell scope="row" >{{ row.prdtId }}</CTableHeaderCell>

        <!-- 제품 명 -->
        <CTableHeaderCell scope="row" >{{ row.prdtNm }}</CTableHeaderCell>

        <!-- 규격 -->
        <CTableHeaderCell scope="row" >{{ row.spec }}</CTableHeaderCell>

        <!-- 단위 -->
        <CTableHeaderCell scope="row" >{{ row.unit }}</CTableHeaderCell>

        <!-- 계획수량 -->
        <CTableHeaderCell scope="row" >{{ row.planQy }}</CTableHeaderCell>

        <!-- 지시수량 -->
        <CTableDataCell class="text-end" @dblclick="startEdit(row, 'drctQy')">
          <template v-if="isEditing(row, 'drctQy')">
            <CFormInput
              v-model.number="editDraft"
              type="number"
              min="0"
              size="sm"
              class="text-end"
              @keyup.enter="commitEdit(row, 'drctQy')"
              @keyup.esc="cancelEdit"
              @blur="commitEdit(row, 'drctQy')"
              placeholder="0"
            />
          </template>
          <template v-else>{{ fmtQty(row.drctQy) }}</template>
        </CTableDataCell>

        <!-- 기지시수량 -->
        <CTableHeaderCell scope="row" >{{ row.baseQuantity }}</CTableHeaderCell>

        <!-- 미지시수량 -->
        <CTableHeaderCell scope="row" >{{ row.unspecifiedQuantity }}</CTableHeaderCell>

        <!-- 우선순위 -->
        <CTableHeaderCell scope="row" >{{ row.priort }}</CTableHeaderCell>

        <!-- 비고 -->
        <CTableHeaderCell scope="row" >{{ row.rm }}</CTableHeaderCell>
</CTableRow>
      <CTableRow v-if="!rows || rows.length === 0">
        <CTableDataCell colspan="8" class="text-center text-muted py-5"
          >행이 없습니다.</CTableDataCell
        >
      </CTableRow>
    </CTableBody>
  </CTable>
</template>
