//제품
const prodPlanSelect =
  //
  `SELECT 
 a.prod_plan_id,
 a.prod_plan_nm,
 a.prod_expc_fr_dt,
 a.prod_expc_to_dt,
 a.reg_dt,
 b.prod_plan_deta_id,
 b.prdt_id,
 b.prdt_opt_id,
 b.plan_qy,
 b.priort,
 c.prdt_nm,
 c.spec,
 c.unit,
 d.opt_nm
FROM prod_plan a
JOIN prod_plan_deta b
ON a.prod_plan_id = b.prod_plan_id
JOIN prdt c
ON b.prdt_id = c.prdt_id
JOIN prdt_opt d
ON c.prdt_id = d.prdt_id
WHERE d.st = '사용'
AND a.prod_plan_nm LIKE CONCAT('%', ?, '%')
AND a.reg_dt >= ?
AND a.prod_expc_fr_dt >= ?
AND a.prod_expc_to_dt <= ?`;

module.exports = {
  prodPlanSelect,
};
