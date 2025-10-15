const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require("../utils/converts.js");
const sqlList = require("../database/sqlList.js");
console.log('coUpdate 존재 여부:', !!sqlList.coUpdate);
console.log('사용 가능한 쿼리들:', Object.keys(sqlList).filter(k => k.startsWith('co')));

let coSelectColumns = [
  "type", "type",
  "name", "name",
  "status", "status"
];

let coInsertColumns = [
  "co_id",
  "bizr_reg_no",
  "co_nm",
  "rpstr_nm",
  "rpstr_tel",
  "co_ty_id",
  "st"
];

const coListView = async (info) => {
  console.log('서비스 - 업체 조회');
  console.log(info);
  let data = convertObjToAry(info, coSelectColumns);
  console.log('SQL 파라미터:', data);

  let result = await mariadb.query("coListView", data);
  return result;
};

const coInsert = async (info) => {
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    if (!info.co_id) {
      let createId = await mariadb.query("coCreateId", [], conn);
      info.co_id = createId[0].co_id;
    }
    let data = convertObjToAry(info, coInsertColumns);
    await mariadb.query("coInsert", data, conn);
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

const coUpdate = async (info) => {
  console.log('서비스 - 업체 수정');
  console.log(info);

  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    const originalId = info.original_co_id || info.co_id;

    if (originalId !== info.co_id) {
      let checkDuplicate = await mariadb.query(
        "coCheckDuplicate",
        [info.co_id],
        conn
      );

      if (checkDuplicate.length > 0) {
        await conn.rollback();
        return {
          isSuccessed: false,
          message: `업체 ID "${info.co_id}"는 이미 존재합니다.`
        };
      }
    }

let updateColumns = [
  "co_id",
  "bizr_reg_no",
  "co_nm",
  "rpstr_nm",
  "rpstr_tel",
  "co_ty_id",
  "st",
  "original_co_id"    // WHERE 절
];

    info.original_co_id = originalId;

    let data = convertObjToAry(info, updateColumns);
    console.log('UPDATE 파라미터:', data);  
    const sqlList = require("../database/sqlList.js");
    console.log('사용 가능한 쿼리들:', Object.keys(sqlList));
    console.log('coUpdate 존재 여부:', !!sqlList.coUpdate);
    console.log('coUpdate 내용:', sqlList.coUpdate);
     await mariadb.query("coUpdate", data, conn);
     await conn.commit();

    return {
      isSuccessed: true,
      message: "업체가 수정되었습니다."
    };
  } catch (err) {
    console.error('UPDATE 에러:', err);
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
    await mariadb.query("coDelete", [info.co_id], conn);
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
