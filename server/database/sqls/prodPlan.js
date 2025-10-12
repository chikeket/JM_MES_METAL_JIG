//제품
const prodPlanSelect =
  // 생산계획 모달 마스터 검색쿼리
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
AND (
  prod_expc_to_dt IS NULL
  OR prod_expc_to_dt <= ?
)`;

const prodPlanDetaSelect =
  // 생산계획 모달 디테일 검색쿼리
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
ON a.prdt_opt_id = c.prdt_opt_id
WHERE prod_plan_id = ?`;

const prodPlanBoardListSearch =
  // 생산계획 조회페이지
  `SELECT
 a.prod_plan_id
 ,a.prod_plan_nm
 ,a.rm
 ,c.prdt_nm
 ,d.opt_nm
 ,b.plan_qy
 ,c.unit
 ,b.priort
 ,a.reg_dt
 ,a.prod_expc_fr_dt
 ,a.prod_expc_to_dt
 ,b.rm "rm_deta"
FROM prod_plan a
JOIN prod_plan_deta b
ON a.prod_plan_id = b.prod_plan_id
JOIN prdt c
ON b.prdt_id = c.prdt_id
JOIN prdt_opt d
ON b.prdt_opt_id = d.prdt_opt_id
WHERE a.prod_plan_id LIKE CONCAT('%', ?, '%')
AND a.prod_plan_nm LIKE CONCAT('%', ?, '%')
AND a.prod_expc_fr_dt >= ?
AND a.prod_expc_to_dt <= ?
AND b.prdt_id LIKE CONCAT('%', ?, '%')
AND c.prdt_nm LIKE CONCAT('%', ?, '%')
AND d.opt_nm LIKE CONCAT('%', ?, '%')
AND a.reg_dt >= ?`;

module.exports = {
  prodPlanSelect,
  prodPlanDetaSelect,
  prodPlanBoardListSearch,
};
