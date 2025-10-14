const express = require("express");
const router = express.Router();
const inspectionService = require("../services/inspectionForWarehouse_service.js");

// 입출고용 검사서 목록 조회
router.get("/inspectionForWarehouse/list", async (req, res) => {
  try {
    console.log(
      "[inspectionForWarehouse_router] GET /inspectionForWarehouse/list - query:",
      req.query
    );

    const result = await inspectionService.getAllInspectionsForWarehouse(
      req.query
    );

    res.json(result);
  } catch (error) {
    console.error("[inspectionForWarehouse_router] 검사서 조회 오류:", error);
    res.status(500).json({
      error: "검사서 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 자재 품질 검사서 조회
router.get("/inspectionForWarehouse/material", async (req, res) => {
  try {
    console.log(
      "[inspectionForWarehouse_router] GET /inspectionForWarehouse/material - query:",
      req.query
    );

    const result = await inspectionService.getInspectionForWarehouse(req.query);

    res.json(result);
  } catch (error) {
    console.error(
      "[inspectionForWarehouse_router] 자재 검사서 조회 오류:",
      error
    );
    res.status(500).json({
      error: "자재 검사서 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 반제품 품질 검사서 조회
router.get("/inspectionForWarehouse/semi", async (req, res) => {
  try {
    console.log(
      "[inspectionForWarehouse_router] GET /inspectionForWarehouse/semi - query:",
      req.query
    );

    const result = await inspectionService.getSemiInspectionForWarehouse(
      req.query
    );

    res.json(result);
  } catch (error) {
    console.error(
      "[inspectionForWarehouse_router] 반제품 검사서 조회 오류:",
      error
    );
    res.status(500).json({
      error: "반제품 검사서 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

// 완제품 품질 검사서 조회
router.get("/inspectionForWarehouse/finished", async (req, res) => {
  try {
    console.log(
      "[inspectionForWarehouse_router] GET /inspectionForWarehouse/finished - query:",
      req.query
    );

    const result = await inspectionService.getFinishedInspectionForWarehouse(
      req.query
    );

    res.json(result);
  } catch (error) {
    console.error(
      "[inspectionForWarehouse_router] 완제품 검사서 조회 오류:",
      error
    );
    res.status(500).json({
      error: "완제품 검사서 목록 조회 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
});

module.exports = router;
