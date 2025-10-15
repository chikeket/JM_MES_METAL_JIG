const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const deliSearchService = require("../services/deliSearch_service.js");

// 납품 검색 API: /deli-search
router.get("/deli-search", async (req, res) => {
  try {
    const {
      deli_id = "",
      emp_nm = "",
      deli_dt_from = "",
      deli_dt_to = "",
    } = req.query || {};

    const list = await deliSearchService.getDeliSearchList({
      deli_id,
      emp_nm,
      deli_dt_from,
      deli_dt_to,
    });

    res.json({ data: list });
  } catch (err) {
    console.error("[GET /deli-search] error:", err);
    res
      .status(500)
      .json({ message: "납품 검색 조회 오류", error: err.message });
  }
});

module.exports = router;
