//생산계획
const prodPlanSelect =
  // 생산계획 모달 마스터 검색쿼리
  `SELECT  
 ae.prod_plan_id,
 a.prod_plan_nm,
 a.prod_expc_fr_dt,
 a.prod_expc_to_dt,
 a.reg_dt 
FROM prod_plan a
JOIN (SELECT 
 a.prod_plan_id
 ,a.prod_plan_deta_id
 ,a.prdt_id
 ,a.prdt_opt_id
 ,a.plan_qy
 ,a.priort
 ,a.rm
 ,SUM(b.drct_qy) "drct_qy" 
FROM prod_plan_deta a
JOIN prod_drct_deta b
ON a.prod_plan_deta_id = b.prod_plan_deta_id
GROUP BY a.prod_plan_id ,a.prod_plan_deta_id ,a.prdt_id ,a.prdt_opt_id ,a.plan_qy ,a.priort ,a.rm
HAVING a.plan_qy > SUM(b.drct_qy) ) ae
WHERE a.prod_plan_id = ae.prod_plan_id
AND prod_plan_nm LIKE CONCAT('%', ?, '%')
AND reg_dt >= ?
AND prod_expc_fr_dt >= ?
AND (
  prod_expc_to_dt IS NULL
  OR prod_expc_to_dt <= ?
)`;

const prodPlanDetaSelect =
  // 생산계획 모달 디테일 검색쿼리
  `SELECT 
 a.prod_plan_id
 ,a.prod_plan_deta_id
 ,a.prdt_id
 ,a.prdt_opt_id
 ,a.plan_qy
 ,SUM(b.drct_qy) "base_quantity" 
 ,a.priort
 ,c.prdt_nm
 ,c.spec
 ,c.unit
 ,d.opt_nm  
FROM prod_plan_deta a
JOIN prod_drct_deta b
ON a.prod_plan_deta_id = b.prod_plan_deta_id
JOIN prdt c
ON a.prdt_id = c.prdt_id
JOIN prdt_opt d
ON a.prdt_opt_id = d.prdt_opt_id
WHERE a.prod_plan_id = ?
GROUP BY a.prod_plan_id ,a.prod_plan_deta_id ,a.prdt_id ,a.prdt_opt_id ,a.plan_qy ,a.priort ,a.rm ,c.prdt_nm ,c.spec ,c.unit ,d.opt_nm
HAVING a.plan_qy > SUM(b.drct_qy)`;

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

const prodPlanRealModalMasterSearch =
  // 생산계획관리 생산계획모달 마스터 조회페이지
  `select
 prod_plan_id
 ,rcvord_id
 ,emp_id
 ,prod_plan_nm
 ,prod_expc_fr_dt
 ,prod_expc_to_dt
 ,reg_dt
 ,rm
from prod_plan
where prod_plan_nm LIKE CONCAT('%', ?,'%')
AND reg_dt >= ?
AND prod_expc_fr_dt >= ?
AND (
  prod_expc_to_dt IS NULL
  OR prod_expc_to_dt <= ?
)`;

const prodPlanRealModalDetaSearch =
  // 생산계획관리 생산계획모달 상세 조회페이지
  `select
 a.prod_plan_deta_id
 ,a.prod_plan_id
 ,a.prdt_id
 ,a.prdt_opt_id
 ,d.prdt_nm
 ,d.spec
 ,d.unit
 ,e.opt_nm
 ,a.plan_qy
 ,a.priort
 ,a.rm
 ,c.paprd_dt
from prod_plan_deta a
join prod_plan b
on a.prod_plan_id = b.prod_plan_id
join rcvord_deta c
on b.rcvord_id = c.rcvord_id
and a.prdt_id = c.prdt_id
and a.prdt_opt_id = c.prdt_opt_id
join prdt d
on a.prdt_id = d.prdt_id
join prdt_opt e
on a.prdt_opt_id = e.prdt_opt_id
where a.prod_plan_id = ?`;

module.exports = {
  prodPlanSelect,
  prodPlanDetaSelect,
  prodPlanBoardListSearch,
  prodPlanRealModalMasterSearch,
  prodPlanRealModalDetaSearch,
};
