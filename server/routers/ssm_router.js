const express = require("express");
const router = express.Router();
const ssmService = require("../services/ssm_service.js");

console.log('✅ SSM Router 로드됨');

// 생산지시서 조회 리스트
router.get("/prodDrct_inquiry_list", async (req, res) => {
  console.log("===== 생산지시서 조회 라우터 도착! =====");
  console.log("쿼리 파라미터:", req.query);
  
  try {
    let list = await ssmService.getProdDrctInquiryList(req.query);
    console.log("✅ 조회 결과:", list.length, "건");
    res.json(list);
  } catch (err) {
    console.error("❌ 생산지시서 조회 오류:", err);
    res.status(500).json({ error: "조회 실패", message: err.message });
  }
});

module.exports = router;