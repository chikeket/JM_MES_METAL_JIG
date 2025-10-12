// 테이블: rsc_ordr <자재 발주> 관련 SQL 쿼리들

// 자재 발주서 목록 조회 (마스터 정보 + 상세 건수)
const selectRscOrdrList = `
SELECT
  c.RSC_ORDR_ID AS rsc_ordr_id,
  COALESCE(c.RM, '') AS rsc_ordr_nm,
  c.co_id AS co_id,
  e.co_nm AS co_nm,
  d.emp_nm AS emp_nm,
  DATE_FORMAT(c.reg_dt, '%Y-%m-%d') AS reg_dt,
  COUNT(b.rsc_ordr_deta_id) AS deta_count
FROM rsc_ordr c
LEFT JOIN co e ON c.co_id = e.co_id
LEFT JOIN emp d ON c.emp_id = d.emp_id
LEFT JOIN rsc_ordr_deta b ON c.RSC_ORDR_ID = b.rsc_ordr_id
LEFT JOIN rsc a ON b.rsc_id = a.rsc_id
WHERE (? IS NULL OR c.RM LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR e.co_nm LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR d.emp_nm LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR c.reg_dt >= ?)
  AND (? IS NULL OR c.emp_id = ?)
GROUP BY c.RSC_ORDR_ID
ORDER BY c.reg_dt DESC
LIMIT 500
`;


// 자재 발주서 상세 조회 (발주서 ID로 상세 리스트 반환)
const selectRscOrdrDetailList = `
SELECT
  b.rsc_ordr_deta_id AS rsc_ordr_deta_id,
  b.rsc_ordr_id      AS rsc_ordr_id,
  b.rsc_id           AS rsc_id,
  a.rsc_nm           AS rsc_nm,
  b.qy               AS qy,
  b.rm               AS rm,
  a.spec             AS spec,
  a.unit             AS rsc_unit
FROM rsc_ordr_deta b
LEFT JOIN rsc a ON b.rsc_id = a.rsc_id
WHERE b.rsc_ordr_id = ?
`;


// 마스터 등록 (신규 발주서 생성)
const insertRscOrdr = `
INSERT INTO rsc_ordr (
  rsc_ordr_id,
  co_id,
  emp_id,
  reg_dt,
  rm
) VALUES (?, ?, ?, ?, ?)
`;

// 마스터 존재 여부 확인
const existsRscOrdr = `
SELECT 1 FROM rsc_ordr WHERE rsc_ordr_id = ? LIMIT 1
`;

// 마스터 수정
const updateRscOrdr = `
UPDATE rsc_ordr
SET co_id = ?,
    emp_id = ?,
    reg_dt = COALESCE(?, reg_dt),
    rm = ?
WHERE rsc_ordr_id = ?
`;

// 상세 등록 (자재 발주 상세 항목 추가)
const insertRscOrdrDeta = `
INSERT INTO rsc_ordr_deta (
  rsc_ordr_deta_id,
  rsc_ordr_id,
  rsc_id,
  qy,
  rm
) VALUES (?, ?, ?, ?, ?)
`;

// 발주서별 상세 일괄 삭제
const deleteRscOrdrDetaByOrdr = `
DELETE FROM rsc_ordr_deta WHERE rsc_ordr_id = ?
`;

// 마스터 삭제
const deleteRscOrdr = `
DELETE FROM rsc_ordr WHERE rsc_ordr_id = ?
`;

// 상세 개별 삭제 (ID로 특정 상세 항목 삭제)
const deleteRscOrdrDetaById = `
DELETE FROM rsc_ordr_deta WHERE rsc_ordr_deta_id = ?
`;

// ID 생성기들 (년월 순번 형태로 자동 생성)
// 발주서 ID 자동 생성 (예: RSC_ORDR2501001)
const rscOrdrCreateId = `
SELECT CONCAT('RSC_ORDR', CONCAT(DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(rsc_ordr_id, -3)), 0) + 1, 3, '0'))) "rsc_ordr_id"
FROM rsc_ordr
WHERE SUBSTR(rsc_ordr_id, 9, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

// 발주서 상세 ID 자동 생성 (예: RSC_ORDR_DETA2501001)
const rscOrdrDetaCreateId = `
SELECT CONCAT('RSC_ORDR_DETA', CONCAT(DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(rsc_ordr_deta_id, -3)), 0) + 1, 3, '0'))) "rsc_ordr_deta_id"
FROM rsc_ordr_deta
WHERE SUBSTR(rsc_ordr_deta_id, 14, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

module.exports = {

  selectRscOrdrList,
  selectRscOrdrDetailList,
  insertRscOrdr,
  existsRscOrdr,
  updateRscOrdr,
  insertRscOrdrDeta,
  deleteRscOrdrDetaByOrdr,
  deleteRscOrdr,
  deleteRscOrdrDetaById,
  rscOrdrCreateId,
  rscOrdrDetaCreateId,

};
