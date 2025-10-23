const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const coService = require("../services/co_serviceForG2.js");

router.get("/cos/forG2", async (req, res) => {
  try {
    console.log("[co_router] 업체 검색 요청:", req.query);
    let cosInfo = req.query; // GET 요청이므로 query 파라미터 사용
    // 명시적으로 'G2' 타입을 전달하여 조건이 없을 때 G2 전체를 조회하도록 함
    let result = await coService.coFindByType("G2", cosInfo);
    console.log("[co_router] 업체 검색 결과:", result?.length || 0, "건");
    res.json(result || []);
  } catch (error) {
    console.error("[co_router] 업체 검색 오류:", error);
    res.status(500).json({ message: "업체 검색 중 오류가 발생했습니다." });
  }
});

module.exports = router;
