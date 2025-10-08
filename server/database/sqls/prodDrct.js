const prodDrctMasterSearch =
	// 생산지시서 마스터 조회 
	`SELECT  
 prod_drct_id,
 prod_drct_nm,
 prod_drct_fr_dt,
 prod_drct_to_dt,
 reg_dt
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
						ON a.prod_plan_deta_id = b.prod_plan_deta_id)`;

const prodDrctDetailSearch =
	// 생산지시서 디테일 조회 
	`SELECT 
 a.prod_drct_deta_id,
 a.prod_drct_id,
 a.prod_plan_deta_id,
 a.prdt_id,
 a.prdt_opt_id,
 a.drct_qy,
 a.priort ,
 b.base_quantity,
 c.prdt_id,
 c.prdt_nm,
 c.spec,
 c.unit,
 d.prdt_opt_id
FROM prod_drct_deta a
JOIN (SELECT 
	   prod_plan_deta_id,
	   SUM(drct_qy) "base_quantity"
	  FROM prod_drct_deta
	  WHERE prod_plan_deta_id IN (
								SELECT
								prod_plan_deta_id
								FROM prod_drct_deta
								WHERE prod_drct_id = ?)
	  GROUP BY prod_plan_deta_id) b
ON a.prod_plan_deta_id = b.prod_plan_deta_id
JOIN prdt c
ON a.prdt_id = c.prdt_id
JOIN prdt_opt d
ON c.prdt_id = d.prdt_id
WHERE prod_drct_id = ?
AND c.prdt_st = '사용'
AND d.st = '사용'`;


module.exports = {
	prodDrctMasterSearch,
	prodDrctDetailSearch,
};
