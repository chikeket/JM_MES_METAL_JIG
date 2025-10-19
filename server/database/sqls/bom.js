// BOM 마스터 ID 자동생성 (rcvord 스타일)
const bomMasterNewId = `
  SELECT CONCAT('BOM_', DATE_FORMAT(NOW(), '%y%m'),
    LPAD(IFNULL(MAX(CAST(SUBSTR(bom_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')) AS bom_id
  FROM BOM
  WHERE SUBSTR(bom_id, 5, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

// BOM 마스터 전체/조건 조회 (제품명/옵션명 JOIN)
const bomMasterSelect = `
  SELECT 
    bm.bom_id,
    p.prdt_nm,
    o.opt_nm,
    bm.bom_ver,
    bm.valid_fr_dt,
    bm.valid_to_dt,
    bm.st,
    bm.rm
  FROM BOM bm
  LEFT JOIN prdt p ON bm.prdt_id = p.prdt_id
  LEFT JOIN prdt_opt o ON bm.prdt_opt_id = o.prdt_opt_id
  WHERE (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
    AND (? = '' OR o.opt_nm LIKE CONCAT('%', ?, '%'))
    AND (? = '' OR bm.st = ?)
  ORDER BY bm.bom_id DESC
`;

// BOM 마스터 단건
const bomMasterFindById = `
  SELECT * FROM BOM WHERE bom_id = ?
`;

// BOM 마스터 신규
const bomMasterInsert = `
  INSERT INTO BOM (
    bom_id, prdt_id, prdt_opt_id, bom_ver, valid_fr_dt, valid_to_dt, st, rm
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?
  )
`;

// BOM 마스터 수정
const bomMasterUpdate = `
  UPDATE BOM SET
    prdt_id = ?,
    prdt_opt_id = ?,
    bom_ver = ?,
    valid_fr_dt = ?,
    valid_to_dt = ?,
    st = ?,
    rm = ?
  WHERE bom_id = ?
`;

// BOM 마스터 삭제
const bomMasterDelete = `
  DELETE FROM BOM WHERE bom_id = ?
`;

// BOM 디테일 ID 자동생성
const bomDetailNewId = `
  SELECT CONCAT('BOM_DETA_', DATE_FORMAT(NOW(), '%y%m'),
    LPAD(IFNULL(MAX(CAST(SUBSTR(bom_deta_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')) AS bom_deta_id
  FROM BOM
  WHERE SUBSTR(bom_deta_id, 10, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

// BOM 디테일 전체/조건 조회 (BOM_DETA 테이블에서 bom_id로 조회)
const bomDetailSelect = `
  SELECT 
    bd.bom_comp_id, 
    bd.bom_id, 
    bd.rsc_id, 
    r.rsc_nm, 
    bd.unit_id, 
    bd.rec_qy, 
    bd.rm
  FROM BOM_DETA bd
  LEFT JOIN rsc r ON bd.rsc_id = r.rsc_id
  WHERE (? = '' OR bd.bom_id = ?)
  ORDER BY bd.bom_comp_id DESC
`;

// BOM 디테일 단건
const bomDetailFindById = `
  SELECT * FROM BOM_DETA WHERE bom_comp_id = ?
`;

// BOM 디테일 신규
const bomDetailInsert = `
  INSERT INTO BOM_DETA (
    bom_comp_id, bom_id, rsc_id, rsc_nm, unit_id, rec_qty, rm
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?
  )
`;

// BOM 디테일 수정
const bomDetailUpdate = `
  UPDATE BOM_DETA SET
    rsc_id = ?,
    rsc_nm = ?,
    unit = ?,
    bom_qty = ?,
    rmrk = ?
  WHERE bom_comp_id = ?
`;

// BOM 디테일 삭제
const bomDetailDelete = `
  DELETE FROM BOM_DETA WHERE bom_comp_id = ?
`;


module.exports = { 
  bomMasterNewId,
  bomMasterSelect,
  bomMasterFindById,
  bomMasterInsert,
  bomMasterUpdate,
  bomMasterDelete,
  bomDetailNewId,
  bomDetailSelect,
  bomDetailFindById,
  bomDetailInsert,
  bomDetailUpdate,
  bomDetailDelete
}