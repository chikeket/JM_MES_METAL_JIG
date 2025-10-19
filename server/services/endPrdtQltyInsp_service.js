const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");
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

let inferColumns = ["infer_qy", "qlty_item_mng_id", "end_prdt_qlty_insp_id"];
let callQuery = null;
// 완제품 품질 실적대기완제품 조회
const waitingFinishedPrdt = async (Info) => {
  let insertColumns = ["prdt_nm", "pass_qy", "wk_to_dt"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  let data = convertObjToAry(Info, insertColumns);
  // console.log("service쪽");
  console.log(data);
  callQuery = sqlList["waitingFinishedPrdt"];
  let list = await mariadb
    .query(callQuery, data)
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

// 완제품 품질검사에 등록된 데이터 조회
const endPrdtQltyInspSearch = async (Info) => {
  let insertColumns = ["emp_nm", "insp_dt"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  let data = convertObjToAry(Info, insertColumns);
  // console.log("service쪽");
  console.log(data);
  callQuery = sqlList["endPrdtQltyInspSearch"];
  let list = await mariadb
    .query(callQuery, data)
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

// 완제품 품질검사 항목별 불량수량 데이터 조회
const endPrdtQltyInspInferSearch = async (Info) => {
  //   let insertColumns = ["emp_nm", "insp_dt"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  //   let data = convertObjToAry(Info, insertColumns);
  // console.log("service쪽");
  console.log(Info);
  callQuery = sqlList["endPrdtQltyInspInferSearch"];
  let list = await mariadb
    .query(callQuery, [Info.end_prdt_qlty_insp_id])
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

//완제품 품질검사등록
const endPrdtQltyInspInsert = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    let createId = null;
    callQuery = sqlList["endPrdtQltyInspCreateId"];
    createId = await mariadb.query(callQuery);
    console.log("서비스쪽 id생성쿼리후");
    console.log(createId);
    let queryResult = null;
    let beforeData = { ...Info.master, ...createId[0] };
    console.log(beforeData);
    let data = convertObjToAry(beforeData, columns);
    console.log(data);
    callQuery = sqlList["endPrdtQltyInspInsert"];
    queryResult = await mariadb.query(callQuery, data);
    for (const item of Info.infer) {
      let queryResult = null;
      let beforeInferData = { ...item, ...createId[0] };
      let data = convertObjToAry(beforeInferData, inferColumns);
      console.log(item);
      callQuery = sqlList["endPrdtQltyInspInferInsert"];
      queryResult = await mariadb.query(callQuery, data);
    }
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

//완제품 품질검사수정
const endPrdtQltyInspUpdate = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let queryResult = null;

    let data = convertObjToAry(Info.master, columns);
    console.log(data);
    callQuery = sqlList["endPrdtQltyInspUpdate"];
    queryResult = await mariadb.query(callQuery, data);
    for (const item of Info.infer) {
      let queryResult = null;
      let beforeInferData = { ...item };
      let data = convertObjToAry(beforeInferData, inferColumns);
      console.log(item);
      callQuery = sqlList["endPrdtQltyInspInferUpdate"];
      queryResult = await mariadb.query(callQuery, data);
    }
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

//완제품 품질검사삭제
const endPrdtQltyInspDelete = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let queryResult = null;
    callQuery = sqlList["endPrdtQltyInspDelete"];
    queryResult = await mariadb.query(callQuery, [
      Info.end_prdt_qlty_insp_id,
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
  waitingFinishedPrdt,
  endPrdtQltyInspSearch,
  endPrdtQltyInspInferSearch,
  endPrdtQltyInspInsert,
  endPrdtQltyInspUpdate,
  endPrdtQltyInspDelete,
};
