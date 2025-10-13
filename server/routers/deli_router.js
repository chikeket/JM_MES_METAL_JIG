const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const deliService = require("../services/deli_service.js");

// 모달 목록
router.get("/delis", async (req, res) => {
  try {
    const kw = req.query.deli_id || "";
    const list = await deliService.getDeliList(kw);
    res.json(list);
  } catch (err) {
    console.error("[GET /delis] error:", err);
    res
      .status(500)
      .json({ message: "납품 목록 조회 오류", error: err.message });
  }
});

// 기납품 누계 조회: /delis/delivered-sum?ids=ROD001,ROD002
router.get("/delis/delivered-sum", async (req, res) => {
  try {
    const idsParam = (req.query.ids || "").trim();
    const ids = idsParam
      ? idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const map = await deliService.getDeliveredSumByRcvDetaIds(ids);
    res.json({ ok: true, data: map });
  } catch (err) {
    console.error("[GET /delis/delivered-sum] error:", err);
    res
      .status(500)
      .json({ message: "기납품 누계 조회 오류", error: err.message });
  }
});

// 기준일시 이전 기납품 누계 조회: /delis/delivered-sum-before?ids=ROD001,ROD002&cutoffDt=2025-10-05%2018:15:12
router.get("/delis/delivered-sum-before", async (req, res) => {
  try {
    const idsParam = (req.query.ids || "").trim();
    const cutoffDt = (req.query.cutoffDt || "").trim();
    const ids = idsParam
      ? idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const map = await deliService.getDeliveredSumByRcvDetaIdsBefore(
      ids,
      cutoffDt
    );
    res.json({ ok: true, data: map });
  } catch (err) {
    console.error("[GET /delis/delivered-sum-before] error:", err);
    res
      .status(500)
      .json({ message: "기납품 누계 조회 오류", error: err.message });
  }
});

// 단건 상세
router.get("/delis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await deliService.getDeliDetail(id);
    if (!detail)
      return res.status(404).json({ message: "납품서를 찾을 수 없습니다." });
    res.json(detail);
  } catch (err) {
    console.error("[GET /delis/:id] error:", err);
    res
      .status(500)
      .json({ message: "납품 상세 조회 오류", error: err.message });
  }
});

// 삭제
router.delete("/delis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deliService.deleteDeli(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /delis/:id] error:", err);
    // 외래키 참조 에러인 경우 사용자 친화적 메시지로 반환
    const msg = String((err && err.message) || "");
    if (
      msg.includes("ER_ROW_IS_REFERENCED_2") ||
      msg.toLowerCase().includes("foreign key")
    ) {
      return res.status(409).json({
        message: "연동된 출고/재고 이력이 있어 삭제할 수 없습니다.",
        error: err.message,
      });
    }
    res.status(500).json({ message: "납품 삭제 오류", error: err.message });
  }
});

// 저장 (신규/수정)
router.post("/delis/save", async (req, res) => {
  try {
    const { header, lines } = req.body || {};
    const result = await deliService.saveDeli(header, lines || []);
    res.json(result);
  } catch (err) {
    console.error("[POST /delis/save] error:", err);
    const msg = String((err && err.message) || "");
    if (
      msg.includes("ER_ROW_IS_REFERENCED_2") ||
      msg.toLowerCase().includes("foreign key")
    ) {
      return res.status(409).json({
        message:
          "연동된 출고/재고 이력 때문에 일부 라인을 삭제/수정할 수 없습니다.",
        error: err.message,
      });
    }
    res.status(500).json({ message: "납품 저장 오류", error: err.message });
  }
});

module.exports = router;
