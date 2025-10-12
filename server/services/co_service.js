const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
//const { convertObjToAry } = require("../utils/converts.js");

// 검색 조건에 따른 업체 목록 조회
const coFindAll = async (cosInfo) => {
  const info = cosInfo || {};
  
  // 기본 업체 조회 쿼리 (WHERE 1=1로 시작하여 동적 조건 추가)
  let query = `SELECT
      co_id,
      co_nm,
      co_ty_id,
      rpstr_nm,
      rpstr_tel,
      bizr_reg_no,
      st,
      rm
    FROM co
    WHERE 1=1`;
  
  const params = [];
  
  // 업체명으로 검색 (부분 일치)
  if (info.co_nm && info.co_nm.trim()) {
    query += ` AND co_nm LIKE ?`;
    params.push(`%${info.co_nm.trim()}%`);
  }
  
  // 대표자명으로 검색 (부분 일치)
  if (info.rpstr_nm && info.rpstr_nm.trim()) {
    query += ` AND rpstr_nm LIKE ?`;
    params.push(`%${info.rpstr_nm.trim()}%`);
  }
  
  // 대표자 연락처로 검색 (부분 일치)
  if (info.rpstr_tel && info.rpstr_tel.trim()) {
    query += ` AND rpstr_tel LIKE ?`;
    params.push(`%${info.rpstr_tel.trim()}%`);
  }
  
  // 업체 유형으로 검색 (정확히 일치)
  if (info.co_ty_id && info.co_ty_id.trim()) {
    query += ` AND co_ty_id = ?`;
    params.push(info.co_ty_id.trim());
  }
  
  // 상태로 검색 (정확히 일치)
  if (info.st && info.st.trim()) {
    query += ` AND st = ?`;
    params.push(info.st.trim());
  }
  
  // 업체 ID 순으로 정렬
  query += ` ORDER BY co_id`;
  
  console.log("업체 검색 쿼리:", query);
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
  coFindAll,
};
