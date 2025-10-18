const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

async function saveStart(payload) {
  // payload: { prcs_prog_precon_id, prcs_ord, mold_id, eqm_id, emp_id, inpt_qy, wk_fr_dt }
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();
    // ID 발급
    const idRows = await conn.query(
      require("../database/sqlList.js").procCtrlNewId
    );
    const prcs_ctrl_id = idRows[0]?.new_id;
    // 기본 수치들 0으로 저장
    const prod_qy = 0;
    const infer_qy = 0;
    const pass_qy = 0;
    await conn.query(require("../database/sqlList.js").procCtrlInsert, [
      prcs_ctrl_id,
      payload.prcs_prog_precon_id,
      payload.prcs_ord,
      payload.mold_id || null,
      payload.eqm_id || null,
      payload.emp_id || null,
      Number(payload.inpt_qy || 0),
      prod_qy,
      infer_qy,
      pass_qy,
      payload.wk_fr_dt,
    ]);
    await conn.commit();
    return { ok: true, prcs_ctrl_id };
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  saveStart,
  async setMoldStatusP1(mold_id) {
    if (!mold_id) return { ok: false, message: "mold_id is required" };
    await mariadb.query("procCtrlUpdateMoldStatusP1", [mold_id]);
    return { ok: true };
  },
  async setMoldStatusP2(mold_id) {
    if (!mold_id) return { ok: false, message: "mold_id is required" };
    await mariadb.query("procCtrlUpdateMoldStatusP2", [mold_id]);
    return { ok: true };
  },
  async setEqmStatusQ1(eqm_id) {
    if (!eqm_id) return { ok: false, message: "eqm_id is required" };
    await mariadb.query("procCtrlUpdateEqmStatusQ1", [eqm_id]);
    return { ok: true };
  },
  async setEqmStatusQ2(eqm_id) {
    if (!eqm_id) return { ok: false, message: "eqm_id is required" };
    await mariadb.query("procCtrlUpdateEqmStatusQ2", [eqm_id]);
    return { ok: true };
  },
  async preStartStatusGuard({ prcs_prog_precon_id, eqm_id, mold_id }) {
    // 조건: ppp.st === 'J2' AND eqm.st === 'Q2' AND (if mold) mold.st === 'P2'
    if (!prcs_prog_precon_id) return { ok: false, reason: "missing-id" };
    const ppp = await mariadb.query("procCtrlGetPrcsProgPreconStatus", [
      prcs_prog_precon_id,
    ]);
    const pppSt = (ppp?.[0]?.st || "").trim();
    if (pppSt !== "J2") return { ok: false, reason: "ppp-st" };
    let eqmOk = true;
    if (eqm_id) {
      const eqm = await mariadb.query("procCtrlGetEqmStatus", [eqm_id]);
      const eqmSt = (eqm?.[0]?.st || "").trim();
      eqmOk = eqmSt === "Q2";
      if (!eqmOk) return { ok: false, reason: "eqm-st" };
    }
    if (mold_id && mold_id !== "-") {
      const mold = await mariadb.query("procCtrlGetMoldStatus", [mold_id]);
      const moldSt = (mold?.[0]?.st || "").trim();
      if (moldSt !== "P2") return { ok: false, reason: "mold-st" };
    }
    return { ok: true };
  },
  async saveFinish(payload) {
    // payload includes: prcs_prog_precon_id, prcs_ord, mold_id, eqm_id, emp_id,
    // inpt_qy, prod_qy, infer_qy, pass_qy, wk_fr_dt, wk_to_dt
    const conn = await mariadb.getConnection();
    try {
      await conn.beginTransaction();
      if (!payload?.prcs_prog_precon_id) {
        throw new Error("prcs_prog_precon_id is required");
      }
      // 방어적 숫자 변환 및 기본값 보정
      const prcs_ord = Number(payload.prcs_ord);
      const norm_prcs_ord = Number.isFinite(prcs_ord) ? prcs_ord : 0;
      const inpt_qy = Number(payload.inpt_qy || 0) || 0;
      const prod_qy = Number(payload.prod_qy || 0) || 0;
      const infer_qy = Number(payload.infer_qy || 0) || 0;
      const pass_qy = Number(payload.pass_qy || 0) || 0;
      const wk_fr_dt = payload.wk_fr_dt;
      const wk_to_dt = payload.wk_to_dt;
      if (!wk_fr_dt || !wk_to_dt) {
        throw new Error("wk_fr_dt and wk_to_dt are required");
      }
      const idRows = await conn.query(sqlList.procCtrlNewId);
      const prcs_ctrl_id = idRows[0]?.new_id;
      await conn.query(sqlList.procCtrlInsertFull, [
        prcs_ctrl_id,
        payload.prcs_prog_precon_id,
        norm_prcs_ord,
        payload.mold_id || null,
        payload.eqm_id || null,
        payload.emp_id || null,
        inpt_qy,
        prod_qy,
        infer_qy,
        pass_qy,
        wk_fr_dt,
        wk_to_dt,
      ]);
      await conn.commit();
      return { ok: true, prcs_ctrl_id };
    } catch (err) {
      try {
        await conn.rollback();
      } catch (_) {}
      throw err;
    } finally {
      if (conn) conn.release();
    }
  },
};
