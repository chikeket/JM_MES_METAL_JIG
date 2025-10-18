const mariadb = require("../database/mapper.js");

async function searchProdDrct(keyword = "") {
  // 두 번 전달하여 (? IS NULL OR ? = '') 체크와 LIKE 바인딩을 모두 처리
  const kw = (keyword || "").trim();
  const rows = await mariadb.query("prcsProgPreconProdDrctSearch", [
    kw,
    kw,
    kw,
  ]);
  return rows;
}

async function getMainList(prodDrctId) {
  if (!prodDrctId) return [];
  const rows = await mariadb.query("prcsProgPreconMainList", [prodDrctId]);
  return rows;
}

async function getEmpList() {
  const rows = await mariadb.query("prcsProgPreconEmpList");
  return rows;
}

async function getEqmList() {
  const rows = await mariadb.query("prcsProgPreconEqmList");
  return rows;
}

async function getPrcsById(prcsId) {
  if (!prcsId) return null;
  const rows = await mariadb.query("prcsProgPreconPrcsById", [prcsId]);
  return rows && rows[0] ? rows[0] : null;
}

async function getMoldList(keyword = "") {
  const kw = (keyword || "").trim();
  const rows = await mariadb.query("prcsProgPreconMoldList", [kw, kw, kw]);
  return rows;
}

async function getRunTargetQtyByDetaId(prodDrctDetaId) {
  if (!prodDrctDetaId) return 0;
  const rows = await mariadb.query("prcsProgPreconRunTargetByDeta", [
    prodDrctDetaId,
  ]);
  const v = rows && rows[0] ? rows[0].prod_expc_qy : 0;
  return Number(v) || 0;
}

async function getRunTargetQtyListByDetaId(prodDrctDetaId) {
  if (!prodDrctDetaId) return [];
  const rows = await mariadb.query("prcsProgPreconRunTargetListByDeta", [
    prodDrctDetaId,
  ]);
  // 반환값은 숫자 배열로 변환
  return (rows || []).map((r) => Number(r.prod_expc_qy) || 0);
}

// 작업 저장 시: 사용한 현투입 수량 행의 inpt_st를 J3로 변경
async function markRunTargetUsedToJ3({ prod_drct_deta_id, prod_expc_qy }) {
  if (!prod_drct_deta_id) throw new Error("prod_drct_deta_id is required");
  const qty = Number(prod_expc_qy);
  if (!Number.isFinite(qty)) throw new Error("prod_expc_qy must be a number");
  await mariadb.query("prcsProgPreconUpdateRunTargetToJ3", [
    prod_drct_deta_id,
    qty,
  ]);
  return { ok: true };
}

// 작업 시작 시 해당 ppp행의 상태를 NULL로 초기화
async function clearPrcsProgPreconStatus(prcs_prog_precon_id) {
  if (!prcs_prog_precon_id) throw new Error("prcs_prog_precon_id required");
  await mariadb.query("prcsProgPreconClearStatus", [prcs_prog_precon_id]);
  return { ok: true };
}

async function updatePrcsProgPreconQuantities({
  prcs_prog_precon_id,
  inpt_qy,
  prod_qy,
  infer_qy,
  pass_qy,
}) {
  if (!prcs_prog_precon_id) throw new Error("prcs_prog_precon_id is required");
  const a = Number(inpt_qy) || 0;
  const b = Number(prod_qy) || 0;
  const c = Number(infer_qy) || 0;
  const d = Number(pass_qy) || 0;
  return await mariadb.query("prcsProgPreconUpdateQuantities", [
    a,
    b,
    c,
    d,
    prcs_prog_precon_id,
  ]);
}

// proc_ctrl 기반 합계 재계산 후 PRCS_PROG_PRECON 업데이트
async function recomputeAndUpdateQuantities(prcs_prog_precon_id) {
  if (!prcs_prog_precon_id) throw new Error("prcs_prog_precon_id is required");
  const rows = await mariadb.query("prcsProgPreconAggregateQuantities", [
    prcs_prog_precon_id,
  ]);
  const agg =
    rows && rows[0]
      ? rows[0]
      : { inpt_qy: 0, prod_qy: 0, infer_qy: 0, pass_qy: 0 };
  const a = Number(agg.inpt_qy) || 0;
  const b = Number(agg.prod_qy) || 0;
  const c = Number(agg.infer_qy) || 0;
  const d = Number(agg.pass_qy) || 0;
  await mariadb.query("prcsProgPreconUpdateQuantities", [
    a,
    b,
    c,
    d,
    prcs_prog_precon_id,
  ]);
  // 수량 업데이트 후 상태 결정: drct_qy == prod_qy → J3, else J2
  const cur = await mariadb.query("prcsProgPreconGetDrctProdById", [
    prcs_prog_precon_id,
  ]);
  const drct = Number(cur?.[0]?.drct_qy) || 0;
  const prod = Number(b) || 0;
  const nextSt = drct === prod ? "J3" : "J2";
  await mariadb.query("prcsProgPreconUpdateStatus", [
    nextSt,
    prcs_prog_precon_id,
  ]);
  return {
    ok: true,
    inpt_qy: a,
    prod_qy: b,
    infer_qy: c,
    pass_qy: d,
    st: nextSt,
  };
}

// 현재 ppp의 다음 공정(prcs_ord+1) 행이 있으면,
// 해당 행의 drct_qy를 "현재 ppp(한 공정)의" proc_ctrl.pass_qy(합격량) 합계로 설정하고 st='J2'
async function advanceNextStepWithSum(prcs_prog_precon_id) {
  if (!prcs_prog_precon_id) throw new Error("prcs_prog_precon_id is required");
  // 1) 현재 행의 deta_id와 prcs_ord 조회
  const base = await mariadb.query("prcsProgPreconGetDetaAndOrdById", [
    prcs_prog_precon_id,
  ]);
  if (!base || !base[0]) return { ok: false, message: "not-found" };
  const detaId = base[0].prod_drct_deta_id;
  const ord = Number(base[0].prcs_ord) || 0;
  // 2) 현재 ppp에 대한 proc_ctrl.pass_qy 합계(= 바로 직전 공정의 합격량 총합)
  const agg = await mariadb.query("prcsProgPreconAggregateQuantities", [
    prcs_prog_precon_id,
  ]);
  const sumPass = Number(agg?.[0]?.pass_qy) || 0;
  // 3) 다음 공정(prcs_ord+1) 행 업데이트
  const nextOrd = ord + 1;
  // 3-a) 다음 공정 행 존재 확인 (없으면 아무 것도 하지 않음)
  const nextExists = await mariadb.query("prcsProgPreconFindByDetaAndOrd", [
    detaId,
    nextOrd,
  ]);
  if (!nextExists || !nextExists[0]) {
    return {
      ok: true,
      skipped: true,
      reason: "no-next-step",
      next_ord: nextOrd,
    };
  }
  // 3-b) 존재 시에만 UPDATE 수행
  await mariadb.query("prcsProgPreconUpdateNextDrctAndStatus", [
    sumPass,
    detaId,
    nextOrd,
  ]);
  return { ok: true, drct_qy: sumPass, next_ord: nextOrd };
}

module.exports = {
  searchProdDrct,
  getMainList,
  getEmpList,
  getEqmList,
  getPrcsById,
  getMoldList,
  getRunTargetQtyByDetaId,
  getRunTargetQtyListByDetaId,
  markRunTargetUsedToJ3,
  clearPrcsProgPreconStatus,
  updatePrcsProgPreconQuantities,
  recomputeAndUpdateQuantities,
  advanceNextStepWithSum,
};
