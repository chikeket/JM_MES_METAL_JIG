const express = require("express");
const router = express.Router();
const authService = require("../services/auth_service.js");

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { id, pw } = req.body || {};
    const acct = await authService.login(id, pw);
    req.session.user = acct; // 세션에 저장
    res.json({ ok: true, user: acct });
  } catch (err) {
    console.error("[POST /login]", err.message, err.code || "");
    if (err.code === "NO_ID" || err.code === "WRONG_PASSWORD") {
      return res.status(401).json({ message: err.message, code: err.code });
    }
    res.status(500).json({ message: err.message || "로그인 실패" });
  }
});

// 세션 확인
router.get("/session", (req, res) => {
  if (req.session.user) return res.json({ ok: true, user: req.session.user });
  res.status(401).json({ ok: false });
});

// 로그아웃
router.post("/logout", async (req, res) => {
  try {
    if (!req.session) return res.json({ ok: true });
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "로그아웃 실패" });
  }
});

module.exports = router;