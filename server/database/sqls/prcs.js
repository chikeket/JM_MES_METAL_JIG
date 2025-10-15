const selectPrcsModal = `
SELECT
    p.prcs_id,
    p.prcs_nm,
    eg.eqm_grp_nm,
    rd.lead_tm,
    p.mold_use_at
FROM prcs p
JOIN eqm_grp eg ON p.eqm_grp_id = eg.eqm_grp_id
LEFT JOIN routing_deta rd ON p.prcs_id = rd.prcs_id
WHERE p.prcs_id LIKE IFNULL(NULLIF(?, ''), p.prcs_id)
AND p.prcs_nm LIKE IFNULL(CONCAT('%', NULLIF(?, ''), '%'), p.prcs_nm)
AND eg.eqm_grp_nm LIKE IFNULL(CONCAT('%', NULLIF(?, ''), '%'), eg.eqm_grp_nm)
AND rd.lead_tm LIKE IFNULL(NULLIF(?, ''), rd.lead_tm)
ORDER BY p.prcs_id
`;

module.exports = {
  selectPrcsModal,
};
// └───공정조회 SQL 쿼리 모듈───┘
