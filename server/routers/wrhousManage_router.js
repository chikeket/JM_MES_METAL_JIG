const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const wrhousManageService = require("../services/wrhousManage_service.js");

// 창고 목록 조회 (검색 조건 포함)
router.get("/wrhousManage", async (req, res) => {
  try {
    console.log("[wrhousManage_router] GET /wrhousManage query:", req.query);
    const result = await wrhousManageService.getWrhousAll(req.query);
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousManage_router] GET /wrhousManage error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 창고 단건 조회
router.get("/wrhousManage/:id", async (req, res) => {
  try {
    console.log("[wrhousManage_router] GET /wrhousManage/:id params:", req.params);
    const result = await wrhousManageService.getWrhousById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "창고를 찾을 수 없습니다." });
    }
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousManage_router] GET /wrhousManage/:id error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 창고 저장 (신규/수정)
router.post("/wrhousManage", async (req, res) => {
  try {
    console.log(
      "[wrhousManage_router] POST /wrhousManage body:",
      JSON.stringify(req.body).slice(0, 1000)
    );
    const result = await wrhousManageService.saveWrhous(req.body);
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousManage_router] POST /wrhousManage error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 창고 삭제
router.delete("/wrhousManage/:id", async (req, res) => {
  try {
    console.log("[wrhousManage_router] DELETE /wrhousManage/:id params:", req.params);
    const result = await wrhousManageService.deleteWrhous(req.params.id);
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousManage_router] DELETE /wrhousManage/:id error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

module.exports = router;