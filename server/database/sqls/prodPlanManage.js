//생산계획관리 cud 관련
//생산지시 관련 쿼리
const prodPlanManageIdCreate =
  //
  `SELECT CONCAT('PLAN', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(prod_plan_id, -3)),0) + 1, 3, '0'))) "prod_plan_id"
FROM prod_plan
WHERE SUBSTR(prod_plan_id, 5, 4) = DATE_FORMAT(NOW(), '%y%m')
FOR UPDATE`;

const prodPlanManageInsert =
  //
  `INSERT INTO prod_plan (
    rm,
    rcvord_id,
    emp_id, 
    prod_plan_nm, 
    prod_expc_fr_dt, 
    prod_expc_to_dt, 
    reg_dt, 
    prod_plan_id 
  )
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

const prodPlanManageDetaIdCreate =
  //
  `SELECT CONCAT('PLAN_DETA', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(prod_plan_deta_id, -3)),0) + 1, 3, '0'))) "prod_plan_deta_id"
FROM prod_plan_deta
WHERE SUBSTR(prod_plan_deta_id, 10, 4) = DATE_FORMAT(NOW(), '%y%m')
FOR UPDATE`;

const prodPlanManageInsertDetail =
  //
  `INSERT INTO prod_plan_deta (
    rm,    
    prdt_id,
    prdt_opt_id,
    plan_qy,
    priort,
    prod_plan_id,
    prod_plan_deta_id
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)`;

const prodPlanManageUpdate =
  //
  `update prod_plan
set
 rm = ?
 ,rcvord_id = ?
 ,emp_id = ?
 ,prod_plan_nm = ?
 ,prod_expc_fr_dt = ?
 ,prod_expc_to_dt = ?
 ,reg_dt = ?
where prod_plan_id = ?`;

const prodPlanManageUpdateDetail =
  //
  `update prod_plan_deta
set
 rm = ?
 ,prdt_id = ?
 ,prdt_opt_id = ?
 ,plan_qy = ?  
 ,priort = ?  
 ,prod_plan_id = ?
where prod_plan_deta_id = ?`;

module.exports = {
  prodPlanManageIdCreate,
  prodPlanManageInsert,
  prodPlanManageDetaIdCreate,
  prodPlanManageInsertDetail,
  prodPlanManageUpdate,
  prodPlanManageUpdateDetail,
};
