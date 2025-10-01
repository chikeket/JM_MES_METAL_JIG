<script setup>
import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormSelect,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

const ProductSearchModal = ({ visible, onClose }) => {
  const [searchCode, setSearchCode] = useState('')
  const [searchText, setSearchText] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = () => {
    // 여기에 실제 검색 로직 또는 API 호출 추가
    setResults([
      {
        code: 'a_red_030',
        name: '메탈지그A',
        spec: '30',
        color: '빨간색',
      },
    ])
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>제품 검색</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="d-flex gap-2 mb-3">
          <CFormSelect
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">코드</option>
            <option value="PRDT_ID">제품코드</option>
            <option value="PRDT_NM">제품명</option>
          </CFormSelect>
          <CFormInput
            placeholder="검색어 입력"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <CButton onClick={handleSearch}>검색</CButton>
        </div>

        <CTable bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>코드</CTableHeaderCell>
              <CTableHeaderCell>제품명</CTableHeaderCell>
              <CTableHeaderCell>규격</CTableHeaderCell>
              <CTableHeaderCell>색상</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {results.map((item, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{item.code}</CTableDataCell>
                <CTableDataCell>{item.name}</CTableDataCell>
                <CTableDataCell>{item.spec}</CTableDataCell>
                <CTableDataCell>{item.color}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          닫기
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ProductSearchModal
</script>
