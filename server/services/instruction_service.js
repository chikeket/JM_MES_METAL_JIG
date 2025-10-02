const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

const addNewInstruction = async (Info) => {
  //   console.log("서비스영역");
  //   console.log(Info);
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
  let data = convertObjToAry(Info.masterInfo, insertColumns);
  //디테일정보
  let insertColumnsDeta = [
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
    resInfo = await mariadb
      .query("instructionInsert", data)
      .catch((err) => console.log(err));
    // console.log("서비스영역");
    // console.log(Info.detailList);

    for (detail of Info.detailList) {
      let dataDeta = convertObjToAry(detail, insertColumnsDeta);
      // console.log("서비스");
      // console.log(dataDeta);
      resInfoDeta = await mariadb
        .query("instructionInsertDetail", dataDeta)
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
  if (resInfo.affectedRows > 0 && resInfoDeta.affectedRows > 0) {
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
