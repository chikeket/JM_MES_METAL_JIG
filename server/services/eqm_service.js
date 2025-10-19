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
    eqmList += ` AND eqm_id LIKE ?`;
    params.push(`%${einfo.eqm_id.trim()}%`);
  }

  // 설비명으로 검색 (부분 일치)
  if (einfo.eqm_nm && einfo.eqm_nm.trim()) {
    eqmList += ` AND eqm_nm LIKE ?`;
    params.push(`%${einfo.eqm_nm.trim()}%`);
  }

  // 설비그룹코드로 검색 (부분 일치)
  if (einfo.eqm_grp_id && einfo.eqm_grp_id.trim()) {
    eqmList += ` AND eqm_grp_id LIKE ?`;
    params.push(`%${einfo.eqm_grp_id.trim()}%`);
  }

  // 설비 상태로 검색 (정확히 일치)
  if (einfo.st && einfo.st.trim()) {
    eqmList += ` AND st = ?`;
    params.push(einfo.st.trim());
  }

  // 정렬
  eqmList += ` ORDER BY eqm_id`;

  console.log("설비 검색 쿼리:", eqmList);
  console.log("파라미터:", params);

  let conn = null;
  try {
    conn = await mariadb.getConnection();
    const list = await conn.query(eqmList, params);
    console.log("조회 결과:", list.length, "건");
    return list;
  } catch (err) {
    console.error("설비 조회 오류:", err);
    return [];
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  eqmFindAll,
};
