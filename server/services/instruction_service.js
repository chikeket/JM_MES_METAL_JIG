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

  //공정진행현황
  let prcsProgPrecon = [
    "prcs_prog_precon_id",
    "prod_drct_deta_id",
    "prcs_ord",
    "prcs_id",
    "prcs_nm",
    "drct_qy",
    "rm"];

  let conn = null;
  let resInfo = null;

  let resInfoDeta = null;
  let resInfoPrcsProgId = null;
  let resInfoPrcs = null;
  let prcsProgInsert = null;
  try {
    conn = await mariadb.getConnection();
    await conn.beginTransaction();

    //생산지시ID생성
    resDrctId = await mariadb
      .query("prodDrctIdCreate")
      .catch((err) => console.log(err));
    // console.log("id생성");
    // console.log(resDrctId);

    let masterInfoMerge = { ...resDrctId[0], ...Info.masterInfo }
    // console.log(masterInfoMerge);

    let data = convertObjToAry(masterInfoMerge, insertColumns);

    //생산지시마스터 인서트
    resInfo = await mariadb
      .query("instructionInsert", data)
      .catch((err) => console.log(err));
    // console.log("서비스영역");
    // console.log(Info.detailList);



    // console.log("상세 인서트쪽")
    for (detail of Info.detailList) {
      console.log('detail쪽임');
      console.log(detail);
      //생산지시상세ID생성
      resDrctDetaId = await mariadb
        .query("prodDrctDetaIdCreate")
        .catch((err) => console.log(err));
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

      // console.log("변환후");
      // console.log(dataDeta);
      resInfoDeta = await mariadb
        .query("instructionInsertDetail", dataDeta)
        .catch((err) => console.log(err));

      //공정진행현황 ID생성
      resInfoPrcsProgId = await mariadb
        .query("prcsProgPreconIdCreate")
        .catch((err) => console.log(err));
      console.log('공정진행현황 ID생성');
      console.log(resInfoPrcsProgId);

      let prdtInfo = [detail.prdt_id, detail.prdt_opt_id]
      // 제품ID로 라우팅과 공정 열람 
      resInfoPrcs = await mariadb
        .query("prcsSelect", prdtInfo)
        .catch((err) => console.log(err));
      console.log("제품ID로 라우팅과 공정 열람");
      console.log(resInfoPrcs);

      let prcsProgPreconInfo = { ...resInfoPrcsProgId[0], ...resDrctDetaId[0], ...resInfoPrcs[0], drct_qy: detail.drct_qy, rm: detail.rm }
      let prcsProgPreconData = convertObjToAry(prcsProgPreconInfo, prcsProgPrecon);
      // 공정진행현황 인서트 
      prcsProgInsert = await mariadb
        .query("prcsProgPreconInsert", prcsProgPreconData)
        .catch((err) => console.log(err));

    }

    await conn.commit();
  } catch (err) {
    console.log(err);
    await conn.rollback();
  } finally {
    if (conn) {
      conn.release();
    }
  }

  let result = null;
  if (resInfoDeta.affectedRows > 0) {
    // 정상적으로 등록된 경우
    result = {
      isSuccessed: true,
    };
  } else {
    // 등록되지 않은 경우
    result = {
      isSuccessed: false,
    };
  }
  return result;
};

module.exports = {
  addNewInstruction,
};
