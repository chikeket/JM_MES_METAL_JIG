<template>
  <CContainer fluid>
    <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
      <CButton color="primary" class="me-md-2">자재 발주서 조회</CButton>
      <CButton color="primary">초기화</CButton>
    </div>

    <CRow class="g-3 mb-3">
      <CCol md="4">
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

      <CCol md="6">
        <CInputGroup>
          <CInputGroupText id="addon-ordr-name-2">발주서 등록 일자</CInputGroupText>
          <CFormInput type="date" id="publication_date" />
          <CFormInput type="date" id="publication_date" />
        </CInputGroup>
      </CCol>
    </CRow>

    <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
      <CButton color="primary" class="me-md-2">신규</CButton>
      <CButton color="primary" class="me-md-2">저장</CButton>
      <CButton color="primary">삭제</CButton>
    </div>

    <CRow class="g-3 mb-3">
      <CCol md="4">
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

      <CCol md="4">
        <CInputGroup>
          <CInputGroupText id="addon-ordr-name-1">자재 발주서 등록 일자</CInputGroupText>
          <CFormInput type="date" id="publication_date" />
        </CInputGroup>
      </CCol>

      <CCol md="4">
        <CInputGroup>
          <CInputGroupText id="addon-ordr-name-1">공급 업체 명</CInputGroupText>
          <CFormInput
            v-model="ordrName1"
            placeholder="공급 업체 명"
            aria-label="Rsc-ordr-name-1"
            aria-describedby="addon-ordr-name-1"
          />
        </CInputGroup>
      </CCol>
    </CRow>

    <CFormTextarea
      id="exampleFormControlTextarea1"
      label="비고"
      rows="3"
      text="필요 시 기재"
    ></CFormTextarea>

    <div class="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
      <CButton color="primary" class="me-md-2">자재 조회</CButton>
      <CButton color="primary">삭제</CButton>
    </div>

    <CTable striped hover>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell scope="col"><CFormCheck id="allCheck" /></CTableHeaderCell>
          <CTableHeaderCell scope="col">No</CTableHeaderCell>
          <CTableHeaderCell scope="col">자재 코드</CTableHeaderCell>
          <CTableHeaderCell scope="col">자재 이름</CTableHeaderCell>
          <CTableHeaderCell scope="col">규격</CTableHeaderCell>
          <CTableHeaderCell scope="col">단위</CTableHeaderCell>
          <CTableHeaderCell scope="col">수량</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow>
          <CTableHeaderCell scope="row"><CFormCheck id="flexCheckDefault" /></CTableHeaderCell>
          <CTableDataCell scope="row"
            ><CFormInput type="word" id="publication_date"
          /></CTableDataCell>
          <CTableDataCell></CTableDataCell>
          <CTableDataCell></CTableDataCell>
          <CTableDataCell></CTableDataCell>
          <CTableDataCell></CTableDataCell>
          <CTableDataCell></CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  </CContainer>
</template>
