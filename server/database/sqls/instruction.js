//생산지시 관련 쿼리
const instructionInsert =
  //
  `INSERT INTO prod_drct (
  prod_drct_id, 
  prod_drct_nm, 
  emp_id, 
  prod_drct_fr_dt, 
  prod_drct_to_dt, 
  reg_dt, 
  rm)
VALUES (?, ?, ?, ?, ?, ?, ?)`;

const prodDrctIdCreate =
  //
  `SELECT CONCAT('DRCT', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(prod_drct_id, -3)),0) + 1, 3, '0'))) "prod_drct_id"
FROM prod_drct
WHERE SUBSTR(prod_drct_id, 5, 4) = DATE_FORMAT(NOW(), '%y%m')
FOR UPDATE`;

const instructionInsertDetail =
  //
  `INSERT INTO prod_drct_deta (
  prod_drct_deta_id,
  prod_drct_id,
  prod_plan_deta_id,
  prdt_id,
  prdt_opt_id,
  drct_qy,
  priort,
  rm
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

const prodDrctDetaIdCreate =
  //
  `SELECT CONCAT('DRCT_DETA', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(prod_drct_deta_id, -3)),0) + 1, 3, '0'))) "prod_drct_deta_id"
FROM prod_drct_deta
WHERE SUBSTR(prod_drct_deta_id, 10, 4) = DATE_FORMAT(NOW(), '%y%m')
FOR UPDATE`;

module.exports = {
  instructionInsert,
  instructionInsertDetail,
  prodDrctIdCreate,
  prodDrctDetaIdCreate,
};
