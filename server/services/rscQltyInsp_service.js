const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

let coFindAllColumns = ["rsc_nm", "qy", "emp_nm", "co_nm", "reg_dt"];

let rscQltyInspInsertColumns = [
  "rm",
  "rsc_ordr_deta_id",
  "emp_id",
  "rtngud_qy",
  "pass_qy",
  "insp_qy",
  "insp_dt",
  "rsc_qlty_insp_id",
];

let rscQltyInspInferInsertColumns = [
  "infer_qy",
  "qlty_item_mng_id",
  "rsc_qlty_insp_id",
];
let callQuery = null;
//rseOrdrModal.vue 자재발주서 마스터정보 조회
const rscOrdrQltyList = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  let result = null;
  let data = convertObjToAry(Info, coFindAllColumns);
  result = await mariadb.query("rscOrdrQltyList", data);
  return result;
};

//rscQltyinsp.vue 자재품질검수 인서트
const rscQltyInspInsert = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    let createId = null;
    callQuery = sqlList["rscQltyInspCreateId"];
    createId = await mariadb.query(callQuery);
    console.log("서비스쪽 id생성쿼리후");
    console.log(createId);
    let queryResult = null;
    let beforeData = { ...Info.master, ...createId[0] };
    console.log(beforeData);
    let data = convertObjToAry(beforeData, rscQltyInspInsertColumns);
    console.log(data);
    callQuery = sqlList["rscQltyInspInsert"];
    queryResult = await mariadb.query(callQuery, data);
    for (const item of Info.infer) {
      let queryResult = null;
      let beforeInferData = { ...item, ...createId[0] };
      let data = convertObjToAry(
        beforeInferData,
        rscQltyInspInferInsertColumns
      );
      console.log(item);
      callQuery = sqlList["rscQltyInspInferInsert"];
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

// 자재품질검사 마스터정보 검색 쿼리
const rscQltyInspSelect = async (Info) => {
  let insertColumns = ["emp_nm", "insp_dt"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  let data = convertObjToAry(Info, insertColumns);
  console.log("service쪽");
  console.log(data);
  callQuery = sqlList["rscQltyInspSelect"];
  let list = await mariadb
    .query(callQuery, data)
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

// 자재품질검사 불량수량 검색 쿼리
const rscQltyInspInferSelect = async (Info) => {
  let insertColumns = ["rsc_qlty_insp_id"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  let data = convertObjToAry(Info, insertColumns);
  console.log("service쪽");
  console.log(data);
  callQuery = sqlList["rscQltyInspInferSearch"];
  let list = await mariadb
    .query(callQuery, data)
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

//rscQltyinsp.vue 자재품질검수 업데이트
const rscQltyInspUpdate = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let queryResult = null;

    let data = convertObjToAry(Info.master, rscQltyInspInsertColumns);
    console.log(data);
    callQuery = sqlList["rscQltyInspUpdate"];
    queryResult = await mariadb.query(callQuery, data);
    for (const item of Info.infer) {
      let data = convertObjToAry(item, rscQltyInspInferInsertColumns);
      console.log(data);
      callQuery = sqlList["rscQltyInspInferUpdate"];
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

//rscQltyinsp.vue 자재품질검수 삭제
const rscQltyInspDelete = async (Info) => {
  console.log("서비스쪽");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let queryResult = null;
    callQuery = sqlList["rscQltyInspDelete"];
    queryResult = await mariadb.query(callQuery, [
      Info.rsc_qlty_insp_id,
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
  rscOrdrQltyList,
  rscQltyInspInsert,
  rscQltyInspSelect,
  rscQltyInspUpdate,
  rscQltyInspDelete,
  rscQltyInspInferSelect,
};
