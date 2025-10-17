// 설비 테이블 관련 query들

// 설비 전체조회
const eqmFindAll = `SELECT
  eqm_id,
  eqm_grp_id,
  eqm_nm,
  st
FROM eqm
ORDER BY eqm_id`;

// 설비 상세조회
const eqmFindDetail = `SELECT
  eqm_id,
  eqm_grp_id, 
  eqm_nm,
  make_co,
  make_model,
  make_dt,
  chck_cycle,
  setp_dt,
  reg_dt, 
  st,
  rm
FROM eqm
WHERE eqm_id = ?`;

module.exports = {
  eqmFindAll,
  eqmFindDetail,
};
