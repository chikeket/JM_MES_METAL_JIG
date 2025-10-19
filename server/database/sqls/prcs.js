// MODAL - 공정조회 SQL 쿼리 모듈
// 공정코드(PK), 공정명, 설비그룹명, 리드타임, 금형사용유무

const selectPrcsModal = `
SELECT DISTINCT
  p.prcs_id,
  p.prcs_nm,
  eg.eqm_grp_nm,
  sc_mold.sub_code_nm AS mold_use_at_nm,
  p.mold_use_at,
  p.lead_tm,
  sc_st.sub_code_nm AS st_nm,
  p.st,
  p.rm
FROM prcs p
JOIN eqm_grp eg ON p.eqm_grp_id = eg.eqm_grp_id
LEFT JOIN sub_code sc_mold ON p.mold_use_at = sc_mold.sub_code_id
LEFT JOIN sub_code sc_st ON p.st = sc_st.sub_code_id
LEFT JOIN routing_deta rd ON p.prcs_id = rd.prcs_id
WHERE p.prcs_id LIKE IFNULL(NULLIF(?, ''), p.prcs_id)
AND p.prcs_nm LIKE IFNULL(CONCAT('%', NULLIF(?, ''), '%'), p.prcs_nm)
AND eg.eqm_grp_nm LIKE IFNULL(CONCAT('%', NULLIF(?, ''), '%'), eg.eqm_grp_nm)
AND p.lead_tm LIKE IFNULL(NULLIF(?, ''), p.lead_tm)
AND p.mold_use_at LIKE IFNULL(NULLIF(?, ''), p.mold_use_at)
ORDER BY p.prcs_id
`;

module.exports = {
  selectPrcsModal,
};
// └───공정조회 SQL 쿼리 모듈───┘
