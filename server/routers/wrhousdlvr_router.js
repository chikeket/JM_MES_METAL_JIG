const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const wrhousdlvrService = require("../services/wrhousdlvr_service.js");

// 창고 입출고 거래 목록 조회 (마스터 목록)
router.get("/warehouse/transactions", async (req, res) => {
  try {
    console.log("[wrhousdlvr_router] incoming query:", req.query);
    const result = await wrhousdlvrService.getTransactionList(req.query);
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousdlvr_router] error stack:",
      err && err.stack ? err.stack : err
    );
    // 상세 에러를 개발용으로 응답에 포함 (운영시 제거)
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 검사서 목록 조회 (입출고 가능한 검사 완료 품목들)
router.get("/warehouse/inspections", async (req, res) => {
  try {
    console.log("[wrhousdlvr_router] /inspections query:", req.query);
    const result = await wrhousdlvrService.getInspectionList(req.query);
    console.log(
      "[wrhousdlvr_router] /inspections result length:",
      Array.isArray(result) ? result.length : "N/A"
    );
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] /inspections error:", err);
    res.status(500).json([]);
  }
});

// 품질검사서 목록 조회 (기존 API와 호환)
router.get("/qltyInsp/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /qltyInsp/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    const results = await wrhousdlvrService.getQualityInspectionList(
      item_code,
      item_name,
      insp_status
    );

    console.log("[wrhousdlvr_router] 완제품 검사서 응답 건수:", results.length);
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 완제품 검사서 조회 실패:", error);
    res.status(500).json({
      error: "검사서 목록 조회 실패",
      message: error.message,
    });
  }
});

// 자재 품질검사서 목록 조회
router.get("/rscQltyInsp/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /rscQltyInsp/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    const results = await wrhousdlvrService.getRscQualityInspectionList(
      item_code,
      item_name,
      insp_status
    );

    console.log("[wrhousdlvr_router] 자재 검사서 응답 건수:", results.length);
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 자재 검사서 조회 실패:", error);
    res.status(500).json({
      error: "자재 검사서 목록 조회 실패",
      message: error.message,
    });
  }
});

// 자재 품질검사서 목록 조회 (기존 호환성)
router.get("/qltyInsp/rsc/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /qltyInsp/rsc/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    const results = await wrhousdlvrService.getRscQualityInspectionList(
      item_code,
      item_name,
      insp_status
    );

    console.log("[wrhousdlvr_router] 자재 검사서 응답 건수:", results.length);
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 자재 검사서 조회 실패:", error);
    res.status(500).json({
      error: "자재 검사서 목록 조회 실패",
      message: error.message,
    });
  }
});

// 완제품 품질검사서 목록 조회
router.get("/endPrdtQltyInsp/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /endPrdtQltyInsp/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    const results = await wrhousdlvrService.getFinishedQualityInspectionList(
      item_code,
      item_name,
      insp_status
    );

    console.log("[wrhousdlvr_router] 완제품 검사서 응답 건수:", results.length);
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 완제품 검사서 조회 실패:", error);
    res.status(500).json({
      error: "완제품 검사서 목록 조회 실패",
      message: error.message,
    });
  }
});

// 완제품 품질검사서 목록 조회 (기존 호환성)
router.get("/qltyInsp/finished/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /qltyInsp/finished/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    const results = await wrhousdlvrService.getFinishedQualityInspectionList(
      item_code,
      item_name,
      insp_status
    );

    console.log("[wrhousdlvr_router] 완제품 검사서 응답 건수:", results.length);
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 완제품 검사서 조회 실패:", error);
    res.status(500).json({
      error: "완제품 검사서 목록 조회 실패",
      message: error.message,
    });
  }
});

// 반제품 품질검사서 목록 조회
router.get("/semiPrdtQltyInsp/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /semiPrdtQltyInsp/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    const results = await wrhousdlvrService.getSemiQualityInspectionList(
      item_code,
      item_name,
      insp_status
    );

    console.log("[wrhousdlvr_router] 반제품 검사서 응답 건수:", results.length);
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 반제품 검사서 조회 실패:", error);
    res.status(500).json({
      error: "반제품 검사서 목록 조회 실패",
      message: error.message,
    });
  }
});

// 반제품 품질검사서 목록 조회 (기존 호환성)
router.get("/qltyInsp/semi/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /qltyInsp/semi/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    const results = await wrhousdlvrService.getSemiQualityInspectionList(
      item_code,
      item_name,
      insp_status
    );

    console.log("[wrhousdlvr_router] 반제품 검사서 응답 건수:", results.length);
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 반제품 검사서 조회 실패:", error);
    res.status(500).json({
      error: "반제품 검사서 목록 조회 실패",
      message: error.message,
    });
  }
});

// 납품 상세 목록 조회
router.get("/delivery/detail/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /delivery/detail/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", delivery_status = "" } = req.query;

    const results = await wrhousdlvrService.getDeliveryDetailList(
      item_code,
      item_name,
      delivery_status
    );

    console.log("[wrhousdlvr_router] 납품 상세 응답 건수:", results.length);
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 납품 상세 조회 실패:", error);
    res.status(500).json({
      error: "납품 상세 목록 조회 실패",
      message: error.message,
    });
  }
});

// 자재 불출 대상 목록 조회
router.get("/material/withdrawal/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /material/withdrawal/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const {
      item_code = "",
      item_name = "",
      withdrawal_status = "",
    } = req.query;

    const results = await wrhousdlvrService.getMaterialWithdrawalList(
      item_code,
      item_name,
      withdrawal_status
    );

    console.log(
      "[wrhousdlvr_router] 자재 불출 대상 응답 건수:",
      results.length
    );
    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 자재 불출 대상 조회 실패:", error);
    res.status(500).json({
      error: "자재 불출 대상 목록 조회 실패",
      message: error.message,
    });
  }
});

// 납품서 기반 검사서 목록 조회
router.get("/delivery/inspections", async (req, res) => {
  try {
    console.log("[wrhousdlvr_router] /delivery/inspections query:", req.query);
    const result = await wrhousdlvrService.getDeliveryInspectionList(req.query);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] /delivery/inspections error:", err);
    res.status(500).json([]);
  }
});

// 발주서 기반 검사서 목록 조회
router.get("/order/inspections", async (req, res) => {
  try {
    console.log("[wrhousdlvr_router] /order/inspections query:", req.query);
    const result = await wrhousdlvrService.getOrderInspectionList(req.query);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] /order/inspections error:", err);
    res.status(500).json([]);
  }
});

// 지시서 기반 검사서 목록 조회
router.get("/instruction/inspections", async (req, res) => {
  try {
    console.log(
      "[wrhousdlvr_router] /instruction/inspections query:",
      req.query
    );
    const result = await wrhousdlvrService.getInstructionInspectionList(
      req.query
    );
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] /instruction/inspections error:", err);
    res.status(500).json([]);
  }
});

// 품목별 현재 재고 조회
router.get("/warehouse/inventory/:itemCode", async (req, res) => {
  try {
    const itemCode = req.params.itemCode;
    console.log("[wrhousdlvr_router] /inventory itemCode:", itemCode);
    const result = await wrhousdlvrService.getInventoryStatus(itemCode);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] /inventory error:", err);
    res.status(500).json([]);
  }
});

// 품목별 입출고 이력 조회
router.get("/warehouse/history/:itemCode", async (req, res) => {
  try {
    const itemCode = req.params.itemCode;
    console.log("[wrhousdlvr_router] /history itemCode:", itemCode);
    const result = await wrhousdlvrService.getItemTransactionHistory(itemCode);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] /history error:", err);
    res.status(500).json([]);
  }
});

// 창고 입출고 거래 저장 (신규/수정)
router.post("/warehouse/transactions", async (req, res) => {
  try {
    console.log(
      "[wrhousdlvr_router] POST body:",
      JSON.stringify(req.body).slice(0, 2000)
    );

    // 요청 본문에서 거래 목록과 사용자 정보 추출
    const { transactionList, emp_id } = req.body;

    if (Array.isArray(transactionList)) {
      const preview = transactionList.slice(0, 5).map((t) => ({
        txn_type: t.txn_type,
        item_code: t.item_code,
        qty: t.qty,
      }));
      console.log(
        "[wrhousdlvr_router] transaction preview (first 5):",
        preview
      );
    }

    // 서비스를 통해 저장 처리
    const result = await wrhousdlvrService.saveTransaction({
      transactionList,
      emp_id,
    });

    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousdlvr_router] POST error:",
      err && err.stack ? err.stack : err
    );
    res
      .status(500)
      .json({ isSuccessed: false, error: err?.message ?? "server error" });
  }
});

// 창고 입출고 거래 삭제 (단일)
router.delete("/warehouse/transactions/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("[wrhousdlvr_router] DELETE /transactions id=", id);
    const result = await wrhousdlvrService.deleteTransaction(id);
    console.log("[wrhousdlvr_router] DELETE result=", result);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] DELETE error:", err);
    res.status(500).json({ isSuccessed: false, error: err.message });
  }
});

// 선택된 거래들 일괄 삭제 (body: { ids: [] })
router.post("/warehouse/transactions/delete", async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    console.log("[wrhousdlvr_router] bulk delete ids:", ids);
    const result = await wrhousdlvrService.deleteSelectedTransactions(ids);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] bulk delete error:", err);
    res
      .status(500)
      .json({ isSuccessed: false, error: err?.message ?? "server error" });
  }
});

// 창고 입출고 거래 처리 (LOT 번호 자동 생성 포함)
router.post('/transactions', async (req, res) => {
  console.log('[wrhousdlvr_router] 창고 입출고 처리 요청:', req.body);
  
  try {
    const result = await wrhousdlvrService.processTransactions(req.body);
    
    if (result.isSuccessed) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('[wrhousdlvr_router] 거래 처리 오류:', error);
    res.status(500).json({
      isSuccessed: false,
      error: '창고 입출고 처리 중 서버 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 창고 재고 자재 목록 조회 (자재 불출용)
router.get('/warehouse/materials/list', async (req, res) => {
  console.log('[wrhousdlvr_router] /warehouse/materials/list 요청 받음');
  console.log('[wrhousdlvr_router] query:', req.query);

  try {
    const { item_code = '', item_name = '' } = req.query;

    // 재고가 있는 자재들만 조회하는 SQL
    const sql = `
      SELECT 
        w.lot_no as insp_no,
        r.rsc_id as item_code,
        r.rsc_nm as item_name,
        r.spec as item_spec,
        r.unit as item_unit,
        SUM(CASE WHEN w.rcvpay_ty = '입고' THEN w.rcvpay_qy ELSE -w.rcvpay_qy END) as pass_qty,
        SUM(CASE WHEN w.rcvpay_ty = '입고' THEN w.rcvpay_qy ELSE -w.rcvpay_qy END) as insp_qty,
        '완료' as insp_status,
        MAX(w.rcvpay_dt) as insp_date,
        '시스템' as insp_emp_name
      FROM wrhous_wrhsdlvr w
      LEFT JOIN rsc r ON w.rsc_id = r.rsc_id
      WHERE w.rsc_id IS NOT NULL
        AND (? = '' OR r.rsc_id LIKE CONCAT('%', ?, '%'))
        AND (? = '' OR r.rsc_nm LIKE CONCAT('%', ?, '%'))
      GROUP BY w.lot_no, r.rsc_id, r.rsc_nm, r.spec, r.unit
      HAVING pass_qty > 0
      ORDER BY MAX(w.rcvpay_dt) DESC
      LIMIT 100
    `;

    const results = await wrhousdlvrService.executeQuery(sql, [
      item_code, item_code, item_name, item_name
    ]);

    console.log('[wrhousdlvr_router] 창고 자재 응답 건수:', results.length);
    res.json(results || []);
  } catch (error) {
    console.error('[wrhousdlvr_router] 창고 자재 조회 실패:', error);
    res.status(500).json([]);
  }
});

// 창고 완제품 목록 조회 (완제품 납품용)
router.get('/warehouse/products/list', async (req, res) => {
  console.log('[wrhousdlvr_router] /warehouse/products/list 요청 받음');
  console.log('[wrhousdlvr_router] query:', req.query);

  try {
    const { item_code = '', item_name = '' } = req.query;

    // 재고가 있는 완제품들만 조회하는 SQL
    const sql = `
      SELECT 
        w.lot_no as insp_no,
        p.prdt_id as item_code,
        p.prdt_nm as item_name,
        p.spec as item_spec,
        p.unit as item_unit,
        SUM(CASE WHEN w.rcvpay_ty = '입고' THEN w.rcvpay_qy ELSE -w.rcvpay_qy END) as pass_qty,
        SUM(CASE WHEN w.rcvpay_ty = '입고' THEN w.rcvpay_qy ELSE -w.rcvpay_qy END) as insp_qty,
        '완료' as insp_status,
        MAX(w.rcvpay_dt) as insp_date,
        '시스템' as insp_emp_name
      FROM wrhous_wrhsdlvr w
      LEFT JOIN prdt p ON w.prdt_id = p.prdt_id
      WHERE w.prdt_id IS NOT NULL
        AND (? = '' OR p.prdt_id LIKE CONCAT('%', ?, '%'))
        AND (? = '' OR p.prdt_nm LIKE CONCAT('%', ?, '%'))
      GROUP BY w.lot_no, p.prdt_id, p.prdt_nm, p.spec, p.unit
      HAVING pass_qty > 0
      ORDER BY MAX(w.rcvpay_dt) DESC
      LIMIT 100
    `;

    const results = await wrhousdlvrService.executeQuery(sql, [
      item_code, item_code, item_name, item_name
    ]);

    console.log('[wrhousdlvr_router] 창고 완제품 응답 건수:', results.length);
    res.json(results || []);
  } catch (error) {
    console.error('[wrhousdlvr_router] 창고 완제품 조회 실패:', error);
    res.status(500).json([]);
  }
});

// 창고 자재 목록 조회 (자재 불출용)
router.get("/api/warehouse/materials/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /api/warehouse/materials/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "" } = req.query;

    // 창고 입출고 전용 서비스 사용
    const result = await wrhousdlvrService.getWarehouseMaterials(item_code, item_name);

    console.log("[wrhousdlvr_router] 창고 자재 응답 건수:", result?.length || 0);
    res.json(result || []);
  } catch (error) {
    console.error("[wrhousdlvr_router] 창고 자재 조회 실패:", error);
    res.status(500).json([]);
  }
});

// 창고 완제품 목록 조회 (완제품 납품용)
router.get("/api/warehouse/products/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /api/warehouse/products/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "" } = req.query;

    // 창고 입출고 전용 서비스 사용
    const result = await wrhousdlvrService.getWarehouseProducts(item_code, item_name);

    console.log("[wrhousdlvr_router] 창고 완제품 응답 건수:", result?.length || 0);
    res.json(result || []);
  } catch (error) {
    console.error("[wrhousdlvr_router] 창고 완제품 조회 실패:", error);
    res.status(500).json([]);
  }
});

module.exports = router;
