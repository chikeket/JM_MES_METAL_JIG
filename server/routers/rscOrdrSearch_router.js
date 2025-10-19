// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const express = require("express");
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rscOrdrSearchService = require("../services/rscOrdrSearch_service.js");

// 자재 발주 검색 API: /rsc-ordr-search
router.get("/rsc/ordrSearch", async (req, res) => {
  try {
    const {
      rsc_ordr_id = '',
      co_nm = '',
      emp_nm = '',
      reg_dt_from = '',
      reg_dt_to = '',
    } = req.query || {};
    const list = await rscOrdrSearchService.getRscOrdrSearchList({
      rsc_ordr_id,
      co_nm,
      emp_nm,
      reg_dt_from,
      reg_dt_to,
    });
    res.json({ data: list });
  } catch (err) {
    console.error('[GET /rsc/ordrSearch] error:', err);
    res.status(500).json({ message: '자재 발주 검색 조회 오류', error: err.message });
  }
});

module.exports = router;
