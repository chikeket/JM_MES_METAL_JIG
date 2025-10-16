const express = require("express");
const router = express.Router();

const service = require("../services/prcsProgPrecon_service.js");

// 지시 조회 모달: 목록 조회 (지시 ID LIKE)
router.get("/prcs-prog-precon/orders", async (req, res) => {
  try {
    const { prod_drct_id } = req.query;
    const rows = await service.searchProdDrct(prod_drct_id || "");
    res.json(rows);
  } catch (err) {
    console.error("orders search error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 메인 큰 그리드: 선택 지시의 공정 진행 (st = 'J2')
router.get("/prcs-prog-precon/main", async (req, res) => {
  try {
    const { prod_drct_id } = req.query;
    const rows = await service.getMainList(prod_drct_id);
    res.json(rows);
  } catch (err) {
    console.error("main list error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 좌측 하단: 사원 전체
router.get("/prcs-prog-precon/emps", async (req, res) => {
  try {
    const rows = await service.getEmpList();
    res.json(rows);
  } catch (err) {
    console.error("emp list error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 우측 하단: 설비 전체
router.get("/prcs-prog-precon/eqms", async (req, res) => {
  try {
    const rows = await service.getEqmList();
    res.json(rows);
  } catch (err) {
    console.error("eqm list error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

module.exports = router;
