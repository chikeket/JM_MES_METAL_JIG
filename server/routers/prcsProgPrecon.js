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

// PRCS_PROG_PRECON 업데이트 (DELETE/INSERT가 아닌 UPDATE)
router.post("/prcs-prog-precon/update-quantities", async (req, res) => {
  try {
    const {
      prcs_prog_precon_id,
      inpt_qy,
      prod_qy,
      infer_qy,
      pass_qy,
      recompute,
    } = req.body || {};
    if (!prcs_prog_precon_id) {
      return res
        .status(400)
        .json({ message: "prcs_prog_precon_id가 없습니다." });
    }
    // recompute 플래그가 true이면 proc_ctrl 합계로 재계산
    if (recompute === true) {
      const result = await service.recomputeAndUpdateQuantities(
        prcs_prog_precon_id
      );
      return res.json({ ok: true, ...result });
    }
    // 간단한 서버측 숫자 보정
    const payload = {
      prcs_prog_precon_id,
      inpt_qy: Number(inpt_qy) || 0,
      prod_qy: Number(prod_qy) || 0,
      infer_qy: Number(infer_qy) || 0,
      pass_qy: Number(pass_qy) || 0,
    };
    console.log("[update-quantities] payload", payload);
    await service.updatePrcsProgPreconQuantities(payload);
    res.json({ ok: true });
  } catch (err) {
    console.error("update quantities error", err);
    res
      .status(500)
      .json({ message: err?.message || "업데이트에 실패했습니다." });
  }
});

// proc_ctrl 합계로 PRCS_PROG_PRECON 수량 일괄 재계산/적용
router.post("/prcs-prog-precon/recompute-quantities", async (req, res) => {
  try {
    const { prcs_prog_precon_id } = req.body || {};
    if (!prcs_prog_precon_id) {
      return res
        .status(400)
        .json({ message: "prcs_prog_precon_id가 없습니다." });
    }
    const result = await service.recomputeAndUpdateQuantities(
      prcs_prog_precon_id
    );
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("recompute quantities error", err);
    res.status(500).json({ message: err?.message || "재계산에 실패했습니다." });
  }
});

// 작업 저장 시: 선택된 현투입 수량(prod_expc_qy) 행의 inpt_st를 J3로 변경
router.post("/prcs-prog-precon/mark-run-target-j3", async (req, res) => {
  try {
    const { prod_drct_deta_id, prod_expc_qy } = req.body || {};
    if (!prod_drct_deta_id || prod_expc_qy == null) {
      return res
        .status(400)
        .json({ message: "필수값 누락(prod_drct_deta_id, prod_expc_qy)" });
    }
    const result = await service.markRunTargetUsedToJ3({
      prod_drct_deta_id,
      prod_expc_qy,
    });
    res.json(result);
  } catch (err) {
    console.error("mark-run-target-j3 error", err);
    res.status(500).json({ message: err?.message || "상태 변경 실패" });
  }
});

// 다음 공정(prcs_ord+1) 행의 drct_qy를 같은 deta의 생산합으로 설정하고 st='J2'
router.post("/prcs-prog-precon/advance-next-step", async (req, res) => {
  try {
    const { prcs_prog_precon_id } = req.body || {};
    if (!prcs_prog_precon_id) {
      return res
        .status(400)
        .json({ message: "prcs_prog_precon_id가 없습니다." });
    }
    const result = await service.advanceNextStepWithSum(prcs_prog_precon_id);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("advance-next-step error", err);
    res
      .status(500)
      .json({ message: err?.message || "다음 공정 갱신에 실패했습니다." });
  }
});

// 작업 시작 시 상태 NULL 처리 (st=NULL)
router.post("/prcs-prog-precon/clear-status", async (req, res) => {
  try {
    const { prcs_prog_precon_id } = req.body || {};
    if (!prcs_prog_precon_id) {
      return res
        .status(400)
        .json({ message: "prcs_prog_precon_id가 필요합니다." });
    }
    const result = await service.clearPrcsProgPreconStatus(prcs_prog_precon_id);
    res.json(result);
  } catch (err) {
    console.error("clear-status error", err);
    res.status(500).json({ message: "오류가 발생했습니다." });
  }
});

module.exports = router;
