const express = require("express");
const router = express.Router();
const wrhousService = require("../services/wrhous_service.js");

// 품목 유형에 따른 창고 목록 조회
router.get("/api/wrhous/warehouses", async (req, res) => {
  try {
    console.log(
      "[wrhous_router] GET /api/wrhous/warehouses - query:",
      req.query
    );

    const result = await wrhousService.getWarehouseByItemType(req.query);

    res.json(result);
  } catch (error) {
    console.error("[wrhous_router] 창고 조회 오류:", error);
    res.status(500).json({
      error: "창고 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 품목 유형에 따른 로케이션 목록 조회
router.get("/api/wrhous/locations", async (req, res) => {
  try {
    console.log(
      "[wrhous_router] GET /api/wrhous/locations - query:",
      req.query
    );

    const result = await wrhousService.getLocationByItemType(req.query);

    res.json(result);
  } catch (error) {
    console.error("[wrhous_router] 로케이션 조회 오류:", error);
    res.status(500).json({
      error: "로케이션 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 모든 창고 목록 조회
router.get("/api/wrhous/warehouses/all", async (req, res) => {
  try {
    console.log("[wrhous_router] GET /api/wrhous/warehouses/all");

    const result = await wrhousService.getAllWarehouses();

    res.json(result);
  } catch (error) {
    console.error("[wrhous_router] 전체 창고 조회 오류:", error);
    res.status(500).json({
      error: "전체 창고 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 모든 로케이션 목록 조회
router.get("/api/wrhous/locations/all", async (req, res) => {
  try {
    console.log("[wrhous_router] GET /api/wrhous/locations/all");

    const result = await wrhousService.getAllLocations();

    res.json(result);
  } catch (error) {
    console.error("[wrhous_router] 전체 로케이션 조회 오류:", error);
    res.status(500).json({
      error: "전체 로케이션 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 특정 창고의 로케이션 목록 조회
router.get(
  "/api/wrhous/warehouses/:warehouseId/locations",
  async (req, res) => {
    try {
      const warehouseId = req.params.warehouseId;
      console.log(
        "[wrhous_router] GET /api/wrhous/warehouses/:warehouseId/locations - warehouseId:",
        warehouseId
      );

      const result = await wrhousService.getLocationsByWarehouse({
        warehouse_id: warehouseId,
      });

      res.json(result);
    } catch (error) {
      console.error("[wrhous_router] 창고별 로케이션 조회 오류:", error);
      res.status(500).json({
        error: "창고별 로케이션 목록 조회 중 오류가 발생했습니다.",
        details: error.message,
      });
    }
  }
);

module.exports = router;
