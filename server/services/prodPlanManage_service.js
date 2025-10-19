const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

//마스터정보
let insertColumns = [
  "rm",
  "rcvord_id",
  "emp_id",
  "prod_plan_nm",
  "prod_expc_fr_dt",
  "prod_expc_to_dt",
  "reg_dt",
  "prod_plan_id",
];

//디테일정보
let insertColumnsDeta = [
  "rm",
  "prdt_id",
  "prdt_opt_id",
  "plan_qy",
  "priort",
  "prod_plan_id",
  "prod_plan_deta_id",
];

let conn = null;
let callQuery = null;
let resDrctId = null;
let resInfo = null;
let resDrctDetaId = null;

const addNewProdPlanManage = async (Info) => {
  console.log("서비스영역");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    //생산계획ID생성
    callQuery = sqlList["prodPlanManageIdCreate"];
    resDrctId = await conn.query(callQuery);

    let masterInfoMerge = { ...Info.masterInfo, ...resDrctId[0] };
    // console.log(masterInfoMerge);

    let data = convertObjToAry(masterInfoMerge, insertColumns);

    //생산계획마스터 인서트
    callQuery = sqlList["prodPlanManageInsert"];
    resInfo = await conn.query(callQuery, data);

    // console.log("상세 인서트쪽")
    for (detail of Info.detailList) {
      //생산계획상세ID생성
      callQuery = sqlList["prodPlanManageDetaIdCreate"];
      resDrctDetaId = await conn.query(callQuery);

      let detailInfoMerge = {
        ...detail,
        ...resDrctId[0],
        ...resDrctDetaId[0],
      };

      let dataDeta = convertObjToAry(detailInfoMerge, insertColumnsDeta);

      //생산계획상세 인서트
      callQuery = sqlList["prodPlanManageInsertDetail"];
      resInfo = await conn.query(callQuery, dataDeta);
    }

    await conn.commit();
    let result = null;
    result = { isSuccessed: true };
    return result;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    result = { isSuccessed: false };
    return result;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const updateProdPlanManage = async (Info) => {
  console.log("서비스영역");
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let masterInfoMerge = { ...Info.masterInfo, ...Info.editProdDrctId };
    let data = convertObjToAry(masterInfoMerge, insertColumns);

    //생산계획마스터 업데이트
    callQuery = sqlList["prodPlanManageUpdate"];
    resInfo = await conn.query(callQuery, data);

    for (detail of Info.detailList) {
      let dataDeta = convertObjToAry(detail, insertColumnsDeta);
      //생산계획상세 업데이트
      callQuery = sqlList["prodPlanManageUpdateDetail"];
      resInfo = await conn.query(callQuery, dataDeta);
    }

    await conn.commit();
    let result = null;
    result = { isSuccessed: true };
    return result;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    result = { isSuccessed: false };
    return result;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const deleteProdPlanManage = async (Info) => {
  // console.log('갑갑갑')
  console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    callQuery = sqlList["prodPlanManageDelete"];
    resInfo = await conn.query(callQuery, [Info.prod_plan_id]);

    await conn.commit();
    let result = null;
    result = { isSuccessed: true };
    return result;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    result = { isSuccessed: false };
    return result;
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

module.exports = {
  addNewProdPlanManage,
  updateProdPlanManage,
  deleteProdPlanManage,
};
