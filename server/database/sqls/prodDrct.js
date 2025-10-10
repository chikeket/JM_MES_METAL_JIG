const prodDrctMasterSearch =
	// 생산지시서 마스터 조회 
	`SELECT  
 prod_drct_id,
 prod_drct_nm,
 prod_drct_fr_dt,
 prod_drct_to_dt,
 reg_dt,
 rm
FROM prod_drct
WHERE prod_drct_id IN (
						SELECT DISTINCT a.prod_drct_id
						FROM prod_drct_deta a
						JOIN(
							SELECT 
							 a.prod_plan_deta_id,
							 SUM(a.drct_qy) "drct_qy",
							 b.plan_qy
							FROM prod_drct_deta a
							JOIN prod_plan_deta b
							ON a.prod_plan_deta_id = b.prod_plan_deta_id
							WHERE a.prod_plan_deta_id <> 'none'
							GROUP BY a.prod_plan_deta_id, b.plan_qy
							HAVING SUM(a.drct_qy) < b.plan_qy) b
						ON a.prod_plan_deta_id = b.prod_plan_deta_id)
AND prod_drct_nm LIKE CONCAT('%', ?, '%')
AND reg_dt >= ?
AND prod_drct_fr_dt >= ?
AND (
  prod_drct_to_dt IS NULL
  OR prod_drct_to_dt <= ?
)`;

const prodDrctDetailSearch =
	// 생산지시서 디테일 조회 
	`SELECT 
 a.prod_drct_deta_id,
 a.prod_drct_id,
 a.prod_plan_deta_id, 
 a.drct_qy,
 a.priort,
 a.rm,
 b.base_quantity,
 b.plan_qy, 
 c.prdt_id,
 c.prdt_nm,
 c.spec,
 c.unit,
 d.prdt_opt_id
FROM prod_drct_deta a
JOIN (SELECT 
	   a.prod_plan_deta_id,
	   SUM(a.drct_qy) "base_quantity",
       b.plan_qy
	  FROM prod_drct_deta a
      JOIN prod_plan_deta b
      ON a.prod_plan_deta_id = b.prod_plan_deta_id
	  WHERE a.prod_plan_deta_id IN (
								SELECT
								prod_plan_deta_id
								FROM prod_drct_deta
								WHERE prod_drct_id = ?)
	  GROUP BY a.prod_plan_deta_id, b.plan_qy) b
ON a.prod_plan_deta_id = b.prod_plan_deta_id
JOIN prdt c
ON a.prdt_id = c.prdt_id
JOIN prdt_opt d
ON a.prdt_opt_id = d.prdt_opt_id
WHERE prod_drct_id = ?
AND c.prdt_st = 'K1'
AND d.st = 'M1'`;


module.exports = {
	prodDrctMasterSearch,
	prodDrctDetailSearch,
};
