const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");
let coFindAllColumns = [
  "rsc_nm",
  "qy",
  "emp_nm",
  "co_nm",
  "reg_dt",
];

//rseOrdrModal.vue 자재발주서 마스터정보 조회
const coFindAll = async (Info) => {
  console.log('서비스쪽')
  console.log(Info)
  let result = null;
  let data = convertObjToAry(Info, coFindAllColumns)
  result = await mariadb
    .query("selectRscOrdrList", data)
  return result;
}


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
  coFindAll,
};
