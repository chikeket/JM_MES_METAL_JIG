const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rcvordService = require("../services/rcvord_service.js");

// 수주 목록 (업체/납기/총수량 포함) + 수주ID 검색 쿼리파라미터 필터
router.get("/rcvords", async (req, res) => {
  try {
    const { rcvord_id } = req.query;
    // 집계 포함 목록 사용
    let list = await rcvordService.rcvordFindAllWithAgg();
    if (rcvord_id) {
      const key = String(rcvord_id).toLowerCase();
      list = list.filter((row) =>
        String(row.rcvord_id || "")
          .toLowerCase()
          .includes(key)
      );
    }
    // r.st 컬럼을 status 별칭으로 포함 (쿼리에서 st 선택되어야 함)
    list = list.map((row) => ({
      ...row,
      status: row.st ?? row.status ?? null,
    }));
    res.json(list);
  } catch (err) {
    console.error("/rcvords list error", err);
    res
      .status(500)
      .json({ message: "rcvords 목록 조회 실패", error: String(err) });
  }
});

// 수주 단건 상세 (헤더 + 라인)
router.get("/rcvords/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const header = await rcvordService.rcvordFindHeader(id);
    if (!header)
      return res.status(404).json({ message: "존재하지 않는 수주입니다." });
    const lines = await rcvordService.rcvordFindLines(id);

    // 클라이언트 편의를 위해 서버에서 합계/최소 납기 재계산 (원본 컬럼만 받은 상태)
    let total_qty = 0;
    let due_date = null;
    for (const ln of lines) {
      const qty = Number(ln.rcvord_qy) || 0;
      total_qty += qty;
      if (ln.paprd_dt) {
        const ts = new Date(ln.paprd_dt).getTime();
        if (!due_date || ts < new Date(due_date).getTime()) {
          due_date = ln.paprd_dt;
        }
      }
    }

    // header.st가 존재하면 status로 노출(프론트 일관성)
    const status = header.st ?? null;
    res.json({ header: { ...header, total_qty, due_date, status }, lines });
  } catch (err) {
    console.error("/rcvords/:id detail error", err);
    res
      .status(500)
      .json({ message: "rcvords 상세 조회 실패", error: String(err) });
  }
});

// 저장
router.post("/rcvords/save", async (req, res) => {
  try {
    const { header, lines } = req.body || {};
    if (!header || !header.rcvord_id) {
      return res.status(400).json({ message: "rcvord_id 누락" });
    }
    const safeHeader = {
      co_id: null,
      emp_id: null,
      reg_dt: new Date(),
      st: header.st || header.status || null,
      rm: null,
      ...header,
    };
    const safeLines = Array.isArray(lines) ? lines : [];
    const result = await rcvordService.rcvordSave(safeHeader, safeLines);
    res.json({ ok: true, result });
  } catch (err) {
    console.error("/rcvords/save error", err);
    res.status(500).json({ message: "수주 저장 실패", error: String(err) });
  }
});

module.exports = router;
