const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const deliService = require("../services/deli_service.js");

// 모달 목록
router.get("/delis", async (req, res) => {
  try {
    const kw = req.query.deli_id || "";
    const list = await deliService.getDeliList(kw);
    res.json(list);
  } catch (err) {
    console.error("[GET /delis] error:", err);
    res
      .status(500)
      .json({ message: "납품 목록 조회 오류", error: err.message });
  }
});

// 단건 상세
router.get("/delis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await deliService.getDeliDetail(id);
    if (!detail)
      return res.status(404).json({ message: "납품서를 찾을 수 없습니다." });
    res.json(detail);
  } catch (err) {
    console.error("[GET /delis/:id] error:", err);
    res
      .status(500)
      .json({ message: "납품 상세 조회 오류", error: err.message });
  }
});

module.exports = router;
