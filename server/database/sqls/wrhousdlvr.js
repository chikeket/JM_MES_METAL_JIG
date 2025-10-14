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

// 완제품 품질검사서 목록 조회
const selectInspectionList = `
SELECT 
  qi.END_PRDT_QLTY_INSP_ID AS insp_no,
  p.prdt_id AS item_code,
  p.prdt_nm AS item_name,
  p.spec AS item_spec,
  p.unit AS item_unit,
  qi.INSP_QY AS insp_qty,
  qi.PASS_QY AS pass_qty,
  qi.INFER_QY AS fail_qty,
  CASE 
    WHEN qi.INSP_QY > 0 AND qi.INSP_QY = (qi.PASS_QY + qi.INFER_QY) THEN '완료'
    ELSE '진행중'
  END AS insp_status,
  DATE_FORMAT(qi.INSP_DT, '%Y-%m-%d') AS insp_date,
  qi.EMP_ID AS insp_emp_id,
  e.emp_nm AS insp_emp_name,
  qi.RM AS rm
FROM END_PRDT_QLTY_INSP qi
LEFT JOIN PROC_CTRL pc ON qi.PRCS_CTRL_ID = pc.PRCS_CTRL_ID
LEFT JOIN prdt p ON pc.PRDT_ID = p.prdt_id
LEFT JOIN emp e ON qi.EMP_ID = e.emp_id
WHERE qi.PASS_QY > 0
  AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
ORDER BY qi.INSP_DT DESC
LIMIT 200
`;

// 자재 품질검사서 목록 조회
const selectRscInspectionList = `
SELECT 
  qi.RSC_QLTY_INSP_ID AS insp_no,
  r.RSC_ID AS item_code,
  r.RSC_NM AS item_name,
  r.SPEC AS item_spec,
  r.UNIT AS item_unit,
  qi.INSP_QY AS insp_qty,
  qi.PASS_QY AS pass_qty,
  qi.RTNGUD_QY AS fail_qty,
  CASE 
    WHEN qi.INSP_QY > 0 AND qi.INSP_QY = (qi.PASS_QY + qi.RTNGUD_QY) THEN '완료'
    ELSE '진행중'
  END AS insp_status,
  DATE_FORMAT(qi.INSP_DT, '%Y-%m-%d') AS insp_date,
  qi.EMP_ID AS insp_emp_id,
  e.emp_nm AS insp_emp_name,
  qi.RM AS rm
FROM RSC_QLTY_INSP qi
LEFT JOIN RSC_ORDR_DETA rod ON qi.RSC_ORDR_DETA_ID = rod.RSC_ORDR_DETA_ID
LEFT JOIN RSC r ON rod.RSC_ID = r.RSC_ID
LEFT JOIN emp e ON qi.EMP_ID = e.emp_id
WHERE qi.PASS_QY > 0
  AND (? = '' OR r.RSC_ID LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR r.RSC_NM LIKE CONCAT('%', ?, '%'))
ORDER BY qi.INSP_DT DESC
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

// 창고 자재 목록 조회 (자재 불출용) - 자재 검사서에서 조회
const selectWarehouseMaterials = `
SELECT 
  qi.RSC_QLTY_INSP_ID AS insp_no,
  r.RSC_ID AS item_code,
  r.RSC_NM AS item_name,
  r.SPEC AS item_spec,
  r.UNIT AS item_unit,
  qi.PASS_QY AS pass_qty,
  qi.INSP_QY AS insp_qty,
  qi.RTNGUD_QY AS fail_qty,
  '완료' as insp_status,
  DATE_FORMAT(qi.INSP_DT, '%Y-%m-%d') AS insp_date,
  e.emp_nm AS insp_emp_name
FROM RSC_QLTY_INSP qi
LEFT JOIN RSC_ORDR_DETA rod ON qi.RSC_ORDR_DETA_ID = rod.RSC_ORDR_DETA_ID
LEFT JOIN RSC r ON rod.RSC_ID = r.RSC_ID
LEFT JOIN emp e ON qi.EMP_ID = e.emp_id
WHERE qi.PASS_QY > 0
  AND (? = '' OR r.RSC_ID LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR r.RSC_NM LIKE CONCAT('%', ?, '%'))
ORDER BY qi.INSP_DT DESC
LIMIT 100
`;

// 반제품 품질검사서 목록 조회
const selectSemiInspectionList = `
SELECT 
  qi.SEMI_PRDT_QLTY_INSP_ID AS insp_no,
  p.prdt_id AS item_code,
  p.prdt_nm AS item_name,
  p.spec AS item_spec,
  p.unit AS item_unit,
  qi.INSP_QY AS insp_qty,
  qi.PASS_QY AS pass_qty,
  qi.INFER_QY AS fail_qty,
  CASE 
    WHEN qi.INSP_QY > 0 AND qi.INSP_QY = (qi.PASS_QY + qi.INFER_QY) THEN '완료'
    ELSE '진행중'
  END AS insp_status,
  DATE_FORMAT(qi.INSP_DT, '%Y-%m-%d') AS insp_date,
  qi.EMP_ID AS insp_emp_id,
  e.emp_nm AS insp_emp_name,
  qi.RM AS rm
FROM SEMI_PRDT_QLTY_INSP qi
LEFT JOIN PROC_CTRL pc ON qi.PRCS_CTRL_ID = pc.PRCS_CTRL_ID
LEFT JOIN prdt p ON pc.PRDT_ID = p.prdt_id
LEFT JOIN emp e ON qi.EMP_ID = e.emp_id
WHERE qi.PASS_QY > 0
  AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
ORDER BY qi.INSP_DT DESC
LIMIT 200
`;

// 완제품 품질검사서 목록 조회
const selectEndPrdtInspectionList = `
SELECT 
  qi.END_PRDT_QLTY_INSP_ID AS insp_no,
  p.prdt_id AS item_code,
  p.prdt_nm AS item_name,
  p.spec AS item_spec,
  p.unit AS item_unit,
  qi.INSP_QY AS insp_qty,
  qi.PASS_QY AS pass_qty,
  qi.INFER_QY AS fail_qty,
  CASE 
    WHEN qi.INSP_QY > 0 AND qi.INSP_QY = (qi.PASS_QY + qi.INFER_QY) THEN '완료'
    ELSE '진행중'
  END AS insp_status,
  DATE_FORMAT(qi.INSP_DT, '%Y-%m-%d') AS insp_date,
  qi.EMP_ID AS insp_emp_id,
  e.emp_nm AS insp_emp_name,
  qi.RM AS rm
FROM END_PRDT_QLTY_INSP qi
LEFT JOIN PROC_CTRL pc ON qi.PRCS_CTRL_ID = pc.PRCS_CTRL_ID
LEFT JOIN prdt p ON pc.PRDT_ID = p.prdt_id
LEFT JOIN emp e ON qi.EMP_ID = e.emp_id
WHERE qi.PASS_QY > 0
  AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
ORDER BY qi.INSP_DT DESC
LIMIT 200
`;

// 창고 완제품 목록 조회 (완제품 납품용) - 완제품 검사서에서 조회
const selectWarehouseProducts = `
SELECT 
  qi.END_PRDT_QLTY_INSP_ID AS insp_no,
  p.prdt_id AS item_code,
  p.prdt_nm AS item_name,
  p.spec AS item_spec,
  p.unit AS item_unit,
  qi.PASS_QY AS pass_qty,
  qi.INSP_QY AS insp_qty,
  qi.INFER_QY AS fail_qty,
  '완료' as insp_status,
  DATE_FORMAT(qi.INSP_DT, '%Y-%m-%d') AS insp_date,
  e.emp_nm AS insp_emp_name
FROM END_PRDT_QLTY_INSP qi
LEFT JOIN PROC_CTRL pc ON qi.PRCS_CTRL_ID = pc.PRCS_CTRL_ID
LEFT JOIN prdt p ON pc.PRDT_ID = p.prdt_id
LEFT JOIN emp e ON qi.EMP_ID = e.emp_id
WHERE qi.PASS_QY > 0
  AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
ORDER BY qi.INSP_DT DESC
LIMIT 100
`;

// 자재 불출 대상 조회 (생산지시 상세 → BOM 기반)
const selectMaterialWithdrawal = `
SELECT 
  pdd.PRDT_DRCT_DETA_ID as withdrawal_id,
  pd.PRDT_DRCT_ID as production_order_id,
  pd.PRDT_ID as product_code,
  p.prdt_nm as product_name,
  pdd.DRCT_QY as order_qty,
  r.RSC_ID as item_code,
  r.RSC_NM as item_name,
  r.SPEC as item_spec,
  r.UNIT as item_unit,
  b.QY as bom_qty,
  (pdd.DRCT_QY * b.QY) as required_qty,
  DATE_FORMAT(pd.DRCT_DT, '%Y-%m-%d') as order_date,
  pd.EMP_ID as emp_id,
  e.emp_nm as emp_name,
  COALESCE(withdrawn.withdrawn_qty, 0) as withdrawn_qty,
  ((pdd.DRCT_QY * b.QY) - COALESCE(withdrawn.withdrawn_qty, 0)) as remaining_qty
FROM PRDT_DRCT_DETA pdd
JOIN PRDT_DRCT pd ON pdd.PRDT_DRCT_ID = pd.PRDT_DRCT_ID
JOIN prdt p ON pd.PRDT_ID = p.prdt_id
JOIN BOM b ON p.prdt_id = b.PRDT_ID
JOIN RSC r ON b.RSC_ID = r.RSC_ID
JOIN emp e ON pd.EMP_ID = e.emp_id
LEFT JOIN (
  SELECT 
    source_id,
    item_code,
    SUM(qty) as withdrawn_qty
  FROM warehouse_transaction 
  WHERE txn_type = 'OUT' 
    AND source_type = 'material_withdrawal'
  GROUP BY source_id, item_code
) withdrawn ON pdd.PRDT_DRCT_DETA_ID = withdrawn.source_id AND r.RSC_ID = withdrawn.item_code
WHERE pdd.ST = 'M1'
  AND ((pdd.DRCT_QY * b.QY) - COALESCE(withdrawn.withdrawn_qty, 0)) > 0
  AND (? = '' OR r.RSC_ID LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR r.RSC_NM LIKE CONCAT('%', ?, '%'))
ORDER BY pd.DRCT_DT DESC, p.prdt_nm, r.RSC_NM
LIMIT 200
`;

// 완제품 납품 대상 조회 (납품 상세)
const selectDeliveryProducts = `
SELECT 
  dd.DELI_DETA_ID as delivery_id,
  d.DELI_ID as delivery_order_id,
  dd.PRDT_ID as item_code,
  p.prdt_nm as item_name,
  p.spec as item_spec,
  p.unit as item_unit,
  dd.QY as delivery_qty,
  DATE_FORMAT(d.DELI_DT, '%Y-%m-%d') as delivery_date,
  d.EMP_ID as emp_id,
  e.emp_nm as emp_name,
  COALESCE(delivered.delivered_qty, 0) as delivered_qty,
  (dd.QY - COALESCE(delivered.delivered_qty, 0)) as remaining_qty
FROM DELI_DETA dd
JOIN DELI d ON dd.DELI_ID = d.DELI_ID
JOIN prdt p ON dd.PRDT_ID = p.prdt_id
JOIN emp e ON d.EMP_ID = e.emp_id
LEFT JOIN (
  SELECT 
    source_id,
    item_code,
    SUM(qty) as delivered_qty
  FROM warehouse_transaction 
  WHERE txn_type = 'OUT' 
    AND source_type = 'delivery'
  GROUP BY source_id, item_code
) delivered ON dd.DELI_DETA_ID = delivered.source_id AND dd.PRDT_ID = delivered.item_code
WHERE d.ST = 'M1'
  AND (dd.QY - COALESCE(delivered.delivered_qty, 0)) > 0
  AND (? = '' OR dd.PRDT_ID LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
ORDER BY d.DELI_DT DESC, p.prdt_nm
LIMIT 200
`;

// 재고 현황 조회/업데이트
const selectInventoryByItem = `
SELECT 
  item_type,
  item_code,
  item_name,
  SUM(CASE WHEN txn_type = 'IN' THEN qty ELSE -qty END) as current_stock
FROM warehouse_transaction
WHERE item_code = ? AND item_type = ?
GROUP BY item_type, item_code, item_name
`;

// 재고 거래 기록 삽입 (개선된 버전)
const insertInventoryTransaction = `
INSERT INTO warehouse_transaction (
  txn_id,
  txn_type,
  source_type,
  source_id,
  item_type,
  item_code,
  item_name,
  spec,
  unit,
  qty,
  warehouse_id,
  location_id,
  emp_id,
  txn_date,
  reg_dt,
  rm
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
`;

module.exports = {
  selectWrhousTransactionList,
  selectInspectionList,
  selectRscInspectionList,
  selectSemiInspectionList,
  selectEndPrdtInspectionList,
  insertWrhousTransaction,
  updateWrhousTransaction,
  deleteWrhousTransaction,
  deleteWrhousTransactionsByIds,
  existsWrhousTransaction,
  createWrhousTransactionId,
  selectInventoryStatus,
  selectItemTransactionHistory,
  selectWarehouseMaterials,
  selectWarehouseProducts,
  // 새로운 출고 관련 쿼리들
  selectMaterialWithdrawal,
  selectDeliveryProducts,
  selectInventoryByItem,
  insertInventoryTransaction,
};
