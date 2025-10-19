// express 땡겨오자
const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();
// 해당 라우터를 통해 제공할 서비스를 가져옴
const routingService = require("../services/routing_service.js");

// 라우팅 상세 행 저장 (INSERT 또는 UPDATE)
router.post("/routing/deta/save", async (req, res) => {
  try {
    const { prdt_id, prdt_opt_id, rows } = req.body;
    const result = await routingService.saveRoutingDetaRows(
      prdt_id,
      prdt_opt_id,
      rows
    );
    res.json({ success: true, affected: result });
  } catch (error) {
    console.error("[routing_router] 라우팅 상세 행 저장 오류:", error);
    res
      .status(500)
      .json({ message: "라우팅 상세 행 저장 중 오류가 발생했습니다." });
  }
});

// 라우팅 상세 행 삭제 (여러개)
router.post("/routing/deta/delete", async (req, res) => {
  try {
    const { prdt_id, prdt_opt_id, rows } = req.body;
    const result = await routingService.deleteRoutingDetaRows(
      prdt_id,
      prdt_opt_id,
      rows
    );
    res.json({ success: true, deleted: result });
  } catch (error) {
    console.error("[routing_router] 라우팅 상세 행 삭제 오류:", error);
    res
      .status(500)
      .json({ message: "라우팅 상세 행 삭제 중 오류가 발생했습니다." });
  }
});

// 제품코드로 공정 조회
// routes/routing_router.js

router.get("/prcs", async (req, res) => {
  try {
    console.log("[routing_router] 공정 모달 조회 요청:", req.query);
    let { prcs_id, prcs_nm, eqm_grp_nm, lead_tm, mold_use_at } = req.query;
    let result = await routingService.getPrcsModal(
      prcs_id,
      prcs_nm,
      eqm_grp_nm,
      lead_tm,
      mold_use_at
    );
    console.log(
      "[routing_router] 공정 모달 조회 결과:",
      result?.length || 0,
      "건"
    );
    res.json(result || []);
  } catch (error) {
    console.error("[routing_router] 공정 모달 조회 오류:", error);
    res.status(500).json({ message: "공정 모달 조회 중 오류가 발생했습니다." });
  }
});

router.get("/prdt/prcs", async (req, res) => {
  try {
    console.log("[routing_router] 제품 공정 조회 요청:", req.query);
    let { prdt_id, prdt_opt_id } = req.query;
    let result = await routingService.selectPrcs(prdt_id, prdt_opt_id);
    console.log(
      "[routing_router] 제품 공정 조회 결과:",
      result?.length || 0,
      "건"
    );
    res.json(result || []);
  } catch (error) {
    console.error("[routing_router] 제품 공정 조회 오류:", error);
    res.status(500).json({ message: "제품 공정 조회 중 오류가 발생했습니다." });
  }
});

// 라우팅 페이지 전용: 제품+옵션 목록 조회 (제품명/옵션ID) - prdt 파일 변경 없이 처리
router.get("/routing/prdts", async (req, res) => {
  try {
    console.log("[routing_router] 라우팅 전용 제품 조회 요청:", req.query);
    const { prdt_nm = "", prdt_opt_id = "" } = req.query;
    const result = await routingService.searchPrdtForRouting(
      prdt_nm,
      prdt_opt_id
    );
    console.log(
      "[routing_router] 라우팅 전용 제품 조회 결과:",
      result?.length || 0,
      "건"
    );
    res.json(result || []);
  } catch (error) {
    console.error("[routing_router] 라우팅 전용 제품 조회 오류:", error);
    res
      .status(500)
      .json({ message: "라우팅 전용 제품 조회 중 오류가 발생했습니다." });
  }
});

module.exports = router;

// └───제품코드로 공정 조회 라우터───┘
// └───routing_router.js───┘
