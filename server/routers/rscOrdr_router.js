const express = require("express");
// Express의 Router 모듈을 사용해서 라우팅 등록, 라우팅을 별도 파일로 관리
const router = express.Router();

// 해당 라우터를 통해 제공할 서비스를 가져옴
const rscOrdrService = require("../services/rscOrdr_service.js");

// 검색 (마스터 목록)
router.get("/rscOrdr", async (req, res) => {
  try {
    console.log("[rscOrdr_router] incoming query:", req.query);
    const result = await rscOrdrService.coFindAll(req.query);
    res.json(result);
  } catch (err) {
    console.error(
      "[rscOrdr_router] error stack:",
      err && err.stack ? err.stack : err
    );
    // 상세 에러를 개발용으로 응답에 포함 (운영시 제거)
    res.status(500).json({
      error: err?.message ?? "server error",
      stack: err?.stack ?? null,
    });
  }
});

// 상세 조회
router.get("/rscOrdrDeta", async (req, res) => {
  try {
    console.log("[rscOrdr_router] /rscOrdrDeta query:", req.query);
    const result = await rscOrdrService.coFindDeta(req.query);
    console.log(
      "[rscOrdr_router] /rscOrdrDeta result length:",
      Array.isArray(result) ? result.length : "N/A"
    );
    res.json(result);
  } catch (err) {
    console.error("[rscOrdr_router] /rscOrdrDeta error:", err);
    res.status(500).json([]);
  }
});

// 저장(신규/수정)
router.post("/rscOrdr", async (req, res) => {
  try {
    console.log(
      "[rscOrdr_router] POST body:",
      JSON.stringify(req.body).slice(0, 2000)
    );
    if (Array.isArray(req.body?.detailList)) {
      const preview = req.body.detailList.slice(0, 5).map((d) => ({
        rsc_nm: d.rsc_nm,
        rsc_id: d.rsc_id,
        qy: d.qy,
        rm: d.rm,
      }));
      console.log("[rscOrdr_router] detail preview (first 5):", preview);
    }
    // use upsert-style save
    const result = await rscOrdrService.saveRscOrdr(req.body);
    res.json(result);
  } catch (err) {
    console.error(
      "[rscOrdr_router] POST error:",
      err && err.stack ? err.stack : err
    );
    res
      .status(500)
      .json({ isSuccessed: false, error: err?.message ?? "server error" });
  }
});

// 삭제
router.delete("/rscOrdr/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("[rscOrdr_router] DELETE /rscOrdr id=", id);
    const result = await rscOrdrService.deleteRscOrdr(id);
    console.log("[rscOrdr_router] DELETE result=", result);
    res.json(result);
  } catch (err) {
    console.error("[rscOrdr_router] DELETE error:", err);
    res.status(500).json({ isSuccessed: false, error: err.message });
  }
});

// delete selected detail rows (body: { ids: [] })
router.post("/rscOrdr/deta/delete", async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const result = await rscOrdrService.deleteRscOrdrDetaSelected(ids);
    res.json(result);
  } catch (err) {
    console.error("[rscOrdr_router] deta delete error:", err);
    res
      .status(500)
      .json({ isSuccessed: false, error: err?.message ?? "server error" });
  }
});

module.exports = router;
