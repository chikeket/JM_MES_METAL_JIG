const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 검사서ID로 남은 수량(remaining_qty) 단건 조회
router.get('/warehouse/inspection-remaining-qty', async (req, res) => {
  try {
    const { inspect_id, item_type } = req.query;
    const result = await wrhousdlvrService.getInspectionRemainingQty({ inspect_id, item_type });
    res.json(result);
  } catch (err) {
    console.error('[API] /warehouse/inspection-remaining-qty error:', err);
    res.status(500).json({ error: err?.message ?? 'server error' });
  }
});


// 가용 수량 단건 조회 (E1/E2/E3 + 코드 + 옵션)
router.get('/warehouse/available-qty', async (req, res) => {
  try {
    let { item_type, item_code, item_opt_code = '' } = req.query;
    item_type = item_type ?? '';
    item_code = item_code ?? '';
    item_opt_code = item_opt_code ?? '';
    console.log('[API] /warehouse/available-qty params:', { item_type, item_code, item_opt_code });
    const result = await wrhousdlvrService.getAvailableQty({ item_type, item_code, item_opt_code });
    res.json(result);
  } catch (err) {
    console.error('[API] /warehouse/available-qty error:', err);
    res.status(500).json({ error: err?.message ?? 'server error' });
  }
});


// 해당 라우터를 통해 제공할 서비스를 가져옴
const wrhousdlvrService = require("../services/wrhousdlvr_service.js");

// 전체 창고 목록 조회 (품목 유형별 필터링 가능)
router.get("/warehouses/all", async (req, res) => {
  try {
    console.log("[wrhousdlvr_router] GET /warehouses/all query:", req.query);
    const result = await wrhousdlvrService.getAllWarehouses(req.query);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] GET /warehouses/all error:", err);
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 전체 로케이션 목록 조회 (품목 유형별 필터링 가능)
router.get("/locations/all", async (req, res) => {
  try {
    console.log("[wrhousdlvr_router] GET /locations/all query:", req.query);
    const result = await wrhousdlvrService.getAllLocations(req.query);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] GET /locations/all error:", err);
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

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
router.get("/wrhousdlvr/qltyInsp/list", async (req, res) => {
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

// 자재 품질검사서 목록 조회 (창고용)
router.get("/warehouse/rscQltyInsp/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /warehouse/rscQltyInsp/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    console.log("[wrhousdlvr_router] 파라미터 확인:", {
      item_code,
      item_name,
      insp_status,
    });

    const results = await wrhousdlvrService.getWarehouseRscInspections(
      item_code,
      item_name
    );

    console.log("[wrhousdlvr_router] 자재 검사서 응답 건수:", results.length);
    console.log("[wrhousdlvr_router] 응답 데이터 샘플:", results.slice(0, 2));

    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 자재 검사서 조회 실패:", error);
    console.error("[wrhousdlvr_router] 에러 스택:", error.stack);
    res.status(500).json({
      error: "자재 검사서 목록 조회 실패",
      message: error.message,
      details: error.stack,
    });
  }
});

// 완제품 품질검사서 목록 조회 (창고용)
router.get("/warehouse/endPrdtQltyInsp/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /warehouse/endPrdtQltyInsp/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    console.log("[wrhousdlvr_router] 파라미터 확인:", {
      item_code,
      item_name,
      insp_status,
    });

    const results = await wrhousdlvrService.getWarehouseEndPrdtInspections(
      item_code,
      item_name
    );

    console.log("[wrhousdlvr_router] 완제품 검사서 응답 건수:", results.length);
    console.log("[wrhousdlvr_router] 응답 데이터 샘플:", results.slice(0, 2));

    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 완제품 검사서 조회 실패:", error);
    console.error("[wrhousdlvr_router] 에러 스택:", error.stack);
    res.status(500).json({
      error: "완제품 검사서 목록 조회 실패",
      message: error.message,
      details: error.stack,
    });
  }
});

// 반제품 품질검사서 목록 조회 (창고용)
router.get("/warehouse/semiPrdtQltyInsp/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /warehouse/semiPrdtQltyInsp/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "", insp_status = "" } = req.query;

    console.log("[wrhousdlvr_router] 파라미터 확인:", {
      item_code,
      item_name,
      insp_status,
    });

    const results = await wrhousdlvrService.getWarehouseSemiInspections(
      item_code,
      item_name
    );

    console.log("[wrhousdlvr_router] 반제품 검사서 응답 건수:", results.length);
    console.log("[wrhousdlvr_router] 응답 데이터 샘플:", results.slice(0, 2));

    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 반제품 검사서 조회 실패:", error);
    console.error("[wrhousdlvr_router] 에러 스택:", error.stack);
    res.status(500).json({
      error: "반제품 검사서 목록 조회 실패",
      message: error.message,
      details: error.stack,
    });
  }
});

// LOT 할당 정보 조회 (출고용)
router.get("/warehouse/lots/allocations", async (req, res) => {
  console.log("[wrhousdlvr_router] /warehouse/lots/allocations 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_type, item_code, item_opt_code, quantity } = req.query;

    console.log("[wrhousdlvr_router] LOT 할당 파라미터:", {
      item_type,
      item_code,
      item_opt_code,
      quantity: Number(quantity)
    });

    const result = await wrhousdlvrService.getLotAllocations({
      item_type,
      item_code,
      item_opt_code: item_opt_code || null,
      quantity: Number(quantity)
    });

    console.log("[wrhousdlvr_router] LOT 할당 결과:", result.length, "건");
    console.log("[wrhousdlvr_router] LOT 할당 상세:", result);

    res.json(result);
  } catch (error) {
    console.error("[wrhousdlvr_router] LOT 할당 조회 실패:", error);
    res.status(500).json({
      error: "LOT 할당 조회 실패",
      message: error.message,
      details: error.stack
    });
  }
});

// 납품 상세 목록 조회
router.get("/wrhousdlvr/warehouse/products/list", async (req, res) => {
  console.log(
    "[wrhousdlvr_router] /wrhousdlvr/warehouse/products/list 요청 받음"
  );
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

// 생산지시 상세 목록 조회 (상단 그리드용)
router.get("/production/orders/details", async (req, res) => {
  console.log("[wrhousdlvr_router] /production/orders/details 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { product_code = "", product_name = "" } = req.query;

    console.log("[wrhousdlvr_router] 파라미터 확인:", {
      product_code,
      product_name,
    });

    const results = await wrhousdlvrService.getProductionOrderDetailsList(
      product_code,
      product_name
    );

    console.log("[wrhousdlvr_router] 생산지시 상세 응답 건수:", results.length);

    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 생산지시 상세 조회 오류:", error);
    res.status(500).json({
      error: "생산지시 상세 조회 실패",
      message: error.message,
    });
  }
});

// 특정 생산지시의 BOM 자재 목록 조회 (하단 그리드용)
router.get(
  "/production/orders/:prod_drct_deta_id/materials",
  async (req, res) => {
    console.log(
      "[wrhousdlvr_router] /production/orders/:prod_drct_deta_id/materials 요청 받음"
    );
    console.log("[wrhousdlvr_router] params:", req.params);

    try {
      const { prod_drct_deta_id } = req.params;

      if (!prod_drct_deta_id) {
        return res.status(400).json({
          error: "생산지시 상세 ID가 필요합니다",
        });
      }

      console.log("[wrhousdlvr_router] 파라미터 확인:", { prod_drct_deta_id });

      const results = await wrhousdlvrService.getMaterialByProductionOrder(
        prod_drct_deta_id
      );

      console.log(
        "[wrhousdlvr_router] BOM 자재 목록 응답 건수:",
        results.length
      );

      res.json(results);
    } catch (error) {
      console.error("[wrhousdlvr_router] BOM 자재 목록 조회 오류:", error);
      res.status(500).json({
        error: "BOM 자재 목록 조회 실패",
        message: error.message,
      });
    }
  }
);

// 자재 불출 대상 목록 조회 (생산지시 → BOM 기반)
router.get("/material/withdrawal/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /material/withdrawal/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "" } = req.query;

    console.log("[wrhousdlvr_router] 파라미터 확인:", { item_code, item_name });

    const results = await wrhousdlvrService.getMaterialWithdrawalList(
      item_code,
      item_name
    );

    console.log(
      "[wrhousdlvr_router] 자재 불출 대상 응답 건수:",
      results.length
    );
    console.log("[wrhousdlvr_router] 응답 데이터 샘플:", results.slice(0, 2));

    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 자재 불출 대상 조회 실패:", error);
    console.error("[wrhousdlvr_router] 에러 스택:", error.stack);
    res.status(500).json({
      error: "자재 불출 대상 목록 조회 실패",
      message: error.message,
      details: error.stack,
    });
  }
});

// 완제품 납품 대상 목록 조회 (납품상세 기반)
router.get("/delivery/products/list", async (req, res) => {
  console.log("[wrhousdlvr_router] /delivery/products/list 요청 받음");
  console.log("[wrhousdlvr_router] query:", req.query);

  try {
    const { item_code = "", item_name = "" } = req.query;

    console.log("[wrhousdlvr_router] 파라미터 확인:", { item_code, item_name });

    const results = await wrhousdlvrService.getDeliveryProductsList(
      item_code,
      item_name
    );

    console.log(
      "[wrhousdlvr_router] 완제품 납품 대상 응답 건수:",
      results.length
    );
    console.log("[wrhousdlvr_router] 응답 데이터 샘플:", results.slice(0, 2));

    res.json(results);
  } catch (error) {
    console.error("[wrhousdlvr_router] 완제품 납품 대상 조회 실패:", error);
    console.error("[wrhousdlvr_router] 에러 스택:", error.stack);
    res.status(500).json({
      error: "완제품 납품 대상 목록 조회 실패",
      message: error.message,
      details: error.stack,
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
    console.log("[wrhousdlvr_router] POST /warehouse/transactions 요청 받음");
    console.log("[wrhousdlvr_router] 요청 헤더:", req.headers);
    console.log("[wrhousdlvr_router] 요청 본문:", req.body);

    // transactionList 구조 분기 처리
    if (Array.isArray(req.body.transactionList)) {
      // transactionList 구조면 processTransactions로 위임
      try {
        const result = await wrhousdlvrService.processTransactions(req.body);
        res.status(result.success ? 200 : 400).json(result);
      } catch (err) {
        console.error("[wrhousdlvr_router] processTransactions error:", err);
        res.status(500).json({ success: false, error: err?.message ?? "server error" });
      }
      return;
    }

    // 기존 방식 (mode, masterTransactions, detailTransactions)
    const { mode, masterTransactions, detailTransactions } = req.body;
    if (!mode || !Array.isArray(masterTransactions) || !Array.isArray(detailTransactions)) {
      return res.status(400).json({
        success: false,
        error: "mode, masterTransactions, detailTransactions가 필요합니다.",
      });
    }
    if (detailTransactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "디테일 테이블에 값이 하나도 없으면 저장할 수 없습니다.",
      });
    }
    console.log(`[wrhousdlvr_router] 마스터 거래: ${masterTransactions.length}건`);
    console.log(`[wrhousdlvr_router] 디테일 거래: ${detailTransactions.length}건`);
    const result = await wrhousdlvrService.saveWarehouseTransactions({
      mode,
      masterTransactions,
      detailTransactions,
    });
    console.log("[wrhousdlvr_router] 창고 거래 저장 결과:", result);
    res.json(result);
  } catch (err) {
    console.error("[wrhousdlvr_router] POST error:", err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, error: err?.message ?? "server error" });
  }
});

// 기존 API 호환을 위한 레거시 엔드포인트 (deprecated)
router.post("/warehouse/transactions/legacy", async (req, res) => {
  try {
    console.log(
      "[wrhousdlvr_router] POST /warehouse/transactions/legacy 요청 받음"
    );
    console.log("[wrhousdlvr_router] 요청 헤더:", req.headers);
    console.log(
      "[wrhousdlvr_router] 요청 본문 크기:",
      JSON.stringify(req.body).length
    );
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
        item_name: t.item_name,
        qty: t.qty,
        warehouse_id: t.warehouse_id,
        location_id: t.location_id,
      }));
      console.log(
        "[wrhousdlvr_router] transaction preview (first 5):",
        preview
      );
    }

    // 서비스를 통해 저장 처리
    console.log("[wrhousdlvr_router] saveTransaction 호출 시작");
    const result = await wrhousdlvrService.saveTransaction({
      transactionList,
      emp_id,
    });

    console.log("[wrhousdlvr_router] saveTransaction 결과:", result);

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
router.post("/transactions", async (req, res) => {
  console.log("[wrhousdlvr_router] 창고 입출고 처리 요청:", req.body);

  try {
    const result = await wrhousdlvrService.processTransactions(req.body);

    if (result.isSuccessed) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[wrhousdlvr_router] 거래 처리 오류:", error);
    res.status(500).json({
      isSuccessed: false,
      error: "창고 입출고 처리 중 서버 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

module.exports = router;
