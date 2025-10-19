// 라우팅 마스터 신규 ID 생성 (월별 증가) - 형식: routingYYYYMMNNN
// 라우팅 마스터 신규 ID 생성 (월별 증가) - 형식: routingYYYYMMNNN
const routingNewId = `
  SELECT CONCAT(
           'ROUTING',
           DATE_FORMAT(NOW(), '%Y%m'),
           LPAD(IFNULL(MAX(CAST(SUBSTR(prcs_routing_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')
         ) AS new_id
  FROM routing
  WHERE SUBSTR(prcs_routing_id, 8, 6) = DATE_FORMAT(NOW(), '%Y%m')
`;

// 라우팅 상세 신규 ID 생성 (월별 증가) - 형식: routing_detaYYYYMMNNN
const routingDetaNewId = `
  SELECT CONCAT(
           'ROUTING_DETA',
           DATE_FORMAT(NOW(), '%Y%m'),
           LPAD(IFNULL(MAX(CAST(SUBSTR(prcs_routing_deta_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')
         ) AS new_id
  FROM routing_deta
  WHERE SUBSTR(prcs_routing_deta_id, 13, 6) = DATE_FORMAT(NOW(), '%Y%m')
`;

// 공정전체조회
// 공정명(PK), 설비그룹ID(FK), 리드타임, 금형사용유무, 공정등록일, 공정순서

const selectPrcs = `
SELECT
  rd.prcs_routing_deta_id,
  rd.prcs_routing_id,
  rd.prcs_ord,
  p.prcs_id,
  p.prcs_nm,
  p.lead_tm,
  p.mold_use_at,
  mold_sub.sub_code_nm AS mold_use_at_nm,
  p.st,
  st_sub.sub_code_nm AS st_nm,
  p.rm AS prcs_rm,
  eg.eqm_grp_nm,
  eg.rm AS eqm_grp_rm
FROM routing r
JOIN routing_deta rd ON r.prcs_routing_id = rd.prcs_routing_id
JOIN prcs p ON rd.prcs_id = p.prcs_id
JOIN eqm_grp eg ON p.eqm_grp_id = eg.eqm_grp_id
LEFT JOIN sub_code mold_sub ON p.mold_use_at = mold_sub.sub_code_id
LEFT JOIN sub_code st_sub ON p.st = st_sub.sub_code_id
WHERE r.prdt_id = ?
  AND r.prdt_opt_id = ?
ORDER BY rd.prcs_ord
`;

// 라우팅 페이지 전용: 제품 + 옵션 목록 조회 (prdt_opt 기준, 제품명/옵션명 검색)
const routingPrdtSearch = `
SELECT
  p.prdt_id,
  p.prdt_nm,
  p.spec,
  p.unit,
  p.prdt_st,
  sc.sub_code_nm AS prdt_st_nm,
  p.rm,
  o.prdt_opt_id,
  o.opt_nm,
  o.rm AS opt_rm,
  sc_opt.sub_code_nm AS opt_st_nm
FROM prdt_opt o
JOIN prdt p ON o.prdt_id = p.prdt_id
LEFT JOIN sub_code sc ON sc.sub_code_id = p.prdt_st
LEFT JOIN sub_code sc_opt ON sc_opt.sub_code_id = o.st
WHERE p.prdt_nm LIKE CONCAT('%', ?, '%')
  AND o.opt_nm LIKE CONCAT('%', ?, '%')
`;

// 신규 공정 등록 시 기존 공정 조회용 SQL 쿼리 모듈
const registeredPrcsCheck = `
SELECT 1 
FROM prcs 
WHERE prcs_nm = ? 
LIMIT 1
`;

// 신규 공정 상세 등록 SQL 쿼리 모듈
const insertPrcsDeta = `
INSERT INTO routing_deta (
  prcs_routing_id,
  prcs_id,
  prcs_ord,
  
) VALUES (?, ?, ?, ?)
`;

// 신규 공정 등록 SQL 쿼리 모듈
const insertPrcs = `
INSERT INTO prcs (
  prcs_id,
  prcs_nm,
  eqm_grp_id,
  lead_tm,
  mold_use_at,
  prcs_ord
) VALUES (?, ?, ?, ?, ?, ?)
`;

// 공정 수정 SQL 쿼리 모듈
const updatePrcs = `
UPDATE prcs
SET prcs_ord = ?
WHERE prcs_id = ?
`;

// 공정 삭제 SQL 쿼리 모듈
const deletePrcs = `
DELETE FROM prcs
WHERE prcs_id = ?
`;

module.exports = {
  selectPrcs,
  routingPrdtSearch,
  routingNewId,
  routingDetaNewId,
};
// └───공정조회 SQL 쿼리 모듈───┘
