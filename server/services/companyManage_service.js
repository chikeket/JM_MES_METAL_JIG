const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require("../utils/converts.js");

// 조회 시 사용할 컬럼 - 각 필드를 2번씩 반복!
let coSelectColumns = [
  "type", "type",      // co_ty_id 조건용 (2개)
  "name", "name",      // co_nm 조건용 (2개)
  "status", "status"   // co_st_id 조건용 (2개)
];

// 등록/수정 시 사용할 컬럼
let coInsertColumns = [
  "co_id",           // 업체 ID
  "bizr_reg_no",     // 사업자등록번호
  "co_nm",           // 업체명
  "rpstr_nm",        // 대표자명
  "rpstr_tel",       // 대표 연락처
  "reg_dt",          // 등록일자
  "mngr_nm",         // 담당자명
  "mngr_tel",        // 담당자 연락처
  "co_ty_id",        // 업체유형
  "co_st_id"         // 상태
];

// 업체 목록 조회
const coListView = async (info) => {
  console.log('서비스 - 업체 조회');
  console.log(info);
  
  let data = convertObjToAry(info, coSelectColumns);
  console.log('SQL 파라미터:', data);
  
  let result = await mariadb.query("coListView", data);
  
  return result;
};

// 업체 등록
const coInsert = async (info) => {
  console.log('서비스 - 업체 등록');
  console.log(info);
  
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // ID 생성 (필요한 경우)
    let createId = null;
    if (!info.co_id) {
      createId = await mariadb.query("coCreateId");
      info.co_id = createId[0].co_id;
    }

    let data = convertObjToAry(info, coInsertColumns);
    await mariadb.query("coInsert", data);

    await conn.commit();
    
    return {
      isSuccessed: true,
      message: "업체가 등록되었습니다."
    };
  } catch (err) {
    console.error(err);
    if (conn) await conn.rollback();
    return {
      isSuccessed: false,
      message: "업체 등록 중 오류가 발생했습니다."
    };
  } finally {
    if (conn) conn.release();
  }
};

// 업체 수정
const coUpdate = async (info) => {
  console.log('서비스 - 업체 수정');
  console.log(info);
  
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let data = convertObjToAry(info, coInsertColumns);
    await mariadb.query("coUpdate", data);

    await conn.commit();
    
    return {
      isSuccessed: true,
      message: "업체가 수정되었습니다."
    };
  } catch (err) {
    console.error(err);
    if (conn) await conn.rollback();
    return {
      isSuccessed: false,
      message: "업체 수정 중 오류가 발생했습니다."
    };
  } finally {
    if (conn) conn.release();
  }
};

// 업체 삭제
const coDelete = async (info) => {
  console.log('서비스 - 업체 삭제');
  console.log(info);
  
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    await mariadb.query("coDelete", [info.co_id]);

    await conn.commit();
    
    return {
      isSuccessed: true,
      message: "업체가 삭제되었습니다."
    };
  } catch (err) {
    console.error(err);
    if (conn) await conn.rollback();
    return {
      isSuccessed: false,
      message: "업체 삭제 중 오류가 발생했습니다."
    };
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  coListView,
  coInsert,
  coUpdate,
  coDelete
};