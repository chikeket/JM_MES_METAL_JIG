// wrhous_wrhsdlvr_mas 수량 update
const updateWrhousdlvrMasQty = `
  UPDATE WRHOUS_WRHSDLVR_MAS SET ALL_RCVPAY_QY = ? WHERE WRHSDLVR_MAS_ID = ?
`;

// wrhous_wrhsdlvr 디테일 수량 update
const updateWrhousdlvrDetailQty = `
  UPDATE WRHOUS_WRHSDLVR SET RCVPAY_QY = ? WHERE WRHSDLVR_MAS_ID = ?
`;

// lot_stc_precon 입고 IST_QY update
const updateLotStcPreconIstQty = `
UPDATE LOT_STC_PRECON
SET OUST_QY   = OUST_QY + ?,
    NOW_STC_QY = GREATEST(NOW_STC_QY - ?, 0)
WHERE WRHSDLVR_MAS_ID = ?
`;

// lot_stc_precon 출고 OUST_QY update
const updateLotStcPreconOustQty = `
UPDATE LOT_STC_PRECON
SET OUST_QY = COALESCE(OUST_QY,0) + ?,
    NOW_STC_QY = GREATEST(COALESCE(NOW_STC_QY,0) - ?, 0)
WHERE WRHSDLVR_MAS_ID = ?
`;

// 자재 불출 테이블 수량
const updateMaterialWithdrawalQty = `
UPDATE rwmatr_rtun_trget
SET PROD_EXPC_QY = ?
WHERE RSC_RTUN_TRGET_ID = (
select rsc_rtun_trget_id from wrhous_wrhsdlvr
where WRHSDLVR_MAS_ID = ?)
`;

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
  (qi.PASS_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS available_qty,
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
HAVING available_qty > 0
ORDER BY qi.INSP_DT DESC
LIMIT 200
`;

// 완제품 품질검사서 목록 조회 (사용) - 완전 입고된 것 제외
const selectEndPrdtInspectionList = `
SELECT  epqi.end_prdt_qlty_insp_id AS insp_no,
        pdd.prdt_id AS item_code,
        p.prdt_nm AS item_name,
        pdd.prdt_opt_id AS opt_code,
        po.opt_nm AS opt_name,
        epqi.insp_qy AS insp_qty,
        epqi.pass_qy AS pass_qty,
        epqi.infer_qy AS fail_qty,
        COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
        (epqi.pass_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS available_qty,
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
JOIN   proc_ctrl pc           ON epqi.prcs_ctrl_id = pc.prcs_ctrl_id
JOIN   prcs_prog_precon ppp   ON pc.prcs_prog_precon_id = ppp.prcs_prog_precon_id
JOIN   prod_drct_deta pdd     ON ppp.prod_drct_deta_id = pdd.prod_drct_deta_id
JOIN   prdt_opt po            ON po.prdt_id = pdd.prdt_id AND po.prdt_opt_id = pdd.prdt_opt_id
JOIN   prdt p                 ON po.prdt_id = p.prdt_id
JOIN   emp e                  ON e.emp_id = epqi.emp_id
LEFT JOIN WRHOUS_WRHSDLVR wd  ON epqi.end_prdt_qlty_insp_id = wd.END_PRDT_QLTY_INSP_ID
LEFT JOIN WRHOUS_WRHSDLVR_MAS wm 
       ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID AND wm.RCVPAY_TY = 'S1'
WHERE  epqi.PASS_QY > 0
  AND  (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
  AND  (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
GROUP BY epqi.end_prdt_qlty_insp_id, pdd.prdt_id, p.prdt_nm, pdd.prdt_opt_id, po.opt_nm,
         epqi.insp_qy, epqi.pass_qy, epqi.infer_qy, p.spec, p.unit,
         epqi.INSP_DT, e.emp_nm, epqi.RM
HAVING  available_qty > 0
ORDER BY epqi.INSP_DT ASC, SUBSTR(epqi.end_prdt_qlty_insp_id, -3) DESC
LIMIT 200`;

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
  (spqi.pass_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS available_qty,
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
HAVING available_qty > 0
ORDER BY spqi.insp_dt ASC,
         SUBSTR(spqi.semi_prdt_qlty_insp_id,-3) DESC
LIMIT 200
`;

// 완제품 납품 대상 조회 (납품 상세) (사용) - 완전 출고된 것 제외
const selectDeliveryProducts = `
SELECT
  dd.deli_deta_id                          AS insp_no,
  rd.prdt_id                               AS item_code,
  p.prdt_nm                                AS item_name,
  rd.prdt_opt_id                           AS opt_code,
  po.opt_nm                                AS opt_name,
  wm.LOT_NO                                AS lot_no,
  dd.DELI_QY                               AS pass_qty,
  COALESCE(SUM(wd.RCVPAY_QY), 0)           AS delivered_qty,
  (dd.DELI_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS available_qty,
  p.spec                                   AS item_spec,
  p.unit                                   AS item_unit,
  dd.DELI_ST                                AS deli_st
FROM DELI_DETA dd
JOIN RCVORD_DETA rd ON dd.RCVORD_DETA_ID = rd.RCVORD_DETA_ID
JOIN PRDT p        ON rd.PRDT_ID = p.PRDT_ID
LEFT JOIN PRDT_OPT po ON po.PRDT_ID = p.PRDT_ID AND po.PRDT_OPT_ID <=> rd.PRDT_OPT_ID
LEFT JOIN WRHOUS_WRHSDLVR wd ON dd.DELI_DETA_ID = wd.DELI_DETA_ID
LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID AND wm.RCVPAY_TY = 'S2'
WHERE 1=1
  AND (? = '' OR p.PRDT_ID LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.PRDT_NM LIKE CONCAT('%', ?, '%'))
GROUP BY dd.DELI_DETA_ID, rd.PRDT_ID, p.PRDT_NM, rd.PRDT_OPT_ID, po.OPT_NM, dd.DELI_QY, p.SPEC, p.UNIT, dd.DELI_ST
HAVING available_qty > 0
ORDER BY dd.DELI_DETA_ID DESC
LIMIT 200`;

// 생산지시 상세 목록 조회 (상단 그리드용 - 완제품 정보)
const selectProductionOrderDetails = `
SELECT
  pdd.prod_drct_deta_id as withdrawal_id,
  pd.prod_drct_id       as production_order_id,
  '완제품'              as item_type,
  pdd.prdt_id           as item_code,
  p.prdt_nm             as item_name,
  pdd.prdt_opt_id       as opt_code,
  po.opt_nm             as opt_name,
  p.spec                as item_spec,
  p.unit                as item_unit,
  pdd.drct_qy           as order_qty,
  DATE_FORMAT(pd.reg_dt, '%Y-%m-%d') as drct_date
FROM prod_drct_deta pdd
JOIN prod_drct pd ON pd.prod_drct_id = pdd.prod_drct_id
JOIN prdt p       ON p.prdt_id       = pdd.prdt_id
LEFT JOIN prdt_opt po ON po.prdt_id = pdd.prdt_id AND po.prdt_opt_id = pdd.prdt_opt_id
WHERE 1=1
  AND (? = '' OR pdd.prdt_id LIKE CONCAT('%', ?, '%'))
  AND (? = '' OR p.prdt_nm  LIKE CONCAT('%', ?, '%'))
ORDER BY pd.reg_dt DESC
LIMIT 200`;

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
SELECT DISTINCT
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
JOIN prod_drct pd ON pdd.prod_drct_id = pd.prod_drct_id
JOIN prdt_opt po ON pdd.prdt_opt_id = po.prdt_opt_id AND po.prdt_id = pdd.prdt_id
JOIN prdt p ON po.prdt_id = p.prdt_id
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

// 창고 입출고 거래 목록 조회 (마스터 기준, 사용자별 필터링)
const selectWrhousTransactionList = `
SELECT
  wm.WRHSDLVR_MAS_ID AS txn_id,
  wm.RCVPAY_TY AS txn_type,
  CASE WHEN wm.PRDT_ID IS NOT NULL AND wm.PRDT_ID <> '' THEN '완제품'
       WHEN wm.RSC_ID IS NOT NULL AND wm.RSC_ID <> '' THEN '자재'
       ELSE '' END AS item_type,
  COALESCE(wm.PRDT_ID, wm.RSC_ID) AS item_code,
  COALESCE(p.prdt_nm, r.rsc_nm, wm.RCVPAY_NM) AS item_name,
  wm.LOT_NO                                AS lot_no,
  wm.SPEC AS spec,
  wm.UNIT AS unit,
  wm.ALL_RCVPAY_QY AS qty,
  COALESCE(d.RSC_QLTY_INSP_ID, d.END_PRDT_QLTY_INSP_ID, d.SEMI_PRDT_QLTY_INSP_ID, d.DELI_DETA_ID) AS inspect_id,
  wm.EMP_ID AS emp_id,
  e.emp_nm AS emp_nm,
  DATE_FORMAT(wm.RCVPAY_DT, '%Y-%m-%d %H:%i:%s') AS reg_dt,
  wm.RM AS rm
FROM WRHOUS_WRHSDLVR_MAS wm
LEFT JOIN WRHOUS_WRHSDLVR d ON wm.WRHSDLVR_MAS_ID = d.WRHSDLVR_MAS_ID
LEFT JOIN PRDT p ON wm.PRDT_ID = p.PRDT_ID
LEFT JOIN RSC r ON wm.RSC_ID = r.RSC_ID
LEFT JOIN emp e ON wm.EMP_ID = e.emp_id
WHERE (? IS NULL OR wm.RCVPAY_TY = ?)
  AND (? IS NULL OR (CASE WHEN wm.PRDT_ID IS NOT NULL AND wm.PRDT_ID <> '' THEN '완제품' WHEN wm.RSC_ID IS NOT NULL AND wm.RSC_ID <> '' THEN '자재' ELSE '' END) LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR COALESCE(wm.PRDT_ID, wm.RSC_ID) LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR COALESCE(p.PRDT_NM, r.RSC_NM) LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR COALESCE(d.RSC_QLTY_INSP_ID, d.END_PRDT_QLTY_INSP_ID, d.SEMI_PRDT_QLTY_INSP_ID, d.DELI_DETA_ID) LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR wm.EMP_ID = ?)
  AND (? IS NULL OR DATE(wm.RCVPAY_DT) >= ?)
ORDER BY wm.RCVPAY_DT DESC
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
  RSC_RTUN_TRGET_ID,
  RSC_QLTY_INSP_ID,
  SEMI_PRDT_QLTY_INSP_ID,
  END_PRDT_QLTY_INSP_ID,
  deli_deta_id,
  RCVPAY_QY,
  RM
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  RM,
  RCVPAY_NM
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)
`;

// EMP_ID 검증
const validateEmployeeId = `
SELECT EMP_ID FROM EMP WHERE EMP_ID = ? LIMIT 1
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

// 자재 품질검사서 PASS_QY 차감
const deductRscInspPassQty = `
UPDATE RSC_QLTY_INSP SET PASS_QY = GREATEST(PASS_QY - ?, 0) WHERE RSC_QLTY_INSP_ID = ?
`;

// 반제품 품질검사서 PASS_QY 차감
const deductSemiPrdtInspPassQty = `
UPDATE SEMI_PRDT_QLTY_INSP SET PASS_QY = GREATEST(PASS_QY - ?, 0) WHERE SEMI_PRDT_QLTY_INSP_ID = ?
`;

// 완제품 품질검사서 PASS_QY 차감
const deductEndPrdtInspPassQty = `
UPDATE END_PRDT_QLTY_INSP SET PASS_QY = GREATEST(PASS_QY - ?, 0) WHERE END_PRDT_QLTY_INSP_ID = ?
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

const createLotId = `
SELECT CONCAT(?, DATE_FORMAT(NOW(), '%y%m'),
  LPAD(IFNULL(MAX(SUBSTR(LOT_ID, -3)), 0) + 1, 3, '0')) "lot_id"
FROM LOT_STC_PRECON 
WHERE LOT_INVNTRY_PRECON_ID LIKE CONCAT(?, DATE_FORMAT(NOW(), '%y%m'), '%')
`;

// 현재 재고 현황 조회 (마스터-디테일 구조)
const selectInventoryStatus = `
SELECT 
  CASE 
    WHEN wm.RSC_ID IS NOT NULL THEN 'E1'
    WHEN wm.PRDT_ID IS NOT NULL AND wm.PRDT_OPT_ID IS NULL THEN 'E2' 
    WHEN wm.PRDT_ID IS NOT NULL AND wm.PRDT_OPT_ID IS NOT NULL THEN 'E3'
    ELSE 'E3'
  END AS item_type,
  COALESCE(wm.RSC_ID, wm.PRDT_ID) AS item_code,
  COALESCE(r.RSC_NM, p.PRDT_NM) AS item_name,
  wm.SPEC AS spec,
  wm.UNIT AS unit,
  SUM(CASE WHEN wm.RCVPAY_TY = 'S1' THEN wd.RCVPAY_QY ELSE -wd.RCVPAY_QY END) AS current_stock
FROM WRHOUS_WRHSDLVR_MAS wm
JOIN WRHOUS_WRHSDLVR wd ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID
LEFT JOIN RSC r ON wm.RSC_ID = r.RSC_ID
LEFT JOIN PRDT p ON wm.PRDT_ID = p.PRDT_ID
WHERE (wm.RSC_ID = ? OR wm.PRDT_ID = ?)
GROUP BY 
  CASE 
    WHEN wm.RSC_ID IS NOT NULL THEN 'E1'
    WHEN wm.PRDT_ID IS NOT NULL AND wm.PRDT_OPT_ID IS NULL THEN 'E2' 
    WHEN wm.PRDT_ID IS NOT NULL AND wm.PRDT_OPT_ID IS NOT NULL THEN 'E3'
    ELSE 'E3'
  END,
  COALESCE(wm.RSC_ID, wm.PRDT_ID),
  COALESCE(r.RSC_NM, p.PRDT_NM),
  wm.SPEC, wm.UNIT
HAVING current_stock > 0
`;

// 품목별 입출고 이력 조회 (마스터-디테일 구조)
const selectItemTransactionHistory = `
SELECT
  wm.WRHSDLVR_MAS_ID AS txn_id,
  wm.RCVPAY_TY AS txn_type,   -- 'S1'(입고) / 'S2'(출고)
  wd.RCVPAY_QY AS qty,
  COALESCE(wd.RSC_QLTY_INSP_ID, wd.SEMI_PRDT_QLTY_INSP_ID, wd.END_PRDT_QLTY_INSP_ID) AS inspect_id,
  wm.EMP_ID AS emp_id,
  e.EMP_NM AS emp_nm,
  DATE_FORMAT(wm.RCVPAY_DT, '%Y-%m-%d %H:%i:%s') AS rcvpay_dt,
  wm.RM AS rm
FROM WRHOUS_WRHSDLVR_MAS wm
JOIN WRHOUS_WRHSDLVR wd ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID
LEFT JOIN EMP e ON wm.EMP_ID = e.EMP_ID
WHERE 
  (
    (? = 'E1' AND wm.RSC_ID = ?)
    OR
    (? IN ('E2','E3') AND wm.PRDT_ID = ? AND (? = '' OR wm.PRDT_OPT_ID = ?))
  )
ORDER BY wm.RCVPAY_DT DESC
LIMIT 200
`;

// 품목 유형별 개별 재고 조회 (자재)
const selectRscInventoryStatus = `
SELECT 
  'E1' AS item_type,
  wm.RSC_ID AS item_code,
  r.RSC_NM AS item_name,
  wm.SPEC AS spec,
  wm.UNIT AS unit,
  SUM(CASE WHEN wm.RCVPAY_TY = 'S1' THEN wd.RCVPAY_QY ELSE -wd.RCVPAY_QY END) AS current_stock
FROM WRHOUS_WRHSDLVR_MAS wm
JOIN WRHOUS_WRHSDLVR wd ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID
LEFT JOIN RSC r ON wm.RSC_ID = r.RSC_ID
WHERE wm.RSC_ID = ?
GROUP BY wm.RSC_ID, r.RSC_NM, wm.SPEC, wm.UNIT
HAVING current_stock > 0
`;

// 품목 유형별 개별 재고 조회 (제품 - 반제품/완제품)
const selectPrdtInventoryStatus = `
SELECT 
  CASE 
    WHEN wm.PRDT_OPT_ID IS NULL THEN 'E2'
    ELSE 'E3'
  END AS item_type,
  wm.PRDT_ID AS item_code,
  p.PRDT_NM AS item_name,
  wm.PRDT_OPT_ID AS opt_code,
  wm.SPEC AS spec,
  wm.UNIT AS unit,
  SUM(CASE WHEN wm.RCVPAY_TY = 'S1' THEN wd.RCVPAY_QY ELSE -wd.RCVPAY_QY END) AS current_stock
FROM WRHOUS_WRHSDLVR_MAS wm
JOIN WRHOUS_WRHSDLVR wd ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID
LEFT JOIN PRDT p ON wm.PRDT_ID = p.PRDT_ID
WHERE wm.PRDT_ID = ? AND (? = '' OR wm.PRDT_OPT_ID = ?)
GROUP BY wm.PRDT_ID, p.PRDT_NM, wm.PRDT_OPT_ID, wm.SPEC, wm.UNIT
HAVING current_stock > 0
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
// 품목별 재고 현황 조회 (LOT별, OPT_ID 조건 추가)
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
WHERE (wm.RSC_ID = ? OR (wm.PRDT_ID = ? AND wm.PRDT_OPT_ID = ?))
GROUP BY wm.LOT_NO, wm.RSC_ID, wm.PRDT_ID, wm.PRDT_OPT_ID, wm.SPEC, wm.UNIT, wm.WRHOUS_ID, wm.ZONE_ID
HAVING current_stock > 0
ORDER BY first_rcvpay_dt ASC, wm.LOT_NO ASC
`;

// 출고 가능한 LOT 목록 조회 (선입선출)
const selectAvailableLots = `
SELECT
  lsp.WRHSDLVR_MAS_ID          AS wrhsdlvr_mas_id,
  wm.LOT_NO                    AS lot_no,
  COALESCE(lsp.NOW_STC_QY,0)   AS available_qty,
  wm.WRHOUS_ID                 AS wrhous_id,
  wm.ZONE_ID                   AS zone_id
FROM LOT_STC_PRECON lsp
JOIN WRHOUS_WRHSDLVR_MAS wm
  ON wm.WRHSDLVR_MAS_ID = lsp.WRHSDLVR_MAS_ID
WHERE wm.RCVPAY_TY = 'S1'  -- 입고에서 생성된 LOT만
  AND (
        (? = 'E1' AND wm.RSC_ID = ?)
     OR (? = 'E2' AND wm.PRDT_ID = ? AND wm.PRDT_OPT_ID IS NULL)
     OR (? = 'E3' AND wm.PRDT_ID = ? AND (wm.PRDT_OPT_ID <=> ?))
      )
  AND COALESCE(lsp.NOW_STC_QY,0) > 0
ORDER BY wm.RCVPAY_DT ASC, wm.LOT_NO ASC
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

// 납품서 개수 조회
const selectDeliveryOrderCount = `
SELECT COUNT(*) as cnt FROM DELI_DETA WHERE DELI_DETA_ID = ?
`;

// 자재 품질서 개수 조회
const selectRscInspectionOrderCount = `
SELECT COUNT(*) as cnt FROM RSC_QLTY_INSP WHERE RSC_QLTY_INSP_ID = ?
`;

// 반제품 품질서 개수 조회
const selectSemiInspectionOrderCount = `
SELECT COUNT(*) as cnt FROM SEMI_PRDT_QLTY_INSP WHERE SEMI_PRDT_QLTY_INSP_ID = ?
`;

// 완제품 품질서 개수 조회
const selectEndPrdtInspectionOrderCount = `
SELECT COUNT(*) as cnt FROM END_PRDT_QLTY_INSP WHERE END_PRDT_QLTY_INSP_ID = ?
`;

// 납품서 상세 잔여 수량 조회
const selectDeliveryOrderRemainingQty = `
SELECT dd.deli_qy, 
               COALESCE(SUM(wd.RCVPAY_QY), 0) AS delivered_qty,
               (dd.deli_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
               p.prdt_nm AS item_name
        FROM deli_deta dd 
        JOIN rcvord_deta rd ON dd.rcvord_deta_id = rd.rcvord_deta_id
        JOIN prdt p ON rd.prdt_id = p.prdt_id
        LEFT JOIN WRHOUS_WRHSDLVR wd ON dd.deli_deta_id = wd.DELI_DETA_ID
        LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
               AND wm.RCVPAY_TY = 'S2'
        WHERE dd.deli_deta_id = ?
        GROUP BY dd.deli_deta_id, dd.deli_qy, p.prdt_nm
`;

// 생산지시 상세 ID인 경우: 생산지시 수량에서 이미 불출된 수량 제외
const selectProductionOrderDetailsById = `
 SELECT pdd.drct_qy, 
               COALESCE(SUM(wd.RCVPAY_QY), 0) AS withdrawn_qty,
               (pdd.drct_qy - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
               p.prdt_nm AS item_name
        FROM prod_drct_deta pdd 
        JOIN prdt p ON pdd.prdt_id = p.prdt_id
        LEFT JOIN WRHOUS_WRHSDLVR wd ON pdd.prod_drct_deta_id = wd.RSC_QLTY_INSP_ID
        LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
               AND wm.RCVPAY_TY = 'S2'
        WHERE pdd.prod_drct_deta_id = ?
        GROUP BY pdd.prod_drct_deta_id, pdd.drct_qy, p.prdt_nm
`;

// 품질검사서인 경우: PASS_QY에서 이미 입고된 수량 제외
const selectRscInspectionDetails = `
  SELECT qi.PASS_QY,
                 COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
                 (qi.PASS_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
                 r.RSC_NM AS item_name
          FROM RSC_QLTY_INSP qi
          LEFT JOIN RSC_ORDR_DETA rod ON qi.RSC_ORDR_DETA_ID = rod.RSC_ORDR_DETA_ID
          LEFT JOIN RSC r ON rod.RSC_ID = r.RSC_ID
          LEFT JOIN WRHOUS_WRHSDLVR wd ON qi.RSC_QLTY_INSP_ID = wd.RSC_QLTY_INSP_ID
          LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
                 AND wm.RCVPAY_TY = 'S1'
          WHERE qi.RSC_QLTY_INSP_ID = ?
          GROUP BY qi.RSC_QLTY_INSP_ID, qi.PASS_QY, r.RSC_NM
`;

// 반제품 품질검사서 목록 조회 (사용) - 완전 입고된 것 제외
const selectSemiInspectionListById = `
SELECT qi.PASS_QY,
                 COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
                 (qi.PASS_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
                 'semi_product' AS item_name
          FROM SEMI_PRDT_QLTY_INSP qi
          LEFT JOIN WRHOUS_WRHSDLVR wd ON qi.SEMI_PRDT_QLTY_INSP_ID = wd.SEMI_PRDT_QLTY_INSP_ID
          LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
                 AND wm.RCVPAY_TY = 'S1'
          WHERE qi.SEMI_PRDT_QLTY_INSP_ID = ?
          GROUP BY qi.SEMI_PRDT_QLTY_INSP_ID, qi.PASS_QY
`;

// 완제품 품질검사서 목록 조회 (사용) - 완전 입고된 것 제외
const selectEndPrdtInspectionListById = `
SELECT qi.PASS_QY,
                 COALESCE(SUM(wd.RCVPAY_QY), 0) AS received_qty,
                 (qi.PASS_QY - COALESCE(SUM(wd.RCVPAY_QY), 0)) AS remaining_qty,
                 'N/A' AS item_name
          FROM END_PRDT_QLTY_INSP qi
          LEFT JOIN WRHOUS_WRHSDLVR wd ON qi.END_PRDT_QLTY_INSP_ID = wd.END_PRDT_QLTY_INSP_ID
          LEFT JOIN WRHOUS_WRHSDLVR_MAS wm ON wd.WRHSDLVR_MAS_ID = wm.WRHSDLVR_MAS_ID 
                 AND wm.RCVPAY_TY = 'S1'
          WHERE qi.END_PRDT_QLTY_INSP_ID = ?

          GROUP BY qi.END_PRDT_QLTY_INSP_ID, qi.PASS_QY`;

// FK 검증용 단건 쿼리: 완제품 품질검사서 ID 존재 여부 확인
const selectEndPrdtQltyInspById = `
SELECT end_prdt_qlty_insp_id FROM END_PRDT_QLTY_INSP WHERE end_prdt_qlty_insp_id = ? LIMIT 1

`;

// 재고 검증용 추가 쿼리들
// 주어진 제품/옵션에 대한 현재 재고 합계 (LOT_STC_PRECON 기준)
const selectNowStockByPrdtOpt = `
SELECT 
  COALESCE(SUM(lsp.NOW_STC_QY), 0) AS now_stock
FROM LOT_STC_PRECON lsp
JOIN WRHOUS_WRHSDLVR_MAS wm 
  ON wm.WRHSDLVR_MAS_ID = lsp.WRHSDLVR_MAS_ID
WHERE wm.PRDT_ID = ?
  AND ( ? IS NULL OR wm.PRDT_OPT_ID = ? )
`;

// 수주 상세ID들로부터 제품/옵션 매핑 조회
const selectPrdtAndOptByRcvordDetaIds = `
SELECT rcvord_deta_id, prdt_id, prdt_opt_id
FROM rcvord_deta
WHERE rcvord_deta_id IN (?)
`;

// 자재 불출용 가용 수량
const selectMaterialByProductOrder = `
WITH valid_bom AS (
  SELECT b.BOM_ID, b.PRDT_ID, b.PRDT_OPT_ID, b.VALID_FR_DT, b.BOM_VER
  FROM BOM b
  WHERE b.PRDT_ID = ?
  AND b.PRDT_OPT_ID = ?
),
max_fr AS ( -- 제품/옵션별 가장 최근 시작일
  SELECT PRDT_ID, PRDT_OPT_ID, MAX(VALID_FR_DT) AS MAX_FR
  FROM valid_bom
  GROUP BY PRDT_ID, PRDT_OPT_ID
),
cand AS (  -- 그 시작일에 해당하는 BOM 중 버전 최대
  SELECT v.*
  FROM valid_bom v
  JOIN max_fr m
    ON m.PRDT_ID = v.PRDT_ID AND (m.PRDT_OPT_ID <=> v.PRDT_OPT_ID)
   AND m.MAX_FR  = v.VALID_FR_DT
),
latest_bom AS (
  SELECT c.*
  FROM cand c
  JOIN (
    SELECT PRDT_ID, PRDT_OPT_ID, MAX(BOM_VER) AS MAX_VER
    FROM cand
    GROUP BY PRDT_ID, PRDT_OPT_ID
  ) mm
    ON mm.PRDT_ID = c.PRDT_ID AND (mm.PRDT_OPT_ID <=> c.PRDT_OPT_ID)
   AND mm.MAX_VER = c.BOM_VER
),
req AS (
  SELECT lb.PRDT_ID, lb.PRDT_OPT_ID, bd.RSC_ID, SUM(bd.REC_QY) AS REC_QY_PER_UNIT
  FROM latest_bom lb
  JOIN BOM_DETA bd ON bd.BOM_ID = lb.BOM_ID
  GROUP BY lb.PRDT_ID, lb.PRDT_OPT_ID, bd.RSC_ID
),
stk AS (
  SELECT m.RSC_ID, SUM(GREATEST(l.NOW_STC_QY,0)) AS STOCK_QY
  FROM LOT_STC_PRECON l
  JOIN WRHOUS_WRHSDLVR_MAS m
    ON m.WRHSDLVR_MAS_ID = l.WRHSDLVR_MAS_ID
  WHERE m.RSC_ID IS NOT NULL

  GROUP BY m.RSC_ID
)
SELECT
  r.PRDT_ID,
  r.PRDT_OPT_ID,
  COALESCE(
    FLOOR(
      MIN( COALESCE(s.STOCK_QY,0) / NULLIF(r.REC_QY_PER_UNIT,0) )
    ), 0
  ) AS AVAILABLE_QY
FROM req r
LEFT JOIN stk s ON s.RSC_ID = r.RSC_ID
GROUP BY r.PRDT_ID, r.PRDT_OPT_ID
ORDER BY r.PRDT_ID, r.PRDT_OPT_ID
`;

// 창고 입출고 마스터 삭제
const deleteWrhousdlvrMasById = `
DELETE FROM WRHOUS_WRHSDLVR_MAS
  WHERE wrhsdlvr_mas_id = ?
`;

// lot 재고 현황 삭제
const deleteLotStcPreconByMasId = `
DELETE FROM LOT_STC_PRECON
  WHERE wrhsdlvr_mas_id = ?
`;

// 자재 불출 삭제
const deleteMaterialWithdrawalByMasId = `
DELETE FROM RWMATR_RTUN_TRGET
  WHERE rsc_rtun_trget_id IN (
    SELECT rsc_rtun_trget_id
    FROM WRHOUS_WRHSDLVR
    WHERE wrhsdlvr_mas_id = ?
  )
`;

const deleteWrhousdlvrDetailsByMasId = `
    DELETE FROM WRHOUS_WRHSDLVR WHERE WRHSDLVR_MAS_ID = ?
  `;

// [NEW] 마스터 총수량 차감
const decreaseWrhousdlvrMasQty = `
    UPDATE WRHOUS_WRHSDLVR_MAS
       SET ALL_RCVPAY_QY = GREATEST(ALL_RCVPAY_QY - ?, 0)
     WHERE WRHSDLVR_MAS_ID = ?
  `;

// [NEW] LOT 롤백(입고)
const decreaseLotIstQtyByMasId = `
    UPDATE LOT_STC_PRECON
       SET IST_QY = GREATEST(IST_QY - ?, 0),
           NOW_STC_QY = GREATEST(NOW_STC_QY - ?, 0)
     WHERE WRHSDLVR_MAS_ID = ?
  `;

// [NEW] LOT 롤백(출고)
const decreaseLotOustQtyByMasId = `
    UPDATE LOT_STC_PRECON
       SET OUST_QY = GREATEST(OUST_QY - ?, 0),
           NOW_STC_QY = NOW_STC_QY + ?
     WHERE WRHSDLVR_MAS_ID = ?
  `;

// [NEW] LOT 0이면 삭제
const deleteLotIfZeroByMasId = `
  DELETE FROM LOT_STC_PRECON
   WHERE WRHSDLVR_MAS_ID = ?
     AND (COALESCE(IST_QY, 0) <= 0)
     AND (COALESCE(NOW_STC_QY, 0) <= 0)
`;

// [NEW] 마스터 0이면 삭제
const deleteWrhousdlvrMasIfZero = `
    DELETE FROM WRHOUS_WRHSDLVR_MAS
     WHERE WRHSDLVR_MAS_ID = ?
       AND (ALL_RCVPAY_QY IS NULL OR ALL_RCVPAY_QY <= 0)
  `;

const selectWrhousdlvrDeletePackByDetailIds = `
  SELECT
  d.WRHOUS_WRHSDLVR_ID  AS detail_id,
  d.WRHSDLVR_MAS_ID     AS mas_id,
  d.RCVPAY_QY           AS detail_qty,
  d.RSC_RTUN_TRGET_ID   AS rtun_id,
  m.RCVPAY_TY           AS rcvpay_ty,     
  m.ALL_RCVPAY_QY       AS mas_total_qty
FROM WRHOUS_WRHSDLVR d
JOIN WRHOUS_WRHSDLVR_MAS m ON m.WRHSDLVR_MAS_ID = d.WRHSDLVR_MAS_ID
WHERE d.WRHOUS_WRHSDLVR_ID IN (%IDS%)
`;

// 자재불출 수량 감소
const decreaseRwmatrRtunTrgetQty = `
  UPDATE RWMATR_RTUN_TRGET
     SET RTUN_QY = GREATEST(RTUN_QY - ?, 0)
   WHERE RSC_RTUN_TRGET_ID = ?
`;

// 자재불출 수량 0이면 삭제
const deleteRwmatrRtunTrgetIfZero = `
  DELETE FROM RWMATR_RTUN_TRGET
   WHERE RSC_RTUN_TRGET_ID = ?
     AND (RTUN_QY IS NULL OR RTUN_QY <= 0)
`;

const deleteWrhousTransaction = `
  DELETE FROM WRHOUS_WRHSDLVR
  WHERE WRHOUS_WRHSDLVR_ID = ?
`;

const decreaseLotOustQtyByS2MasId = `
  UPDATE LOT_STC_PRECON l
  JOIN WRHOUS_WRHSDLVR_MAS m_in   ON m_in.WRHSDLVR_MAS_ID = l.WRHSDLVR_MAS_ID  
  JOIN WRHOUS_WRHSDLVR_MAS m_out  ON m_out.LOT_NO = m_in.LOT_NO                
     SET l.OUST_QY    = GREATEST(l.OUST_QY - ?, 0),
         l.NOW_STC_QY = l.NOW_STC_QY + ?
   WHERE m_out.WRHSDLVR_MAS_ID = ?
`;

const deleteLotIfZeroByS2MasId = `
  DELETE FROM LOT_STC_PRECON
   WHERE WRHSDLVR_MAS_ID = ?
     AND COALESCE(IST_QY, 0)     <= 0
     AND COALESCE(NOW_STC_QY, 0) <= 0
`;

const insertLotStcPrecon = `
INSERT INTO LOT_STC_PRECON (
  LOT_INVNTRY_PRECON_ID,
  WRHSDLVR_MAS_ID,
  IST_QY,
  OUST_QY,
  NOW_STC_QY,
  RM
) VALUES (?, ?, ?, ?, ?, ?)`;

const selectMasByLotNo = `
SELECT WRHSDLVR_MAS_ID
    FROM WRHOUS_WRHSDLVR_MAS
   WHERE LOT_NO = ?
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
  validateEmployeeId,

  // FK 검증용 단건 쿼리
  selectEndPrdtQltyInspById,
  deductRscInspPassQty,
  deductSemiPrdtInspPassQty,
  deductEndPrdtInspPassQty,
  selectDeliveryOrderCount,
  selectRscInspectionOrderCount,
  selectSemiInspectionOrderCount,
  selectEndPrdtInspectionOrderCount,

  selectDeliveryOrderRemainingQty,
  selectProductionOrderDetailsById,
  selectRscInspectionDetails,
  selectSemiInspectionListById,
  selectEndPrdtInspectionListById,
  // 개별 품목 타입별 재고 조회
  selectRscInventoryStatus,
  selectPrdtInventoryStatus,

  selectNowStockByPrdtOpt,
  selectPrdtAndOptByRcvordDetaIds,

  selectMaterialByProductOrder,
  updateWrhousdlvrDetailQty,
  updateWrhousdlvrMasQty,
  updateLotStcPreconIstQty,
  updateLotStcPreconOustQty,
  updateMaterialWithdrawalQty,

  // 삭제(사용)
  deleteWrhousdlvrDetailsByMasId,
  deleteWrhousdlvrMasById,
  deleteLotStcPreconByMasId,
  deleteMaterialWithdrawalByMasId,
  decreaseWrhousdlvrMasQty,
  decreaseLotIstQtyByMasId,
  decreaseLotOustQtyByMasId,
  deleteLotIfZeroByMasId,
  deleteWrhousdlvrMasIfZero,
  selectWrhousdlvrDeletePackByDetailIds,
  decreaseRwmatrRtunTrgetQty,
  deleteRwmatrRtunTrgetIfZero,
  deleteWrhousTransaction,
  decreaseLotOustQtyByS2MasId,
  deleteLotIfZeroByS2MasId,
  createLotId,
  insertLotStcPrecon,

  // 수정 중
  selectMasByLotNo,
};
