const mariadb = require("../database/mapper.js");

// 안전한 uuid 생성 (uuid 패키지 미설치 대비)
let uuidv4;
try {
  uuidv4 = require("uuid").v4;
} catch (err) {
  const crypto = require("crypto");
  uuidv4 = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random()*1000000)}`);
}

// helper: 객체 키를 소문자로 정규화
const toLowerKeys = (obj) => {
  if (!obj || typeof obj !== "object") return {};
  return Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = obj[k];
    return acc;
  }, {});
};

const coFindAll = async (Info) => {
  const info = toLowerKeys(Info || {});
  const rsc_ordr_nm = (info.rsc_ordr_nm ?? "").trim() || null;
  const emp_nm = (info.emp_nm ?? "").trim() || null;
  const co_nm = (info.co_nm ?? "").trim() || null;
  const reg_dt = (info.reg_dt ?? "").trim() || null;

  const params = [
    rsc_ordr_nm, rsc_ordr_nm,
    co_nm, co_nm,
    emp_nm, emp_nm,
    reg_dt, reg_dt,
  ];

  console.log('[rscOrdr_service] coFindAll params ->', params);
  const result = await mariadb.query("selectRscOrdrList", params);
  return result;

};

const coFindDeta = async (Info) => {
  const info = toLowerKeys(Info || {});
  const id = info.rsc_ordr_id ?? info.rsc_id ?? null;
  if (!id) return [];
  const result = await mariadb.query("selectRscOrdrDeta", [id]);
  return result;
};

// master + detail을 하나의 트랜잭션에서 처리 (신규/수정)
const insertRscOrdr = async ({ master, detailList, rsc_ordr_id = null } = {}) => {
  // 입력 검증/정규화
  const m = toLowerKeys(master || {});
  const details = Array.isArray(detailList) ? detailList.map(d => toLowerKeys(d || {})) : [];

  if (!m) throw new Error('master is required');

}



  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    const ordrId = rsc_ordr_id || m.rsc_ordr_id || uuidv4();
    console.log('[rscOrdr_service] insert start ordrId=', ordrId);

    // master insert via alias mapper
    await mariadb.query("insertRscOrdr", [
      ordrId,
      m.co_id || null,
      m.emp_id || null,
      m.reg_dt || null,
      m.rm || null,
    ]);

    // 기존 상세는 삭제 후 재삽입 (업데이트시 중복 방지)
    await mariadb.query("deleteRscOrdrDetaByOrdr", [ordrId]);

    // detail insert: insertRscOrdrDeta expects (rsc_ordr_deta_id, rsc_ordr_id, rsc_id, qy, rm)
    for (const d of details) {
      const detaId = d.rsc_ordr_deta_id || uuidv4();
      await mariadb.query("insertRscOrdrDeta", [
        detaId,
        ordrId,
        d.rsc_id || null,
        d.qy ?? 0,
        d.rm || null,
      ]);
    }

    await conn.commit();
    console.log('[rscOrdr_service] insert committed ordrId=', ordrId);
    return { isSuccessed: true, id: ordrId };
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
    }
    console.error('[rscOrdr_service] insert error:', err && err.stack ? err.stack : err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

const deleteRscOrdr = async (rscOrdrId) => {
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    await mariadb.query("deleteRscOrdrDetaByOrdr", [rscOrdrId]);
    await mariadb.query("deleteRscOrdr", [rscOrdrId]);
    await conn.commit();
    return { isSuccessed: true };
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  coFindAll,

  coFindDeta,
  insertRscOrdr,
  deleteRscOrdr,

};
