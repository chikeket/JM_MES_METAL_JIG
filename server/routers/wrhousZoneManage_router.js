const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const wrhousZoneManageService = require("../services/wrhousZoneManage_service.js");

// 로케이션 목록 조회 (검색 조건 포함)
router.get("/wrhousZoneManage", async (req, res) => {
  try {
    console.log("[wrhousZoneManage_router] GET /wrhousZoneManage query:", req.query);
    const result = await wrhousZoneManageService.getWrhousZoneAll(req.query);
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousZoneManage_router] GET /wrhousZoneManage error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 로케이션 단건 조회
router.get("/wrhousZoneManage/:id", async (req, res) => {
  try {
    console.log("[wrhousZoneManage_router] GET /wrhousZoneManage/:id params:", req.params);
    const result = await wrhousZoneManageService.getWrhousZoneById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "로케이션을 찾을 수 없습니다." });
    }
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousZoneManage_router] GET /wrhousZoneManage/:id error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 로케이션 저장 (신규/수정)
router.post("/wrhousZoneManage", async (req, res) => {
  try {
    console.log(
      "[wrhousZoneManage_router] POST /wrhousZoneManage body:",
      JSON.stringify(req.body).slice(0, 1000)
    );
    const result = await wrhousZoneManageService.saveWrhousZone(req.body);
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousZoneManage_router] POST /wrhousZoneManage error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 로케이션 삭제
router.delete("/wrhousZoneManage/:id", async (req, res) => {
  try {
    console.log("[wrhousZoneManage_router] DELETE /wrhousZoneManage/:id params:", req.params);
    const result = await wrhousZoneManageService.deleteWrhousZone(req.params.id);
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousZoneManage_router] DELETE /wrhousZoneManage/:id error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 창고 목록 조회 (로케이션 등록시 선택용)
router.get("/wrhousForZone", async (req, res) => {
  try {
    console.log("[wrhousZoneManage_router] GET /wrhousForZone");
    const result = await wrhousZoneManageService.getWrhousForZone();
    res.json(result);
  } catch (err) {
    console.error(
      "[wrhousZoneManage_router] GET /wrhousForZone error:",
      err && err.stack ? err.stack : err
    );
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

module.exports = router;