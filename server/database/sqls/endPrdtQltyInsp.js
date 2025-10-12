//완제품 품질 실적대기완제품 조회 (endPrdtQltyInspModal.vue모달검색조회쿼리)
const waitingFinishedPrdt = `
SELECT
 a.prcs_ctrl_id,
 a.prdt_id, 
 d.prdt_nm,
 f.prdt_opt_id,
 a.prcs_ord,
 a.pass_qy "bePass_qy",
 a.wk_to_dt,
 a.prcs_routing_id, 
 SUM(c.insp_qy) "beInsp_qy"
FROM proc_ctrl a
JOIN (SELECT
 a.prdt_id,
 a.opt_id,
 MAX(b.prcs_ord) "prcs_ord"
FROM routing a
JOIN routing_deta b
ON a.prcs_routing_id = b.prcs_routing_id
GROUP BY a.prdt_id) b
ON a.prdt_id = b.prdt_id
JOIN end_prdt_qlty_insp c
ON a.prcs_ctrl_id = c.prcs_ctrl_id
JOIN prdt d
ON a.prdt_id = d.prdt_id
JOIN prcs_prog_precon e
ON a.prcs_prog_precon_id = e.prcs_prog_precon_id
JOIN prod_drct_deta f
ON e.prod_drct_deta_id = f.prod_drct_deta_id
WHERE a.prcs_ord = b.prcs_ord
AND f.prdt_opt_id = b.opt_id
AND a.pass_qy > insp_qy
AND d.prdt_nm LIKE CONCAT('%',? ,'%')
AND a.pass_qy > ?
AND a.wk_to_dt >= ?
GROUP BY a.prcs_ctrl_id, a.prdt_id, d.prdt_nm, f.prdt_opt_id, a.prcs_ord, a.pass_qy, a.wk_to_dt, a.prcs_routing_id
`;

// 완제품 품질검사 관리 조회
const endPrdtQltyInspSearch = `
SELECT 
 b.emp_nm,
 c.pass_qy "qy",
 a.prcs_ctrl_id,
 a.end_prdt_qlty_insp_id,
 a.insp_qy,
 a.pass_qy,
 a.infer_qy,
 a.insp_dt,
 a.rm,
 e.prdt_id,
 e.prdt_opt_id,
 f.prdt_nm
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
WHERE b.emp_nm LIKE CONCAT('%',? ,'%')
AND a.insp_dt >= ?`;

// 완제품 품질 검수 ID생성 쿼리
const endPrdtQltyInspCreateId = `
SELECT CONCAT('END_PRDT_QLTY_INSP', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(end_prdt_qlty_insp_id, -3)),0) + 1, 3, '0'))) "end_prdt_qlty_insp_id"
FROM end_prdt_qlty_insp
WHERE SUBSTR(end_prdt_qlty_insp_id, 19, 4) = DATE_FORMAT(NOW(), '%y%m')`;

const endPrdtQltyInspInsert = `
INSERT INTO end_prdt_qlty_insp(
 rm,
 prcs_ctrl_id,
 emp_id,
 infer_qy,
 pass_qy,
 insp_qy,
 insp_dt,
 end_prdt_qlty_insp_id)
VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

const endPrdtQltyInspUpdate = `
UPDATE end_prdt_qlty_insp
SET
 rm = ?,
 prcs_ctrl_id = ?,
 emp_id = ?,
 infer_qy = ?,
 pass_qy = ?,
 insp_qy = ?,
 insp_dt = ?
WHERE end_prdt_qlty_insp_id = ?`;

const endPrdtQltyInspDelete = `
DELETE
FROM end_prdt_qlty_insp
WHERE end_prdt_qlty_insp_id = ?`;

module.exports = {
    waitingFinishedPrdt,
    endPrdtQltyInspSearch,
    endPrdtQltyInspCreateId,
    endPrdtQltyInspInsert,
    endPrdtQltyInspUpdate,
    endPrdtQltyInspDelete,
};