//반제품 품질 실적대기완제품 조회 (endPrdtQltyInspModal.vue모달검색조회쿼리)
const waitingSemiPrdt = `
select 
 a.prcs_ctrl_id
 ,a.prcs_prog_precon_id 
 ,a.prcs_ord
 ,a.pass_qy - d.end_insp_qy "bePass_qy"
 ,a.wk_to_dt
 ,e.prdt_nm
 ,f.opt_nm
 ,b.prdt_id
 ,b.prdt_opt_id
from proc_ctrl a
join (
		select 
		 a.prcs_prog_precon_id 
		 ,b.prdt_id
		 ,b.prdt_opt_id 
		from prcs_prog_precon a
		join (
				select
				 prdt_id
				 ,prdt_opt_id
				 ,prod_drct_deta_id
				from prod_drct_deta) b
		on a.prod_drct_deta_id = b.prod_drct_deta_id) b
on a.prcs_prog_precon_id = b.prcs_prog_precon_id
join (
		SELECT
		 a.prdt_id,
		 a.prdt_opt_id,
		 MAX(b.prcs_ord) "prcs_ord"
		FROM routing a
		JOIN routing_deta b
		ON a.prcs_routing_id = b.prcs_routing_id
		GROUP BY a.prdt_id, a.prdt_opt_id) c
on b.prdt_id = c.prdt_id
and b.prdt_opt_id = c.prdt_opt_id
and a.prcs_ord <> c.prcs_ord
join(
		select
		 prcs_ctrl_id
		 ,SUM(insp_qy) "end_insp_qy"
		from semi_prdt_qlty_insp
		group by prcs_ctrl_id) d
on a.prcs_ctrl_id = d.prcs_ctrl_id
and a.pass_qy > d.end_insp_qy
join prdt e
on b.prdt_id = e.prdt_id
join prdt_opt f
on b.prdt_opt_id = f.prdt_opt_id
WHERE e.prdt_nm LIKE CONCAT('%', ?,'%')
AND a.pass_qy > ?
AND a.wk_to_dt >= ?
`;

// 반제품 품질검사 관리 조회
const semiPrdtQltyInspSearch = `
SELECT 
 b.emp_nm,
 c.pass_qy "bePass_qy",
 a.emp_id,
 a.prcs_ctrl_id,
 a.semi_prdt_qlty_insp_id,
 a.insp_qy,
 a.pass_qy,
 a.infer_qy,
 a.insp_dt,
 a.rm,
 e.prdt_id,
 e.prdt_opt_id,
 f.prdt_nm,
 f.unit
 ,g.opt_nm
FROM semi_prdt_qlty_insp a
JOIN emp b
ON a.emp_id = b.emp_id
JOIN proc_ctrl c
ON a.prcs_ctrl_id = c.prcs_ctrl_id
JOIN prcs_prog_precon d
ON c.prcs_prog_precon_id = d.prcs_prog_precon_id
JOIN prod_drct_deta e
ON d.prod_drct_deta_id = e.prod_drct_deta_id
JOIN prdt f
ON e.prdt_id = f.prdt_id
join prdt_opt g
on e.prdt_opt_id = g.prdt_opt_id
WHERE b.emp_nm LIKE CONCAT('%',? ,'%')
AND a.insp_dt >= ?`;

// 반제품 품질검사 항목별 불량수량관리 조회
const semiPrdtQltyInspInferSearch = `
SELECT
 c.insp_item_nm,
 c.basi_val,
 a.qlty_item_mng_id,
 a.semi_prdt_qlty_insp_id,
 c.eror_scope_min,
 c.eror_scope_max,
 a.infer_qy 
FROM semi_prdt_qlty_insp_infer_qy a
JOIN qlty_item c
ON a.qlty_item_mng_id = c.qlty_item_mng_id
WHERE c.st = 'P1'
AND a.semi_prdt_qlty_insp_id = ?`;

// 반제품 품질 검수 ID생성 쿼리
const semiPrdtQltyInspCreateId = `
SELECT CONCAT('SEMI_PRDT_QLTY_INSP', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(semi_prdt_qlty_insp_id, -3)),0) + 1, 3, '0'))) "semi_prdt_qlty_insp_id"
FROM semi_prdt_qlty_insp
WHERE SUBSTR(semi_prdt_qlty_insp_id, 20, 4) = DATE_FORMAT(NOW(), '%y%m')`;

const semiPrdtQltyInspInsert = `
INSERT INTO semi_prdt_qlty_insp(
 rm,
 prcs_ctrl_id,
 emp_id,
 infer_qy,
 pass_qy,
 insp_qy,
 insp_dt,
 semi_prdt_qlty_insp_id)
VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

const semiPrdtQltyInspInferInsert = `
INSERT INTO semi_prdt_qlty_insp_infer_qy(
infer_qy
,qlty_item_mng_id
,semi_prdt_qlty_insp_id)
VALUES(?, ?, ?)`;


const semiPrdtQltyInspUpdate = `
UPDATE semi_prdt_qlty_insp
SET
 rm = ?,
 prcs_ctrl_id = ?,
 emp_id = ?,
 infer_qy = ?,
 pass_qy = ?,
 insp_qy = ?,
 insp_dt = ?
WHERE semi_prdt_qlty_insp_id = ?`;

//반제품 품질 검사 불량 수량 테이블 쿼리수정
const semiPrdtQltyInspInferUpdate = `
UPDATE semi_prdt_qlty_insp_infer_qy
SET
 infer_qy = ?
WHERE qlty_item_mng_id = ?
AND semi_prdt_qlty_insp_id = ?
`;

const semiPrdtQltyInspDelete = `
DELETE
FROM semi_prdt_qlty_insp
WHERE semi_prdt_qlty_insp_id = ?`;

module.exports = {
	waitingSemiPrdt,
	semiPrdtQltyInspSearch,
	semiPrdtQltyInspCreateId,
	semiPrdtQltyInspInsert,
	semiPrdtQltyInspUpdate,
	semiPrdtQltyInspDelete,
	semiPrdtQltyInspInferSearch,
	semiPrdtQltyInspInferInsert,
	semiPrdtQltyInspInferUpdate,
};
