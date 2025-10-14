const express = require("express");
const router = express.Router();
const warehouseService = require("../services/wrhouse_service.js");

// 품목 유형에 따른 창고 목록 조회
router.get("/wrhouses", async (req, res) => {
  try {
    console.log("[warehouse_router] GET /wrhouses - query:", req.query);

    const result = await warehouseService.getWarehouseByItemType(req.query);

    res.json(result);
  } catch (error) {
    console.error("[warehouse_router] 창고 조회 오류:", error);
    res.status(500).json({
      error: "창고 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 품목 유형에 따른 로케이션 목록 조회
router.get("/locations", async (req, res) => {
  try {
    console.log("[warehouse_router] GET /locations - query:", req.query);

    const result = await warehouseService.getLocationByItemType(req.query);

    res.json(result);
  } catch (error) {
    console.error("[warehouse_router] 로케이션 조회 오류:", error);
    res.status(500).json({
      error: "로케이션 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 모든 창고 목록 조회
router.get("/warehouses/all", async (req, res) => {
  try {
    console.log("[warehouse_router] GET /warehouses/all");

    const result = await warehouseService.getAllWarehouses();

    res.json(result);
  } catch (error) {
    console.error("[warehouse_router] 전체 창고 조회 오류:", error);
    res.status(500).json({
      error: "전체 창고 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 모든 로케이션 목록 조회
router.get("/locations/all", async (req, res) => {
  try {
    console.log("[warehouse_router] GET /locations/all");

    const result = await warehouseService.getAllLocations();

    res.json(result);
  } catch (error) {
    console.error("[warehouse_router] 전체 로케이션 조회 오류:", error);
    res.status(500).json({
      error: "전체 로케이션 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 특정 창고의 로케이션 목록 조회
router.get("/warehouses/:warehouseId/locations", async (req, res) => {
  try {
    const warehouseId = req.params.warehouseId;
    console.log(
      "[warehouse_router] GET /warehouses/:warehouseId/locations - warehouseId:",
      warehouseId
    );

    const result = await warehouseService.getLocationsByWarehouse({
      warehouse_id: warehouseId,
    });

    res.json(result);
  } catch (error) {
    console.error("[warehouse_router] 창고별 로케이션 조회 오류:", error);
    res.status(500).json({
      error: "창고별 로케이션 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

module.exports = router;
