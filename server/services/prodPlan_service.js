const mariadb = require("../database/mapper.js");

// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const { convertObjToAry } = require("../utils/converts.js");

// 조건 없이 전체조회
const prodPlanfindAll = async (Info) => {
  let insertColumns = ["prod_plan_nm", "reg_dt", "prod_expc_fr_dt", "prod_expc_to_dt"];
  // console.log("클라에서들어가는값 서비스");
  // console.log(Info);
  let data = convertObjToAry(Info, insertColumns);
  console.log("service쪽");
  console.log(data);
  let list = await mariadb
    .query("prodPlanSelect", data)
    .catch((err) => console.log(err));
  // console.log("조회 결과:", list);
  return list;
};

module.exports = {
  prodPlanfindAll,
};
