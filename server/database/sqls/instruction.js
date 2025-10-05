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

const prcsProgPreconIdCreate =
  // 공정진행현황 ID 생성
  `SELECT CONCAT('PRCS_PROG', CONCAT(DATE_FORMAT(NOW(), '%y%m'),LPAD(IFNULL(MAX(SUBSTR(prcs_prog_precon_id, -3)),0) + 1, 3, '0'))) "prcs_prog_precon_id"
FROM prcs_prog_precon
WHERE SUBSTR(prcs_prog_precon_id, 10, 4) = DATE_FORMAT(NOW(), '%y%m')
FOR UPDATE`;

const prcsSelect =
  // 제품ID,옵션ID로 라우팅과 공정열람 
  `SELECT  
 b.prcs_ord,
 c.prcs_id,
 c.prcs_nm
FROM routing a
JOIN routing_deta b
ON a.prcs_routing_id = b.prcs_routing_id
JOIN prcs c
ON b.prcs_id = c.prcs_id
WHERE a.prdt_id = ?
AND a.opt_id = ?
AND b.prcs_ord = 1`;

const prcsProgPreconInsert =
  // 공정진행현황 정보입력 
  `INSERT INTO prcs_prog_precon (
  prcs_prog_precon_id,
  prod_drct_deta_id,
  prcs_ord,
  prcs_id,
  prcs_nm,
  drct_qy,
  inpt_qy,
  st,
  rm
  )
  VALUES (?, ?, ?, ?, ?, ?, 0, '사용', ?)`;




module.exports = {
  instructionInsert,
  instructionInsertDetail,
  prodDrctIdCreate,
  prodDrctDetaIdCreate,
  prcsProgPreconIdCreate,
  prcsSelect,
  prcsProgPreconInsert,
};
