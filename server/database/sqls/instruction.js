//생산지시 관련 쿼리
const instructionInsert =
  //
  `INSERT INTO prod_drct (
    rm,
    prod_drct_nm, 
    emp_id, 
    prod_drct_fr_dt, 
    prod_drct_to_dt, 
    reg_dt, 
    prod_drct_id 
  )
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
    rm,
    prod_drct_id,
    prod_plan_deta_id,
    prdt_id,
    prdt_opt_id,
    drct_qy,
    priort,
    prod_drct_deta_id
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
AND a.prdt_opt_id = ?`;

const prcsProgPreconInsert =
  // 공정진행현황 정보입력
  `INSERT INTO prcs_prog_precon (
    rm,
    prod_drct_deta_id,
    prcs_ord,
    prcs_id,
    prcs_nm,
    drct_qy,
    inpt_qy,
    st,
    prcs_prog_precon_id
  )
  VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`;

const instructionUpdate =
  // 생산지시마스터 수정(업데이트)
  `UPDATE prod_drct
  SET    
    rm = ?,
    prod_drct_nm = ?, 
    emp_id = ?, 
    prod_drct_fr_dt = ?, 
    prod_drct_to_dt = ?, 
    reg_dt = ?
  WHERE prod_drct_id = ?`;

const instructionDetaUpdate =
  // 생산지시디테일 수정
  `UPDATE prod_drct_deta
SET  
  rm = ?,
  prod_drct_id = ?,
  prod_plan_deta_id = ?,
  prdt_id = ?,
  prdt_opt_id = ?,
  drct_qy = ?,
  priort = ?
WHERE prod_drct_deta_id = ?`;

const prcsProgPreconIdSearch =
  // 공정진행현황 ID 검색
  `SELECT prcs_prog_precon_id
FROM prcs_prog_precon
WHERE prod_drct_deta_id = ?
ORDER BY prcs_ord ASC
LIMIT 1`;

const prcsProgPreconUpdate =
  // 공정진행현황 수정
  `UPDATE prcs_prog_precon 
SET
  rm = ? ,
  prod_drct_deta_id = ? ,
  prcs_ord = ? ,
  prcs_id = ? ,
  prcs_nm = ? ,
  drct_qy = ? ,
  inpt_qy = 0 ,
  st = ?  
WHERE prcs_prog_precon_id = ?`;

const instructionDelete =
  // 생산지시삭제
  `DELETE 
FROM prod_drct
WHERE prod_drct_id = ?`;

module.exports = {
  instructionInsert,
  instructionInsertDetail,
  prodDrctIdCreate,
  prodDrctDetaIdCreate,
  prcsProgPreconIdCreate,
  prcsSelect,
  prcsProgPreconInsert,
  instructionUpdate,
  instructionDetaUpdate,
  prcsProgPreconIdSearch,
  prcsProgPreconUpdate,
  instructionDelete,
};
