// 테이블: WRHOUS_WRHSDLVR <창고 입출고> 관련 SQL 쿼리들

// 자재 품질검사서 목록 조회 (사용) - 완전 입고된 것 제외
const selectRscInspectionList = `
SELECT 
  qi.RSC_QLTY_INSP_ID AS insp_no,
  r.RSC_ID            AS item_code,
  r.RSC_NM            AS item_name,
  r.SPEC              AS item_spec,
  r.UNIT              AS item_unit,
  qi.INSP_QY          AS insp_qty,
  qi.PASS_QY          AS pass_qty,
  COALESCE(SUM(qii.INFER_QY), 0) AS fail_qty,
  COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
  (qi.PASS_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
  CASE 
    WHEN qi.INSP_QY > 0 
         AND qi.INSP_QY = qi.PASS_QY + COALESCE(SUM(qii.INFER_QY), 0)
      THEN '완료'
    ELSE '진행중'
  END                AS insp_status,
  DATE_FORMAT(qi.INSP_DT, '%Y-%m-%d') AS insp_date,
  qi.EMP_ID          AS insp_emp_id,
  e.EMP_NM           AS insp_emp_name,
  qi.RM              AS rm
FROM RSC_QLTY_INSP qi
LEFT JOIN RSC_ORDR_DETA rod 
       ON qi.RSC_ORDR_DETA_ID = rod.RSC_ORDR_DETA_ID
LEFT JOIN RSC r 
       ON rod.RSC_ID = r.RSC_ID
LEFT JOIN EMP e 
       ON qi.EMP_ID = e.EMP_ID
LEFT JOIN RSC_QLTY_INSP_INFER_QY qii 
       ON qi.RSC_QLTY_INSP_ID = qii.RSC_QLTY_INSP_ID
LEFT JOIN WRHOUS_WRHSDLVR wd 
       ON qi.RSC_QLTY_INSP_ID = wd.RSC_QLTY_INSP_ID
LEFT JOIN WRHOUS_WRHSDLVR_MAS wm 
       ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
       AND wm.RCVPAY_TY = 'S1'
WHERE qi.PASS_QY > 0
  AND (? = '' OR r.RSC_ID LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR r.RSC_NM LIKE CONCAT('%', ?, '%'))
GROUP BY
  qi.RSC_QLTY_INSP_ID, r.RSC_ID, r.RSC_NM, r.SPEC, r.UNIT,
  qi.INSP_QY, qi.PASS_QY, qi.RTNGUD_QY, rod.QY,
  qi.INSP_DT, qi.EMP_ID, e.EMP_NM, qi.RM
HAVING remaining_qty > 0
ORDER BY qi.INSP_DT DESC
LIMIT 200
`;

// 완제품 품질검사서 목록 조회 (사용) - 완전 입고된 것 제외
const selectEndPrdtInspectionList = `
SELECT  epqi.end_prdt_qlty_insp_id AS insp_no,
        pdd.prdt_id AS item_code,
        p.prdt_nm AS item_name,
        po.prdt_opt_id AS opt_code,
        po.opt_nm AS opt_name,
        epqi.insp_qy AS insp_qty,
        epqi.pass_qy  AS pass_qty,
        epqi.infer_qy AS fail_qty,
        COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
        (epqi.pass_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
        p.spec AS item_spec,
        p.unit AS item_unit,
        CASE 
          WHEN epqi.INSP_QY > 0 AND epqi.INSP_QY = (epqi.PASS_QY + epqi.INFER_QY) THEN '완료'
          ELSE '진행중'
        END AS insp_status,
        DATE_FORMAT(epqi.INSP_DT, '%Y-%m-%d') AS insp_date,
        e.emp_nm AS insp_emp_name,
        epqi.RM AS rm
FROM   end_prdt_qlty_insp epqi 
JOIN proc_ctrl pc ON epqi.prcs_ctrl_id = pc.prcs_ctrl_id
JOIN prcs_prog_precon ppp ON pc.prcs_prog_precon_id = ppp.prcs_prog_precon_id
JOIN prod_drct_deta pdd ON ppp.prod_drct_deta_id = pdd.prod_drct_deta_id
JOIN prdt p ON pdd.prdt_id = p.prdt_id
JOIN prdt_opt po ON p.prdt_id = po.prdt_id
JOIN emp e ON e.emp_id = epqi.emp_id
LEFT JOIN WRHOUS_WRHSDLVR wd 
       ON epqi.end_prdt_qlty_insp_id = wd.END_PRDT_QLTY_INSP_ID
LEFT JOIN WRHOUS_WRHSDLVR_MAS wm 
       ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
       AND wm.RCVPAY_TY = 'S1'
WHERE epqi.PASS_QY > 0
AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
GROUP BY epqi.end_prdt_qlty_insp_id, pdd.prdt_id, p.prdt_nm, po.prdt_opt_id, po.opt_nm,
         epqi.insp_qy, epqi.pass_qy, epqi.infer_qy, p.spec, p.unit,
         epqi.INSP_DT, e.emp_nm, epqi.RM
HAVING remaining_qty > 0
ORDER BY epqi.INSP_DT ASC,
         SUBSTR(epqi.end_prdt_qlty_insp_id,-3) DESC
LIMIT 200
`;

// 반제품 품질검사서 목록 조회 (사용) - 완전 입고된 것 제외
const selectSemiInspectionList = `
SELECT  spqi.semi_prdt_qlty_insp_id AS insp_no,
        pdd.prdt_id AS item_code,
        p.prdt_nm AS item_name,
        po.prdt_opt_id AS opt_code,
        po.opt_nm AS opt_name,
        spqi.insp_qy AS insp_qty,
        spqi.pass_qy  AS pass_qty,
        spqi.infer_qy AS fail_qty,
        COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
        (spqi.pass_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
        p.spec AS item_spec,
        p.unit AS item_unit,
        CASE 
          WHEN spqi.INSP_QY > 0 AND spqi.INSP_QY = (spqi.PASS_QY + spqi.INFER_QY) THEN '완료'
          ELSE '진행중'
        END AS insp_status,
        DATE_FORMAT(spqi.INSP_DT, '%Y-%m-%d') AS insp_date,
        e.emp_nm AS insp_emp_name,
        spqi.RM AS rm
FROM   semi_prdt_qlty_insp spqi 
JOIN proc_ctrl pc ON spqi.prcs_ctrl_id = pc.prcs_ctrl_id
JOIN prcs_prog_precon ppp ON pc.prcs_prog_precon_id = ppp.prcs_prog_precon_id
JOIN prod_drct_deta pdd ON ppp.prod_drct_deta_id = pdd.prod_drct_deta_id
JOIN prdt p ON pdd.prdt_id = p.prdt_id
JOIN prdt_opt po ON p.prdt_id = po.prdt_id
JOIN emp e ON e.emp_id = spqi.emp_id
LEFT JOIN WRHOUS_WRHSDLVR wd 
       ON spqi.semi_prdt_qlty_insp_id = wd.SEMI_PRDT_QLTY_INSP_ID
LEFT JOIN WRHOUS_WRHSDLVR_MAS wm 
       ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
       AND wm.RCVPAY_TY = 'S1'
WHERE spqi.pass_qy > 0
AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
GROUP BY spqi.semi_prdt_qlty_insp_id, pdd.prdt_id, p.prdt_nm, po.prdt_opt_id, po.opt_nm,
         spqi.insp_qy, spqi.pass_qy, spqi.infer_qy, p.spec, p.unit,
         spqi.insp_dt, e.emp_nm, spqi.RM
HAVING remaining_qty > 0
ORDER BY spqi.insp_dt ASC,
         SUBSTR(spqi.semi_prdt_qlty_insp_id,-3) DESC
LIMIT 200
`;

// 완제품 납품 대상 조회 (납품 상세) (사용) - 완전 출고된 것 제외
const selectDeliveryProducts = `
SELECT  dd.deli_deta_id AS insp_no,
        rd.prdt_id AS item_code,
        p.prdt_nm AS item_name,
        rd.prdt_opt_id AS opt_code,
        po.opt_nm AS opt_name,
        dd.deli_qy  AS pass_qty,
        COALESCE(SUM(wd.RCVPAY_QY), 0) AS delivered_qty,
        (dd.deli_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
        p.spec AS item_spec,
        p.unit AS item_unit,
        CASE 
          WHEN dd.deli_st = 'J1' THEN '등록'
          WHEN dd.deli_st = 'J2' THEN '진행 중'
          ELSE '진행 완료'
        END AS insp_status,
        DATE_FORMAT(d.deli_dt, '%Y-%m-%d') AS insp_date,
        e.emp_nm AS insp_emp_name,
        dd.RM AS rm
FROM    deli_deta dd 
JOIN    deli d ON dd.deli_id = d.deli_id
JOIN    rcvord_deta rd ON dd.rcvord_deta_id = rd.rcvord_deta_id
JOIN    prdt p ON rd.prdt_id = p.prdt_id
JOIN    prdt_opt po ON rd.prdt_opt_id = po.prdt_opt_id
JOIN    emp e ON d.emp_id = e.emp_id
LEFT JOIN WRHOUS_WRHSDLVR wd 
       ON dd.deli_deta_id = wd.DELI_DETA_ID
LEFT JOIN WRHOUS_WRHSDLVR_MAS wm 
       ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
       AND wm.RCVPAY_TY = 'S2'
WHERE   dd.deli_st IN ('J1', 'J2')
  AND   (dd.deli_qy) > 0
  AND   (? = '' OR rd.prdt_id LIKE CONCAT('%', ?, '%'))
  AND   (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
GROUP BY dd.deli_deta_id, rd.prdt_id, p.prdt_nm, rd.prdt_opt_id, po.opt_nm,
         dd.deli_qy, p.spec, p.unit, dd.deli_st, d.deli_dt, e.emp_nm, dd.RM
HAVING remaining_qty > 0
ORDER BY d.deli_dt DESC, SUBSTR(dd.deli_deta_id, -3) DESC
LIMIT 200
`;

// 생산지시 상세 목록 조회 (상단 그리드용 - 완제품 정보)
const selectProductionOrderDetails = `
SELECT 
  pdd.prod_drct_deta_id as withdrawal_id,
  pd.prod_drct_id as production_order_id,
  '완제품' as item_type,
  pdd.prdt_id as item_code,
  p.prdt_nm as item_name,
  pdd.prdt_opt_id as opt_code,
  po.opt_nm as opt_name,
  p.spec as item_spec,
  p.unit as item_unit,
  pdd.drct_qy as required_qty,
  DATE_FORMAT(pd.reg_dt, '%Y-%m-%d') as order_date,
  pd.emp_id as emp_id,
  e.emp_nm as emp_name
FROM prod_drct_deta pdd
JOIN prod_drct pd ON pdd.prod_drct_id = pd.prod_drct_id
JOIN prdt p ON pdd.prdt_id = p.prdt_id
JOIN prdt_opt po ON pdd.prdt_opt_id = po.prdt_opt_id
JOIN emp e ON pd.emp_id = e.emp_id
WHERE pdd.drct_qy > 0
  AND (? = '' OR pdd.prdt_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
ORDER BY pd.reg_dt DESC, p.prdt_nm
LIMIT 200
`;

// 특정 생산지시의 BOM 자재 목록 조회 (하단 그리드용)
const selectMaterialByProductionOrder = `
SELECT 
  pdd.prod_drct_deta_id as withdrawal_id,
  '자재' as item_type,
  bd.rsc_id as item_code,
  r.rsc_nm as item_name,
  '' as opt_code,
  '' as opt_name,
  r.spec as item_spec,
  r.unit as item_unit,
  bd.rec_qy as bom_qty,
  pdd.drct_qy as order_qty,
  CEIL(pdd.drct_qy * bd.rec_qy) as required_qty,
  COALESCE(0, 0) as withdrawn_qty,
  CEIL(pdd.drct_qy * bd.rec_qy) as remaining_qty
FROM prod_drct_deta pdd
JOIN bom b ON pdd.prdt_id = b.prdt_id
JOIN bom_deta bd ON b.bom_id = bd.bom_id
JOIN rsc r ON bd.rsc_id = r.rsc_id
WHERE pdd.prod_drct_deta_id = ?
  AND CEIL(pdd.drct_qy * bd.rec_qy) > 0
ORDER BY r.rsc_nm
`;

// 자재 불출 대상 조회 (생산지시 상세 → BOM 기반) (기존 통합 쿼리)
const selectMaterialWithdrawal = `
SELECT 
  pdd.prod_drct_deta_id as withdrawal_id,
  pd.prod_drct_id as production_order_id,
  pdd.prdt_id as item_code,
  p.prdt_nm as item_name,
  p.spec as item_spec,
  p.unit as item_unit,
  pdd.prdt_opt_id as product_opt_id,
  po.opt_nm as product_opt_name,
  pdd.drct_qy as required_qty,
  bd.rsc_id,
  r.rsc_nm,
  r.spec,
  r.unit,
  bd.rec_qy as bom_qty,
  CEIL(pdd.drct_qy * bd.rec_qy) as required_rsc_qty,
  DATE_FORMAT(pd.reg_dt, '%Y-%m-%d') as order_date,
  pd.emp_id as emp_id,
  e.emp_nm as emp_name,
  COALESCE(0, 0) as withdrawn_qty,
  CEIL(pdd.drct_qy * bd.rec_qy) as remaining_qty
FROM prod_drct_deta pdd
LEFT OUTER JOIN rwmatr_rtun_trget rrt ON pdd.prod_drct_deta_id = rrt.prod_drct_deta_id
JOIN prod_drct pd ON pdd.prod_drct_id = pd.prod_drct_id
JOIN prdt p ON pdd.prdt_id = p.prdt_id
JOIN prdt_opt po ON pdd.prdt_opt_id = po.prdt_opt_id
JOIN bom b ON pdd.prdt_id = b.prdt_id
JOIN bom_deta bd ON b.bom_id = bd.bom_id
JOIN rsc r ON bd.rsc_id = r.rsc_id
JOIN emp e ON pd.emp_id = e.emp_id
WHERE CEIL(pdd.drct_qy * bd.rec_qy) > 0
  AND (? = '' OR bd.rsc_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR r.rsc_nm LIKE CONCAT('%', ?, '%'))
ORDER BY pd.reg_dt DESC, p.prdt_nm, r.rsc_nm
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

// 창고 입출고 디테일 거래 등록 - 실제 테이블 구조에 맞춤
const insertWrhousTransaction = `
INSERT INTO WRHOUS_WRHSDLVR (
  WRHOUS_WRHSDLVR_ID,
  WRHSDLVR_MAS_ID,
  RSC_QLTY_INSP_ID,
  SEMI_PRDT_QLTY_INSP_ID,
  END_PRDT_QLTY_INSP_ID,
  DELI_DETA_ID,
  RCVPAY_QY,
  RM
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

// 창고 입출고 마스터 거래 등록 (신규 추가) - 실제 테이블 구조에 맞춤
const insertWrhousTransactionMaster = `
INSERT INTO WRHOUS_WRHSDLVR_MAS (
  WRHSDLVR_MAS_ID,
  RCVPAY_TY,
  EMP_ID,
  RSC_ID,
  PRDT_ID,
  PRDT_OPT_ID,
  WRHOUS_ID,
  ZONE_ID,
  LOT_NO,
  SPEC,
  UNIT,
  ALL_RCVPAY_QY,
  RCVPAY_DT,
  RM
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

// 마스터 ID 자동 생성 (예: WRHM_IN_251001, WRHM_OUT_251001)
const createWrhousTransactionId = `
SELECT CONCAT(?, DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(WRHSDLVR_MAS_ID, -3)), 0) + 1, 3, '0')) "txn_id"
FROM WRHOUS_WRHSDLVR_MAS
WHERE WRHSDLVR_MAS_ID LIKE CONCAT(?, DATE_FORMAT(NOW(), '%y%m'), '%')
`;

// 디테일 창고 ID 자동 생성 (예: 입고 WRH_IN_251001, 출고 WRH_OUT_251001)
const createWrhousDetailId = `
SELECT CONCAT(?, DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(WRHOUS_WRHSDLVR_ID, -3)), 0) + 1, 3, '0')) "detail_id"
FROM WRHOUS_WRHSDLVR
WHERE WRHOUS_WRHSDLVR_ID LIKE CONCAT(?, DATE_FORMAT(NOW(), '%y%m'), '%')
`;

// LOT 번호 자동 생성 (예: 자재: LOT_RSC_251001, 완제품: LOT_END_251001, 반제품: LOT_SEMI_251001)
const createLotno = `
SELECT CONCAT(?, DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(LOT_NO, -3)), 0) + 1, 3, '0')) "lot_no"
FROM WRHOUS_WRHSDLVR_MAS
WHERE LOT_NO LIKE CONCAT(?, DATE_FORMAT(NOW(), '%y%m'), '%')
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

// 검사서별 입고 완료 수량 확인 (자재 품질검사)
const selectRscInspectionCompletedQty = `
SELECT 
  COALESCE(SUM(wm.ALL_RCVPAY_QY), 0) as completed_qty
FROM WRHOUS_WRHSDLVR_MAS wm
WHERE wm.RSC_ID = ?
  AND wm.RCVPAY_TY = 'S1'
  AND wm.INSP_ID = ?
`;

// 검사서별 입고 완료 수량 확인 (완제품/반제품 품질검사)
const selectPrdtInspectionCompletedQty = `
SELECT 
  COALESCE(SUM(wm.ALL_RCVPAY_QY), 0) as completed_qty
FROM WRHOUS_WRHSDLVR_MAS wm
WHERE wm.PRDT_ID = ?
  AND wm.RCVPAY_TY = 'S1'
  AND wm.INSP_ID = ?
`;

// 품목별 재고 현황 조회 (LOT별)
const selectInventoryByItemWithLot = `
SELECT 
  wm.LOT_NO as lot_no,
  wm.RSC_ID as rsc_id,
  wm.PRDT_ID as prdt_id,
  wm.PRDT_OPT_ID as prdt_opt_id,
  wm.SPEC as spec,
  wm.UNIT as unit,
  SUM(CASE WHEN wm.RCVPAY_TY = 'S1' THEN wm.ALL_RCVPAY_QY ELSE -wm.ALL_RCVPAY_QY END) as current_stock,
  MIN(wm.RCVPAY_DT) as first_rcvpay_dt,
  wm.WRHOUS_ID as warehouse_id,
  wm.ZONE_ID as zone_id
FROM WRHOUS_WRHSDLVR_MAS wm
WHERE (wm.RSC_ID = ? OR wm.PRDT_ID = ?)
GROUP BY wm.LOT_NO, wm.RSC_ID, wm.PRDT_ID, wm.PRDT_OPT_ID, wm.SPEC, wm.UNIT, wm.WRHOUS_ID, wm.ZONE_ID
HAVING current_stock > 0
ORDER BY first_rcvpay_dt ASC, wm.LOT_NO ASC
`;

// 출고 가능한 LOT 목록 조회 (선입선출)
const selectAvailableLots = `
SELECT 
  wm.LOT_NO as lot_no,
  wm.RSC_ID as rsc_id,
  wm.PRDT_ID as prdt_id,
  wm.PRDT_OPT_ID as prdt_opt_id,
  SUM(CASE WHEN wm.RCVPAY_TY = 'S1' THEN wm.ALL_RCVPAY_QY ELSE -wm.ALL_RCVPAY_QY END) as available_qty,
  MIN(wm.RCVPAY_DT) as first_rcvpay_dt,
  wm.WRHOUS_ID as warehouse_id,
  wm.ZONE_ID as zone_id
FROM WRHOUS_WRHSDLVR_MAS wm
WHERE (? = '' OR wm.RSC_ID = ?)
  AND (? = '' OR wm.PRDT_ID = ?)
  AND (? = '' OR wm.PRDT_OPT_ID = ?)
GROUP BY wm.LOT_NO, wm.RSC_ID, wm.PRDT_ID, wm.PRDT_OPT_ID, wm.WRHOUS_ID, wm.ZONE_ID
HAVING available_qty > 0
ORDER BY first_rcvpay_dt ASC, wm.LOT_NO ASC
`;

// 납품서별 출고 완료 수량 확인
const selectDeliveryCompletedQty = `
SELECT 
  COALESCE(SUM(wm.ALL_RCVPAY_QY), 0) as completed_qty
FROM WRHOUS_WRHSDLVR_MAS wm
WHERE wm.PRDT_ID = ?
  AND wm.PRDT_OPT_ID = ?
  AND wm.RCVPAY_TY = 'S2'
  AND wm.DELI_DETA_ID = ?
`;

// 생산지시별 자재 불출 완료 수량 확인
const selectMaterialWithdrawalCompletedQty = `
SELECT 
  COALESCE(SUM(wm.ALL_RCVPAY_QY), 0) as completed_qty
FROM WRHOUS_WRHSDLVR_MAS wm
WHERE wm.RSC_ID = ?
  AND wm.RCVPAY_TY = 'S2'
  AND wm.PROD_DRCT_DETA_ID = ?
`;

module.exports = {
  selectWrhousTransactionList,
  selectInspectionList,
  selectRscInspectionList,
  selectSemiInspectionList,
  selectEndPrdtInspectionList,
  insertWrhousTransaction,
  insertWrhousTransactionMaster, // 새로 추가
  updateWrhousTransaction,
  deleteWrhousTransaction,
  deleteWrhousTransactionsByIds,
  existsWrhousTransaction,
  createWrhousTransactionId,
  createWrhousDetailId,
  createLotno,
  selectInventoryStatus,
  selectItemTransactionHistory,
  selectWarehouseMaterials,
  selectWarehouseProducts,
  // 새로운 출고 관련 쿼리들
  selectMaterialWithdrawal,
  selectDeliveryProducts,
  selectProductionOrderDetails,
  selectMaterialByProductionOrder,
  selectInventoryByItem,
  insertInventoryTransaction,
  getWarehousesByItemType,
  getWarehousesByNone,
  getLocationsByWarehouse,
  getLocationsByNone,
  // 새로 추가된 쿼리들
  selectRscInspectionCompletedQty,
  selectPrdtInspectionCompletedQty,
  selectInventoryByItemWithLot,
  selectAvailableLots,
  selectDeliveryCompletedQty,
  selectMaterialWithdrawalCompletedQty,
};
