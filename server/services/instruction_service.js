const mariadb = require("../database/mapper.js");
const sqlList = require("../database/sqlList.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

//마스터정보
let insertColumns = [
  "rm",
  "prod_drct_nm",
  "emp_id",
  "prod_drct_fr_dt",
  "prod_drct_to_dt",
  "reg_dt",
  "prod_drct_id",
];

//디테일정보
let insertColumnsDeta = [
  "rm",
  "prod_drct_id",
  "prod_plan_deta_id",
  "prdt_id",
  "prdt_opt_id",
  "drct_qy",
  "priort",
  "prod_drct_deta_id",
];

//공정진행현황
let prcsProgPrecon = [
  "rm",
  "prod_drct_deta_id",
  "prcs_ord",
  "prcs_id",
  "prcs_nm",
  "drct_qy",
  "st",
  "prcs_prog_precon_id",
];

let conn = null;
let callQuery = null;
let resDrctId = null;
let resInfo = null;
let resDrctDetaId = null;
let resInfoDeta = null;
let resInfoPrcsProgId = null;
let resInfoPrcs = null;
let prcsProgInsert = null;

const addNewInstruction = async (Info) => {
  // console.log("서비스영역");
  // console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    //생산지시ID생성
    callQuery = sqlList["prodDrctIdCreate"];
    resDrctId = await conn.query(callQuery);
    // .catch((err) => console.log(err));

    let masterInfoMerge = { ...Info.masterInfo, ...resDrctId[0] };
    // console.log(masterInfoMerge);

    let data = convertObjToAry(masterInfoMerge, insertColumns);

    //생산지시마스터 인서트
    callQuery = sqlList["instructionInsert"];
    resInfo = await conn.query(callQuery, data);
    // .catch((err) => console.log(err));

    // console.log("상세 인서트쪽")
    for (detail of Info.detailList) {
      //생산지시상세ID생성
      callQuery = sqlList["instructionInsert"];
      resDrctDetaId = await conn.query(callQuery);
      // .catch((err) => console.log(err));
      let detailInfoMerge = {
        rm: detail.rm,
        ...resDrctId[0],
        prod_plan_deta_id: detail.prod_plan_deta_id,
        prdt_id: detail.prdt_id,
        prdt_opt_id: detail.prdt_opt_id,
        drct_qy: detail.drct_qy,
        priort: detail.priort,
        ...resDrctDetaId[0],
      };

      let dataDeta = convertObjToAry(detailInfoMerge, insertColumnsDeta);

      //생산지시상세 인서트
      callQuery = sqlList["instructionInsertDetail"];
      resInfoDeta = await conn.query(callQuery, dataDeta);
      // .catch((err) => console.log(err));

      let prdtInfo = [detail.prdt_id, detail.prdt_opt_id];
      // 제품ID로 라우팅과 공정 열람
      callQuery = sqlList["prcsSelect"];
      resInfoPrcs = await conn
        .query(callQuery, prdtInfo)
        .catch((err) => console.log(err));
      console.log("제품ID로 라우팅과 공정 열람");
      console.log(resInfoPrcs);
      for (prcs of resInfoPrcs) {
        //공정진행현황 ID생성
        callQuery = sqlList["prcsProgPreconIdCreate"];
        resInfoPrcsProgId = await conn
          .query(callQuery)
          .catch((err) => console.log(err));
        console.log("공정진행현황 ID생성");
        console.log(resInfoPrcsProgId);
        console.log(prcs);
        let prcsProgPreconInfo = {
          rm: detail.rm,
          ...resDrctDetaId[0],
          ...prcs,
          drct_qy: prcs.prcs_ord == 1 ? detail.drct_qy : 0,
          st: prcs.prcs_ord == 1 ? "J2" : "J1",
          ...resInfoPrcsProgId[0],
        };
        console.log(prcsProgPreconInfo);
        let prcsProgPreconData = convertObjToAry(
          prcsProgPreconInfo,
          prcsProgPrecon
        );
        // 공정진행현황 인서트
        callQuery = sqlList["prcsProgPreconInsert"];
        prcsProgInsert = await conn
          .query(callQuery, prcsProgPreconData)
          .catch((err) => console.log(err));

        if (resInfoDeta.affectedRows == 0) {
          throw new Error("상세 인서트 실패");
        }
      } //prcs of resInfoPrcs
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

const updateInstruction = async (Info) => {
  // console.log("서비스영역");
  // console.log(Info);
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    let masterInfoMerge = { ...Info.masterInfo, ...Info.editProdDrctId };
    let data = convertObjToAry(masterInfoMerge, insertColumns);
    console.log("=====값확인======");
    console.log(data);
    //생산지시마스터 업데이트
    callQuery = sqlList["instructionUpdate"];
    resInfo = await conn.query(callQuery, data);

    for (detail of Info.detailList) {
      let detailInfoMerge = {
        rm: detail.rm,
        prod_drct_id: Info.editProdDrctId.prod_drct_id,
        prod_plan_deta_id: detail.prod_plan_deta_id,
        prdt_id: detail.prdt_id,
        prdt_opt_id: detail.prdt_opt_id,
        drct_qy: detail.drct_qy,
        priort: detail.priort,
        prod_drct_deta_id: detail.prod_drct_deta_id,
      };
      let dataDeta = convertObjToAry(detailInfoMerge, insertColumnsDeta);
      //생산지시상세 업데이트
      callQuery = sqlList["instructionDetaUpdate"];
      resInfoDeta = await conn.query(callQuery, dataDeta);

      //공정진행현황 ID검색
      callQuery = sqlList["prcsProgPreconIdSearch"];
      resInfoPrcsProgId = await conn
        .query(callQuery, [detail.prod_drct_deta_id])
        .catch((err) => console.log(err));
      console.log("공정진행현황 ID생성");
      console.log(resInfoPrcsProgId);

      let prdtInfo = [detail.prdt_id, detail.prdt_opt_id];
      // 제품ID로 라우팅과 공정 열람
      callQuery = sqlList["prcsSelect"];
      resInfoPrcs = await conn
        .query(callQuery, prdtInfo)
        .catch((err) => console.log(err));
      console.log("제품ID로 라우팅과 공정 열람");
      console.log(resInfoPrcs);

      let prcsProgPreconInfo = {
        rm: detail.rm,
        prod_drct_deta_id: detail.prod_drct_deta_id,
        ...resInfoPrcs[0],
        drct_qy: detail.drct_qy,
        st: "J2",
        ...resInfoPrcsProgId[0],
      };
      let prcsProgPreconData = convertObjToAry(
        prcsProgPreconInfo,
        prcsProgPrecon
      );
      // 공정진행현황 업데이트
      callQuery = sqlList["prcsProgPreconUpdate"];
      prcsProgInsert = await conn
        .query(callQuery, prcsProgPreconData)
        .catch((err) => console.log(err));
      if (resInfoDeta.affectedRows == 0) {
        throw new Error("상세 인서트 실패");
      }
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

const deleteInstruction = async (Info) => {
  // console.log('갑갑갑')
  // console.log(Info.prod_drct_id)
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();
    callQuery = sqlList["instructionDelete"];
    resDrctId = await conn.query(callQuery, [Info.prod_drct_id]);

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
  addNewInstruction,
  updateInstruction,
  deleteInstruction,
};
