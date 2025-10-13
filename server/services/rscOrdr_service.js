const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 안전한 UUID 생성 (uuid 패키지 미설치 상황 대비)
let uuidv4;
try {
  uuidv4 = require("uuid").v4;
} catch (err) {
  const crypto = require("crypto");
  // crypto.randomUUID가 있으면 사용, 없으면 타임스탬프 기반 ID 생성
  uuidv4 = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

// 도우미 함수: 객체의 키를 소문자로 정규화 (클라이언트 대소문자 호환성)
const toLowerKeys = (obj) => {
  if (!obj || typeof obj !== "object") return {};
  return Object.keys(obj).reduce((acc, k) => {
    acc[k.toLowerCase()] = obj[k];
    return acc;
  }, {});
};

// 안전한 숫자 변환 함수 (쉼표가 포함된 문자열 등 처리)
const toNumberSafe = (v, def = 0) => {
  if (v == null) return def;
  if (typeof v === "number") return Number.isFinite(v) ? v : def;
  if (typeof v === "string") {
    const s = v.replace(/,/g, "").trim(); // 쉼표 제거 후 공백 제거
    const n = Number(s);
    return Number.isFinite(n) ? n : def;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

// 자재 발주서 목록 조회 (로그인 사용자 기준 필터링)
const coFindAll = async (Info) => {
  const info = toLowerKeys(Info || {});
  const rsc_ordr_nm = (info.rsc_ordr_nm ?? "").trim() || null;
  const emp_nm = (info.emp_nm ?? "").trim() || null;
  const co_nm = (info.co_nm ?? "").trim() || null;
  const reg_dt = (info.reg_dt ?? "").trim() || null;
  const emp_id = (info.emp_id ?? "").trim() || null; // 로그인 사용자 ID 추가

  // SQL 파라미터 배열 (각 조건이 2개씩 들어감: IS NULL 체크용과 실제 값 비교용)
  const params = [
    rsc_ordr_nm,
    rsc_ordr_nm,
    co_nm,
    co_nm,
    emp_nm,
    emp_nm,
    reg_dt,
    reg_dt,
    emp_id,
    emp_id, // 로그인 사용자 ID 파라미터 추가
  ];

  console.log("[rscOrdr_service] coFindAll params ->", params);
  const result = await mariadb.query("selectRscOrdrList", params);
  return result;
};

// 자재 발주서 상세 목록 조회
const coFindDeta = async (Info) => {
  const info = toLowerKeys(Info || {});
  const raw = info.rsc_ordr_id ?? info.rsc_id ?? null;
  const id = (raw == null ? "" : String(raw)).trim() || null;
  if (!id) {
    console.log("[rscOrdr_service] coFindDeta missing id from Info:", Info);
    return [];
  }
  console.log("[rscOrdr_service] coFindDeta param id ->", id);
  const result = await mariadb.query("selectRscOrdrDetailList", [id]);
  return result;
};

// master + detail을 하나의 트랜잭션에서 처리 (신규/수정)
const insertRscOrdr = async ({
  master,
  detailList,
  rsc_ordr_id = null,
} = {}) => {
  // 입력 검증/정규화
  const m = toLowerKeys(master || {});
  const details = Array.isArray(detailList)
    ? detailList.map((d) => toLowerKeys(d || {}))
    : [];

  if (!m) throw new Error("master is required");

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    const ordrId = rsc_ordr_id || m.rsc_ordr_id || uuidv4();
    console.log("[rscOrdr_service] insert start ordrId=", ordrId);

    // master insert via connection
    // insertRscOrdr expects: (rsc_ordr_id, rsc_ordr_nm, co_id, emp_id, reg_dt, rm)
    await conn.query("insertRscOrdr", [
      ordrId,
      m.rsc_ordr_nm || null,
      m.co_id || null,
      m.emp_id || null,
      m.reg_dt || null,
      m.rm || null,
    ]);

    // 기존 상세는 삭제 후 재삽입 (업데이트시 중복 방지)
    await conn.query("deleteRscOrdrDetaByOrdr", [ordrId]);

    // detail insert: insertRscOrdrDeta expects (rsc_ordr_deta_id, rsc_ordr_id, rsc_id, qy, deli_expc_dt, rm)
    for (const d of details) {
      const detaId = d.rsc_ordr_deta_id || uuidv4();
      await conn.query("insertRscOrdrDeta", [
        detaId,
        ordrId,
        d.rsc_id || null,
        d.qy ?? 0,
        d.deli_dt || null,
        d.rm || null,
      ]);
    }

    await conn.commit();
    console.log("[rscOrdr_service] insert committed ordrId=", ordrId);
    return { isSuccessed: true, id: ordrId };
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (_) {}
    }
    console.error(
      "[rscOrdr_service] insert error:",
      err && err.stack ? err.stack : err
    );
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
    if (conn)
      try {
        await conn.rollback();
      } catch (_) {}
    console.error(
      "[rscOrdr_service] delete error:",
      err && err.stack ? err.stack : err
    );
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// Upsert-style save with YYMM sequence IDs and transaction
const saveRscOrdr = async ({ master, detailList, rsc_ordr_id = null } = {}) => {
  const m = toLowerKeys(master || {});
  const details = Array.isArray(detailList)
    ? detailList.map((d) => toLowerKeys(d || {}))
    : [];
  if (!m) throw new Error("master is required");

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // Resolve or create master ID
    let ordrId = (rsc_ordr_id || m.rsc_ordr_id || "").trim();
    let exists = [];
    if (ordrId) {
      exists = await conn.query(sqlList.existsRscOrdr, [ordrId]);
    }
    if (!ordrId || !(exists && exists.length)) {
      const gen = await conn.query(sqlList.rscOrdrCreateId);
      ordrId =
        gen && gen[0] && gen[0].rsc_ordr_id ? gen[0].rsc_ordr_id : uuidv4();
      await conn.query(sqlList.insertRscOrdr, [
        ordrId,
        m.rsc_ordr_nm || null,
        m.co_id || null,
        m.emp_id || null,
        m.reg_dt || null,
        m.rm || null,
      ]);
    } else {
      await conn.query(sqlList.updateRscOrdr, [
        m.rsc_ordr_nm || null,
        m.co_id || null,
        m.emp_id || null,
        m.reg_dt == null ? null : m.reg_dt,
        m.rm || null,
        ordrId,
      ]);
      // 기존 상세는 전량 재생성(간단한 동기화 전략)
      await conn.query(sqlList.deleteRscOrdrDetaByOrdr, [ordrId]);
    }

    // Insert details
    console.log("[rscOrdr_service] details incoming count=", details.length);
    for (const d of details) {
      let detaId = (d.rsc_ordr_deta_id || "").trim();
      if (!detaId) {
        const genD = await conn.query(sqlList.rscOrdrDetaCreateId);
        detaId =
          genD && genD[0] && genD[0].rsc_ordr_deta_id
            ? genD[0].rsc_ordr_deta_id
            : uuidv4();
      }
      const qty = toNumberSafe(d.qy ?? d.qty, 0);
      console.log("[rscOrdr_service] insert deta ->", {
        detaId,
        ordrId,
        rsc_id: d.rsc_id,
        qy: qty,
        deli_dt: d.deli_dt,
        rm: d.rm,
      });
      await conn.query(sqlList.insertRscOrdrDeta, [
        detaId,
        ordrId,
        d.rsc_id || null,
        qty,
        d.deli_dt || null,
        d.rm || null,
      ]);
    }

    await conn.commit();
    return { isSuccessed: true, id: ordrId };
  } catch (err) {
    if (conn)
      try {
        await conn.rollback();
      } catch (_) {}
    console.error(
      "[rscOrdr_service] save error:",
      err && err.stack ? err.stack : err
    );
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

// New: delete selected detail rows by their IDs
const deleteRscOrdrDetaSelected = async (ids = []) => {
  const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
  for (const id of list) {
    await mariadb.query("deleteRscOrdrDetaById", [id]);
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
