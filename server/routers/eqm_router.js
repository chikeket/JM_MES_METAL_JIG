const express = require("express");
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const eqmService = require("../services/eqm_service.js");

router.get("/eqm", async (req, res) => {
  try {
    console.log("[eqm_router] 설비 검색 요청:", req.query);
    let eqmInfo = req.query; // GET 요청이므로 query 파라미터 사용
    let result = await eqmService.eqmFindAll(eqmInfo);
    console.log("[eqm_router] 설비 검색 결과:", result?.length || 0, "건");
    res.json(result || []);
  } catch (error) {
    console.error("[co_router] 설비 검색 오류:", error);
    res.status(500).json({ message: "업체 검색 중 오류가 발생했습니다." });
  }
});

module.exports = router;
