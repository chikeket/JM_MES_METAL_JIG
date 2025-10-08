const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

const addNewInstruction = async (Info) => {
  // console.log("서비스영역");
  // console.log(Info);

  //마스터정보
  let insertColumns = [
    "prod_drct_id",
    "prod_drct_nm",
    "emp_id",
    "prod_drct_fr_dt",
    "prod_drct_to_dt",
    "reg_dt",
    "rm",
  ];

  //디테일정보
  let insertColumnsDeta = [
    "prod_drct_deta_id",
    "prod_drct_id",
    "prod_plan_deta_id",
    "prdt_id",
    "prdt_opt_id",
    "drct_qy",
    "priort",
    "rm",
  ];

  let conn = null;
  let resInfo = null;

  let resInfoDeta = null;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    //생산지시ID생성
    resDrctId = await mariadb
      .query("prodDrctIdCreate")
    // .catch((err) => console.log(err));
    // console.log("id생성");
    // console.log(resDrctId);

    let masterInfoMerge = { ...resDrctId[0], ...Info.masterInfo }
    // console.log(masterInfoMerge);

    let data = convertObjToAry(masterInfoMerge, insertColumns);

    //생산지시마스터 인서트
    resInfo = await mariadb
      .query("instructionInsert", data)
    // .catch((err) => console.log(err));
    // console.log("서비스영역");
    // console.log(Info.detailList);



    // console.log("상세 인서트쪽")
    for (detail of Info.detailList) {
      //생산지시상세ID생성
      resDrctDetaId = await mariadb
        .query("prodDrctDetaIdCreate")
      // .catch((err) => console.log(err));
      // console.log('정보resDrctDetaId')
      // console.log(resDrctDetaId)
      let detailInfoMerge = {
        ...resDrctDetaId[0],
        ...resDrctId[0],
        prod_plan_deta_id: detail.prod_plan_deta_id,
        prdt_id: detail.prdt_id,
        prdt_opt_id: detail.prdt_opt_id,
        drct_qy: detail.drct_qy,
        priort: detail.priort,
        rm: detail.rm,
      }
      // console.log(detailInfoMerge)
      let dataDeta = convertObjToAry(detailInfoMerge, insertColumnsDeta);
      // console.log('변환후');
      // console.log(dataDeta);

      // console.log("서비스");
      // console.log(dataDeta);
      resInfoDeta = await mariadb
        .query("instructionInsertDetail", dataDeta)
      // .catch((err) => console.log(err));
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

module.exports = {
  addNewInstruction,
};
