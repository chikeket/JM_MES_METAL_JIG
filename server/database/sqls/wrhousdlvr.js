// 테이블: WRHOUS_WRHSDLVR <창고 입출고> 관련 SQL 쿼리들

// 자재 품질검사서 목록 조회 (사용)
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

// 완제품 품질검사서 목록 조회 (사용)
const selectEndPrdtInspectionList = `
SELECT  epqi.end_prdt_qlty_insp_id AS insp_no,
        pdd.prdt_id AS item_code,
        p.prdt_nm AS item_name,
        po.prdt_opt_id AS opt_code,
        po.opt_nm AS opt_name,
        epqi.insp_qy AS insp_qty,
        epqi.pass_qy  AS pass_qty,
        epqi.infer_qy AS fail_qty,
        p.spec AS item_spec,
        p.unit AS item_unit,
        CASE 
          WHEN epqi.INSP_QY > 0 AND epqi.INSP_QY = (epqi.PASS_QY + epqi.INFER_QY) THEN '완료'
          ELSE '진행중'
        END AS insp_status,
        DATE_FORMAT(epqi.INSP_DT, '%Y-%m-%d') AS insp_date,
        e.emp_nm AS insp_emp_name,
        epqi.RM AS rm
FROM   end_prdt_qlty_insp epqi JOIN proc_ctrl pc ON epqi.prcs_ctrl_id = pc.prcs_ctrl_id
JOIN prcs_prog_precon ppp ON pc.prcs_prog_precon_id = ppp.prcs_prog_precon_id
JOIN prod_drct_deta pdd ON ppp.prod_drct_deta_id = pdd.prod_drct_deta_id
JOIN prdt p ON pdd.prdt_id = p.prdt_id
JOIN prdt_opt po ON p.prdt_id = po.prdt_id
JOIN emp e ON e.emp_id = epqi.emp_id
WHERE epqi.PASS_QY > 0
AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
ORDER BY epqi.INSP_DT ASC,
         SUBSTR(epqi.end_prdt_qlty_insp_id,-3) DESC
LIMIT 200
`;

// 반제품 품질검사서 목록 조회 (사용)
const selectSemiInspectionList = `
SELECT  spqi.semi_prdt_qlty_insp_id AS insp_no,
        pdd.prdt_id AS item_code,
        p.prdt_nm AS item_name,
        po.prdt_opt_id AS opt_code,
        po.opt_nm AS opt_name,
        spqi.insp_qy AS insp_qty,
        spqi.pass_qy  AS pass_qty,
        spqi.infer_qy AS fail_qty,
        p.spec AS item_spec,
        p.unit AS item_unit,
        CASE 
          WHEN spqi.INSP_QY > 0 AND spqi.INSP_QY = (spqi.PASS_QY + spqi.INFER_QY) THEN '완료'
          ELSE '진행중'
        END AS insp_status,
        DATE_FORMAT(spqi.INSP_DT, '%Y-%m-%d') AS insp_date,
        e.emp_nm AS insp_emp_name,
        spqi.RM AS rm
FROM   semi_prdt_qlty_insp spqi JOIN proc_ctrl pc ON spqi.prcs_ctrl_id = pc.prcs_ctrl_id
JOIN prcs_prog_precon ppp ON pc.prcs_prog_precon_id = ppp.prcs_prog_precon_id
JOIN prod_drct_deta pdd ON ppp.prod_drct_deta_id = pdd.prod_drct_deta_id
JOIN prdt p ON pdd.prdt_id = p.prdt_id
JOIN prdt_opt po ON p.prdt_id = po.prdt_id
JOIN emp e ON e.emp_id = spqi.emp_id
WHERE spqi.pass_qy > 0
AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
ORDER BY spqi.insp_dt ASC,
         SUBSTR(spqi.semi_prdt_qlty_insp_id,-3) DESC
LIMIT 200
`;

// 창고 입출고 거래 목록 조회 (사용자별 필터링)
const selectWrhousTransactionList = `
SELECT
  w.WRHSDLVR_ID AS txn_id,
  w.DLVR_TY AS txn_type,
  w.ITEM_TY AS item_type,
  w.ITEM_CODE AS item_code,
  w.ITEM_NM AS item_name,
  w.SPEC AS spec,
  w.UNIT AS unit,
  w.QY AS qty,
  w.INSP_ID AS inspect_id,
  w.EMP_ID AS emp_id,
  e.emp_nm AS emp_nm,
  DATE_FORMAT(w.REG_DT, '%Y-%m-%d %H:%i:%s') AS reg_dt,
  w.RM AS rm
FROM WRHOUS_WRHSDLVR w
LEFT JOIN emp e ON w.EMP_ID = e.emp_id
WHERE (? IS NULL OR w.DLVR_TY = ?)
  AND (? IS NULL OR w.ITEM_TY LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.ITEM_CODE LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.ITEM_NM LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.INSP_ID LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR w.EMP_ID = ?)
  AND (? IS NULL OR DATE(w.REG_DT) >= ?)
ORDER BY w.REG_DT DESC
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

// 창고 입출고 거래 등록
const insertWrhousTransaction = `
INSERT INTO WRHOUS_WRHSDLVR (
  WRHSDLVR_ID,
  DLVR_TY,
  ITEM_TY,
  ITEM_CODE,
  ITEM_NM,
  SPEC,
  UNIT,
  QY,
  INSP_ID,
  WRHOUS_ID,
  ZONE_ID,
  EMP_ID,
  REG_DT,
  RM
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
`;

// 창고 입출고 거래 수정
const updateWrhousTransaction = `
UPDATE WRHOUS_WRHSDLVR
SET DLVR_TY = ?,
    ITEM_TY = ?,
    ITEM_CODE = ?,
    ITEM_NM = ?,
    SPEC = ?,
    UNIT = ?,
    QY = ?,
    INSP_ID = ?,
    WRHOUS_ID = ?,
    ZONE_ID = ?,
    EMP_ID = ?,
    RM = ?
WHERE WRHSDLVR_ID = ?
`;

// 창고 입출고 거래 삭제
const deleteWrhousTransaction = `
DELETE FROM WRHOUS_WRHSDLVR WHERE WRHSDLVR_ID = ?
`;

// 선택된 거래들 일괄 삭제
const deleteWrhousTransactionsByIds = `
DELETE FROM WRHOUS_WRHSDLVR WHERE WRHSDLVR_ID IN (?)
`;

// 창고 입출고 거래 존재 여부 확인
const existsWrhousTransaction = `
SELECT 1 FROM WRHOUS_WRHSDLVR WHERE WRHSDLVR_ID = ? LIMIT 1
`;

// 거래 ID 자동 생성 (예: WTX2501001)
const createWrhousTransactionId = `
SELECT CONCAT('WTX', CONCAT(DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(WRHSDLVR_ID, -3)), 0) + 1, 3, '0'))) "txn_id"
FROM WRHOUS_WRHSDLVR
WHERE SUBSTR(WRHSDLVR_ID, 4, 4) = DATE_FORMAT(NOW(), '%y%m')
`;

// 현재 재고 현황 조회
const selectInventoryStatus = `
SELECT 
  ITEM_TY as item_type,
  ITEM_CODE as item_code,
  ITEM_NM as item_name,
  SPEC as spec,
  UNIT as unit,
  SUM(CASE WHEN DLVR_TY = 'IN' THEN QY ELSE -QY END) AS current_stock
FROM WRHOUS_WRHSDLVR
WHERE ITEM_CODE = ?
GROUP BY ITEM_TY, ITEM_CODE, ITEM_NM, SPEC, UNIT
HAVING current_stock > 0
`;

// 품목별 입출고 이력 조회
const selectItemTransactionHistory = `
SELECT
  WRHSDLVR_ID as txn_id,
  DLVR_TY as txn_type,
  QY as qty,
  INSP_ID as inspect_id,
  EMP_ID as emp_id,
  e.emp_nm,
  DATE_FORMAT(REG_DT, '%Y-%m-%d %H:%i:%s') AS reg_dt,
  RM as rm
FROM WRHOUS_WRHSDLVR w
LEFT JOIN emp e ON w.EMP_ID = e.emp_id
WHERE w.ITEM_CODE = ?
ORDER BY w.REG_DT DESC
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
    SOURCE_ID as source_id,
    ITEM_CODE as item_code,
    SUM(QY) as withdrawn_qty
  FROM WRHOUS_WRHSDLVR 
  WHERE DLVR_TY = 'OUT' 
    AND SOURCE_TY = 'material_withdrawal'
  GROUP BY SOURCE_ID, ITEM_CODE
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
    SOURCE_ID as source_id,
    ITEM_CODE as item_code,
    SUM(QY) as delivered_qty
  FROM WRHOUS_WRHSDLVR 
  WHERE DLVR_TY = 'OUT' 
    AND SOURCE_TY = 'delivery'
  GROUP BY SOURCE_ID, ITEM_CODE
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
  ITEM_TY as item_type,
  ITEM_CODE as item_code,
  ITEM_NM as item_name,
  SUM(CASE WHEN DLVR_TY = 'IN' THEN QY ELSE -QY END) as current_stock
FROM WRHOUS_WRHSDLVR
WHERE ITEM_CODE = ? AND ITEM_TY = ?
GROUP BY ITEM_TY, ITEM_CODE, ITEM_NM
`;

// 재고 거래 기록 삽입 (개선된 버전)
const insertInventoryTransaction = `
INSERT INTO WRHOUS_WRHSDLVR (
  WRHSDLVR_ID,
  DLVR_TY,
  SOURCE_TY,
  SOURCE_ID,
  ITEM_TY,
  ITEM_CODE,
  ITEM_NM,
  SPEC,
  UNIT,
  QY,
  WRHOUS_ID,
  ZONE_ID,
  EMP_ID,
  DLVR_DT,
  REG_DT,
  RM
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
`;

const getWarehousesByItemType = `
SELECT 
        w.WRHOUS_ID as warehouse_id,
        w.WRHOUS_NM as warehouse_name,
        w.ITEM_TY as item_type,
        w.ST as status,
        w.RM as remark
FROM WRHOUS w
WHERE w.ITEM_TY = ?
AND w.ST = 'M1'
ORDER BY w.WRHOUS_ID
`;

const getWarehousesByNone = `
SELECT 
        w.WRHOUS_ID as warehouse_id,
        w.WRHOUS_NM as warehouse_name,
        w.ITEM_TY as item_type,
        w.ST as status,
        w.RM as remark
FROM WRHOUS w
WHERE w.ST = 'M1'
ORDER BY w.WRHOUS_ID
`;

// 창고위치 조회 쿼리들
const getLocationsByWarehouse = `
SELECT 
  wz.ZONE_ID as location_id,
  wz.ZONE_NM as location_name,
  wz.WRHOUS_ID as warehouse_id,
  wz.ST as status,
  wz.RM as remark
FROM WRHOUS_ZONE wz
WHERE wz.WRHOUS_ID = ?
  AND wz.ST = 'M1'
ORDER BY wz.ZONE_ID
`;

const getLocationsByNone = `
SELECT 
  wz.ZONE_ID as location_id,
  wz.ZONE_NM as location_name,
  wz.WRHOUS_ID as warehouse_id,
  wz.ST as status,
  wz.RM as remark
FROM WRHOUS_ZONE wz
WHERE wz.ST = 'M1'
ORDER BY wz.ZONE_ID
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
  getWarehousesByItemType,
  getWarehousesByNone,
  getLocationsByWarehouse,
  getLocationsByNone,
};
