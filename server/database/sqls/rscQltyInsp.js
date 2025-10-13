//자재품질검수

//자재발주서 조회
const rscOrdrQltyList = `
SELECT
 a.rsc_nm,
 b.qy,
 d.emp_nm,
 d.emp_id,
 e.co_nm,
 c.reg_dt,
 a.rsc_id,
 b.rsc_ordr_deta_id
FROM rsc a
JOIN rsc_ordr_deta b
ON a.rsc_id = b.rsc_id
JOIN rsc_ordr c
ON b.rsc_ordr_id = c.rsc_ordr_id
JOIN emp d
ON c.emp_id = d.emp_id
JOIN co e
ON c.co_id = e.co_id
WHERE a.rsc_nm LIKE CONCAT('%', ?, '%')
AND b.qy > ?
AND d.emp_nm LIKE CONCAT('%', ?, '%')
AND e.co_nm LIKE CONCAT('%', ?, '%')
AND c.reg_dt >= ?
ORDER BY c.reg_dt DESC`;

//자재 품질 검수 ID생성 쿼리
const rscQltyInspCreateId = `
SELECT CONCAT('RSC_QLTY_INSP', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(rsc_qlty_insp_id, -3)),0) + 1, 3, '0'))) "rsc_qlty_insp_id"
FROM rsc_qlty_insp
WHERE SUBSTR(rsc_qlty_insp_id, 14, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

//자재 품질 검수 인서트쿼리
const rscQltyInspInsert = `
INSERT INTO rsc_qlty_insp(
 rm,
 rsc_ordr_deta_id,
 emp_id,
 rtngud_qy,
 pass_qy,
 insp_qy,
 insp_dt,
 rsc_qlty_insp_id)
VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

//자재 품질 검사 테이블 조회
const rscQltyInspSelect = `
SELECT
 a.rsc_qlty_insp_id,
 a.rsc_ordr_deta_id,
 a.emp_id,
 b.emp_nm,
 f.co_nm,
 d.rsc_nm,
 c.rsc_id,
 c.qy,
 a.insp_qy,
 a.pass_qy,
 a.rtngud_qy,
 a.insp_dt,
 a.rm
FROM rsc_qlty_insp a
JOIN emp b
ON a.emp_id = b.emp_id
JOIN rsc_ordr_deta c
ON a.rsc_ordr_deta_id = c.rsc_ordr_deta_id
JOIN rsc d
ON c.rsc_id = d.rsc_id
JOIN rsc_ordr e
ON c.rsc_ordr_id = e.rsc_ordr_id
JOIN co f
ON e.co_id = f.co_id
WHERE b.emp_nm LIKE CONCAT('%', ?, '%')
AND a.insp_dt >= ?`;

//자재 품질 검사 테이블 수정
const rscQltyInspUpdate = `
UPDATE rsc_qlty_insp
SET
 rm = ?,
 rsc_ordr_deta_id = ?,
 emp_id = ?,
 rtngud_qy = ?,
 pass_qy = ?,
 insp_qy = ?,
 insp_dt = ?
WHERE rsc_qlty_insp_id = ?
`;

//자재 품질 검사 테이블 삭제
const rscQltyInspDelete = `
DELETE
FROM rsc_qlty_insp
WHERE rsc_qlty_insp_id = ?
`;

module.exports = {
  rscOrdrQltyList,
  rscQltyInspCreateId,
  rscQltyInspInsert,
  rscQltyInspSelect,
  rscQltyInspUpdate,
  rscQltyInspDelete,
};
