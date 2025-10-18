const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

let columns = [
  "rm",
  "prcs_ctrl_id",
  "emp_id",
  "infer_qy",
  "pass_qy",
  "insp_qy",
  "insp_dt",
  "end_prdt_qlty_insp_id",
];

// 반제품 품질 실적대기완제품 조회
const waitingSemiPrdt = async (Info) => {
  let insertColumns = ["prdt_nm", "pass_qy", "wk_to_dt"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  let data = convertObjToAry(Info, insertColumns);
  // console.log("service쪽");
  console.log(data);
  let list = await mariadb
    .query("waitingSemiPrdt", data)
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

// 반제품 품질검사에 등록된 데이터 조회
const semiPrdtQltyInspSearch = async (Info) => {
  let insertColumns = ["emp_nm", "insp_dt"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  let data = convertObjToAry(Info, insertColumns);
  // console.log("service쪽");
  console.log(data);
  let list = await mariadb
    .query("semiPrdtQltyInspSearch", data)
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

//반제품 품질검사등록
const semiPrdtQltyInspInsert = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    let createId = null;
    createId = await mariadb.query("semiPrdtQltyInspCreateId");
    console.log("서비스쪽 id생성쿼리후");
    console.log(createId);
    let queryResult = null;
    let beforeData = { ...Info, ...createId[0] };
    console.log(beforeData);
    let data = convertObjToAry(beforeData, columns);
    console.log(data);
    queryResult = await mariadb.query("semiPrdtQltyInspInsert", data);

    await conn.commit();
    let result = null;
    result = {
      isSuccessed: true,
    };
    return result;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    result = {
      isSuccessed: false,
    };
    return result;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

//반제품 품질검사수정
const semiPrdtQltyInspUpdate = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let queryResult = null;

    let data = convertObjToAry(Info, columns);
    console.log(data);
    queryResult = await mariadb.query("semiPrdtQltyInspUpdate", data);

    await conn.commit();
    let result = null;
    result = {
      isSuccessed: true,
    };
    return result;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    result = {
      isSuccessed: false,
    };
    return result;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

//반제품 품질검사삭제
const semiPrdtQltyInspDelete = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let queryResult = null;

    queryResult = await mariadb.query("semiPrdtQltyInspDelete", [
      Info.semi_prdt_qlty_insp_id,
    ]);

    await conn.commit();
    let result = null;
    result = {
      isSuccessed: true,
    };
    return result;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    result = {
      isSuccessed: false,
    };
    return result;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
module.exports = {
  waitingSemiPrdt,
  semiPrdtQltyInspSearch,
  semiPrdtQltyInspInsert,
  semiPrdtQltyInspUpdate,
  semiPrdtQltyInspDelete,
};
