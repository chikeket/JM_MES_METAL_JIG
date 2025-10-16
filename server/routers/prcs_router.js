const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const routingService = require("../services/routing_service.js");

// 공정 모달 조회
router.get("/prcs", async (req, res) => {
  try {
    console.log("[routing_router] 공정 모달 조회 요청:", req.query);
    const result = await routingService.selectPrcsModal(req.query);
    res.json(result);
  } catch (err) {
    console.error("공정 모달 조회 오류:", err);
    res.status(500).send("서버 오류 발생");
  }
});

module.exports = router;
