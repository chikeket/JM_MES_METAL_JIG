const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
//const { convertObjToAry } = require("../utils/converts.js");

const insertRscOrdr = async () => {
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    // 여러 쿼리 실행
    await conn.query("SQL1");
    await conn.query("SQL2");

    await conn.commit();
  } catch (err) {
    if (conn) await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  insertRscOrdr,
};
