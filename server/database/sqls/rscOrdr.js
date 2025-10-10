// Table : rsc_ordr <자재 발주>

const selectRscOrdrList = `
SELECT
  c.RSC_ORDR_ID AS rsc_ordr_id,
  COALESCE(c.RM, '') AS rsc_ordr_nm,
  e.co_nm AS co_nm,
  d.emp_nm AS emp_nm,
  c.reg_dt AS reg_dt
FROM rsc_ordr c
LEFT JOIN co e ON c.co_id = e.co_id
LEFT JOIN emp d ON c.emp_id = d.emp_id
LEFT JOIN rsc_ordr_deta b ON c.RSC_ORDR_ID = b.rsc_ordr_id
LEFT JOIN rsc a ON b.rsc_id = a.rsc_id
WHERE (? IS NULL OR c.RM LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR e.co_nm LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR d.emp_nm LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR c.reg_dt >= ?)
GROUP BY c.RSC_ORDR_ID
ORDER BY c.reg_dt DESC
LIMIT 500
`;


// 상세 조회 (발주서 아이디로 상세 리스트 반환)
const selectRscOrdrDeta = `
SELECT
  b.rsc_ordr_deta_id,
  b.rsc_ordr_id,
  b.rsc_id,
  a.rsc_nm,
  b.qy,
  b.rm,
  a.spec,
  a.unit AS rsc_unit
FROM rsc_ordr_deta b
LEFT JOIN rsc a ON b.rsc_id = a.rsc_id
WHERE b.rsc_ordr_id = ?
`;


// master insert
const insertRscOrdr = `
INSERT INTO rsc_ordr (
  rsc_ordr_id,
  co_id,
  emp_id,
  reg_dt,
  rm
) VALUES (?, ?, ?, ?, ?)
`;

// detail insert
const insertRscOrdrDeta = `
INSERT INTO rsc_ordr_deta (
  rsc_ordr_deta_id,
  rsc_ordr_id,
  rsc_id,
  qy,
  rm
) VALUES (?, ?, ?, ?, ?)
`;

// delete detail by order id
const deleteRscOrdrDetaByOrdr = `
DELETE FROM rsc_ordr_deta WHERE rsc_ordr_id = ?
`;

// delete master
const deleteRscOrdr = `
DELETE FROM rsc_ordr WHERE rsc_ordr_id = ?
`;

module.exports = {

  selectRscOrdrList,
  selectRscOrdrDeta,
  insertRscOrdr,
  insertRscOrdrDeta,
  deleteRscOrdrDetaByOrdr,
  deleteRscOrdr,

};
