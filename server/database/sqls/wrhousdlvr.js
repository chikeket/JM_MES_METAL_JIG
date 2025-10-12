// 테이블: warehouse_transaction <창고 입출고> 관련 SQL 쿼리들

// 창고 입출고 거래 목록 조회 (사용자별 필터링)
const selectWrhousTransactionList = `
SELECT
  w.txn_id AS txn_id,
  w.txn_type AS txn_type,
  w.item_type AS item_type,
  w.item_code AS item_code,
  w.item_name AS item_name,
  w.spec AS spec,
  w.unit AS unit,
  w.qty AS qty,
  w.inspect_id AS inspect_id,
  w.emp_id AS emp_id,
  e.emp_nm AS emp_nm,
  DATE_FORMAT(w.reg_dt, '%Y-%m-%d %H:%i:%s') AS reg_dt,
  w.rm AS rm
FROM warehouse_transaction w
LEFT JOIN emp e ON w.emp_id = e.emp_id
WHERE (? IS NULL OR w.txn_type = ?)
  AND (? IS NULL OR w.item_type LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.item_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.item_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.inspect_id LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.emp_id = ?)
  AND (? IS NULL OR DATE(w.reg_dt) >= ?)
ORDER BY w.reg_dt DESC
LIMIT 500
`;

// 검사서 목록 조회 (입출고 가능한 검사서들)
const selectInspectionList = `
SELECT 
  i.inspect_id AS inspect_id,
  i.item_type AS item_type,
  i.item_code AS item_code,
  i.item_name AS item_name,
  i.spec AS spec,
  i.unit AS unit,
  i.qty AS qty,
  i.inspect_result AS inspect_result,
  i.inspector_id AS inspector_id,
  e.emp_nm AS inspector_nm,
  DATE_FORMAT(i.inspect_dt, '%Y-%m-%d') AS inspect_dt,
  i.rm AS rm
FROM quality_inspection i
LEFT JOIN emp e ON i.inspector_id = e.emp_id
WHERE i.inspect_result = 'PASS'
  AND (? IS NULL OR i.item_type LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR i.item_code LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR i.item_name LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR i.inspect_id LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR DATE(i.inspect_dt) >= ?)
ORDER BY i.inspect_dt DESC
LIMIT 200
`;

// 창고 입출고 거래 등록
const insertWrhousTransaction = `
INSERT INTO warehouse_transaction (
  txn_id,
  txn_type,
  item_type,
  item_code,
  item_name,
  spec,
  unit,
  qty,
  inspect_id,
  emp_id,
  reg_dt,
  rm
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
`;

// 창고 입출고 거래 수정
const updateWrhousTransaction = `
UPDATE warehouse_transaction
SET txn_type = ?,
    item_type = ?,
    item_code = ?,
    item_name = ?,
    spec = ?,
    unit = ?,
    qty = ?,
    inspect_id = ?,
    emp_id = ?,
    rm = ?
WHERE txn_id = ?
`;

// 창고 입출고 거래 삭제
const deleteWrhousTransaction = `
DELETE FROM warehouse_transaction WHERE txn_id = ?
`;

// 선택된 거래들 일괄 삭제
const deleteWrhousTransactionsByIds = `
DELETE FROM warehouse_transaction WHERE txn_id IN (?)
`;

// 창고 입출고 거래 존재 여부 확인
const existsWrhousTransaction = `
SELECT 1 FROM warehouse_transaction WHERE txn_id = ? LIMIT 1
`;

// 거래 ID 자동 생성 (예: WTX2501001)
const createWrhousTransactionId = `
SELECT CONCAT('WTX', CONCAT(DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(txn_id, -3)), 0) + 1, 3, '0'))) "txn_id"
FROM warehouse_transaction
WHERE SUBSTR(txn_id, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

// 현재 재고 현황 조회
const selectInventoryStatus = `
SELECT 
  item_type,
  item_code,
  item_name,
  spec,
  unit,
  SUM(CASE WHEN txn_type = 'IN' THEN qty ELSE -qty END) AS current_stock
FROM warehouse_transaction
WHERE item_code = ?
GROUP BY item_type, item_code, item_name, spec, unit
HAVING current_stock > 0
`;

// 품목별 입출고 이력 조회
const selectItemTransactionHistory = `
SELECT
  txn_id,
  txn_type,
  qty,
  inspect_id,
  emp_id,
  e.emp_nm,
  DATE_FORMAT(reg_dt, '%Y-%m-%d %H:%i:%s') AS reg_dt,
  rm
FROM warehouse_transaction w
LEFT JOIN emp e ON w.emp_id = e.emp_id
WHERE w.item_code = ?
ORDER BY w.reg_dt DESC
LIMIT 100
`;

module.exports = {
  selectWrhousTransactionList,
  selectInspectionList,
  insertWrhousTransaction,
  updateWrhousTransaction,
  deleteWrhousTransaction,
  deleteWrhousTransactionsByIds,
  existsWrhousTransaction,
  createWrhousTransactionId,
  selectInventoryStatus,
  selectItemTransactionHistory,
};