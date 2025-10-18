// 품질기준항목

// 자재 품질항목 검사항목조회
const selectRscOrdrDeta = `
SELECT 
 b.insp_item_nm,
 b.basi_val,
 b.qlty_item_mng_id,
 b.eror_scope_min,
 b.eror_scope_max
FROM qlty_item_deta a
JOIN qlty_item b
ON a.qlty_item_mng_id = b.qlty_item_mng_id
WHERE b.st = 'P1'
AND a.rsc_id = ?`;

// 제품 품질항목 검사항목조회
const prdtQltyDeta = `
SELECT 
 b.insp_item_nm,
 b.basi_val,
 b.qlty_item_mng_id,
 b.eror_scope_min,
 b.eror_scope_max
FROM qlty_item_deta a
JOIN qlty_item b
ON a.qlty_item_mng_id = b.qlty_item_mng_id
WHERE b.st = 'P1'
AND a.prdt_id = ?
AND a.prdt_opt_id = ?`;

//자재 품질 검사 테이블 조회
const rscQltyBoardList = `
SELECT
 a.rsc_qlty_insp_id,
 a.rsc_ordr_deta_id,
 a.emp_id,
 b.emp_nm,
 f.co_nm,
 d.rsc_nm,
 d.unit,
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
AND a.insp_dt >= ?
AND c.rsc_id LIKE CONCAT('%',? ,'%')`;

// 완제품 품질검사 관리 조회
const endPrdtQltyBoardList = `
SELECT 
 b.emp_nm,
 c.pass_qy "bePass_qy",
 a.prcs_ctrl_id,
 a.end_prdt_qlty_insp_id,
 a.insp_qy,
 a.pass_qy,
 a.infer_qy,
 a.insp_dt,
 a.rm,
 e.prdt_id,
 e.prdt_opt_id,
 f.prdt_nm,
 f.unit,
 g.opt_nm
FROM end_prdt_qlty_insp a
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
JOIN prdt_opt g
ON e.prdt_opt_id = g.prdt_opt_id 
WHERE b.emp_nm LIKE CONCAT('%',? ,'%')
AND a.insp_dt >= ?
AND e.prdt_id LIKE CONCAT('%',? ,'%')
AND e.prdt_opt_id LIKE CONCAT('%',? ,'%')`;

// 반제품 품질검사 관리 조회
const semiPrdtQltyBoardList = `
SELECT 
 b.emp_nm,
 c.pass_qy "bePass_qy",
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
AND a.insp_dt >= ?
AND e.prdt_id LIKE CONCAT('%',? ,'%')
AND e.prdt_opt_id LIKE CONCAT('%',? ,'%')`;

module.exports = {
  selectRscOrdrDeta,
  prdtQltyDeta,
  rscQltyBoardList,
  endPrdtQltyBoardList,
  semiPrdtQltyBoardList,
};
