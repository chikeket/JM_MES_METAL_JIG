const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

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

// robust number parser for qty (handles strings like "1,000" or whitespace)
const toNumberSafe = (v, def = 0) => {
  if (v == null) return def;
  if (typeof v === 'number') return Number.isFinite(v) ? v : def;
  if (typeof v === 'string') {
    const s = v.replace(/,/g, '').trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : def;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
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
  if (!id) {
    console.log('[rscOrdr_service] coFindDeta missing id from Info:', Info)
    return [];
  }
  console.log('[rscOrdr_service] coFindDeta param id ->', id)
  const result = await mariadb.query("selectRscOrdrDeta", [id]);
  return result;
};

// master + detail을 하나의 트랜잭션에서 처리 (신규/수정)
const insertRscOrdr = async ({ master, detailList, rsc_ordr_id = null } = {}) => {
  // 입력 검증/정규화
  const m = toLowerKeys(master || {});
  const details = Array.isArray(detailList) ? detailList.map(d => toLowerKeys(d || {})) : [];

  if (!m) throw new Error('master is required');

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    const ordrId = rsc_ordr_id || m.rsc_ordr_id || uuidv4();
    console.log('[rscOrdr_service] insert start ordrId=', ordrId);

    // master insert via connection
    // insertRscOrdr expects: (rsc_ordr_id, co_id, emp_id, reg_dt, rm, rsc_ordr_nm)
    await conn.query("insertRscOrdr", [
      ordrId,
      m.co_id || null,
      m.emp_id || null,
      m.reg_dt || null,
      m.rm || null,
      m.rsc_ordr_nm || m.rsc_nm || null,
    ]);

    // 기존 상세는 삭제 후 재삽입 (업데이트시 중복 방지)
    await conn.query("deleteRscOrdrDetaByOrdr", [ordrId]);

    // detail insert: insertRscOrdrDeta expects (rsc_ordr_deta_id, rsc_ordr_id, rsc_id, qy, rm)
    for (const d of details) {
      const detaId = d.rsc_ordr_deta_id || uuidv4();
      await conn.query("insertRscOrdrDeta", [
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
    // Use raw SQL strings from sqlList inside transaction
    await conn.query(sqlList.deleteRscOrdrDetaByOrdr, [rscOrdrId]);
    await conn.query(sqlList.deleteRscOrdr, [rscOrdrId]);
    await conn.commit();
    return { isSuccessed: true };
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch (_) {}
    console.error('[rscOrdr_service] delete error:', err && err.stack ? err.stack : err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// Upsert-style save with YYMM sequence IDs and transaction
const saveRscOrdr = async ({ master, detailList, rsc_ordr_id = null } = {}) => {
  const m = toLowerKeys(master || {});
  const details = Array.isArray(detailList) ? detailList.map(d => toLowerKeys(d || {})) : [];
  if (!m) throw new Error('master is required');

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // Resolve or create master ID
    let ordrId = (rsc_ordr_id || m.rsc_ordr_id || '').trim();
    let exists = [];
    if (ordrId) {
      exists = await conn.query(sqlList.existsRscOrdr, [ordrId]);
    }
    if (!ordrId || !(exists && exists.length)) {
      const gen = await conn.query(sqlList.rscOrdrCreateId);
      ordrId = gen && gen[0] && gen[0].rsc_ordr_id ? gen[0].rsc_ordr_id : uuidv4();
      await conn.query(sqlList.insertRscOrdr, [
        ordrId,
        m.co_id || null,
        m.emp_id || null,
        m.reg_dt || null,
        // 테이블에 rsc_ordr_nm 별도 컬럼이 없어 RM에 발주명 저장
        m.rsc_ordr_nm || m.rm || m.rsc_nm || null,
      ]);
    } else {
      await conn.query(sqlList.updateRscOrdr, [
        m.co_id || null,
        m.emp_id || null,
        m.reg_dt || null,
        m.rsc_ordr_nm || m.rm || m.rsc_nm || null,
        ordrId,
      ]);
      // 기존 상세는 전량 재생성(간단한 동기화 전략)
      await conn.query(sqlList.deleteRscOrdrDetaByOrdr, [ordrId]);
    }

    // Insert details
    console.log('[rscOrdr_service] details incoming count=', details.length)
    for (const d of details) {
      let detaId = (d.rsc_ordr_deta_id || '').trim();
      if (!detaId) {
        const genD = await conn.query(sqlList.rscOrdrDetaCreateId);
        detaId = genD && genD[0] && genD[0].rsc_ordr_deta_id ? genD[0].rsc_ordr_deta_id : uuidv4();
      }
      const qty = toNumberSafe(d.qy ?? d.qty, 0);
      console.log('[rscOrdr_service] insert deta ->', { detaId, ordrId, rsc_id: d.rsc_id, qy: qty, rm: d.rm })
      await conn.query(sqlList.insertRscOrdrDeta, [
        detaId,
        ordrId,
        d.rsc_id || null,
        qty,
        d.rm || null,
      ]);
    }

    await conn.commit();
    return { isSuccessed: true, id: ordrId };
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch (_) {}
    console.error('[rscOrdr_service] save error:', err && err.stack ? err.stack : err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// New: delete selected detail rows by their IDs
const deleteRscOrdrDetaSelected = async (ids = []) => {
  const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
  for (const id of list) {
    await mariadb.query('deleteRscOrdrDetaById', [id]);
  }
  return { isSuccessed: true, count: list.length };
};

module.exports = {
  coFindAll,
  coFindDeta,
  insertRscOrdr,
  deleteRscOrdr,
  saveRscOrdr,
  deleteRscOrdrDetaSelected,
};
