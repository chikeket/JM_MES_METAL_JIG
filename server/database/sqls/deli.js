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
//  - 스키마 변경 반영: deli_deta는 rcvord_id 대신 rcvord_deta_id를 보유
//  - 전체 기납품 수량(delivered_qty): "현재 문서 등록일시 이전"의 모든 납품서 누계
//  - 현재 문서 납품 수량(doc_delivered_qty): 선택한 deli_id 내 합계
const deliFindLines = `
WITH cur AS (
  SELECT deli_id, deli_dt FROM deli WHERE deli_id = ?
),
delivered AS (
  SELECT dd.rcvord_deta_id, SUM(dd.deli_qy) AS delivered_qty
  FROM deli_deta dd
  JOIN deli dh ON dh.deli_id = dd.deli_id
  JOIN cur c ON 1=1
  WHERE dh.deli_dt < c.deli_dt
  GROUP BY dd.rcvord_deta_id
),
doc AS (
  SELECT deli_id, rcvord_deta_id, SUM(deli_qy) AS doc_delivered_qty
  FROM deli_deta
  WHERE deli_id = ?
  GROUP BY deli_id, rcvord_deta_id
)
SELECT 
  rd.rcvord_id,
  rd.rcvord_deta_id,
  dd.deli_deta_id AS deli_deta_id,
  dd.deli_qy AS doc_line_qty,
  c.co_nm,
  p.prdt_nm,
  o.opt_nm,
  p.spec,
  p.unit,
  rd.rcvord_qy AS total_req_qty,
  IFNULL(delivered.delivered_qty, 0) AS delivered_qty,
  IFNULL(doc.doc_delivered_qty, 0) AS doc_delivered_qty,
  GREATEST(rd.rcvord_qy - IFNULL(delivered.delivered_qty, 0), 0) AS remaining_qty,
  h.rm AS deli_rm
FROM deli_deta dd
JOIN rcvord_deta rd ON rd.rcvord_deta_id = dd.rcvord_deta_id
JOIN rcvord r ON r.rcvord_id = rd.rcvord_id
JOIN co c ON c.co_id = r.co_id
JOIN prdt p ON p.prdt_id = rd.prdt_id
JOIN prdt_opt o ON o.prdt_opt_id = rd.prdt_opt_id
JOIN deli h ON h.deli_id = dd.deli_id
LEFT JOIN delivered ON delivered.rcvord_deta_id = rd.rcvord_deta_id
LEFT JOIN doc ON doc.deli_id = dd.deli_id AND doc.rcvord_deta_id = rd.rcvord_deta_id
WHERE dd.deli_id = ?
ORDER BY rd.rcvord_id, p.prdt_nm, o.opt_nm`;
// 존재 여부
const deliExists = `SELECT 1 FROM deli WHERE deli_id = ? LIMIT 1`;
// 헤더 insert / update / delete
const deliInsert = `INSERT INTO deli (deli_id, emp_id, deli_dt, rm) VALUES (?, ?, ?, ?)`;
const deliUpdate = `UPDATE deli SET emp_id = ?, deli_dt = ?, rm = ? WHERE deli_id = ?`;
const deliDeleteHeader = `DELETE FROM deli WHERE deli_id = ?`;
// 라인 재작성 (전체 삭제 후 다시 insert)
const deliDeleteLines = `DELETE FROM deli_deta WHERE deli_id = ?`;
const deliInsertLine = `INSERT INTO deli_deta (deli_deta_id, deli_id, rcvord_deta_id, deli_qy, rm) VALUES (?, ?, ?, ?, ?)`;
const deliUpdateLine = `UPDATE deli_deta SET rcvord_deta_id = ?, deli_qy = ?, rm = ? WHERE deli_deta_id = ?`;
const deliFindLinesByDoc = `SELECT deli_deta_id, rcvord_deta_id, deli_qy, rm FROM deli_deta WHERE deli_id = ?`;
// 단일 rcvord_deta_id의 전체 기납품 누계 (모든 문서 합계)
const deliDeliveredSumByRcvDeta = `
  SELECT IFNULL(SUM(deli_qy), 0) AS sum_qty
  FROM deli_deta
  WHERE rcvord_deta_id = ?
`;
// 복수 개 rcvord_deta_id에 대한 기납품 누계 조회
const deliDeliveredSumByRcvDetaList = `
  SELECT rcvord_deta_id, IFNULL(SUM(deli_qy), 0) AS sum_qty
  FROM deli_deta
  WHERE rcvord_deta_id IN (?)
  GROUP BY rcvord_deta_id
`;
// 특정 기준일시 이전의 기납품 누계 조회 (복수 ID)
const deliDeliveredSumByRcvDetaListBeforeDt = `
  WITH target AS (
    SELECT ? AS cutoff_dt
  )
  SELECT dd.rcvord_deta_id, IFNULL(SUM(dd.deli_qy), 0) AS sum_qty
  FROM deli_deta dd
  JOIN deli dh ON dh.deli_id = dd.deli_id
  JOIN target t ON 1=1
  WHERE dd.rcvord_deta_id IN (?)
    AND dh.deli_dt < t.cutoff_dt
  GROUP BY dd.rcvord_deta_id
`;
// ID 생성 (월별 증가)
const deliNewId = `
  SELECT CONCAT(
           'DL',
           DATE_FORMAT(NOW(), '%Y%m'),
           LPAD(IFNULL(MAX(CAST(SUBSTR(deli_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')
         ) AS new_id
  FROM deli
  WHERE (
    SUBSTR(deli_id, 1, 6) = DATE_FORMAT(NOW(), '%Y%m')
    OR SUBSTR(deli_id, 3, 6) = DATE_FORMAT(NOW(), '%Y%m')
  )
`;
const deliDetaNewId = `
  SELECT CONCAT(
           'DLD',
           DATE_FORMAT(NOW(), '%Y%m'),
           LPAD(IFNULL(MAX(CAST(SUBSTR(deli_deta_id, -3) AS UNSIGNED)), 0) + 1, 3, '0')
         ) AS new_id
  FROM deli_deta
  WHERE SUBSTR(deli_deta_id, 4, 6) = DATE_FORMAT(NOW(), '%Y%m')
`;

module.exports = {
  deliModalFind,
  deliFindHeader,
  deliFindLines,
  deliExists,
  deliInsert,
  deliUpdate,
  deliDeleteHeader,
  deliDeleteLines,
  deliInsertLine,
  deliUpdateLine,
  deliFindLinesByDoc,
  deliDeliveredSumByRcvDeta,
  deliDeliveredSumByRcvDetaList,
  deliDeliveredSumByRcvDetaListBeforeDt,
  deliNewId,
  deliDetaNewId,
};
