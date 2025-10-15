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

module.exports = {
  selectRscOrdrDeta,
  prdtQltyDeta,
};
