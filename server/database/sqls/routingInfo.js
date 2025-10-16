// 공정전체조회
// 공정명(PK), 설비그룹ID(FK), 리드타임, 금형사용유무, 공정등록일, 공정순서

const selectPrcs = `
SELECT DISTINCT
   p.prcs_id,
   p.prcs_nm, 
   eg.eqm_grp_nm, 
   p.lead_tm, 
   p.mold_use_at,
   rd.prcs_reg_dt,
   rd.prcs_ord
FROM prdt pd 
JOIN routing r ON r.prdt_id = pd.prdt_id
JOIN routing_deta rd ON r.prcs_routing_id = rd.prcs_routing_id
JOIN prcs p ON p.prcs_id = rd.prcs_id
JOIN eqm_grp eg ON p.eqm_grp_id = eg.eqm_grp_id
where pd.prdt_id = ?`;

module.exports = {
  selectPrcs,
};
// └───공정조회 SQL 쿼리 모듈───┘
