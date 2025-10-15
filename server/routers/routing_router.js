// express 땡겨오자
const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();
// 해당 라우터를 통해 제공할 서비스를 가져옴
const routingService = require("../services/routing_service.js");

// 제품코드로 공정 조회
// routes/routing_router.js

router.get("/prcs", async (req, res) => {
  try {
    console.log("[routing_router] 공정 모달 조회 요청:", req.query);
    let { prcs_id, prcs_nm, eqm_grp_nm, lead_tm, mold_use_at } = req.query;
    let result = await routingService.getPrcsModal(
      prcs_id,
      prcs_nm,
      eqm_grp_nm,
      lead_tm,
      mold_use_at
    );
    console.log(
      "[routing_router] 공정 모달 조회 결과:",
      result?.length || 0,
      "건"
    );
    res.json(result || []);
  } catch (error) {
    console.error("[routing_router] 공정 모달 조회 오류:", error);
    res.status(500).json({ message: "공정 모달 조회 중 오류가 발생했습니다." });
  }
});

module.exports = router;
// └───제품코드로 공정 조회 라우터───┘
// └───routing_router.js───┘

