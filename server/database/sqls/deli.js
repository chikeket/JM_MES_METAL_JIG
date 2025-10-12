// 납품 목록(모달) 조회: 검색어가 비어있으면 전체, 있으면 LIKE 검색
const deliModalFind = `
SELECT d.deli_id, e.emp_nm, d.deli_dt, d.rm
FROM deli d
JOIN emp e ON e.emp_id = d.emp_id
WHERE (? = '' OR d.deli_id LIKE CONCAT('%', ?, '%'))
ORDER BY d.deli_id DESC`;

// 납품 헤더 단건
const deliFindHeader = `
SELECT d.deli_id, d.emp_id, e.emp_nm, d.deli_dt, d.rm
FROM deli d
JOIN emp e ON e.emp_id = d.emp_id
WHERE d.deli_id = ?`;

// 납품 상세 라인: 선택한 납품서의 deli_id 기준으로, 관련 수주/제품 라인 정보를 전개
// 설명:
//  - 한 납품서(deli_id)에 포함된 deli_deta들(dd)을 기반으로 해당 수주(rcvord)와 제품 라인(rcvord_deta)까지 조인
//  - 기납품 수량(doc_delivered_qty)은 동일 납품서(deli_id) 내 deli_qy 합계를 rcvord_id 단위로 산출하여 라인별로 보여줌
const deliFindLines = `
WITH delivered AS (
  SELECT deli_id, rcvord_id, SUM(deli_qy) AS doc_delivered_qty
  FROM deli_deta
  WHERE deli_id = ?
  GROUP BY deli_id, rcvord_id
)
SELECT 
  rd.rcvord_id,
  c.co_nm,
  p.prdt_nm,
  o.opt_nm,
  p.spec,
  p.unit,
  rd.rcvord_qy AS total_req_qty,
  IFNULL(d.doc_delivered_qty, 0) AS delivered_qty,
  GREATEST(rd.rcvord_qy - IFNULL(d.doc_delivered_qty, 0), 0) AS remaining_qty,
  h.rm AS deli_rm
FROM deli_deta dd
JOIN rcvord r ON r.rcvord_id = dd.rcvord_id
JOIN co c ON c.co_id = r.co_id
JOIN rcvord_deta rd ON rd.rcvord_id = dd.rcvord_id
JOIN prdt p ON p.prdt_id = rd.prdt_id
JOIN prdt_opt o ON o.prdt_opt_id = rd.prdt_opt_id
JOIN deli h ON h.deli_id = dd.deli_id
LEFT JOIN delivered d ON d.deli_id = dd.deli_id AND d.rcvord_id = rd.rcvord_id
WHERE dd.deli_id = ?
ORDER BY rd.rcvord_id, p.prdt_nm, o.opt_nm`;

module.exports = { deliModalFind, deliFindHeader, deliFindLines };
