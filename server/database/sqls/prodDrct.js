const prodDrctMasterSearch =
  // 생산지시서 마스터 조회
  `SELECT  
 prod_drct_id,
 prod_drct_nm,
 prod_drct_fr_dt,
 prod_drct_to_dt,
 reg_dt,
 rm,
 emp_id
FROM prod_drct
WHERE prod_drct_nm LIKE CONCAT('%', ?, '%')
AND reg_dt >= ?
AND prod_drct_fr_dt >= ?
AND (
  prod_drct_to_dt IS NULL
  OR prod_drct_to_dt <= ?)
ORDER BY reg_dt DESC  `;

const prodDrctDetailSearch =
  // 생산지시서 디테일 조회
  `SELECT 
 a.prod_drct_deta_id,
 a.prod_drct_id,
 a.prod_plan_deta_id, 
 a.drct_qy,
 a.priort,
 a.rm,
 CASE 
    WHEN b.plan_qy = 0 THEN a.drct_qy 
    ELSE b.base_quantity 
  END AS base_quantity,
 b.plan_qy, 
 c.prdt_id,
 c.prdt_nm,
 c.spec,
 c.unit,
 d.prdt_opt_id
FROM prod_drct_deta a
JOIN (SELECT 
       a.prod_plan_deta_id,       
       a.prdt_id,
       a.prdt_opt_id,
	   SUM(a.drct_qy) "base_quantity",
       COALESCE(b.plan_qy,0) "plan_qy"
	  FROM prod_drct_deta a
      left JOIN prod_plan_deta b
      ON a.prod_plan_deta_id = b.prod_plan_deta_id
	  WHERE a.prod_plan_deta_id IN (
								SELECT
								prod_plan_deta_id
								FROM prod_drct_deta
								WHERE prod_drct_id = ?)   
	  
GROUP BY a.prdt_id, a.prdt_opt_id, b.plan_qy) b
ON a.prod_plan_deta_id = b.prod_plan_deta_id
JOIN prdt c
ON a.prdt_id = c.prdt_id
JOIN prdt_opt d
ON a.prdt_opt_id = d.prdt_opt_id
and a.prdt_id = d.prdt_id
WHERE prod_drct_id = ?
AND c.prdt_st = 'K1'
AND d.st = 'M1'`;

const prodDrctPlanDetaIdChk =
  //생산 계획상세 유무 확인쿼리
  `select 
 prod_plan_deta_id
from prod_drct_deta
where prod_drct_id = ?`;

const prodDrctNonePlanDetailSearch =
  //생산 지시 즉시발주된 상세내용 확인쿼리
  `select 
 a.prod_drct_deta_id
 ,a.prod_drct_id
 ,a.prod_plan_deta_id
 ,a.drct_qy
 ,a.priort
 ,a.rm
 ,a.drct_qy "base_quantity"
 ,b.prdt_id
 ,b.prdt_nm
 ,b.spec
 ,b.unit
 ,c.prdt_opt_id
from prod_drct_deta a
JOIN prdt b
ON a.prdt_id = b.prdt_id
JOIN prdt_opt c
ON a.prdt_opt_id = c.prdt_opt_id
where prod_drct_id = ?`;

const prodDrctBoardListSearch =
  //생산 지시 조회페이지 다중조회검색 쿼리
  `
select
 a.prod_drct_id
 ,a.prod_drct_nm
 ,b.prod_plan_deta_id
 ,e.emp_nm
 ,a.rm "master_rm"
 ,f.prdt_nm
 ,g.opt_nm
 ,COALESCE(c.plan_qy,0) "plan_qy"
 ,b.drct_qy
 ,d.base_quantity
 ,b.priort
 ,a.reg_dt
 ,a.prod_drct_fr_dt
 ,a.prod_drct_to_dt
 ,a.rm
from prod_drct a
join prod_drct_deta b
on a.prod_drct_id = b.prod_drct_id
left join prod_plan_deta c
on b.prod_plan_deta_id = c.prod_plan_deta_id
and b.prdt_id = c.prdt_id
and b.prdt_opt_id = c.prdt_opt_id
left join (
	select
	  prod_plan_deta_id
	  ,prdt_id
	  ,prdt_opt_id
	  ,SUM(drct_qy) "base_quantity"
	from prod_drct_deta
    group by prod_plan_deta_id, prdt_id,prdt_opt_id) d
on b.prod_plan_deta_id = d.prod_plan_deta_id
and b.prdt_id = d.prdt_id
and b.prdt_opt_id = d.prdt_opt_id
join emp e
on a.emp_id = e.emp_id
join prdt f
on b.prdt_id = f.prdt_id
join prdt_opt g
on b.prdt_opt_id = g.prdt_opt_id
where a.prod_drct_nm LIKE CONCAT('%', ?, '%')
and a.prod_drct_id LIKE CONCAT('%', ?, '%')
and a.prod_drct_fr_dt >= ?
and a.prod_drct_to_dt <= ?
and f.prdt_nm LIKE CONCAT('%', ?, '%')
and g.opt_nm LIKE CONCAT('%', ?, '%')
and e.emp_nm LIKE CONCAT('%', ?, '%')
and a.reg_dt >= ?
order by a.prod_drct_to_dt
`;

module.exports = {
  prodDrctMasterSearch,
  prodDrctDetailSearch,
  prodDrctPlanDetaIdChk,
  prodDrctNonePlanDetailSearch,
  prodDrctBoardListSearch,
};
