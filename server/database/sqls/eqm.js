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

// EQM 신규 ID 생성 (형식: eqmYYYYMMNNN)
const eqmNewId = `
  SELECT CONCAT(
           'eqm',
           DATE_FORMAT(NOW(), '%Y%m'),
           LPAD(IFNULL(MAX(CAST(SUBSTR(eqm_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')
         ) AS new_id
  FROM eqm
  WHERE (
    SUBSTR(eqm_id, 1, 6) = DATE_FORMAT(NOW(), '%Y%m') -- 무접두 형식(YYYYMMNNN)
    OR SUBSTR(eqm_id, 4, 6) = DATE_FORMAT(NOW(), '%Y%m') -- 'eqm' 접두 형식(eqmYYYYMMNNN)
  )
`;

module.exports = {
  eqmFindAll,
  eqmFindDetail,
  eqmNewId,
};
