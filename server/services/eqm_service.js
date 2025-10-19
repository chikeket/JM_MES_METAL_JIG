const mariadb = require("../database/mapper.js");

// 검색 조건에 따른 설비 목록 조회
// 지원 조건:
// - eqm_grp_nm: EQM_GRP.EQM_GRP_NM 부분검색 (LIKE %...%)
// - eqm_nm: EQM.EQM_NM 부분검색 (LIKE %...%)
// - make_co: EQM.MAKE_CO 정확히 일치
// - st: EQM.ST (SUB_CODE_ID) 정확히 일치
const eqmFindAll = async (eqmInfo) => {
  const einfo = eqmInfo || {};

  let sql = `
    SELECT
      e.eqm_id,
      e.eqm_grp_id,
      g.eqm_grp_nm,
      e.eqm_nm,
      e.make_co,
      e.make_model,
      e.make_dt,
      e.chck_cycle,
      e.setp_dt,
      e.reg_dt,
      e.st,
      sc.sub_code_nm AS st_nm,
      e.rm
    FROM eqm e
    LEFT JOIN eqm_grp g ON g.eqm_grp_id = e.eqm_grp_id
    LEFT JOIN sub_code sc ON sc.sub_code_id = e.st
    WHERE 1=1
  `;

  const params = [];

  // 설비그룹명 LIKE
  if (einfo.eqm_grp_nm && String(einfo.eqm_grp_nm).trim()) {
    sql += ` AND g.eqm_grp_nm LIKE ?`;
    params.push(`%${String(einfo.eqm_grp_nm).trim()}%`);
  }

  // 설비명 LIKE
  if (einfo.eqm_nm && String(einfo.eqm_nm).trim()) {
    sql += ` AND e.eqm_nm LIKE ?`;
    params.push(`%${String(einfo.eqm_nm).trim()}%`);
  }

  // 제조업체 (정확 일치)
  if (einfo.make_co && String(einfo.make_co).trim()) {
    sql += ` AND e.make_co = ?`;
    params.push(String(einfo.make_co).trim());
  }

  // 상태 (정확 일치 - SUB_CODE_ID)
  if (einfo.st && String(einfo.st).trim()) {
    sql += ` AND e.st = ?`;
    params.push(String(einfo.st).trim());
  }

  sql += `
    ORDER BY e.eqm_id
  `;

  let conn = null;
  try {
    conn = await mariadb.getConnection();
    const list = await conn.query(sql, params);
    return list;
  } catch (err) {
    console.error("[eqm_service] 설비 조회 오류:", err);
    return [];
  } finally {
    if (conn) conn.release();
  }
};

// 설비 테이블에서 중복 제거된 제조업체 목록
const getDistinctMakeCompanies = async () => {
  const sql = `
    SELECT DISTINCT e.make_co
    FROM eqm e
    WHERE e.make_co IS NOT NULL AND e.make_co <> ''
    ORDER BY e.make_co
  `;
  let conn = null;
  try {
    conn = await mariadb.getConnection();
    const rows = await conn.query(sql);
    return rows.map((r) => r.make_co);
  } catch (err) {
    console.error("[eqm_service] 제조업체 목록 조회 오류:", err);
    return [];
  } finally {
    if (conn) conn.release();
  }
};

// 설비 테이블에 존재하는 상태(sub_code) 목록 (중복 제거)
const getDistinctStatuses = async () => {
  const sql = `
    SELECT DISTINCT sc.sub_code_id AS st, sc.sub_code_nm AS st_nm
    FROM eqm e
    JOIN sub_code sc ON sc.sub_code_id = e.st
    ORDER BY sc.sub_code_nm
  `;
  let conn = null;
  try {
    conn = await mariadb.getConnection();
    const rows = await conn.query(sql);
    return rows;
  } catch (err) {
    console.error("[eqm_service] 상태 목록 조회 오류:", err);
    return [];
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  eqmFindAll,
  getDistinctMakeCompanies,
  getDistinctStatuses,
};

// 아래 신규/수정 저장 로직 추가
/**
 * EQM 신규 저장
 * 필수: eqm_nm
 * 선택: eqm_grp_id, make_co, make_model, make_dt, setp_dt, chck_cycle, st, rm
 */
const eqmInsert = async (payload) => {
  const {
    eqm_grp_id = null,
    eqm_grp_nm = null,
    eqm_nm,
    make_co = null,
    make_model = null,
    make_dt = null,
    setp_dt = null,
    chck_cycle = null,
    st = null,
    rm = null,
  } = payload || {};

  if (!eqm_nm || !String(eqm_nm).trim()) {
    throw new Error("EQM_NM is required");
  }

  let conn;
  try {
    conn = await mariadb.getConnection();
    // eqm_grp_id가 없으면 eqm_grp_nm으로 매핑 시도
    let resolvedGrpId = eqm_grp_id;
    if (!resolvedGrpId) {
      const name = (eqm_grp_nm || "").trim();
      if (!name) {
        throw new Error("설비 그룹을 선택(입력)해 주세요.");
      }
      const exact = await conn.query(
        "SELECT eqm_grp_id, eqm_grp_nm FROM eqm_grp WHERE eqm_grp_nm = ?",
        [name]
      );
      if (exact.length === 1) {
        resolvedGrpId = exact[0].eqm_grp_id;
      } else {
        const like = await conn.query(
          'SELECT eqm_grp_id, eqm_grp_nm FROM eqm_grp WHERE eqm_grp_nm LIKE CONCAT("%", ?, "%")',
          [name]
        );
        if (like.length === 1) {
          resolvedGrpId = like[0].eqm_grp_id;
        } else {
          throw new Error("설비 그룹을 정확히 선택해 주세요.");
        }
      }
    }
    // 신규 ID 발급 (eqmYYYYMMNNN)
    const newIdRows = await conn.query(
      require("../database/sqlList.js").eqmNewId
    );
    const newId = newIdRows && newIdRows[0] && newIdRows[0].new_id;
    if (!newId) throw new Error("신규 EQM ID 발급 실패");

    const sql = `
      INSERT INTO eqm (
        eqm_id, eqm_grp_id, eqm_nm, make_co, make_model, make_dt, chck_cycle, setp_dt, st, rm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await conn.query(sql, [
      newId,
      resolvedGrpId,
      String(eqm_nm).trim(),
      make_co,
      make_model,
      make_dt,
      chck_cycle,
      setp_dt,
      st,
      rm,
    ]);
    return { affectedRows: result.affectedRows, eqm_id: newId };
  } finally {
    if (conn) conn.release();
  }
};

/**
 * EQM 수정 저장
 * 경로 파라미터 eqm_id로 대상 지정, 본문에 전달된 컬럼만 업데이트
 */
const eqmUpdate = async (eqm_id, payload) => {
  if (!eqm_id) throw new Error("eqm_id is required");

  // 허용 컬럼만 업데이트
  const fields = [];
  const params = [];
  const allow = [
    "eqm_grp_id",
    "eqm_nm",
    "make_co",
    "make_model",
    "make_dt",
    "chck_cycle",
    "setp_dt",
    "st",
    "rm",
  ];
  for (const key of allow) {
    if (payload.hasOwnProperty(key)) {
      fields.push(`${key} = ?`);
      params.push(payload[key]);
    }
  }
  if (fields.length === 0) return { affectedRows: 0 };

  const sql = `UPDATE eqm SET ${fields.join(", ")} WHERE eqm_id = ?`;
  params.push(eqm_id);

  let conn;
  try {
    conn = await mariadb.getConnection();
    const result = await conn.query(sql, params);
    return { affectedRows: result.affectedRows };
  } finally {
    if (conn) conn.release();
  }
};

module.exports.eqmInsert = eqmInsert;
module.exports.eqmUpdate = eqmUpdate;

/**
 * EQM 삭제
 */
const eqmDelete = async (eqm_id) => {
  if (!eqm_id) throw new Error("eqm_id is required");
  const sql = `DELETE FROM eqm WHERE eqm_id = ?`;

  let conn;
  try {
    conn = await mariadb.getConnection();
    const result = await conn.query(sql, [eqm_id]);
    return { affectedRows: result.affectedRows };
  } catch (err) {
    const msg = String((err && err.message) || "").toLowerCase();
    // FK 제약 등으로 삭제 불가 시 상위에서 409로 매핑할 수 있도록 throw 유지
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports.eqmDelete = eqmDelete;
