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

// 제품 품질 상세항목조회 (endPrdtQltyInspModal.vue모달검색조회쿼리)
const endPrdtQltyDeta = `
SELECT 
 b.insp_item_nm,
 b.basi_val,
 b.unit,
 b.eror_scope_min,
 b.eror_scope_max
FROM qlty_item_deta a
JOIN qlty_item b
ON a.qlty_item_mng_id = b.qlty_item_mng_id
WHERE b.st = 'P1'
AND a.prdt_id = ?
AND a.prdt_opt_id = ?`;

module.exports = {
    waitingFinishedPrdt,
    endPrdtQltyDeta,
};