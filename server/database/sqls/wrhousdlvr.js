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

// 창고 완제품 목록 조회 (완제품 납품용) - 납품 상세 기준으로 수주 상세와 JOIN
const selectWarehouseProducts = `
SELECT 
  drd.deli_deta_id AS insp_no,
  rd.prdt_id AS item_code,
  p.prdt_nm  AS item_name,
  p.spec AS item_spec,
  p.unit AS item_unit,
  rd.rcvord_qy AS order_qty,
  drd.DELI_QY AS insp_qty,
  (rd.rcvord_qy - COALESCE(drd.DELI_QY, 0)) AS remaining_qty,
  DATE_FORMAT(rd.paprd_dt, '%Y-%m-%d') AS delivery_date,
  drd.RM AS rm,
  '납품가능' as status
FROM DELI_DETA drd
LEFT JOIN rcvord_deta rd ON drd.RCVORD_DETA_ID = rd.rcvord_deta_id
LEFT JOIN prdt p ON rd.prdt_id = p.prdt_id
LEFT JOIN prdt_opt po ON po.prdt_id = p.prdt_id
WHERE drd.DELI_QY > 0
  AND (? = '' OR rd.prdt_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
LIMIT 100
`;

// 창고 자재 검사서 목록 조회 - 수정 필요 자재 불출용
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

module.exports = {
  selectWrhousTransactionList,
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
};
