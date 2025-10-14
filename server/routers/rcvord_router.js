// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const express = require("express");
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rcvordService = require("../services/rcvord_service.js");

router.get("/rcvords", async (req, res) => {
  // 1. 클라이언트가 보낸 검색어 (?rcvord_id=...) 추출, 없으면 빈 문자열
  const searchId = req.query.rcvord_id || "";
  try {
    // 2. 서비스 호출 (DB 쿼리) - 결과는 배열
    const list = await rcvordService.getRcvordList(searchId);
    // 3. 프론트 모달은 순수 배열을 기대하므로 바로 배열만 반환
    res.json(list);
  } catch (err) {
    console.error("[GET /rcvords] error:", err);
    res
      .status(500)
      .json({ message: "수주 목록 조회 오류", error: err.message });
  }
});

// 단건 상세 (모달에서 더블클릭 후 상세 불러오기)
router.get("/rcvords/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const header = await rcvordService.getRcvordHeader(id);
    if (!header) {
      return res.status(404).json({ message: "수주를 찾을 수 없습니다." });
    }
    const lines = await rcvordService.getRcvordLines(id);
    // 프론트에서 status 필드 기대 (코드명/한글명 매핑 이미 서비스에서 수행)
    const headerOut = { ...header };
    res.json({ header: headerOut, lines });
  } catch (err) {
    console.error("[GET /rcvords/:id] error:", err);
    res
      .status(500)
      .json({ message: "수주 상세 조회 오류", error: err.message });
  }
});

// 저장 (신규/수정)
router.post("/rcvords/save", async (req, res) => {
  try {
    const { header, lines } = req.body || {};
    const result = await rcvordService.saveRcvord(header, lines || []);
    res.json(result);
  } catch (err) {
    console.error("[POST /rcvords/save] error:", err);
    const msg = String((err && err.message) || "");
    if (
      msg.includes("ER_ROW_IS_REFERENCED_2") ||
      msg.toLowerCase().includes("foreign key") ||
      msg.includes("외부 참조")
    ) {
      return res.status(409).json({
        message:
          "연동된 출고/재고 이력이 있어 일부 라인을 삭제/수정할 수 없습니다.",
        error: err.message,
      });
    }
    res.status(500).json({ error: err.message || "저장 실패" });
  }
});

// 삭제
router.delete("/rcvords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await rcvordService.deleteRcvord(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /rcvords/:id] error:", err);
    res.status(500).json({ error: err.message || "삭제 실패" });
  }
});
module.exports = router;
