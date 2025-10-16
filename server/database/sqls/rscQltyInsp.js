//자재품질검수

//자재발주서 조회
const rscOrdrQltyList = `
select
 c.rsc_nm 
 ,a.qy - COALESCE(b.insp_qy, 0) "qy"
 ,e.emp_nm
 ,e.emp_id
 ,f.co_nm
 ,c.rsc_id
 ,d.reg_dt
 ,a.rsc_ordr_deta_id
from rsc_ordr_deta a
LEFT JOIN (
		select 
		 rsc_ordr_deta_id
		 ,SUM(insp_qy) "insp_qy"
		from rsc_qlty_insp		
		GROUP BY rsc_ordr_deta_id) b
ON a.rsc_ordr_deta_id = b.rsc_ordr_deta_id
JOIN rsc c
ON a.rsc_id = c.rsc_id
JOIN rsc_ordr d
ON a.rsc_ordr_id = d.rsc_ordr_id
JOIN emp e
ON d.emp_id = e.emp_id
JOIN co f
ON d.co_id = f.co_id
WHERE a.qy > COALESCE(b.insp_qy, 0)
AND c.rsc_nm LIKE CONCAT('%', ?, '%')
AND a.qy - COALESCE(b.insp_qy, 0) > ?
AND e.emp_nm LIKE CONCAT('%', ?, '%')
AND f.co_nm LIKE CONCAT('%', ?, '%')
AND d.reg_dt >= ?
ORDER BY d.reg_dt DESC`;

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

//자재 품질 검수 검사항목별 불량수량관리 인서트쿼리
const rscQltyInspInferInsert = `
INSERT INTO rsc_qlty_insp_infer_qy(
infer_qy
,qlty_item_mng_id
,rsc_qlty_insp_id)
VALUES(?, ?, ?)`;

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
 min.min_rtngud_qy AS rtngud_qy,
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
JOIN (
  SELECT rsc_ordr_deta_id, MIN(rtngud_qy) AS min_rtngud_qy
  FROM rsc_qlty_insp
  GROUP BY rsc_ordr_deta_id
) min
ON a.rsc_ordr_deta_id = min.rsc_ordr_deta_id
WHERE b.emp_nm LIKE CONCAT('%', ?, '%')
AND a.insp_dt >= ?`;

//자재품질검수 항목별 불량수량 테이블 불러오는 쿼리
const rscQltyInspInferSearch = `
SELECT
 c.insp_item_nm,
 c.basi_val,
 a.qlty_item_mng_id,
 a.rsc_qlty_insp_id,
 c.eror_scope_min,
 c.eror_scope_max,
 a.infer_qy 
FROM rsc_qlty_insp_infer_qy a
JOIN qlty_item c
ON a.qlty_item_mng_id = c.qlty_item_mng_id
WHERE c.st = 'P1'
AND a.rsc_qlty_insp_id = ?`;

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

//자재 품질 검사 불량 수량 테이블 쿼리수정
const rscQltyInspInferUpdate = `
UPDATE rsc_qlty_insp_infer_qy
SET
 infer_qy = ?
WHERE qlty_item_mng_id = ?
AND rsc_qlty_insp_id = ?
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
  rscQltyInspInferInsert,
  rscQltyInspSelect,
  rscQltyInspInferSearch,
  rscQltyInspUpdate,
  rscQltyInspInferUpdate,
  rscQltyInspDelete,
};
