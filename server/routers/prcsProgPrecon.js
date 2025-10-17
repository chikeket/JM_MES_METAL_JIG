const express = require("express");
const router = express.Router();

const service = require("../services/prcsProgPrecon_service.js");

// 지시 조회 모달: 목록 조회 (지시 ID LIKE)
router.get("/prcs-prog-precon/orders", async (req, res) => {
  try {
    const { prod_drct_id } = req.query;
    const rows = await service.searchProdDrct(prod_drct_id || "");
    res.json(rows);
  } catch (err) {
    console.error("orders search error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 메인 큰 그리드: 선택 지시의 공정 진행 (st = 'J2')
router.get("/prcs-prog-precon/main", async (req, res) => {
  try {
    const { prod_drct_id } = req.query;
    const rows = await service.getMainList(prod_drct_id);
    res.json(rows);
  } catch (err) {
    console.error("main list error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 좌측 하단: 사원 전체
router.get("/prcs-prog-precon/emps", async (req, res) => {
  try {
    const rows = await service.getEmpList();
    res.json(rows);
  } catch (err) {
    console.error("emp list error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 우측 하단: 설비 전체
router.get("/prcs-prog-precon/eqms", async (req, res) => {
  try {
    const rows = await service.getEqmList();
    res.json(rows);
  } catch (err) {
    console.error("eqm list error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 공정 상세(금형 사용 여부 확인)
router.get("/prcs-prog-precon/prcs/:prcs_id", async (req, res) => {
  try {
    const { prcs_id } = req.params;
    const row = await service.getPrcsById(prcs_id);
    if (!row)
      return res.status(404).json({ message: "공정을 찾을 수 없습니다." });
    res.json(row);
  } catch (err) {
    console.error("prcs detail error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 금형 목록 (모달2)
router.get("/prcs-prog-precon/molds", async (req, res) => {
  try {
    const { mold_id } = req.query;
    const rows = await service.getMoldList(mold_id || "");
    res.json(rows);
  } catch (err) {
    console.error("mold list error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 현투입 수량(= RWMATR_RTUN_TRGET.prod_expc_qy 합) 조회
router.get("/prcs-prog-precon/run-target", async (req, res) => {
  try {
    const { prod_drct_deta_id } = req.query;
    const qty = await service.getRunTargetQtyByDetaId(prod_drct_deta_id);
    res.json({ prod_expc_qy: qty });
  } catch (err) {
    console.error("run target qty error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

// 현투입 수량 목록(= RWMATR_RTUN_TRGET.prod_expc_qy 리스트, inpt_st='J2') 조회
router.get("/prcs-prog-precon/run-target/list", async (req, res) => {
  try {
    const { prod_drct_deta_id } = req.query;
    const list = await service.getRunTargetQtyListByDetaId(prod_drct_deta_id);
    res.json({ list });
  } catch (err) {
    console.error("run target qty list error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

module.exports = router;
