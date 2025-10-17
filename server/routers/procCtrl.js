const express = require("express");
const router = express.Router();
const service = require("../services/procCtrl_service.js");

// 작업 시작: proc_ctrl에 행 생성
router.post("/proc-ctrl/start", async (req, res) => {
  try {
    const body = req.body || {};
    const result = await service.saveStart(body);
    res.json(result);
  } catch (err) {
    console.error("proc-ctrl start error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

module.exports = router;
