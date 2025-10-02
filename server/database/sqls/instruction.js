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

const instructionInsertDetail =
  //
  `INSERT INTO prod_drct_deta (
  prod_drct_id,
  prod_plan_deta_id,
  prdt_id,
  prdt_opt_id,
  drct_qy,
  priort,
  rm
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)`;

module.exports = {
  instructionInsert,
  instructionInsertDetail,
};
