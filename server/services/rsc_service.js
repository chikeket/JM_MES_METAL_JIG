const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
//const { convertObjToAry } = require("../utils/converts.js");

// 검색 조건에 따른 자재 목록 조회
const rscfindAll = async (rscInfo) => {
  const info = rscInfo || {};
  
  // 기본 자재 조회 쿼리 (WHERE 1=1로 시작하여 동적 조건 추가)
  let query = `SELECT
        rsc_id,
        rsc_clsf_id,
        rsc_nm,
        spec,
        unit,
        rm
    FROM rsc
    WHERE 1=1`;
  
  const params = [];
  
  // 자재 ID로 검색 (부분 일치)
  if (info.rsc_id && info.rsc_id.trim()) {
    query += ` AND rsc_id LIKE ?`;
    params.push(`%${info.rsc_id.trim()}%`);
  }
  
  // 자재 분류 ID로 검색 (부분 일치)
  if (info.rsc_clsf_id && info.rsc_clsf_id.trim()) {
    query += ` AND rsc_clsf_id LIKE ?`;
    params.push(`%${info.rsc_clsf_id.trim()}%`);
  }
  
  // 자재명으로 검색 (부분 일치)
  if (info.rsc_nm && info.rsc_nm.trim()) {
    query += ` AND rsc_nm LIKE ?`;
    params.push(`%${info.rsc_nm.trim()}%`);
  }
  
  // 규격으로 검색 (부분 일치)
  if (info.spec && info.spec.trim()) {
    query += ` AND spec LIKE ?`;
    params.push(`%${info.spec.trim()}%`);
  }
  
  // 단위로 검색 (부분 일치)
  if (info.unit && info.unit.trim()) {
    query += ` AND unit LIKE ?`;
    params.push(`%${info.unit.trim()}%`);
  }
  
  // 자재 ID 순으로 정렬
  query += ` ORDER BY rsc_id`;
  
  console.log("자재 검색 쿼리:", query);
  console.log("파라미터:", params);
  
  let conn = null;
  try {
    conn = await mariadb.getConnection();
    const list = await conn.query(query, params);
    console.log("자재 조회 결과:", list.length, "건");
    return list;
  } catch (err) {
    console.error("자재 조회 오류:", err);
    return [];
  } finally {
    // 연결 리소스 정리
    if (conn) conn.release();
  }
};

module.exports = {
  rscfindAll,
};
