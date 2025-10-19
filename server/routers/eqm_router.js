const express = require("express");
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const eqmService = require("../services/eqm_service.js");

// 설비 목록 조회 (검색)
router.get("/eqm", async (req, res) => {
  try {
    const eqmInfo = req.query || {};
    const result = await eqmService.eqmFindAll(eqmInfo);
    res.json(result || []);
  } catch (error) {
    console.error("[eqm_router] 설비 검색 오류:", error);
    res.status(500).json({ message: "설비 검색 중 오류가 발생했습니다." });
  }
});

// 제조업체 드롭다운용 목록 (중복 제거)
router.get("/eqm/make-companies", async (_req, res) => {
  try {
    const list = await eqmService.getDistinctMakeCompanies();
    res.json(list || []);
  } catch (error) {
    console.error("[eqm_router] 제조업체 목록 오류:", error);
    res
      .status(500)
      .json({ message: "제조업체 목록 조회 중 오류가 발생했습니다." });
  }
});

// 상태 드롭다운용 목록 (중복 제거, 이름 포함)
router.get("/eqm/statuses", async (_req, res) => {
  try {
    const list = await eqmService.getDistinctStatuses();
    res.json(list || []);
  } catch (error) {
    console.error("[eqm_router] 상태 목록 오류:", error);
    res.status(500).json({ message: "상태 목록 조회 중 오류가 발생했습니다." });
  }
});

// 설비 신규 등록
router.post("/eqm", async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await eqmService.eqmInsert(payload);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[eqm_router] 설비 등록 오류:", error);
    res.status(400).json({
      success: false,
      message: error.message || "설비 등록 중 오류가 발생했습니다.",
    });
  }
});

// 설비 수정
router.put("/eqm/:eqm_id", async (req, res) => {
  try {
    const { eqm_id } = req.params;
    const payload = req.body || {};
    const result = await eqmService.eqmUpdate(eqm_id, payload);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[eqm_router] 설비 수정 오류:", error);
    res.status(400).json({
      success: false,
      message: error.message || "설비 수정 중 오류가 발생했습니다.",
    });
  }
});

// 설비 삭제
router.delete("/eqm/:eqm_id", async (req, res) => {
  try {
    const { eqm_id } = req.params;
    const result = await eqmService.eqmDelete(eqm_id);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("[eqm_router] 설비 삭제 오류:", error);
    const msg = String((error && error.message) || "");
    if (
      msg.includes("ER_ROW_IS_REFERENCED_2") ||
      msg.toLowerCase().includes("foreign key")
    ) {
      return res
        .status(409)
        .json({
          success: false,
          message: "다른 데이터에서 참조 중이라 삭제할 수 없습니다.",
        });
    }
    res
      .status(400)
      .json({
        success: false,
        message: error.message || "설비 삭제 중 오류가 발생했습니다.",
      });
  }
});

module.exports = router;
