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

// 금형 상태를 P1로 변경
router.post("/proc-ctrl/mold/p1", async (req, res) => {
  try {
    const { mold_id } = req.body || {};
    if (!mold_id)
      return res.status(400).json({ message: "mold_id가 필요합니다." });
    const result = await service.setMoldStatusP1(mold_id);
    res.json(result);
  } catch (err) {
    console.error("proc-ctrl mold p1 error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 설비 상태를 Q1로 변경
router.post("/proc-ctrl/eqm/q1", async (req, res) => {
  try {
    const { eqm_id } = req.body || {};
    if (!eqm_id)
      return res.status(400).json({ message: "eqm_id가 필요합니다." });
    const result = await service.setEqmStatusQ1(eqm_id);
    res.json(result);
  } catch (err) {
    console.error("proc-ctrl eqm q1 error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 금형 상태를 P2로 변경 (작업 종료 시 원복)
router.post("/proc-ctrl/mold/p2", async (req, res) => {
  try {
    const { mold_id } = req.body || {};
    if (!mold_id)
      return res.status(400).json({ message: "mold_id가 필요합니다." });
    const result = await service.setMoldStatusP2(mold_id);
    res.json(result);
  } catch (err) {
    console.error("proc-ctrl mold p2 error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 설비 상태를 Q2로 변경 (작업 종료 시 원복)
router.post("/proc-ctrl/eqm/q2", async (req, res) => {
  try {
    const { eqm_id } = req.body || {};
    if (!eqm_id)
      return res.status(400).json({ message: "eqm_id가 필요합니다." });
    const result = await service.setEqmStatusQ2(eqm_id);
    res.json(result);
  } catch (err) {
    console.error("proc-ctrl eqm q2 error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 작업 시작 전 상태 중복 가드 검사
router.post("/proc-ctrl/prestart-guard", async (req, res) => {
  try {
    const { prcs_prog_precon_id, eqm_id, mold_id } = req.body || {};
    const result = await service.preStartStatusGuard({
      prcs_prog_precon_id,
      eqm_id,
      mold_id,
    });
    if (!result.ok)
      return res.status(409).json({ ok: false, message: "정보 중복 오류" });
    res.json({ ok: true });
  } catch (err) {
    console.error("prestart-guard error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 작업 종료: proc_ctrl에 새 행 생성 (완료 스냅샷)
router.post("/proc-ctrl/finish", async (req, res) => {
  try {
    const body = req.body || {};
    console.log("[proc-ctrl/finish] payload", body);
    const result = await service.saveFinish(body);
    res.json(result);
  } catch (err) {
    console.error("proc-ctrl finish error", err);
    res
      .status(500)
      .json({ ok: false, message: err?.message || "오류가 발생했습니다." });
  }
});

module.exports = router;
