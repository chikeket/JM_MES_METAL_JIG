const mariadb = require("../database/mapper.js");

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
};
