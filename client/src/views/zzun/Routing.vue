<template>
  <CContainer fluid>
    <CCol :xs="12">
      <CCard class="mb-4">
        <CCardBody class="p-4">
          <!-- 맨 위 입력창(disabled)과 버튼 -->
          <CRow class="g-3 mb-3">
            <CCol md="4">
              <CInputGroup>
                <CInputGroupText id="addon-prod-name">제품명</CInputGroupText>
                <CFormInput
                  v-model="productId"
                  aria-label="input-product-id"
                  aria-describedby="addon-ordr-name-1"
                  disabled
                />
              </CInputGroup>
            </CCol>

            <CCol md="4" class="d-flex align-items-center">
              <CButton color="secondary" class="me-2">초기화</CButton>
              <CButton color="secondary">조회</CButton>
            </CCol>
          </CRow>

          <!-- 상단 제목: 공정 라우팅관리 -->
          <CRow class="mb-3">
            <CCol md="4">
              <h6 class="fw-semibold mb-2">공정 라우팅관리</h6>
            </CCol>
          </CRow>

          <!-- 가로 분할: 왼쪽영역/ 오른쪽영역 / 영역크기 다름 -->
          <CRow style="height: 400px">
            <!-- 부모 높이 지정 -->
            <!-- 왼쪽 영역 -->
            <CCol md="4" class="d-flex">
              <CCard class="p-3 mb-3 flex-fill" style="overflow-x: auto; overflow-y: auto">
                <CTable striped hover>
                  <CTableHead color="dark">
                    <CTableRow>
                      <CTableHeaderCell scope="col" class="text-center" style="width: 56px">
                        제품명
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow><CTableDataCell>제품 A</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell>제품 B</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell>제품 C</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell>제품 D</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell>제품 E</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell>제품 F</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell>제품 G</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell>제품 H</CTableDataCell></CTableRow>
                  </CTableBody>
                </CTable>
              </CCard>
            </CCol>

            <!-- 오른쪽 영역-->
            <CCol md="3">
              <CInputGroup>
                <CInputGroupText id="addon-ordr-name-1">제품명</CInputGroupText>
                <CFormInput
                  v-model="ordrName1"
                  aria-label="Rsc-ordr-name-1"
                  aria-describedby="addon-ordr-name-1"
                />
              </CInputGroup>

              <h6 class="fw-semibold mb-2">3번영역: Form형태의 상세정보</h6>
              <p>제품명/제품코드/option/규격/등록일</p>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CContainer>
</template>

<script setup>
import { ref } from 'vue'

const ordrName1 = ref('')
</script>
