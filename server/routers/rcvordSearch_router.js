// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const express = require("express");
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rcvordSearchService = require("../services/rcvordSearch_service.js");

// 수주 검색 API: /rcvord-search
router.get("/rcvord-search", async (req, res) => {
  try {
    const {
      rcvord_id = "",
      co_nm = "",
      emp_nm = "",
      reg_dt_from = "",
      reg_dt_to = "",
    } = req.query || {};
    const list = await rcvordSearchService.getRcvordSearchList({
      rcvord_id,
      co_nm,
      emp_nm,
      reg_dt_from,
      reg_dt_to,
    });
    res.json({ data: list });
  } catch (err) {
    console.error("[GET /rcvord-search] error:", err);
    res
      .status(500)
      .json({ message: "수주 검색 조회 오류", error: err.message });
  }
});

module.exports = router;
