//제품
const prodPlanSelect =
  //
  `SELECT 
 prod_plan_id,
 prod_plan_nm,
 prod_expc_fr_dt,
 prod_expc_to_dt,
 reg_dt 
FROM prod_plan
WHERE prod_plan_nm LIKE CONCAT('%', ?, '%')
AND reg_dt >= ?
AND prod_expc_fr_dt >= ?
AND prod_expc_to_dt <= ?`;

const prodPlanDetaSelect =
  //
  `SELECT
 a.prod_plan_deta_id,
 a.prod_plan_id,
 a.prdt_id,
 a.prdt_opt_id,
 a.plan_qy,
 a.priort,
 b.prdt_nm,
 b.spec,
 b.unit,
 c.opt_nm
FROM prod_plan_deta a
JOIN prdt b
ON a.prdt_id = b.prdt_id
JOIN prdt_opt c
ON b.prdt_id = c.prdt_id
WHERE prod_plan_id = ?`;

module.exports = {
  prodPlanSelect,
  prodPlanDetaSelect,
};
