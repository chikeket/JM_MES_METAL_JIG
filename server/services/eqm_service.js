const mariadb = require("../database/mapper.js");

// 검색 조건에 따른 설비 목록 조회
const eqmFindAll = async (eqmInfo) => {
  const einfo = eqmInfo || {};

  // 설비 목록 조회 쿼리
  let eqmList = `SELECT
      eqm_id,
      eqm_grp_id,
      eqm_nm,
      st
    FROM eqm
    WHERE 1=1`;

  const params = [];

  // 설비코드로 검색 (부분 일치)
  if (einfo.eqm_id && einfo.eqm_id.trim()) {
    query += ` AND eqm_id LIKE ?`;
    params.push(`%${einfo.eqm_id.trim()}%`);
  }

  // 설비명으로 검색 (부분 일치)
  if (einfo.eqm_nm && einfo.eqm_nm.trim()) {
    query += ` AND eqm_nm LIKE ?`;
    params.push(`%${einfo.eqm_nm.trim()}%`);
  }

  // 설비그룹코드로 검색 (부분 일치)
  if (einfo.eqm_grp_id && einfo.eqm_grp_id.trim()) {
    query += ` AND eqm_grp_id LIKE ?`;
    params.push(`%${einfo.eqm_grp_id.trim()}%`);
  }

  // 설비 상태로 검색 (정확히 일치)
  if (einfo.st && einfo.st.trim()) {
    query += ` AND st = ?`;
    params.push(einfo.st.trim());
  }

  //
  query += ` ORDER BY eqm_id`;

  console.log("설비 검색 쿼리:", query);
  console.log("파라미터:", params);

  let conn = null;
  try {
    conn = await mariadb.getConnection();
    const list = await conn.query(query, params);
    console.log("조회 결과:", list.length, "건");
    return list;
  } catch (err) {
    console.error("업체 조회 오류:", err);
    return [];
  } finally {
    // 연결 리소스 정리
    if (conn) conn.release();
  }
};

module.exports = {
  eqmFindAll,
};
