const prodDrctMasterSearch =
  // 생산지시서 마스터 조회 
  `SELECT  
 a.prod_drct_nm,
 a.prod_drct_fr_dt,
 a.prod_drct_to_dt,
 a.reg_dt,
 b.prod_drct_id,
 SUM(b.drct_qy) "drct_qy",
 c.plan_qy
FROM prod_drct a
JOIN prod_drct_deta b
ON a.prod_drct_id = b.prod_drct_id
JOIN prod_plan_deta c
ON b.prod_plan_deta_id = c.prod_plan_deta_id
WHERE b.prod_plan_deta_id <> 'none'
AND a.prod_drct_nm LIKE CONCAT('%', ?, '%')
AND a.reg_dt >= ?
AND a.prod_drct_fr_dt >= ?
AND a.prod_drct_to_dt <= ?
GROUP BY a.prod_drct_nm, a.prod_drct_fr_dt, a.prod_drct_to_dt, a.reg_dt, b.prod_drct_id, c.plan_qy
HAVING SUM(b.drct_qy) < c.plan_qy
ORDER BY a.reg_dt DESC`;

const prodDrctDetailSearch =
  // 생산지시서 디테일 조회 
  `SELECT  
 a.prod_drct_deta_id,
 a.prod_drct_id,
 a.prod_plan_deta_id,
 a.prdt_id,
 a.prdt_opt_id,
 SUM(a.drct_qy) "drct_qy", 
 b.plan_qy,
 c.prdt_nm,
 c.spec,
 c.unit
FROM prod_drct_deta a
JOIN prod_plan_deta b
ON a.prod_plan_deta_id = b.prod_plan_deta_id
JOIN prdt c
ON a.prdt_id = c.prdt_id
JOIN prdt_opt d
ON c.prdt_id = d.prdt_id
WHERE a.prod_drct_id = ?
AND c.prdt_st = '사용'
AND d.st = '사용'
GROUP BY a.prod_drct_id, a.prod_plan_deta_id, a.prdt_id, a.prdt_opt_id, b.plan_qy, c.prdt_nm, c.spec, c.unit
HAVING SUM(a.drct_qy) < b.plan_qy`;


module.exports = {
  prodDrctMasterSearch,
  prodDrctDetailSearch,
};
