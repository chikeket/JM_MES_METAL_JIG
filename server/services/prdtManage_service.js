const mariadb = require("../database/mapper.js");
const { convertObjToAry } = require("../utils/converts.js");

let prdtSelectColumns = [
  "prdt_id", "prdt_id",
  "prdt_nm", "prdt_nm",
  "prdt_st", "prdt_st"
];

const prdtListView = async (info) => {
  console.log('서비스 - 제품 조회');
  console.log(info);
  let data = convertObjToAry(info, prdtSelectColumns);
  console.log('SQL 파라미터:', data);
  
  let result = await mariadb.query("prdtListView", data);
  return result;
};

const prdtOptionList = async (info) => {
  console.log('서비스 - 제품 옵션 조회');
  console.log(info);
  
  let result = await mariadb.query("prdtOptionList", [info.prdt_id]);
  return result;
};

const prdtDelete = async (info) => {
  console.log('서비스 - 제품 삭제');
  console.log(info);
  
  let conn;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    
    await mariadb.query("prdtDelete", [info.prdt_id], conn);
    
    await conn.commit();
    
    return {
      isSuccessed: true,
      message: "제품이 삭제되었습니다."
    };
  } catch (err) {
    console.error(err);
    if (conn) await conn.rollback();
    return {
      isSuccessed: false,
      message: "제품 삭제 중 오류가 발생했습니다."
    };
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  prdtListView,
  prdtOptionList,
  prdtDelete
};